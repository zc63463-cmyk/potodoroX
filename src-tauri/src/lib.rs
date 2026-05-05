use tauri::{
    menu::{Menu, MenuItem},
    tray::TrayIconBuilder,
    Manager,
};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! Welcome to PomodoroX.", name)
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
    let resp = ureq::put(&full_url)
        .set("Authorization", &format!("Basic {}", base64_encode(&format!("{}:{}", username, password))))
        .send_string(content)
        .map_err(|e| format!("PUT failed: {}", e))?;

    if resp.status() >= 200 && resp.status() < 300 {
        Ok(format!("Upload successful: {}", resp.status()))
    } else {
        Err(format!("Upload failed with status: {}", resp.status()))
    }
}

/// WebDAV GET 下载文件
#[tauri::command]
fn webdav_get(url: &str, username: &str, password: &str, path: &str) -> Result<String, String> {
    let full_url = format!("{}/{}", url.trim_end_matches('/'), path.trim_start_matches('/'));
    let resp = ureq::get(&full_url)
        .set("Authorization", &format!("Basic {}", base64_encode(&format!("{}:{}", username, password))))
        .call()
        .map_err(|e| format!("GET failed: {}", e))?;

    if resp.status() >= 200 && resp.status() < 300 {
        resp.into_body()
            .read_to_string()
            .map_err(|e| format!("Read body failed: {}", e))
    } else {
        Err(format!("GET failed with status: {}", resp.status()))
    }
}

/// WebDAV PROPFIND 测试连接
#[tauri::command]
fn webdav_test(url: &str, username: &str, password: &str) -> Result<bool, String> {
    let resp = ureq::request("PROPFIND", url)
        .set("Authorization", &format!("Basic {}", base64_encode(&format!("{}:{}", username, password))))
        .set("Depth", "0")
        .send("")
        .map_err(|e| format!("PROPFIND failed: {}", e))?;

    Ok(resp.status() == 207 || resp.status() == 200)
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
        .invoke_handler(tauri::generate_handler![greet, webdav_put, webdav_get, webdav_test])
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
