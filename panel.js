/* Copyright (c) 2026 Sowrov (Telegram: @JSOrganization). All rights reserved. */
let currentHostname = '';

if (chrome.devtools && chrome.devtools.inspectedWindow) {
  chrome.devtools.inspectedWindow.eval('window.location.hostname', (hostname) => {
    currentHostname = hostname || '';
    const domainSpan = document.getElementById('currentDomain');
    if (domainSpan) {
      domainSpan.textContent = currentHostname || 'Unknown Domain';
    }
  });
}

const getDomScript = `
(function() {
  try {
    let docToUse = document;
    const iframes = document.querySelectorAll('iframe');
    
    for (let i = 0; i < iframes.length; i++) {
      let iframe = iframes[i];
      let isFullScreen = (iframe.style.width === '100vw' && iframe.style.height === '100vh') || 
                         (iframe.clientWidth >= window.innerWidth * 0.9 && iframe.clientHeight >= window.innerHeight * 0.9);
                         
      if (isFullScreen) {
        if (iframe.contentDocument) {
          docToUse = iframe.contentDocument;
          break;
        }
      }
    }
    return docToUse.documentElement.outerHTML;
  } catch(e) {
    return document.documentElement.outerHTML;
  }
})();
`;

document.getElementById('downloadBtn').addEventListener('click', async () => {
  const btn = document.getElementById('downloadBtn');
  const status = document.getElementById('status');
  const progressFill = document.getElementById('progressFill');
  const logList = document.getElementById('logList');
  
  const scopeRadio = document.querySelector('input[name="scope"]:checked');
  const scope = scopeRadio ? scopeRadio.value : 'all';
  
  const typeRadio = document.querySelector('input[name="downloadType"]:checked');
  const downloadType = typeRadio ? typeRadio.value : 'zip';
  
  btn.disabled = true;
  logList.innerHTML = '';
  progressFill.style.width = '0%';
  
  const log = (msg, type = 'info') => {
    const li = document.createElement('li');
    li.textContent = msg;
    li.title = msg;
    if (type === 'error') li.className = 'error';
    if (type === 'success') li.className = 'success';
    if (type === 'warning') li.style.color = '#fbbc04';
    
    logList.appendChild(li);
    logList.scrollTop = logList.scrollHeight;
    status.textContent = msg;
  };
  
  try {
    if (!chrome.devtools || !chrome.devtools.inspectedWindow) {
      log('Error: API not available. Are you running this in DevTools?', 'error');
      btn.disabled = false;
      return;
    }

    if (downloadType === 'elementsOnly') {
      log('Capturing ONLY Live Elements (Smart IFrame Detection)...');
      progressFill.style.width = '50%';
      
      chrome.devtools.inspectedWindow.eval(getDomScript, (result, isException) => {
        if (isException || !result) {
          log('Failed to capture Live Elements. Please try reloading the page.', 'error');
          btn.disabled = false;
          return;
        }
        
        progressFill.style.width = '100%';
        const fullHtml = \`<!DOCTYPE html>\\n\${result}\`;
        
        const blob = new Blob([fullHtml], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const siteName = currentHostname || 'site';
        const timestamp = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
        const filename = \`\${siteName}_live_elements_\${timestamp}.html\`;
        
        log(\`Triggering download for \${filename}...\`, 'success');
        
        chrome.downloads.download({ url: url, filename: filename, saveAs: true }, () => {
          URL.revokeObjectURL(url);
          log('Download complete!', 'success');
          btn.disabled = false;
        });
      });
      return; 
    }

    log(\`Gathering resources (Scope: \${scope})...\`);
    chrome.devtools.inspectedWindow.getResources(async (resources) => {
      log(\`Found \${resources.length} total resources.\`);
      
      const zip = new JSZip();
      let processed = 0;
      let skippedCount = 0;
      
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
      
      log(\`Processing \${validResources.length} matching resources...\`);
      
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
             if (contentObj.encoding === 'base64') options.base64 = true;
             zip.file(filePath, contentObj.content, options);
             log(\`Added: \${filePath}\`);
          } else {
             skippedCount++;
             log(\`Skipped (No Content/Permission): \${filePath}\`, 'warning');
          }
        } catch (err) {
          skippedCount++;
          log(\`Failed to read: \${resource.url} (\${err.message})\`, 'error');
        }
        
        processed++;
        progressFill.style.width = \`\${(processed / validResources.length) * 100}%\`;
      }
      
      if (skippedCount > 0) {
        log(\`Warning: \${skippedCount} files were skipped. (Tip: Disable cache in Network tab)\`, 'warning');
      }
      
      log('Capturing Live Elements (Rendered DOM)...');
      try {
        const domContent = await new Promise(resolve => {
          chrome.devtools.inspectedWindow.eval(getDomScript, (result, isException) => {
              if (isException) resolve(null);
              else resolve(result);
          });
        });
        
        if (domContent) {
          const fullHtml = \`<!DOCTYPE html>\\n\${domContent}\`;
          const siteName = currentHostname || 'site';
          zip.file(\`\${siteName}_live_elements.html\`, fullHtml);
          log(\`Added: \${siteName}_live_elements.html (Live DOM)\`, 'success');
        }
      } catch (domErr) {
        log(\`Live DOM Error: \${domErr.message}\`, 'error');
      }
      
      log('Generating zip file (this might take a moment)...');
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = URL.createObjectURL(zipBlob);
      
      log('Preparing download...', 'success');
      const siteName = currentHostname || 'sources';
      const timestamp = new Date().toISOString().replace(/T/, '_').replace(/[:.]/g, '-').slice(0, 19);
      const filename = \`\${siteName}_sources_\${timestamp}.zip\`;
      
      chrome.downloads.download({
        url: zipUrl,
        filename: filename,
        saveAs: true
      }, (downloadId) => {
        URL.revokeObjectURL(zipUrl);
        if (chrome.runtime.lastError) {
          log(\`Download Error: \${chrome.runtime.lastError.message}\`, 'error');
        } else {
          log(\`Download complete! (\${filename})\`, 'success');
        }
        btn.disabled = false;
      });
      
    });
  } catch (err) {
    log(\`Critical Error: \${err.message}\`, 'error');
    btn.disabled = false;
  }
});
