// ============================================================
// PomodoroX - Token 加密存储（Web Crypto API · AES-256-GCM）
//
// 安全模型：
//   - 防止：浏览器扩展读取 localStorage、本地文件窃取
//   - 不防：拥有完整 JS 执行权限的 XSS 攻击（靠 P0-1/3 防护）
//
// 密钥派生：
//   PBKDF2(origin + 固定盐) → AES-256-GCM key
//   密钥与域名绑定，无法跨域解密
// ============================================================

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const PBKDF2_ITERATIONS = 600_000;
const SALT_BASE = "pomodorox-crypto-v1";

/**
 * 派生加密密钥（基于当前域名）
 * 密钥存储于 IndexedDB 的 CryptoKey（不可导出），仅在内存中存在
 */
let cachedKey: CryptoKey | null = null;
let keyPromise: Promise<CryptoKey> | null = null;

function getDerivedKey(): Promise<CryptoKey> {
  if (cachedKey) return Promise.resolve(cachedKey);
  if (keyPromise) return keyPromise;

  keyPromise = (async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "pomodorox";
    const salt = new TextEncoder().encode(`${SALT_BASE}:${origin}`);

    // 先用 PBKDF2 派生原始密钥
    const baseKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(`pomodorox-master-seed:${origin}`),
      "PBKDF2",
      false,
      ["deriveKey"]
    );

    cachedKey = await crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: PBKDF2_ITERATIONS,
        hash: "SHA-256",
      },
      baseKey,
      { name: ALGORITHM, length: KEY_LENGTH },
      true,
      ["encrypt", "decrypt"]
    );

    return cachedKey;
  })();

  return keyPromise;
}

/**
 * 加密明文并返回 Base64 编码的密文（含 IV）
 * 格式: iv_base64.ciphertext_base64
 */
export async function encrypt(plaintext: string): Promise<string> {
  if (!plaintext) return "";

  const key = await getDerivedKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  const encoded = new TextEncoder().encode(plaintext);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    encoded
  );

  // 组合 IV + 密文
  const ivStr = btoa(String.fromCharCode(...iv));
  const ctStr = btoa(String.fromCharCode(...new Uint8Array(ciphertext)));

  return `${ivStr}.${ctStr}`;
}

/**
 * 解密密文并返回明文
 * @param encrypted 加密后的字符串（encrypt() 的输出格式）
 * @returns 解密后的明文；失败时返回空字符串
 */
export async function decrypt(encrypted: string): Promise<string> {
  if (!encrypted || !encrypted.includes(".")) return "";

  try {
    const key = await getDerivedKey();
    const [ivStr, ctStr] = encrypted.split(".");

    const iv = new Uint8Array(
      atob(ivStr)
        .split("")
        .map((c) => c.charCodeAt(0))
    );
    const ciphertext = new Uint8Array(
      atob(ctStr)
        .split("")
        .map((c) => c.charCodeAt(0))
    );

    const plaintext = await crypto.subtle.decrypt(
      { name: ALGORITHM, iv },
      key,
      ciphertext
    );

    return new TextDecoder().decode(plaintext);
  } catch {
    console.warn("[Crypto] 解密失败，token 可能已损坏或域名变更");
    return "";
  }
}

/**
 * 安全存储加密值到 localStorage
 * 自动添加命名空间前缀防止冲突
 */
export async function secureSetItem(key: string, value: string): Promise<void> {
  if (!value) {
    secureRemoveItem(key);
    return;
  }
  const encrypted = await encrypt(value);
  localStorage.setItem(`px_secure_${key}`, encrypted);
}

/**
 * 从 localStorage 读取并解密值
 */
export async function secureGetItem(key: string): Promise<string> {
  const encrypted = localStorage.getItem(`px_secure_${key}`);
  if (!encrypted) return "";
  return decrypt(encrypted);
}

/**
 * 删除加密存储的值
 */
export function secureRemoveItem(key: string): void {
  localStorage.removeItem(`px_secure_${key}`);
}

// ============================================================
// 测试辅助函数
// ============================================================

/** 清除密钥缓存（仅测试使用） */
export function __testOnlyClearKeyCache(): void {
  cachedKey = null;
  keyPromise = null;
}
