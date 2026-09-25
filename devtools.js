chrome.devtools.panels.create(
  "Source Downloader",
  "", // Icon path (optional)
  "panel.html",
  function(panel) {
    console.log("Source Downloader panel created.");
  }
);
