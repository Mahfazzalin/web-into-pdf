// Web into PDF & Document Suite Pro - Popup Controller

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const resetPageBtn = document.getElementById('resetPageBtn');
  const tabFavicon = document.getElementById('tabFavicon');
  const tabTitle = document.getElementById('tabTitle');
  const tabDomain = document.getElementById('tabDomain');
  const metaSelection = document.getElementById('metaSelection');
  const metaImages = document.getElementById('metaImages');
  const metaTables = document.getElementById('metaTables');
  const toastContainer = document.getElementById('toast-container');

  // Tab Buttons
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content');

  // PDF Controls
  const directPdfBtn = document.getElementById('directPdfBtn');
  const nativePrintBtn = document.getElementById('nativePrintBtn');
  const readerPdfBtn = document.getElementById('readerPdfBtn');
  const selectionPdfBtn = document.getElementById('selectionPdfBtn');
  const copyCitationsBtn = document.getElementById('copyCitationsBtn');
  const pdfPaperSize = document.getElementById('pdfPaperSize');
  const pdfOrientation = document.getElementById('pdfOrientation');
  const pdfMargin = document.getElementById('pdfMargin');

  // Page Tools Controls
  const eraserCard = document.getElementById('eraserCard');
  const eraserStatus = document.getElementById('eraserStatus');
  const toggleEraserBtn = document.getElementById('toggleEraserBtn');
  const undoEraserBtn = document.getElementById('undoEraserBtn');
  const toggleReaderCard = document.getElementById('toggleReaderCard');
  const toggleInkSaverCard = document.getElementById('toggleInkSaverCard');
  const toggleHideImagesCard = document.getElementById('toggleHideImagesCard');

  // Converter Controls
  const exportMarkdownBtn = document.getElementById('exportMarkdownBtn');
  const exportTextBtn = document.getElementById('exportTextBtn');
  const exportHtmlBtn = document.getElementById('exportHtmlBtn');
  const exportCsvBtn = document.getElementById('exportCsvBtn');

  // Batch Controls
  const extractImagesZipBtn = document.getElementById('extractImagesZipBtn');
  const extractLinksBtn = document.getElementById('extractLinksBtn');
  const exportAllTabsBtn = document.getElementById('exportAllTabsBtn');

  let currentTab = null;
  const isExtensionEnv = typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.query === 'function';

  // Storage helper
  const storageGet = (keys, cb) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get(keys, cb);
    } else {
      const res = {};
      keys.forEach((k) => { res[k] = localStorage.getItem(k); });
      cb(res);
    }
  };

  const storageSet = (obj) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set(obj);
    } else {
      Object.entries(obj).forEach(([k, v]) => { localStorage.setItem(k, v); });
    }
  };

  // 1. Initialize Active Tab
  if (isExtensionEnv) {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tabs || tabs.length === 0) {
        tabTitle.textContent = 'No active tab found';
        return;
      }
      currentTab = tabs[0];

      // Render Tab Info
      tabTitle.textContent = currentTab.title || 'Untitled Page';
      tabTitle.title = currentTab.title || '';

      try {
        const urlObj = new URL(currentTab.url);
        tabDomain.textContent = urlObj.hostname.replace(/^www\./, '');
        if (currentTab.favIconUrl) {
          tabFavicon.src = currentTab.favIconUrl;
        }
      } catch {
        tabDomain.textContent = 'local/system';
      }

      // Check if valid web page (not chrome:// or extension page)
      if (!currentTab.url || !currentTab.url.startsWith('http')) {
        showToast('Notice: Cannot run tools on browser system pages.', 'error', 5000);
        disableAllActions();
        return;
      }

      // Ensure content script is injected
      await ensureInjected(currentTab.id);

      // Refresh page statistics
      await refreshPageStats();
    } catch (err) {
      console.error('Initialization error:', err);
    }
  } else {
    // Standalone Preview Mode (for debugging / browser testing)
    tabTitle.textContent = 'Preview: Web into PDF Pro - Modern Web Document Suite';
    tabDomain.textContent = 'github.com';
    metaSelection.textContent = '✂️ 240 chars selected';
    metaSelection.classList.add('active');
    metaImages.textContent = '🖼️ 12 imgs';
    metaTables.textContent = '📊 3 tables';
    showToast('Web into PDF Pro Preview Active', 'info', 2500);
  }

  // 2. Theme Handling
  storageGet(['theme', 'pdfPaperSize', 'pdfOrientation', 'pdfMargin'], (res) => {
    if (res.theme === 'light') {
      document.body.classList.add('light-theme');
      renderThemeIcon(true);
    } else {
      renderThemeIcon(false);
    }

    if (res.pdfPaperSize) pdfPaperSize.value = res.pdfPaperSize;
    if (res.pdfOrientation) pdfOrientation.value = res.pdfOrientation;
    if (res.pdfMargin) pdfMargin.value = res.pdfMargin;
  });

  themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    renderThemeIcon(isLight);
    storageSet({ theme: isLight ? 'light' : 'dark' });
  });

  function renderThemeIcon(isLight) {
    if (isLight) {
      themeIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
      themeToggleBtn.title = 'Switch to Dark Mode';
    } else {
      themeIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
      themeToggleBtn.title = 'Switch to Light Mode';
    }
  }

  // Persist PDF Settings on change
  [pdfPaperSize, pdfOrientation, pdfMargin].forEach((el) => {
    el.addEventListener('change', () => {
      storageSet({
        pdfPaperSize: pdfPaperSize.value,
        pdfOrientation: pdfOrientation.value,
        pdfMargin: pdfMargin.value
      });
    });
  });

  // 3. Segmented Navigation Tabs
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanels.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPanel = document.getElementById(btn.dataset.tab);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // 4. PDF Tools Handlers
  // ------------------------------------
  // Direct PDF Download
  directPdfBtn.addEventListener('click', async () => {
    await runDirectPdf({
      readerMode: false,
      selectionOnly: false
    });
  });

  // Native Print
  nativePrintBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    try {
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        func: () => window.print()
      });
      showToast('Opening Chrome Print dialog...', 'success');
    } catch (err) {
      showToast('Could not open print dialog: ' + err.message, 'error');
    }
  });

  // Reader PDF
  readerPdfBtn.addEventListener('click', async () => {
    await runDirectPdf({
      readerMode: true,
      selectionOnly: false
    });
  });

  // Selection PDF
  selectionPdfBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    await ensureInjected(currentTab.id);

    const stats = await getTabMessage('getPageDetails');
    if (!stats || !stats.hasSelection) {
      showToast('Please highlight or select text on the webpage first!', 'error', 4000);
      return;
    }

    const cleanTitle = (currentTab.title || 'Webpage').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 35);
    await runDirectPdf({
      readerMode: false,
      selectionOnly: true,
      selectedText: stats.selectedText || '',
      selectedHtml: stats.selectedHtml || '',
      filename: `Selection_${cleanTitle}`
    });
  });

  // Copy Citation
  copyCitationsBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const citation = `"${currentTab.title}". ${currentTab.url} (accessed ${new Date().toLocaleDateString()}).`;
    try {
      await navigator.clipboard.writeText(citation);
      showToast('Citation copied to clipboard!', 'success');
    } catch {
      showToast('Could not copy to clipboard', 'error');
    }
  });

  async function runDirectPdf(options) {
    if (!currentTab) return;
    showToast('Preparing & rendering PDF document...', 'info', 4000);

    try {
      // Inject html2pdf library into page first
      await chrome.scripting.executeScript({
        target: { tabId: currentTab.id },
        files: ['libs/html2pdf.bundle.min.js']
      });

      const fullOpts = {
        paperSize: pdfPaperSize.value,
        orientation: pdfOrientation.value,
        margin: parseInt(pdfMargin.value, 10),
        ...options
      };

      const res = await chrome.tabs.sendMessage(currentTab.id, {
        action: 'directPdfExport',
        options: fullOpts
      });

      if (res && res.fallback) {
        showToast('Opened Chrome Print dialog (optimized for complex web apps)', 'success', 4000);
      } else if (res && res.success) {
        showToast(`PDF saved successfully: ${res.filename}`, 'success');
      } else {
        showToast(`PDF generation failed: ${res?.error || 'Unknown error'}`, 'error');
      }
    } catch (err) {
      showToast('PDF error: ' + err.message, 'error');
    }
  }

  // 5. Page Tools (Clean & Eraser) Handlers
  // ------------------------------------
  toggleEraserBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'toggleEraser' });
    if (res) {
      updateEraserUI(res.active);
      if (res.active) {
        showToast('Eraser Active: Click elements on page to remove them!', 'info', 4000);
      } else {
        showToast('Eraser Mode turned off', 'info');
      }
    }
  });

  undoEraserBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'undoEraser' });
    if (res && res.success) {
      showToast(`Restored element (${res.count} left in undo stack)`, 'success');
    } else {
      showToast('Nothing to undo', 'info');
    }
  });

  toggleReaderCard.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'toggleReaderMode' });
    if (res) {
      toggleReaderCard.classList.toggle('active', res.active);
      showToast(res.active ? 'Reader Mode enabled' : 'Reader Mode closed', 'info');
    }
  });

  toggleInkSaverCard.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'toggleInkSaver' });
    if (res) {
      toggleInkSaverCard.classList.toggle('active', res.active);
      showToast(res.active ? 'Ink-Saver Grayscale enabled' : 'Colors restored', 'info');
    }
  });

  toggleHideImagesCard.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'toggleHideImages' });
    if (res) {
      toggleHideImagesCard.classList.toggle('active', res.active);
      showToast(res.active ? 'All images hidden' : 'Images shown', 'info');
    }
  });

  resetPageBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    await chrome.tabs.sendMessage(currentTab.id, { action: 'resetPageModifications' });
    updateEraserUI(false);
    toggleReaderCard.classList.remove('active');
    toggleInkSaverCard.classList.remove('active');
    toggleHideImagesCard.classList.remove('active');
    showToast('All page modifications reset to original', 'success');
  });

  function updateEraserUI(isActive) {
    if (isActive) {
      eraserCard.classList.add('active');
      eraserStatus.style.display = 'inline-flex';
      toggleEraserBtn.innerHTML = '<span>Stop Eraser (ESC)</span>';
      toggleEraserBtn.classList.remove('primary');
    } else {
      eraserCard.classList.remove('active');
      eraserStatus.style.display = 'none';
      toggleEraserBtn.innerHTML = '<span>Toggle Eraser Mode</span>';
      toggleEraserBtn.classList.add('primary');
    }
  }

  // 6. Converter Handlers
  // ------------------------------------
  exportMarkdownBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractMarkdown' });
    if (res && res.success) {
      downloadFile(res.data, res.filename, 'text/markdown;charset=utf-8');
      showToast('Markdown downloaded: ' + res.filename, 'success');
    }
  });

  exportTextBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractText' });
    if (res && res.success) {
      downloadFile(res.data, res.filename, 'text/plain;charset=utf-8');
      showToast('Clean text downloaded: ' + res.filename, 'success');
    }
  });

  exportHtmlBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractHTML' });
    if (res && res.success) {
      downloadFile(res.data, res.filename, 'text/html;charset=utf-8');
      showToast('Offline HTML downloaded: ' + res.filename, 'success');
    }
  });

  exportCsvBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractTables' });
    if (res && res.success) {
      downloadFile(res.data, res.filename, 'text/csv;charset=utf-8');
      showToast(`Exported ${res.count} table(s) to CSV!`, 'success');
    } else {
      showToast('No HTML <table> elements found on this page.', 'error');
    }
  });

  // 7. Batch & Extract Handlers
  // ------------------------------------
  extractImagesZipBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    if (typeof JSZip === 'undefined') {
      showToast('JSZip library not available', 'error');
      return;
    }

    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractImagesList' });
    if (!res || !res.success || res.images.length === 0) {
      showToast('No extractable images found on this page', 'error');
      return;
    }

    const images = res.images;
    showToast(`Found ${images.length} images. Packaging into ZIP...`, 'info', 5000);

    const zip = new JSZip();
    const folder = zip.folder('images');
    let completed = 0;

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const response = await fetch(img.src);
        if (!response.ok) continue;
        const blob = await response.blob();
        let ext = blob.type.split('/')[1] || 'jpg';
        if (ext === 'jpeg') ext = 'jpg';
        if (ext.includes('+')) ext = ext.split('+')[0];

        const imgName = `image_${String(i + 1).padStart(3, '0')}.${ext}`;
        folder.file(imgName, blob);
        completed++;
      } catch (e) {
        console.warn('Could not fetch image:', img.src, e);
      }
    }

    if (completed === 0) {
      showToast('Could not download images due to website CORS restrictions', 'error');
      return;
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const cleanTitle = (res.title || 'webpage').replace(/[^a-zA-Z0-9_-]/g, '_');
    downloadFile(zipBlob, `${cleanTitle}_images.zip`, 'application/zip');
    showToast(`Successfully zipped ${completed} images!`, 'success');
  });

  extractLinksBtn.addEventListener('click', async () => {
    if (!currentTab) return;
    const res = await chrome.tabs.sendMessage(currentTab.id, { action: 'extractLinksList' });
    if (res && res.success) {
      downloadFile(res.links, res.filename, 'text/csv;charset=utf-8');
      showToast(`Extracted ${res.count} hyperlinks to CSV`, 'success');
    } else {
      showToast('No hyperlinks found on this page', 'error');
    }
  });

  exportAllTabsBtn.addEventListener('click', async () => {
    try {
      const allTabs = await chrome.tabs.query({ currentWindow: true });
      let summary = `# Open Tabs Summary (${allTabs.length} Tabs)\n\n`;
      summary += `> Exported on: ${new Date().toLocaleString()}\n\n`;

      allTabs.forEach((tab, index) => {
        summary += `${index + 1}. [${tab.title || 'Untitled'}](${tab.url})\n`;
      });

      downloadFile(summary, `open_tabs_summary_${Date.now()}.md`, 'text/markdown;charset=utf-8');
      showToast(`Exported ${allTabs.length} tabs to Markdown summary!`, 'success');
    } catch (err) {
      showToast('Error exporting tabs: ' + err.message, 'error');
    }
  });

  // Helpers
  async function refreshPageStats() {
    if (!currentTab) return;
    try {
      const stats = await chrome.tabs.sendMessage(currentTab.id, { action: 'getPageDetails' });
      if (!stats) return;

      if (stats.hasSelection) {
        metaSelection.textContent = `✂️ Selected (${stats.selectedTextLength} chars)`;
        metaSelection.classList.add('active');
      } else {
        metaSelection.textContent = '✂️ No selection';
        metaSelection.classList.remove('active');
      }

      metaImages.textContent = `🖼️ ${stats.imageCount} imgs`;
      metaTables.textContent = `📊 ${stats.tableCount} tables`;

      if (stats.eraserActive) updateEraserUI(true);
      if (stats.readerModeActive) toggleReaderCard.classList.add('active');
      if (stats.inkSaverActive) toggleInkSaverCard.classList.add('active');
      if (stats.hideImagesActive) toggleHideImagesCard.classList.add('active');
    } catch (e) {
      console.warn('Could not query page details:', e);
    }
  }

  async function ensureInjected(tabId) {
    try {
      const ping = await chrome.tabs.sendMessage(tabId, { action: 'ping' });
      if (ping && ping.success) return true;
    } catch {
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['content.js']
      });
    }
  }

  async function getTabMessage(action, payload = {}) {
    if (!currentTab) return null;
    try {
      return await chrome.tabs.sendMessage(currentTab.id, { action, ...payload });
    } catch {
      return null;
    }
  }

  function downloadFile(content, filename, mimeType) {
    if (typeof saveAs !== 'undefined') {
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      saveAs(blob, filename);
    } else {
      const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        a.remove();
        URL.revokeObjectURL(url);
      }, 500);
    }
  }

  function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f43f5e" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
    } else {
      iconSvg = `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#818cf8" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px) scale(0.95)';
      setTimeout(() => toast.remove(), 250);
    }, duration);
  }

  function disableAllActions() {
    document.querySelectorAll('.hero-btn, .action-card, .toggle-card, .tab-btn').forEach((el) => {
      el.style.opacity = '0.5';
      el.style.pointerEvents = 'none';
    });
  }

  // ------------------------------------
  // Monthly Review Reminder System
  // ------------------------------------
  const reviewBanner = document.getElementById('reviewBanner');
  const rateReviewBtn = document.getElementById('rateReviewBtn');
  const laterReviewBtn = document.getElementById('laterReviewBtn');
  const dismissReviewBtn = document.getElementById('dismissReviewBtn');
  const footerRateLink = document.getElementById('footerRateLink');

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000; // 30 days in ms

  function initReviewPromptSystem() {
    storageGet(['reviewGiven', 'lastReviewPromptTime', 'firstInstallTime'], (res) => {
      const now = Date.now();

      // First run: save install time and initialize prompt timer
      if (!res.firstInstallTime) {
        storageSet({
          firstInstallTime: now,
          lastReviewPromptTime: now
        });
        return;
      }

      // If user already reviewed, keep banner hidden
      if (res.reviewGiven) {
        return;
      }

      // Check if 30 days or more have elapsed since install or last prompt
      const lastPrompt = res.lastReviewPromptTime || res.firstInstallTime;
      if (now - lastPrompt >= THIRTY_DAYS_MS) {
        if (reviewBanner) {
          reviewBanner.style.display = 'flex';
        }
      }
    });
  }

  function openChromeStoreReview() {
    const extId = (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id)
      ? chrome.runtime.id
      : '';
    const reviewUrl = extId
      ? `https://chromewebstore.google.com/detail/${extId}/reviews`
      : 'https://chromewebstore.google.com/';

    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.create) {
      chrome.tabs.create({ url: reviewUrl });
    } else {
      window.open(reviewUrl, '_blank');
    }
  }

  function hideReviewBannerWithAnimation() {
    if (!reviewBanner) return;
    reviewBanner.style.opacity = '0';
    reviewBanner.style.transform = 'translateY(-8px) scale(0.98)';
    setTimeout(() => {
      reviewBanner.style.display = 'none';
    }, 250);
  }

  if (rateReviewBtn) {
    rateReviewBtn.addEventListener('click', () => {
      openChromeStoreReview();
      storageSet({
        reviewGiven: true,
        lastReviewPromptTime: Date.now()
      });
      hideReviewBannerWithAnimation();
      showToast('Thank you so much for supporting Web into PDF Pro! ❤️', 'success', 4000);
    });
  }

  function postponeReviewPrompt() {
    storageSet({
      lastReviewPromptTime: Date.now()
    });
    hideReviewBannerWithAnimation();
    showToast('Reminder postponed for 30 days. Thank you!', 'info', 3000);
  }

  if (laterReviewBtn) {
    laterReviewBtn.addEventListener('click', postponeReviewPrompt);
  }

  if (dismissReviewBtn) {
    dismissReviewBtn.addEventListener('click', postponeReviewPrompt);
  }

  if (footerRateLink) {
    footerRateLink.addEventListener('click', (e) => {
      e.preventDefault();
      openChromeStoreReview();
      storageSet({
        reviewGiven: true,
        lastReviewPromptTime: Date.now()
      });
      hideReviewBannerWithAnimation();
      showToast('Opening Chrome Web Store review page...', 'info', 3000);
    });
  }

  // Developer / debug helper to test banner rendering in console
  window.__testReviewReminder = () => {
    if (reviewBanner) {
      reviewBanner.style.display = 'flex';
      reviewBanner.style.opacity = '1';
      reviewBanner.style.transform = 'translateY(0) scale(1)';
    }
  };

  // Run review check on popup initialization
  initReviewPromptSystem();
});
