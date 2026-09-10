// Web into PDF & Document Suite Pro - Content Script
// Handles Element Eraser, Reader View, Extractors, Ink-saver, and Clean PDF Generation

(function () {
  if (window.__webIntoPdfInitialized) {
    return;
  }
  window.__webIntoPdfInitialized = true;

  // State Management
  const state = {
    eraserActive: false,
    hoveredElement: null,
    undoStack: [],
    inkSaverActive: false,
    hideImagesActive: false,
    readerModeActive: false,
    originalBodyContent: null
  };

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
      case 'ping':
        sendResponse({ success: true, status: 'ready' });
        break;

      case 'getPageDetails':
        sendResponse({
          title: document.title || 'Webpage',
          url: window.location.href,
          hasSelection: !window.getSelection().isCollapsed && window.getSelection().toString().trim().length > 0,
          selectedTextLength: window.getSelection().toString().trim().length,
          imageCount: document.querySelectorAll('img[src]').length,
          tableCount: document.querySelectorAll('table').length,
          inkSaverActive: state.inkSaverActive,
          hideImagesActive: state.hideImagesActive,
          eraserActive: state.eraserActive,
          readerModeActive: state.readerModeActive
        });
        break;

      case 'toggleEraser':
        if (state.eraserActive) {
          disableEraser();
        } else {
          enableEraser();
        }
        sendResponse({ active: state.eraserActive });
        break;

      case 'undoEraser':
        const undone = undoLastErase();
        sendResponse({ success: undone, count: state.undoStack.length });
        break;

      case 'toggleInkSaver':
        toggleInkSaver();
        sendResponse({ active: state.inkSaverActive });
        break;

      case 'toggleHideImages':
        toggleHideImages();
        sendResponse({ active: state.hideImagesActive });
        break;

      case 'toggleReaderMode':
        toggleReaderMode();
        sendResponse({ active: state.readerModeActive });
        break;

      case 'resetPageModifications':
        resetPage();
        sendResponse({ success: true });
        break;

      case 'extractMarkdown':
        const md = getPageMarkdown(message.selectionOnly);
        sendResponse({
          success: true,
          data: md,
          title: document.title,
          filename: sanitizeFilename(document.title) + '.md'
        });
        break;

      case 'extractText':
        const text = getPageCleanText(message.selectionOnly);
        sendResponse({
          success: true,
          data: text,
          title: document.title,
          filename: sanitizeFilename(document.title) + '.txt'
        });
        break;

      case 'extractHTML':
        const html = getPageCleanHTML(message.selectionOnly);
        sendResponse({
          success: true,
          data: html,
          title: document.title,
          filename: sanitizeFilename(document.title) + '.html'
        });
        break;

      case 'extractTables':
        const tablesCsv = extractTablesToCSV();
        sendResponse({
          success: tablesCsv.count > 0,
          count: tablesCsv.count,
          data: tablesCsv.csv,
          filename: sanitizeFilename(document.title) + '_tables.csv'
        });
        break;

      case 'extractImagesList':
        const images = extractImagesList();
        sendResponse({
          success: images.length > 0,
          count: images.length,
          images: images,
          title: document.title
        });
        break;

      case 'extractLinksList':
        const links = extractLinksList();
        sendResponse({
          success: links.length > 0,
          count: links.length,
          links: links,
          filename: sanitizeFilename(document.title) + '_links.csv'
        });
        break;

      case 'directPdfExport':
        generateDirectPdf(message.options)
          .then((res) => sendResponse({ success: true, filename: res.filename }))
          .catch((err) => sendResponse({ success: false, error: err.message }));
        return true; // Keep channel open for async response

      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  });

  // ==========================================
  // 1. ELEMENT ERASER TOOL
  // ==========================================
  const HIGHLIGHT_CLASS = 'wip-eraser-hover-target';
  let eraserBanner = null;

  function enableEraser() {
    state.eraserActive = true;
    injectEraserStyles();
    createEraserBanner();

    document.addEventListener('mouseover', handleEraserHover, true);
    document.addEventListener('mouseout', handleEraserUnhover, true);
    document.addEventListener('click', handleEraserClick, true);
    document.addEventListener('keydown', handleEraserKeydown, true);
  }

  function disableEraser() {
    state.eraserActive = false;
    clearEraserHover();

    document.removeEventListener('mouseover', handleEraserHover, true);
    document.removeEventListener('mouseout', handleEraserUnhover, true);
    document.removeEventListener('click', handleEraserClick, true);
    document.removeEventListener('keydown', handleEraserKeydown, true);

    if (eraserBanner && eraserBanner.parentNode) {
      eraserBanner.parentNode.removeChild(eraserBanner);
      eraserBanner = null;
    }

    const style = document.getElementById('wip-eraser-styles');
    if (style) style.remove();
  }

  function injectEraserStyles() {
    if (document.getElementById('wip-eraser-styles')) return;
    const style = document.createElement('style');
    style.id = 'wip-eraser-styles';
    style.textContent = `
      .${HIGHLIGHT_CLASS} {
        outline: 2px dashed #f43f5e !important;
        outline-offset: -2px !important;
        background-color: rgba(244, 63, 94, 0.12) !important;
        cursor: crosshair !important;
        transition: outline 0.1s ease !important;
      }
      #wip-eraser-banner {
        position: fixed !important;
        bottom: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 2147483647 !important;
        background: rgba(15, 23, 42, 0.94) !important;
        backdrop-filter: blur(12px) !important;
        -webkit-backdrop-filter: blur(12px) !important;
        color: #f8fafc !important;
        border: 1px solid rgba(244, 63, 94, 0.4) !important;
        border-radius: 9999px !important;
        padding: 8px 18px !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        font-size: 13px !important;
        font-weight: 500 !important;
        display: flex !important;
        align-items: center !important;
        gap: 12px !important;
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 0 15px rgba(244, 63, 94, 0.25) !important;
        user-select: none !important;
      }
      #wip-eraser-banner button {
        background: #334155 !important;
        color: #f8fafc !important;
        border: none !important;
        border-radius: 9999px !important;
        padding: 4px 10px !important;
        font-size: 12px !important;
        cursor: pointer !important;
        transition: all 0.15s ease !important;
      }
      #wip-eraser-banner button:hover {
        background: #475569 !important;
      }
      #wip-eraser-banner button.wip-btn-exit {
        background: #e11d48 !important;
      }
      #wip-eraser-banner button.wip-btn-exit:hover {
        background: #be123c !important;
      }
    `;
    document.head.appendChild(style);
  }

  function createEraserBanner() {
    if (document.getElementById('wip-eraser-banner')) return;
    eraserBanner = document.createElement('div');
    eraserBanner.id = 'wip-eraser-banner';
    updateEraserBannerText();
    document.body.appendChild(eraserBanner);
  }

  function updateEraserBannerText() {
    if (!eraserBanner) return;
    eraserBanner.innerHTML = `
      <span style="display:inline-flex;align-items:center;gap:6px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#f43f5e;animation:pulse 1.5s infinite;"></span>
        <strong>Element Eraser Active:</strong> Click any banner or section to delete
      </span>
      <button id="wip-undo-btn" title="Undo delete">↶ Undo (${state.undoStack.length})</button>
      <button class="wip-btn-exit" id="wip-exit-btn">Done (ESC)</button>
    `;
    eraserBanner.querySelector('#wip-undo-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      undoLastErase();
    });
    eraserBanner.querySelector('#wip-exit-btn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      disableEraser();
    });
  }

  function handleEraserHover(e) {
    if (!state.eraserActive) return;
    const target = e.target;
    if (isSystemElement(target)) return;

    clearEraserHover();
    state.hoveredElement = target;
    target.classList.add(HIGHLIGHT_CLASS);
  }

  function handleEraserUnhover(e) {
    if (!state.eraserActive) return;
    if (e.target === state.hoveredElement) {
      clearEraserHover();
    }
  }

  function clearEraserHover() {
    if (state.hoveredElement) {
      state.hoveredElement.classList.remove(HIGHLIGHT_CLASS);
      state.hoveredElement = null;
    }
  }

  function handleEraserClick(e) {
    if (!state.eraserActive) return;
    const target = e.target;
    if (isSystemElement(target)) return;

    e.preventDefault();
    e.stopPropagation();

    clearEraserHover();

    // Push into undo stack
    state.undoStack.push({
      element: target,
      parent: target.parentNode,
      nextSibling: target.nextSibling,
      originalDisplay: target.style.display
    });

    target.style.display = 'none';
    updateEraserBannerText();
  }

  function handleEraserKeydown(e) {
    if (!state.eraserActive) return;
    if (e.key === 'Escape') {
      disableEraser();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      undoLastErase();
    }
  }

  function undoLastErase() {
    if (state.undoStack.length === 0) return false;
    const last = state.undoStack.pop();
    if (last && last.element) {
      last.element.style.display = last.originalDisplay || '';
    }
    updateEraserBannerText();
    return true;
  }

  function isSystemElement(el) {
    if (!el) return true;
    if (el.id === 'wip-eraser-banner' || el.closest('#wip-eraser-banner')) return true;
    if (el.id === 'wip-reader-container' || el.closest('#wip-reader-container')) return true;
    return false;
  }

  // ==========================================
  // 2. INK SAVER & IMAGE HIDER
  // ==========================================
  function toggleInkSaver() {
    state.inkSaverActive = !state.inkSaverActive;
    let style = document.getElementById('wip-ink-saver-style');
    if (state.inkSaverActive) {
      if (!style) {
        style = document.createElement('style');
        style.id = 'wip-ink-saver-style';
        style.textContent = `
          html, body {
            filter: grayscale(100%) contrast(110%) !important;
            -webkit-filter: grayscale(100%) contrast(110%) !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          * {
            box-shadow: none !important;
            text-shadow: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else if (style) {
      style.remove();
    }
  }

  function toggleHideImages() {
    state.hideImagesActive = !state.hideImagesActive;
    let style = document.getElementById('wip-hide-images-style');
    if (state.hideImagesActive) {
      if (!style) {
        style = document.createElement('style');
        style.id = 'wip-hide-images-style';
        style.textContent = `
          img, picture, video, svg, canvas, [style*="background-image"] {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else if (style) {
      style.remove();
    }
  }

  // ==========================================
  // 3. READER MODE (DISTRACTION-FREE)
  // ==========================================
  function toggleReaderMode() {
    state.readerModeActive = !state.readerModeActive;
    let container = document.getElementById('wip-reader-container');

    if (state.readerModeActive) {
      if (!container) {
        container = document.createElement('div');
        container.id = 'wip-reader-container';

        const mainContent = extractCleanArticleContent();

        container.innerHTML = `
          <div class="wip-reader-bar">
            <span>📖 Clean Reader View</span>
            <button id="wip-reader-close">Close Reader View</button>
          </div>
          <div class="wip-reader-body">
            <h1 class="wip-reader-title">${document.title}</h1>
            <div class="wip-reader-meta">Source: ${window.location.hostname} &bull; ${new Date().toLocaleDateString()}</div>
            <hr class="wip-reader-divider" />
            <div class="wip-reader-content">${mainContent.innerHTML}</div>
          </div>
        `;

        const readerStyles = document.createElement('style');
        readerStyles.id = 'wip-reader-styles';
        readerStyles.textContent = `
          #wip-reader-container {
            position: fixed !important;
            inset: 0 !important;
            background: #fdfbf7 !important;
            color: #1e293b !important;
            z-index: 2147483640 !important;
            overflow-y: auto !important;
            padding: 40px 20px 80px 20px !important;
            font-family: Georgia, Cambria, "Times New Roman", Times, serif !important;
            line-height: 1.8 !important;
          }
          .wip-reader-bar {
            position: sticky !important;
            top: 0 !important;
            max-width: 760px !important;
            margin: 0 auto 30px auto !important;
            display: flex !important;
            justify-content: space-between !important;
            align-items: center !important;
            padding: 10px 18px !important;
            background: rgba(253, 251, 247, 0.95) !important;
            border-bottom: 1px solid #e2e8f0 !important;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            z-index: 10 !important;
          }
          .wip-reader-bar button {
            background: #1e293b !important;
            color: #fff !important;
            border: none !important;
            padding: 6px 14px !important;
            border-radius: 6px !important;
            cursor: pointer !important;
            font-size: 12px !important;
          }
          .wip-reader-body {
            max-width: 760px !important;
            margin: 0 auto !important;
          }
          .wip-reader-title {
            font-size: 32px !important;
            line-height: 1.3 !important;
            margin-bottom: 12px !important;
            font-weight: 700 !important;
          }
          .wip-reader-meta {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            font-size: 13px !important;
            color: #64748b !important;
            margin-bottom: 24px !important;
          }
          .wip-reader-divider {
            border: 0 !important;
            border-top: 1px solid #cbd5e1 !important;
            margin: 24px 0 !important;
          }
          .wip-reader-content p {
            font-size: 19px !important;
            margin-bottom: 1.5em !important;
            color: #27272a !important;
          }
          .wip-reader-content img {
            max-width: 100% !important;
            height: auto !important;
            border-radius: 8px !important;
            margin: 20px auto !important;
            display: block !important;
          }
          .wip-reader-content h2, .wip-reader-content h3 {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
            margin-top: 1.8em !important;
            margin-bottom: 0.6em !important;
          }
        `;
        document.head.appendChild(readerStyles);
        document.body.appendChild(container);

        container.querySelector('#wip-reader-close').addEventListener('click', () => {
          toggleReaderMode();
        });
      }
    } else {
      if (container) container.remove();
      const st = document.getElementById('wip-reader-styles');
      if (st) st.remove();
    }
  }

  function extractCleanArticleContent() {
    // Look for article, main, or best container
    const candidates = document.querySelectorAll('article, [role="main"], main, .post-content, .article-body, .entry-content');
    let bestContainer = null;
    let maxScore = 0;

    candidates.forEach((el) => {
      const text = el.innerText || '';
      if (text.length > maxScore) {
        maxScore = text.length;
        bestContainer = el;
      }
    });

    if (!bestContainer || maxScore < 200) {
      bestContainer = document.body;
    }

    const clone = bestContainer.cloneNode(true);

    // Strip noisy elements
    const noisySelectors = [
      'nav', 'header', 'footer', 'aside', '.sidebar', '.ad', '.ads',
      '.advertisement', '.social-share', '.share-buttons', '.comments',
      'iframe', 'script', 'style', 'noscript', '#wip-eraser-banner',
      '#wip-reader-container', '[role="complementary"]'
    ];
    noisySelectors.forEach((sel) => {
      clone.querySelectorAll(sel).forEach((n) => n.remove());
    });

    return clone;
  }

  function resetPage() {
    disableEraser();
    if (state.inkSaverActive) toggleInkSaver();
    if (state.hideImagesActive) toggleHideImages();
    if (state.readerModeActive) toggleReaderMode();

    while (state.undoStack.length > 0) {
      undoLastErase();
    }
  }

  // ==========================================
  // 4. MARKDOWN & TEXT EXPORTERS
  // ==========================================
  function getPageMarkdown(selectionOnly) {
    let sourceNode;
    const sel = window.getSelection();

    if (selectionOnly && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const div = document.createElement('div');
      div.appendChild(range.cloneContents());
      sourceNode = div;
    } else {
      sourceNode = extractCleanArticleContent();
    }

    let md = `# ${document.title}\n\n`;
    md += `> **Source:** [${window.location.href}](${window.location.href})\n`;
    md += `> **Captured:** ${new Date().toLocaleString()}\n\n---\n\n`;

    md += htmlToMarkdown(sourceNode);
    return md;
  }

  function htmlToMarkdown(node) {
    if (!node) return '';
    let result = '';

    function walk(n) {
      if (n.nodeType === Node.TEXT_NODE) {
        return n.textContent.replace(/\s+/g, ' ');
      }
      if (n.nodeType !== Node.ELEMENT_NODE) return '';

      const tag = n.tagName.toLowerCase();
      let inner = '';
      for (const child of n.childNodes) {
        inner += walk(child);
      }

      switch (tag) {
        case 'h1': return `\n\n# ${inner.trim()}\n\n`;
        case 'h2': return `\n\n## ${inner.trim()}\n\n`;
        case 'h3': return `\n\n### ${inner.trim()}\n\n`;
        case 'h4': return `\n\n#### ${inner.trim()}\n\n`;
        case 'h5': return `\n\n##### ${inner.trim()}\n\n`;
        case 'h6': return `\n\n###### ${inner.trim()}\n\n`;
        case 'p': return `\n\n${inner.trim()}\n\n`;
        case 'strong':
        case 'b': return `**${inner.trim()}**`;
        case 'em':
        case 'i': return `*${inner.trim()}*`;
        case 'code':
          return n.parentNode?.tagName.toLowerCase() === 'pre' ? inner : `\`${inner.trim()}\``;
        case 'pre': return `\n\n\`\`\`\n${inner.trim()}\n\`\`\`\n\n`;
        case 'blockquote': return `\n\n> ${inner.trim().replace(/\n/g, '\n> ')}\n\n`;
        case 'a':
          const href = n.getAttribute('href');
          return href ? `[${inner.trim() || href}](${href})` : inner;
        case 'img':
          const src = n.getAttribute('src');
          const alt = n.getAttribute('alt') || 'image';
          return src ? `\n\n![${alt}](${src})\n\n` : '';
        case 'ul':
          return `\n\n${inner.trim()}\n\n`;
        case 'ol':
          return `\n\n${inner.trim()}\n\n`;
        case 'li':
          return `\n- ${inner.trim()}`;
        case 'hr': return `\n\n---\n\n`;
        case 'br': return `\n`;
        default: return inner;
      }
    }

    result = walk(node);
    return result.replace(/\n{3,}/g, '\n\n').trim();
  }

  function getPageCleanText(selectionOnly) {
    const sel = window.getSelection();
    if (selectionOnly && !sel.isCollapsed) {
      return sel.toString().trim();
    }
    const cleanArticle = extractCleanArticleContent();
    return cleanArticle.innerText.replace(/\n{3,}/g, '\n\n').trim();
  }

  function getPageCleanHTML(selectionOnly) {
    let contentHtml = '';
    const sel = window.getSelection();

    if (selectionOnly && !sel.isCollapsed) {
      const range = sel.getRangeAt(0);
      const div = document.createElement('div');
      div.appendChild(range.cloneContents());
      contentHtml = div.innerHTML;
    } else {
      contentHtml = extractCleanArticleContent().innerHTML;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${escapeHTML(document.title)}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 0 20px;
      color: #1a1a1a;
      background: #fafafa;
    }
    img { max-width: 100%; height: auto; border-radius: 6px; }
    h1, h2, h3 { color: #111; }
    a { color: #2563eb; }
    pre { background: #f1f5f9; padding: 12px; border-radius: 6px; overflow-x: auto; }
    .source-meta { color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb; padding-bottom: 16px; margin-bottom: 24px; }
  </style>
</head>
<body>
  <h1>${escapeHTML(document.title)}</h1>
  <div class="source-meta">
    Source: <a href="${window.location.href}">${window.location.href}</a> &bull; Saved on ${new Date().toLocaleString()}
  </div>
  ${contentHtml}
</body>
</html>`;
  }

  // ==========================================
  // 5. TABLE & LINK & IMAGE EXTRACTORS
  // ==========================================
  function extractTablesToCSV() {
    const tables = document.querySelectorAll('table');
    if (tables.length === 0) {
      return { count: 0, csv: '' };
    }

    let fullCsv = '';
    tables.forEach((table, index) => {
      fullCsv += `--- TABLE ${index + 1} ---\n`;
      const rows = table.querySelectorAll('tr');
      rows.forEach((row) => {
        const cells = row.querySelectorAll('th, td');
        const rowData = [];
        cells.forEach((cell) => {
          let text = cell.innerText.replace(/"/g, '""').trim();
          rowData.push(`"${text}"`);
        });
        fullCsv += rowData.join(',') + '\n';
      });
      fullCsv += '\n\n';
    });

    return { count: tables.length, csv: fullCsv };
  }

  function extractImagesList() {
    const imgs = document.querySelectorAll('img[src]');
    const set = new Set();
    const list = [];

    imgs.forEach((img) => {
      const src = img.src;
      if (!src || src.startsWith('data:') || set.has(src)) return;
      set.add(src);
      list.push({
        src: src,
        alt: img.alt || 'image',
        width: img.naturalWidth || img.width || 0,
        height: img.naturalHeight || img.height || 0
      });
    });

    return list;
  }

  function extractLinksList() {
    const anchors = document.querySelectorAll('a[href]');
    const set = new Set();
    let csv = 'Text,URL,Type\n';

    anchors.forEach((a) => {
      const href = a.href;
      if (!href || href.startsWith('javascript:') || set.has(href)) return;
      set.add(href);
      const isExternal = a.hostname !== window.location.hostname;
      const text = a.innerText.replace(/"/g, '""').trim() || a.title || 'Link';
      csv += `"${text}","${href}","${isExternal ? 'External' : 'Internal'}"\n`;
    });

    return csv;
  }

  // ==========================================
  // 6. DIRECT CLIENT-SIDE PDF EXPORT
  // ==========================================
  async function generateDirectPdf(options = {}) {
    if (typeof window.html2pdf === 'undefined') {
      throw new Error('html2pdf library is not loaded');
    }

    let targetElement;
    let tempWrapper = null;

    if (options.readerMode) {
      targetElement = extractCleanArticleContent();
      tempWrapper = document.createElement('div');
      tempWrapper.style.padding = '20px';
      tempWrapper.style.fontFamily = 'Arial, sans-serif';
      tempWrapper.innerHTML = `
        <h1 style="font-size:24px;margin-bottom:8px;">${escapeHTML(document.title)}</h1>
        <p style="color:#666;font-size:12px;margin-bottom:20px;">Source: ${window.location.href}</p>
      `;
      tempWrapper.appendChild(targetElement);
      document.body.appendChild(tempWrapper);
      targetElement = tempWrapper;
    } else if (options.selectionOnly) {
      const sel = window.getSelection();
      if (sel.isCollapsed) throw new Error('No text is currently selected on the page');
      tempWrapper = document.createElement('div');
      tempWrapper.style.padding = '20px';
      tempWrapper.style.fontFamily = 'Arial, sans-serif';
      tempWrapper.appendChild(sel.getRangeAt(0).cloneContents());
      document.body.appendChild(tempWrapper);
      targetElement = tempWrapper;
    } else {
      targetElement = document.body;
    }

    const filename = sanitizeFilename(options.filename || document.title) + '.pdf';
    const paperSize = options.paperSize || 'a4';
    const orientation = options.orientation || 'portrait';
    const margin = options.margin !== undefined ? options.margin : 10;

    const opt = {
      margin: margin,
      filename: filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: paperSize, orientation: orientation }
    };

    try {
      await window.html2pdf().from(targetElement).set(opt).save();
      return { success: true, filename: filename };
    } finally {
      if (tempWrapper && tempWrapper.parentNode) {
        tempWrapper.parentNode.removeChild(tempWrapper);
      }
    }
  }

  // Utilities
  function sanitizeFilename(name) {
    if (!name) return 'document';
    return name.replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_').substring(0, 80);
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, (tag) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }

})();
