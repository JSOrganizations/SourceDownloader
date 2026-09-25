# DevTools Source Downloader

A powerful Chrome DevTools extension that allows you to easily download all loaded resources (HTML, CSS, JS, Images, etc.) from any webpage while preserving the exact folder structure. 

Developed by [JSOrganizations](https://github.com/JSOrganizations).

## ✨ Features

- **One-Click Download:** Save all webpage assets into a neatly organized `.zip` file.
- **Preserves Folder Structure:** Recreates the exact directory tree (e.g., `css/style.css`, `images/logo.png`) as seen in the DevTools "Sources" tab.
- **Smart Filtering (Scope Selection):**
  - **Download EVERYTHING:** Captures all loaded files, including third-party assets (CDNs, Google Analytics, external fonts, etc.).
  - **Download ONLY from current website:** Filters out third-party clutter and downloads only the primary domain's assets.
- **Live Progress UI:** Clean, modern interface displaying real-time progress and logs of downloaded files.
- **Manifest V3:** Built using the latest and most secure Chrome Extension standards.

## 🚀 Installation (Developer Mode)

Since this extension is not currently published on the Chrome Web Store, you can install it manually by following these steps:

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** using the toggle switch in the top right corner.
4. Click on the **Load unpacked** button in the top left.
5. Select the `SourceDownloader` folder containing this extension's files.
6. The extension is now installed!

## 💡 How to Use

1. Navigate to the webpage you want to download resources from.
2. Open Chrome Developer Tools (`F12` or Right-Click > `Inspect`).
3. In the DevTools top menu (where Elements, Console, Sources are located), click the `>>` icon if the tab is hidden, and select **Source Downloader**.
4. Choose your preferred **Download Scope**:
   - *Everything* (All domains)
   - *Current website only*
5. Click **Download Sources (.zip)**.
6. Wait for the progress bar to complete. A `.zip` file containing all the website's source files will be downloaded to your computer.

## 🛠️ Built With

- Vanilla JavaScript
- Chrome Extensions API (`chrome.devtools.inspectedWindow`)
- [JSZip](https://stuk.github.io/jszip/) (Client-side ZIP generation)

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---
*Created by [JSOrganizations](https://github.com/JSOrganizations)*
