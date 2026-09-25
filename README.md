# DevTools Source Downloader

A powerful Chrome DevTools extension that allows you to easily download all loaded resources (HTML, CSS, JS, Images, etc.) from any webpage while preserving the exact folder structure. It also features a Smart IFrame Detection system to capture Live DOM elements accurately.

**Copyright (c) 2026 Sowrov. All rights reserved.**  
*Developer:* Sowrov  
*Telegram:* [@JSOrganization](https://t.me/JSOrganization)  
*GitHub:* [JSOrganizations](https://github.com/JSOrganizations)

---

## ✨ Features

- **One-Click Download:** Save all webpage assets into a neatly organized `.zip` file.
- **Preserves Folder Structure:** Recreates the exact directory tree as seen in the DevTools "Sources" tab.
- **Smart Filtering (Scope Selection):**
  - **Download EVERYTHING:** Captures all loaded files, including third-party assets (CDNs, Google Analytics, external fonts, etc.).
  - **Download ONLY from current website:** Filters out third-party clutter and downloads only the primary domain's assets.
- **Live Elements Extraction:** 
  - Capable of downloading just the current live DOM as a single HTML file.
  - Smart iframe bypass automatically extracts the true website DOM even if it's hidden inside a wrapper.
- **Live Progress UI:** Clean, modern interface displaying real-time progress and logs of downloaded files.

## 🚀 Installation (Developer Mode)

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click on the **Load unpacked** button in the top left.
5. Select the `SourceDownloader` folder containing this extension's files.
6. The extension is now installed!

## 💡 How to Use

1. Navigate to the webpage you want to download resources from.
2. Open Chrome Developer Tools (`F12` or Right-Click > `Inspect`).
3. Navigate to the **Network** tab and check **Disable cache** to ensure all files can be captured, then refresh the page.
4. In the DevTools top menu, click the `>>` icon if the tab is hidden, and select **Source Downloader**.
5. Choose your **Download Scope** and **Download Type** (Full ZIP or ONLY Live Elements).
6. Click the Download button and wait for the ZIP or HTML file to be saved to your computer.

## 📄 License & Copyright

**Copyright (c) 2026 Sowrov (Telegram: @JSOrganization)**

This software is the intellectual property of Sowrov. All rights are reserved. If you use, distribute, or modify this code, proper attribution to the original author must be maintained.
