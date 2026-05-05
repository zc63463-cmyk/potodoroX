use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to PomodoroX.", name)
}

/// 构造 Basic Auth 头部值
fn basic_auth(username: &str, password: &str) -> String {
    format!("Basic {}", base64_encode(&format!("{}:{}", username, password)))
}

/// 通过 ureq 3 的 `Agent::run` 执行任意 HTTP 方法（用于 PROPFIND/MKCOL 等 WebDAV 扩展）。
/// 返回响应（或 ureq::Error，调用方按需处理 StatusCode 分支）。
fn dav_run(
    method: &str,
    full_url: &str,
    auth: &str,
    extra_headers: &[(&str, &str)],
    body: &str,
) -> Result<ureq::http::Response<ureq::Body>, ureq::Error> {
    let agent = ureq::Agent::new_with_defaults();
    let mut builder = ureq::http::Request::builder()
        .method(method)
        .uri(full_url)
        .header("Authorization", auth);
    for (k, v) in extra_headers {
        builder = builder.header(*k, *v);
    }
    let req = builder.body(body.to_string()).map_err(|e| {
        // http::Error 不是 ureq::Error；包装为通用 Other
        ureq::Error::Other(format!("build request failed: {}", e).into())
    })?;
    agent.run(req)
}

/// WebDAV PUT 上传文件
#[tauri::command]
fn webdav_put(
    url: &str,
    username: &str,
    password: &str,
    path: &str,
    content: &str,
) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let agent = ureq::Agent::new_with_defaults();
    let resp = agent
        .put(&full_url)
        .header("Authorization", &basic_auth(username, password))
        .send(content)
        .map_err(|e| format!("PUT failed: {}", e))?;

    let status = resp.status().as_u16();
    if (200..300).contains(&status) {
        Ok(format!("Upload successful: {}", status))
    } else {
        Err(format!("Upload failed with status: {}", status))
    }
}

/// WebDAV GET 下载文件
#[tauri::command]
fn webdav_get(url: &str, username: &str, password: &str, path: &str) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let agent = ureq::Agent::new_with_defaults();
    let resp = agent
        .get(&full_url)
        .header("Authorization", &basic_auth(username, password))
        .call()
        .map_err(|e| format!("GET failed: {}", e))?;

    let status = resp.status().as_u16();
    if (200..300).contains(&status) {
        let mut resp = resp;
        resp.body_mut()
            .read_to_string()
            .map_err(|e| format!("Read body failed: {}", e))
    } else {
        Err(format!("GET failed with status: {}", status))
    }
}

/// WebDAV PROPFIND 测试连接
#[tauri::command]
fn webdav_test(url: &str, username: &str, password: &str) -> Result<bool, String> {
    let auth = basic_auth(username, password);
    let resp = dav_run("PROPFIND", url, &auth, &[("Depth", "0")], "")
        .map_err(|e| format!("PROPFIND failed: {}", e))?;
    let status = resp.status().as_u16();
    Ok(status == 207 || status == 200)
}

/// WebDAV MKCOL 创建目录（若已存在则忽略 405/409）
#[tauri::command]
fn webdav_mkcol(url: &str, username: &str, password: &str, path: &str) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let auth = basic_auth(username, password);
    match dav_run("MKCOL", &full_url, &auth, &[], "") {
        Ok(resp) => Ok(format!("MKCOL {}", resp.status().as_u16())),
        Err(ureq::Error::StatusCode(code)) if code == 405 || code == 409 || code == 301 => {
            // 405 Method Not Allowed / 409 Conflict / 301 常见于目录已存在
            Ok(format!("MKCOL already exists ({})", code))
        }
        Err(e) => Err(format!("MKCOL failed: {}", e)),
    }
}

/// WebDAV PROPFIND Depth:1 列出目录内容，返回原始 XML 文本
#[tauri::command]
fn webdav_list(url: &str, username: &str, password: &str, path: &str) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let auth = basic_auth(username, password);
    let result = dav_run(
        "PROPFIND",
        &full_url,
        &auth,
        &[("Depth", "1"), ("Content-Type", "application/xml")],
        "",
    );

    match result {
        Ok(mut resp) => resp
            .body_mut()
            .read_to_string()
            .map_err(|e| format!("Read PROPFIND body failed: {}", e)),
        // 404 Not Found - 目录不存在（首次使用）：返回空字符串，调用方视为空列表
        Err(ureq::Error::StatusCode(404)) => Ok(String::new()),
        Err(e) => Err(format!("PROPFIND failed: {}", e)),
    }
}

/// WebDAV DELETE 删除文件（幂等，404 视为成功）
#[tauri::command]
fn webdav_delete(url: &str, username: &str, password: &str, path: &str) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let agent = ureq::Agent::new_with_defaults();
    let result = agent
        .delete(&full_url)
        .header("Authorization", &basic_auth(username, password))
        .call();
    match result {
        Ok(resp) => Ok(format!("DELETE {}", resp.status().as_u16())),
        Err(ureq::Error::StatusCode(404)) => Ok(String::from("DELETE 404 (already gone)")),
        Err(e) => Err(format!("DELETE failed: {}", e)),
    }
}

fn base64_encode(input: &str) -> String {
    use base64::{Engine as _, engine::general_purpose};
    general_purpose::STANDARD.encode(input)
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![greet, webdav_put, webdav_get, webdav_test, webdav_mkcol, webdav_list, webdav_delete])
        .setup(|app| {
            // Create the tray menu
            let show_i = MenuItem::with_id(app, "show", "显示窗口", true, None::<&str>)?;
            let quit_i = MenuItem::with_id(app, "quit", "退出", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&show_i, &quit_i])?;

            // Build tray icon
            let _tray = TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("PomodoroX - 番茄时钟")
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "show" => {
                        if let Some(window) = app.get_webview_window("main") {
                            let _ = window.show();
                            let _ = window.set_focus();
                        }
                    }
                    "quit" => {
                        app.exit(0);
                    }
                    _ => {}
                })
                .build(app)?;

            // Configure main window
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.set_title("PomodoroX");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running PomodoroX");
}
