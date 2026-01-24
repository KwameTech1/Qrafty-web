# How to Convert DOCUMENTATION.md to PDF

This guide shows how to convert the professional documentation to a PDF format that's suitable for sharing with stakeholders, team members, or archival purposes.

## Option 1: Using Pandoc (Recommended)

Pandoc is a universal document converter that produces high-quality PDFs.

### Installation

**Windows (using Chocolatey):**

```bash
choco install pandoc
choco install miktex  # For better PDF rendering
```

**macOS (using Homebrew):**

```bash
brew install pandoc
brew install --cask mactex
```

**Ubuntu/Debian:**

```bash
sudo apt-get install pandoc texlive-latex-base texlive-latex-extra
```

### Convert to PDF

```bash
# Basic conversion (simple but effective)
pandoc DOCUMENTATION.md -o DOCUMENTATION.pdf

# With styling and table of contents
pandoc DOCUMENTATION.md \
  -o DOCUMENTATION.pdf \
  --toc \
  --toc-depth=2 \
  --variable urlcolor=blue \
  --variable linkcolor=blue \
  --pdf-engine=xelatex

# With custom styling (advanced)
pandoc DOCUMENTATION.md \
  -o DOCUMENTATION.pdf \
  --toc \
  --toc-depth=3 \
  --from markdown+emoji \
  --number-sections \
  --highlight-style=espresso \
  --pdf-engine=xelatex \
  -V colorlinks=true \
  -V geometry:margin=1in \
  -V mainfont="Calibri" \
  -V fontsize=11pt

# With cover page
cat > cover.md << 'EOF'
---
title: QRAFTY Project Documentation
subtitle: Professional Development & Deployment Guide
author: Development Team
date: January 24, 2026
---
EOF

pandoc cover.md DOCUMENTATION.md \
  -o DOCUMENTATION.pdf \
  --toc \
  --pdf-engine=xelatex \
  -V geometry:margin=1in
```

## Option 2: Using VS Code Extension (Easiest for Windows)

### Install Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Markdown PDF"
4. Install by ysemenov
5. Reload VS Code

### Convert

1. Open DOCUMENTATION.md in VS Code
2. Right-click in editor
3. Select "Markdown PDF: Export (pdf)"

**Configuration** (Optional):
Create `.vscode/settings.json`:

```json
{
  "markdown-pdf.type": "pdf",
  "markdown-pdf.displayHeaderFooter": true,
  "markdown-pdf.headerTemplate": "<div style=\"font-size: 10px; margin-left: 1cm;\">QRAFTY Documentation</div>",
  "markdown-pdf.footerTemplate": "<div style=\"font-size: 10px; margin-right: 1cm;\"><span class=\"pageNumber\"></span> of <span class=\"totalPages\"></span></div>",
  "markdown-pdf.margin.top": "1.5cm",
  "markdown-pdf.margin.bottom": "1.5cm",
  "markdown-pdf.margin.left": "1cm",
  "markdown-pdf.margin.right": "1cm"
}
```

## Option 3: Using Online Converters (Instant)

No installation required - upload and download:

1. **Markdown to PDF Online**
   - Visit: https://md2pdf.netlify.app/
   - Upload DOCUMENTATION.md
   - Download PDF

2. **Pandoc Online**
   - Visit: https://pandoc.org/try/
   - Paste content
   - Download PDF

3. **Vertopal**
   - Visit: https://www.vertopal.com/en/conversion/markdown-to-pdf
   - Upload file
   - Download converted PDF

## Option 4: GitHub PDF Export (Simplest)

GitHub automatically renders Markdown beautifully:

1. Push code to GitHub (already done)
2. Go to: https://github.com/KwameTech1/Qrafty-web
3. Click DOCUMENTATION.md
4. Press **P** to open print preview
5. Print to PDF (Ctrl+P → Save as PDF)

**Advantages:**

- No installation
- Professional formatting with GitHub styling
- Preserves all links and code blocks
- Easy to share

## Option 5: Google Docs (Best for Sharing & Collaboration)

1. Upload DOCUMENTATION.md to Google Drive
2. Open with Google Docs
3. File → Download → PDF Document

## Recommended Workflow

For professional documentation, I recommend **Option 1 (Pandoc)** with this command:

