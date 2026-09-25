let currentHostname = '';

// On load, get the current hostname
if (chrome.devtools && chrome.devtools.inspectedWindow) {
  chrome.devtools.inspectedWindow.eval('window.location.hostname', (hostname) => {
    currentHostname = hostname || '';
    const domainSpan = document.getElementById('currentDomain');
    if (domainSpan) {
      domainSpan.textContent = currentHostname || 'Unknown Domain';
    }
  });
}

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const btn = document.getElementById('downloadBtn');
  const status = document.getElementById('status');
  const progressFill = document.getElementById('progressFill');
  const logList = document.getElementById('logList');
  
  // Get selected scope
  const scopeRadio = document.querySelector('input[name="scope"]:checked');
  const scope = scopeRadio ? scopeRadio.value : 'all';
  
  btn.disabled = true;
  logList.innerHTML = '';
  progressFill.style.width = '0%';
  
  const log = (msg, type = 'info') => {
    const li = document.createElement('li');
    li.textContent = msg;
    li.title = msg;
    if (type === 'error') li.className = 'error';
    if (type === 'success') li.className = 'success';
    
    logList.appendChild(li);
    logList.scrollTop = logList.scrollHeight;
    status.textContent = msg;
  };
  
  try {
    log(`Gathering resources (Scope: ${scope})...`);
    
    if (!chrome.devtools || !chrome.devtools.inspectedWindow) {
      log('Error: API not available. Are you running this in DevTools?', 'error');
      btn.disabled = false;
      return;
    }

    chrome.devtools.inspectedWindow.getResources(async (resources) => {
      log(`Found ${resources.length} total resources.`);
      
      const zip = new JSZip();
      let processed = 0;
      
      // Filter resources
      let validResources = resources.filter(r => r.url.startsWith('http://') || r.url.startsWith('https://'));
      
      if (scope === 'current' && currentHostname) {
        validResources = validResources.filter(r => {
          try {
            const urlObj = new URL(r.url);
            return urlObj.hostname === currentHostname;
          } catch(e) {
            return false;
          }
        });
      }
      
      log(`Processing ${validResources.length} matching resources...`);
      
      if (validResources.length === 0) {
        log('No resources matched the criteria!', 'error');
        btn.disabled = false;
        return;
      }
      
      for (const resource of validResources) {
        try {
          const urlObj = new URL(resource.url);
          let filePath = urlObj.hostname + urlObj.pathname;
          
          if (filePath.endsWith('/')) filePath += 'index.html';
          
          filePath = decodeURIComponent(filePath);
          
          const contentObj = await new Promise(resolve => {
             resource.getContent((content, encoding) => {
                resolve({ content, encoding });
             });
          });
          
          if (contentObj && contentObj.content !== null && contentObj.content !== undefined) {
             let options = {};
             if (contentObj.encoding === 'base64') {
               options.base64 = true;
             }
             zip.file(filePath, contentObj.content, options);
             log(`Added: ${filePath}`);
          } else {
             log(`Skipped (No Content/Permission): ${filePath}`, 'error');
          }
        } catch (err) {
          log(`Failed to read: ${resource.url} (${err.message})`, 'error');
        }
        
        processed++;
        progressFill.style.width = `${(processed / validResources.length) * 100}%`;
      }
      
      log('Generating zip file (this might take a moment)...');
      
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      log('Preparing download...', 'success');
      
      const siteName = currentHostname || 'sources';
      const timestamp = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
      const filename = `${siteName}_sources_${timestamp}.zip`;
      
      chrome.downloads.download({
        url: zipUrl,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        URL.revokeObjectURL(zipUrl);
        
        if (chrome.runtime.lastError) {
          log(`Download Error: ${chrome.runtime.lastError.message}`, 'error');
        } else {
          log(`Download started successfully! (${filename})`, 'success');
        }
        btn.disabled = false;
      });
      
    });
  } catch (err) {
    log(`Critical Error: ${err.message}`, 'error');
    btn.disabled = false;
  }
});
