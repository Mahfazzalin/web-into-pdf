# Chrome Web Store Listing & Submission Guide — Web into PDF & Document Suite Pro

> **Last Updated:** 2026-09-12  
> **Extension Version:** 2.0.0  
> **Manifest Version:** 3 (MV3 Compliant)  
> **Target Store:** Google Chrome Web Store Developer Dashboard  

---

## 📋 1. Store Listing (স্টোর লিস্টিং তথ্য)

### Extension Name [REQUIRED]
<!-- Max 75 characters. Must exactly match manifest.json "name" -->
```text
Web into PDF & Document Suite Pro
```
*(Character count: 33 / 75)*

---

### Short Description / Summary [REQUIRED]
<!-- Max 132 characters. Shown in search results and extension cards. Must be direct & functional. -->
```text
All-in-one web document suite: Export PDF, Markdown, Text, Image ZIP, Table CSV, with live Element Eraser & Reader mode.
```
*(Character count: 124 / 132)*

---

### Detailed Description [REQUIRED]
<!-- Max 16,000 characters. 
     NOTE: Chrome Web Store plain text editor does not render Markdown (* or #). 
     Copy-paste the exact text block below directly into the CWS Description field:
-->
```text
Transform any webpage into clean, professional documents with one click. Web into PDF & Document Suite Pro is your complete, 100% private in-browser document toolbox.

Whether you need a pristine PDF report without ads, a Markdown file for Notion/Obsidian, raw data tables exported to Excel CSV, or all page images downloaded in a single ZIP, this suite handles it instantly and offline.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ KEY FEATURES AT A GLANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 1. VERSATILE PDF GENERATION
• Direct Clean PDF: Instant 1-click download without cumbersome print dialogs.
• Native High-Res Print: Full Chrome print preview with system printer support (Ctrl+P).
• Reader Mode PDF: Automatically strips sidebars, ads, banners, and clutter before export.
• Selection PDF: Highlight any section of text or article to export only that portion.
• Customizable Layouts: Choose Paper format (A4, Letter, Legal), Orientation (Portrait, Landscape), and Margins.

✂️ 2. LIVE ELEMENT ERASER & PAGE CLEANING
• Visual Element Eraser: Hover over any cookie banner, annoying popup, or side ad and click to delete it before printing.
• Multi-Step Undo: Made a mistake? Restore removed elements with a single click.
• Distraction-Free Reader Mode: Transform cluttered web articles into an elegant, readable typography layout.
• Ink-Saver (Grayscale): Converts colored pages to high-contrast black & white to save expensive printer ink.
• Hide All Images: 1-click toggle to suppress all pictures for text-only documentation.

🔄 3. MULTI-FORMAT CONVERTERS
• Web to Markdown (.md): Export clean, formatted Markdown ready for Obsidian, Notion, GitHub, and LLM/AI prompts.
• Web to Plain Text (.txt): Stripped text extraction for fast note-taking.
• Offline Standalone HTML (.html): Save self-contained offline readable web archives.
• Tables to CSV (.csv): Automatically detect HTML tables on any page and export them directly to Excel/Sheets compatible CSV format.

📦 4. BATCH EXTRACTION TOOLS
• Images to ZIP: Detect and archive all high-resolution webpage images into a neat ZIP file.
• Extract Links: Harvest every hyperlink on the active webpage into a structured CSV list.
• Batch Open Tabs: Export a structured Markdown summary of all tabs currently open in your browser window.

🖱️ 5. CONVENIENT RIGHT-CLICK CONTEXT MENUS
• Right-click anywhere on any webpage to instantly save as PDF or Markdown.
• Right-click highlighted text to export only the selection to PDF.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 100% PRIVATE & OFFLINE (ZERO DATA TRACKING)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• Zero Tracking: No analytics, no tracking pixels, and no telemetry.
• Local Processing: All conversions and PDF rendering occur 100% locally in your browser.
• No External Servers: No webpage contents, URLs, or personal data ever leave your computer.
• Works completely offline without an internet connection.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 HOW TO USE IT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Click the "Web into PDF" icon in your Chrome toolbar (or use right-click context menu).
2. Choose your desired action:
   - For an instant PDF, click "Direct Clean PDF".
   - To clean ads first, open the "Clean" tab and use the "Element Eraser".
   - To export Markdown, CSV, or Text, switch to the "Convert" tab.
   - To grab images or all links, switch to the "Extract" tab.
3. Your downloaded file will be saved directly to your Downloads folder!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💬 SUPPORT & FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Have questions, suggestions, or need help?
• Support Email: support@yourdomain.com
• Bug Reports & Feature Requests: https://github.com/Mahfazzalin/web-into-pdf/issues
```

---

### Category [REQUIRED]
```text
Productivity
```
*(Secondary Category optional: Developer Tools)*

---

### Single Purpose Description [REQUIRED]
<!-- One clear, focused sentence stating the core single function of the extension -->
```text
An all-in-one web document tool to convert web pages, selections, and tables into PDF, Markdown, CSV, Text, and image archives with live element cleanup.
```

---

### Primary Language [REQUIRED]
```text
English
```

---

## 🛡️ 2. Permissions Justification (পারমিশন জাস্টিফিকেশন)

> ⚠️ **IMPORTANT (গুরুত্বপূর্ণ):** Chrome Web Store review team checks each permission strictly. Never write "Required for the extension to work" — it will cause immediate rejection. Use the exact justifications prepared below:

| Permission | Type | Exact Justification for Chrome Web Store Dashboard |
| :--- | :--- | :--- |
| `activeTab` | `permissions` | Needed to securely access the currently focused webpage when the user clicks the extension popup or context menu, enabling on-page PDF conversion, element cleanup, and content extraction without requiring broad permissions across all websites. |
| `scripting` | `permissions` | Needed to inject the content scripts and client-side conversion libraries (html2pdf, reader mode styles, and DOM extractors) into the active tab to perform PDF generation, element erasure, and document formatting. |
| `tabs` | `permissions` | Needed to read the active tab's title, URL, and favicon to display metadata in the popup header and format document citations, as well as to enable the user-requested "Batch All Open Tabs" feature that summarizes open tab titles and links into a document. |
| `storage` | `permissions` | Needed to store user preferences locally on the client's browser (such as Dark/Light theme mode, preferred paper size [A4/Letter/Legal], orientation, and margin settings) using `chrome.storage.local`. |
| `downloads` | `permissions` | Needed to programmatically trigger the download and file saving of user-generated documents (PDF, Markdown, CSV, TXT, and ZIP image archives) directly to the user's Downloads directory with sanitized filenames. |
| `contextMenus` | `permissions` | Needed to create convenient right-click browser menu items ("Save Page as PDF", "Save Selected Text as PDF", and "Export Page to Markdown") allowing users to export pages or selected text directly. |

> **Host Permissions:**  
> **None (`host_permissions` are NOT requested in manifest.json).**  
> This significantly speeds up Chrome Web Store review approval because no broad domain access (`<all_urls>`) is requested!

---

## 🔒 3. Privacy & Data Use Disclosure (প্রাইভেসি এবং ডেটা ডিসক্লোজার)

In the Chrome Developer Dashboard under the **Privacy** tab, complete the questionnaire as follows:

### Data Collection Declarations

**Does the extension collect or transmit user data?**  
👉 Select: **NO** (This extension does not collect, record, or transmit any user data).

| Data Type Category | Collected? | Transmitted Off-Device? | Notes |
| :--- | :---: | :---: | :--- |
| Personally Identifiable Information (PII) | ❌ NO | ❌ NO | None collected |
| Health Information | ❌ NO | ❌ NO | None collected |
| Financial Information | ❌ NO | ❌ NO | None collected |
| Authentication Information (passwords, credentials) | ❌ NO | ❌ NO | None collected |
| Personal Communications | ❌ NO | ❌ NO | None collected |
| Location Data | ❌ NO | ❌ NO | None collected |
| Web History | ❌ NO | ❌ NO | URL is accessed solely in runtime memory to name the downloaded file; never stored or sent anywhere |
| User Activity (clicks, mouse tracking) | ❌ NO | ❌ NO | Element Eraser runs purely locally in active DOM |
| Website Content | ❌ NO | ❌ NO | Extracted in local DOM memory only to generate user-initiated file downloads (PDF/MD/CSV) |

### Developer Certifications (Compliance Checkboxes)
Mark all three required certification checkboxes in the dashboard:
- [x] **The developer declares that your data is not being sold to third parties, outside of the approved use cases.**
- [x] **The developer declares that your data is not being used or transferred for purposes that are unrelated to the item's core functionality.**
- [x] **The developer declares that your data is not being used or transferred to determine creditworthiness or for lending purposes.**

---

## 📄 4. Privacy Policy (প্রাইভেসি পলিসি)

> 💡 **Requirement:** You must host a publicly accessible Privacy Policy URL (e.g., via GitHub Pages, GitHub Gist, Notion, or your personal website).

### Recommended Privacy Policy URL:
`https://mahfazzalin.github.io/web-into-pdf/privacy` *(or a public GitHub Gist link)*

### Privacy Policy Text (Ready to Publish):

```markdown
# Privacy Policy for Web into PDF & Document Suite Pro

Last Updated: September 12, 2026

"Web into PDF & Document Suite Pro" is built with privacy as a foundational principle. We believe that your browsing activity and document exports are strictly your own personal business.

### 1. Zero Data Collection
Web into PDF & Document Suite Pro does NOT collect, harvest, transmit, or store any personal data, personally identifiable information (PII), browsing history, keystrokes, IP addresses, or analytical data.

### 2. Local-Only Processing
All document generation, including converting webpages to PDF, Markdown (.md), Plain Text (.txt), CSV tables (.csv), and ZIP archives (.zip), is executed 100% locally within your browser using client-side JavaScript. No webpage content, text, or images are ever transmitted to any remote server or third-party service.

### 3. Local Storage Use
The extension utilizes Chrome's `chrome.storage.local` API exclusively to remember your visual preferences on your own computer:
- UI Theme setting (Dark Mode vs. Light Mode)
- PDF configuration preferences (Paper format, Orientation, Margin size)
This information never leaves your personal browser.

### 4. Third-Party Services & Remote Code
The extension does NOT use any third-party analytics (e.g., Google Analytics, Mixpanel), tracking scripts, advertising networks, or remote CDNs. All required code and libraries (FileSaver, JSZip, html2pdf) are packaged locally within the extension build.

### 5. Permissions Usage
- `activeTab` & `scripting`: To read the active DOM and perform conversions on user command.
- `tabs`: To read the title and favicon for document naming and tab batch export.
- `downloads`: To trigger the browser's download manager for your generated files.
- `contextMenus`: To display convenient right-click shortcut options.
- `storage`: To remember your local tool settings.

### 6. Contact & Inquiries
If you have any questions or feedback regarding this privacy policy or the extension, please contact:
- Developer: Mahfazzalin
- Contact Email: support@yourdomain.com
- Project Repository: https://github.com/Mahfazzalin/web-into-pdf
```

---

## 🎨 5. Graphics & Promotional Assets (গ্রাফিক্স এবং অ্যাসেট সাইজ)

| Asset Type | Dimensions | Format | Status | Guidance & Notes |
| :--- | :--- | :--- | :---: | :--- |
| **Store Icon** [REQUIRED] | 128 × 128 px | PNG (32-bit with transparency) | 🟡 Needs Resize | Must be exactly 128×128 px. (Currently in `icons/icon128.png`). |
| **Screenshot 1** [REQUIRED] | 1280 × 800 px (or 640 × 400 px) | PNG / JPEG | ⬜ Needs Capture | Main popup UI showing "Direct Clean PDF" & layout options. |
| **Screenshot 2** [RECOMMENDED] | 1280 × 800 px | PNG / JPEG | ⬜ Needs Capture | "Clean Tab" featuring Element Eraser highlighting and removing ads. |
| **Screenshot 3** [RECOMMENDED] | 1280 × 800 px | PNG / JPEG | ⬜ Needs Capture | "Convert Tab" showing Markdown, Plain Text & Table CSV export. |
| **Screenshot 4** [RECOMMENDED] | 1280 × 800 px | PNG / JPEG | ⬜ Needs Capture | "Extract Tab" showing Images to ZIP and Tab Batch summaries. |
| **Small Promo Tile** [RECOMMENDED] | 440 × 280 px | PNG / JPEG | ⬜ Optional | Displayed if featured on Chrome Web Store category pages. |
| **Marquee Promo Tile** [OPTIONAL] | 1400 × 560 px | PNG / JPEG | ⬜ Optional | For top banner editorial showcase. |

> 📌 **Important Icon Note:** Chrome Web Store requires icons of exact pixel dimensions:
> - `icons/icon16.png` -> 16 × 16 px
> - `icons/icon48.png` -> 48 × 48 px
> - `icons/icon128.png` -> 128 × 128 px (and this 128px icon is also uploaded as the Store Icon)

---

## 🚀 6. Distribution & Developer Info (ডিস্ট্রিবিউশন এবং বিকাশকারী তথ্য)

- **Visibility:** Public (সবার জন্য উন্মুক্ত)
- **Geographic Distribution:** All regions (সব দেশ)
- **Pricing:** Free (সম্পূর্ণ বিনামূল্যে)
- **Publisher Account:** Chrome Web Store Developer account (Requires a one-time $5 Google registration fee).
- **Contact Email:** Your active email address (Displayed publicly to store users).
- **Support URL / GitHub Issues:** `https://github.com/Mahfazzalin/web-into-pdf/issues`

---

## 📦 7. How to Create the Release ZIP (প্যাকেজিং নির্দেশিকা)

Do NOT include `.git`, `.vscode`, `DirectoryStructure.txt`, `CHROMEWEBSTORE.md`, or previous `.zip` files in your upload package.

### Files to Include in the ZIP:
```text
manifest.json
popup.html
popup.css
popup.js
background.js
content.js
icons/
  ├── icon16.png
  ├── icon48.png
  └── icon128.png
libs/
  ├── FileSaver.min.js
  ├── html2pdf.bundle.min.js
  └── jszip.min.js
```

### PowerShell Command to Create Clean ZIP:
Run this command in PowerShell from the project root:
```powershell
Compress-Archive -Path manifest.json, popup.html, popup.css, popup.js, background.js, content.js, icons, libs -DestinationPath WebIntoPdf_v2.0.0.zip -Force
```

---

## 📝 8. Pre-Submission Checklist (জমা দেওয়ার পূর্বের চেকলিস্ট)

- [x] Manifest is Version 3 (`"manifest_version": 3`).
- [x] No remote scripts or external CDNs loaded at runtime.
- [x] All 6 permissions have clear, honest, feature-based justifications.
- [x] Detailed description does not make misleading or prohibited claims.
- [x] Icons exist and match manifest paths.
- [ ] Icons resized to exact dimensions (16x16, 48x48, 128x128).
- [ ] At least one 1280x800 screenshot captured.
- [ ] Privacy Policy hosted on public URL (GitHub Pages / Gist).
- [ ] Clean ZIP archive created without git/dev files.

---

## 📜 9. Version History

| Version | Date | Changes Summary | Store Status |
| :--- | :--- | :--- | :--- |
| 2.0.0 | 2026-09-12 | Complete Manifest V3 Document Suite: Direct PDF, Element Eraser, Reader mode, Markdown, CSV, Images ZIP, and Open Tabs batch exporter. | Draft / Ready for Submission |
| 1.0.0 | Earlier | Initial Web into PDF release. | Archived |
