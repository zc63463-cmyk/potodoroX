// ============================================================
// PomodoroX - 开发服务器启动脚本（带 QR Code）
// 启动 Vite dev server 并在终端打印局域网地址与二维码
// ============================================================

const { spawn } = require('child_process')
const qrcode = require('qrcode-terminal')
const os = require('os')

// 获取局域网 IP
const interfaces = os.networkInterfaces()
let ip = 'localhost'
for (const name of Object.keys(interfaces)) {
  for (const iface of interfaces[name]) {
    if (iface.family === 'IPv4' && !iface.internal) {
      ip = iface.address
      break
    }
  }
  if (ip !== 'localhost') break
}

const url = `http://${ip}:1420`
console.log(`\n  LAN 地址: ${url}\n`)
qrcode.generate(url, { small: true })

// 启动 Vite dev server
spawn('vite', ['--host', '0.0.0.0'], { stdio: 'inherit' })
