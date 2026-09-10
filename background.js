// Web into PDF & Document Suite Pro - Service Worker
// Manages context menus, tab scripting, and background workflows

chrome.runtime.onInstalled.addListener(() => {
  console.log('Web into PDF & Document Suite Pro installed.');

  // Create Context Menus
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'wip-save-pdf',
      title: '📄 Save Page as PDF',
      contexts: ['page']
    });

    chrome.contextMenus.create({
      id: 'wip-save-selection-pdf',
      title: '✂️ Save Selected Text as PDF',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      id: 'wip-save-markdown',
      title: '📝 Export Page to Markdown (.md)',
      contexts: ['page']
    });
  });
});

// Handle Context Menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id || !tab.url || !tab.url.startsWith('http')) {
    return;
  }

  try {
    // Ensure content script is injected
    await ensureContentScriptInjected(tab.id);

    if (info.menuItemId === 'wip-save-pdf') {
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => window.print()
      });
    } else if (info.menuItemId === 'wip-save-selection-pdf') {
      // In direct selection mode, we can invoke direct PDF or print selection
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['libs/html2pdf.bundle.min.js']
      });
      await chrome.tabs.sendMessage(tab.id, {
        action: 'directPdfExport',
        options: { selectionOnly: true, paperSize: 'a4', orientation: 'portrait' }
      });
    } else if (info.menuItemId === 'wip-save-markdown') {
      const response = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractMarkdown',
        selectionOnly: false
      });
      if (response && response.success) {
        downloadBlob(response.data, response.filename, 'text/markdown');
      }
    }
  } catch (err) {
    console.error('Context menu action error:', err);
  }
});

// Helper to inject content script safely if not already present
async function ensureContentScriptInjected(tabId) {
  try {
    const ping = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
    if (ping && ping.success) return true;
  } catch {
    // Script not injected yet, inject it
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content.js']
    });
  }
}

// Download helper
function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const reader = new FileReader();
  reader.onload = () => {
    chrome.downloads.download({
      url: reader.result,
      filename: filename,
      saveAs: true
    });
  };
  reader.readAsDataURL(blob);
}