```bash
pandoc DOCUMENTATION.md \
  --from markdown \
  --to pdf \
  --output DOCUMENTATION.pdf \
  --toc \
  --toc-depth=2 \
  --pdf-engine=xelatex \
  --number-sections \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  -V linkcolor=blue \
  -V urlcolor=blue
```

This produces:

- ✅ Professional appearance
- ✅ Clickable table of contents
- ✅ Numbered sections
- ✅ Proper margins
- ✅ Blue hyperlinks
- ✅ Proper code block formatting

## File Size & Quality

**Typical Output:**

- File Size: 800KB - 2MB
- Quality: Print-ready (300 DPI)
- Pages: ~25-35 pages

## Sharing the PDF

Once created, you can:

1. **Email to stakeholders**

   ```bash
   # Compress if needed
   gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 \
     -dPDFSETTINGS=/ebook \
     -dNOPAUSE -dQUIET -dBATCH \
     -sOutputFile=DOCUMENTATION-compressed.pdf DOCUMENTATION.pdf
   ```

2. **Upload to Google Drive/Dropbox**
   - Easy sharing with comments

3. **Include in Project Repository**
   - Commit PDF to git (or .gitignore if large)

4. **Host on GitHub Pages**
   - Serve directly from website

5. **Create Confluence/Notion page**
   - Paste content to wiki

## Make PDF Searchable (Optional)

If using Pandoc's native PDF output, ensure searchability:

```bash
# Verify PDF is searchable
pdftotext DOCUMENTATION.pdf - | head -20

# If not searchable, OCR it
tesseract DOCUMENTATION.pdf DOCUMENTATION-ocr pdf
```

## Troubleshooting

**Issue: Pandoc not found**

```bash
# Check installation
pandoc --version

# If not installed, reinstall
choco install pandoc  # Windows
brew install pandoc   # macOS
```

**Issue: Missing font**

```bash
# Use different PDF engine
pandoc DOCUMENTATION.md -o DOCUMENTATION.pdf --pdf-engine=pdflatex
```

**Issue: Markdown not rendering correctly**

```bash
# Specify markdown flavor
pandoc DOCUMENTATION.md \
  --from markdown+emoji+attributes \
  -o DOCUMENTATION.pdf
```

**Issue: Code blocks too narrow**

```bash
# Adjust margins
pandoc DOCUMENTATION.md \
  -o DOCUMENTATION.pdf \
  -V geometry:margin=0.8in \
  -V geometry:bmargin=0.8in
```

## Automation Script

Create `build-pdf.sh` to automate:

```bash
#!/bin/bash

# Convert Markdown to PDF
echo "Building DOCUMENTATION.pdf..."

pandoc DOCUMENTATION.md \
  --from markdown \
  --to pdf \
  --output DOCUMENTATION.pdf \
  --toc \
  --toc-depth=2 \
  --pdf-engine=xelatex \
  --number-sections \
  -V geometry:margin=1in \
  -V fontsize=11pt \
  -V linkcolor=blue \
  -V urlcolor=blue

# Check if successful
if [ -f DOCUMENTATION.pdf ]; then
  echo "✓ DOCUMENTATION.pdf created successfully"
  ls -lh DOCUMENTATION.pdf
else
  echo "✗ Failed to create PDF"
  exit 1
fi
```

Make executable and run:

```bash
chmod +x build-pdf.sh
./build-pdf.sh
```

## Version Control for PDF

Add to `.gitignore` if PDF is large:

```
# Generated PDFs
DOCUMENTATION.pdf
*.pdf
```

Or track it if you want versions:

```bash
git add DOCUMENTATION.pdf
git commit -m "docs: update PDF export (January 2026)"
```

---

## Summary

| Method       | Ease       | Quality    | Installation | Time   |
| ------------ | ---------- | ---------- | ------------ | ------ |
| Pandoc       | ⭐⭐⭐     | ⭐⭐⭐⭐⭐ | 5 min        | 30 sec |
| VS Code      | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐   | 2 min        | 1 min  |
| Online       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | None         | 2 min  |
| GitHub Print | ⭐⭐⭐⭐⭐ | ⭐⭐⭐     | None         | 3 min  |
| Google Docs  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐   | 2 min        | 2 min  |

**Recommended for your team:**

1. **Quick sharing**: Use GitHub PDF Export (Option 4)
2. **Professional archive**: Use Pandoc (Option 1)
3. **Collaboration**: Use Google Docs (Option 5)

Enjoy your professional documentation!
