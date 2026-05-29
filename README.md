<div align="center">

# 🌟 Pulsar
### A beautiful, lightweight system monitor widget for macOS, Windows, and Linux
> Real-time CPU, GPU, RAM, temperature and top process monitoring — in a sleek floating widget

</div>

---

## ✨ Features

- 🟡 **CPU usage** — live percentage with color indicator
- 🟢 **GPU usage** — real-time monitoring  
- 🔵 **RAM usage** — used vs total in GB
- 🟣 **FPS counter** — frame rate display
- 🌡️ **CPU temperature** — live thermal readout
- 📊 **60 second history graph** — sparkline chart for every metric
- 🏆 **Top CPU consumers** — see which apps are eating your CPU
- 🪟 **Transparent floating widget** — sits cleanly on your desktop
- 🔴 **Close button** — exits the app
- 🟡 **Minimize to tray** — hides widget, keeps running in background
- ⚡ **Lightweight** — built with Rust + Tauri, tiny memory footprint

---

## 📸 Preview

![Pulsar Widget](screenshots/preview.png)

---

## ⬇️ Download and Install

> No coding required. Just download and run.

1. Go to the [**Actions**](https://github.com/udhavvvv-dev/pulsaar/actions) tab
2. Click the **latest successful run** (green ✅)
3. Scroll down to **Artifacts** and download for your OS:

| Platform | Artifact | How to install |
|---|---|---|
| 🍎 **macOS** | `Pulsar-macOS` | Extract → double-click `.dmg` → drag to Applications |
| 🪟 **Windows** | `Pulsar-Windows` | Extract → double-click `.exe` → follow installer |
| 🐧 **Linux** | `Pulsar-Linux` | Extract → right-click `.AppImage` → Allow executing as program → double-click |

> **Note:** You need a free GitHub account to download artifacts from Actions.

---

## 🖥️ System Requirements

| Platform | Minimum |
|---|---|
| macOS | 10.15 Catalina or later |
| Windows | Windows 10 or later |
| Linux | Ubuntu 20.04+ or any distro with WebKit2GTK |

---

## 🛠️ Build From Source

Only needed if you want to modify the code. Otherwise just download above.

### Prerequisites

- [Node.js](https://nodejs.org) LTS
- [Rust](https://rustup.rs)

### Steps

```bash
# Clone the repo
git clone https://github.com/udhavvvv-dev/pulsaar.git
cd pulsaar

# Install dependencies
npm install

# Run in development
npm run tauri dev

# Build for your platform
npm run tauri build
```

---

## 📄 License

MIT — free to use, modify, and share.

---

<div align="center">
Built with ❤️ using Tauri + Rust
</div>
