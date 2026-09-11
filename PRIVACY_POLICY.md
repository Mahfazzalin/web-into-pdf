# Privacy Policy for Web into PDF & Document Suite Pro

**Last Updated:** September 12, 2026

**Web into PDF & Document Suite Pro** ("the Extension") is dedicated to protecting user privacy. This Privacy Policy explains our practices regarding data handling and privacy compliance with the Google Chrome Web Store Developer Program Policies.

---

### 1. Zero Data Collection
Web into PDF & Document Suite Pro **does not collect, store, transmit, or sell** any personal data, personally identifiable information (PII), web browsing history, keystrokes, IP addresses, or telemetry data.

---

### 2. Purely Local, Client-Side Operation
All conversion and formatting processes—including:
- Generating clean PDFs from webpages or text selections
- Exporting content to Markdown (`.md`), Plain Text (`.txt`), or Offline HTML (`.html`)
- Extracting HTML data tables into CSV (`.csv`) spreadsheets
- Packing webpage images into a `.zip` archive
- Removing DOM elements via the live Element Eraser
- Formatting article text in Reader Mode

are executed **100% locally on your computer** within Google Chrome. No webpage content, text selections, document titles, or image binaries are ever uploaded or transmitted to any external server.

---

### 3. Use of Local Browser Storage
The extension uses the `chrome.storage.local` API exclusively to save your customized tool preferences on your own local device:
- Selected UI theme (Dark Mode / Light Mode)
- Default PDF settings (Paper size, Page orientation, Margin size)

This preference data is stored strictly on your local device and is never synced, tracked, or shared.

---

### 4. Third-Party Services and Analytics
- We do **not** use any analytics tools (such as Google Analytics, Mixpanel, or PostHog).
- We do **not** include any remote scripts, third-party trackers, or ads.
- All dependencies (`libs/html2pdf.bundle.min.js`, `libs/jszip.min.js`, and `libs/FileSaver.min.js`) are bundled locally within the extension package.

---

### 5. Permissions Explanation
The extension requests only the minimum permissions necessary for its user-requested features:
- **`activeTab`**: Allows the extension to interact with the currently open tab only when you explicitly click the extension popup or context menu item.
- **`scripting`**: Required to inject the local conversion scripts and Reader/Eraser tools into the active page DOM.
- **`tabs`**: Used to retrieve the current webpage title/favicon for document naming, and to power the optional "Batch All Open Tabs" summary feature.
- **`storage`**: Used solely to persist your UI theme and PDF layout preferences locally.
- **`downloads`**: Used to trigger the Chrome download prompt for your exported PDF, Markdown, CSV, or ZIP files.
- **`contextMenus`**: Adds right-click shortcuts ("Save Page as PDF", "Save Selected Text as PDF", "Export Page to Markdown") directly into Chrome's context menu.

---

### 6. Children's Privacy
The Extension does not collect any data from anyone, including children under the age of 13.

---

### 7. Changes to This Privacy Policy
If we update this Privacy Policy in future releases, changes will be posted directly to this document and reflected in the extension's version release notes.

---

### 8. Contact Us
If you have questions, feedback, or concerns regarding this policy, please reach out via:
- **Project Issues:** https://github.com/Mahfazzalin/web-into-pdf/issues
- **Developer:** Mahfazzalin
