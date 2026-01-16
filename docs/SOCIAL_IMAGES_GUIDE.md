# Social Media Image Generation Guide

This guide explains how to create the required Open Graph and Twitter Card images for sps.guide

## Required Images

### 1. Open Graph Image (og-image.png)
- **Size:** 1200 x 630 pixels
- **Format:** PNG
- **Location:** `docs/public/og-image.png`
- **Usage:** Facebook, LinkedIn, WhatsApp, other social platforms

### 2. Twitter Card Image (twitter-image.png)
- **Size:** 1200 x 630 pixels (or 1200 x 675 for better mobile)
- **Format:** PNG
- **Location:** `docs/public/twitter-image.png`
- **Usage:** Twitter/X link previews

### 3. Favicons
- **apple-touch-icon.png:** 180 x 180 pixels
- **favicon-32x32.png:** 32 x 32 pixels
- **favicon-16x16.png:** 16 x 16 pixels
- **Location:** `docs/public/`

---

## Design Recommendations

### Visual Elements

**Primary Colors (from theme):**
- Brand Teal: `#0d9488`
- Brand Cyan: `#14b8a6`
- Dark Teal: `#0f766e`
- Background: White or `#f8fafa`

**Text:**
- Title: "Solana Privacy Scanner" or "SPS.guide"
- Tagline: "Analyze On-Chain Privacy Risks"
- Optional: "Free • Open Source • Transparent"

**Icon/Visual:**
- Use 🕵🏻‍♂️ detective emoji (current favicon)
- Or create a simple shield/lock icon with Solana logo
- Or abstract privacy/blockchain visualization

### Layout Suggestions

#### Option 1: Centered Text
```
┌─────────────────────────────────────┐
│                                     │
│         🕵🏻‍♂️                         │
│                                     │
│    Solana Privacy Scanner           │
│    Analyze On-Chain Privacy Risks   │
│                                     │
│    Free • Open Source               │
│    sps.guide                        │
│                                     │
└─────────────────────────────────────┘
```

#### Option 2: Split Layout
```
┌─────────────────────────────────────┐
│ 🕵🏻‍♂️         │                      │
│               │  Solana Privacy     │
│               │  Scanner            │
│               │                     │
│               │  Analyze wallets,   │
│               │  transactions &     │
│               │  programs for       │
│               │  privacy risks      │
│               │                     │
│               │  sps.guide          │
└─────────────────────────────────────┘
```

#### Option 3: Dashboard Style
```
┌─────────────────────────────────────┐
│ SOLANA PRIVACY SCANNER              │
│ sps.guide                           │
├─────────────────────────────────────┤
│                                     │
│  [Risk Score Display]               │
│  ████████░░ HIGH                    │
│                                     │
│  [Stats]                            │
│  5 signals • 20 txs analyzed        │
│                                     │
│  Free On-Chain Privacy Analysis     │
└─────────────────────────────────────┘
```

---

## Tools for Creating Images

### Online Tools (No Design Skills Required)

1. **Canva**
   - URL: https://www.canva.com/
   - Template: "Facebook Post" (1200 x 630)
   - Free tier available
   - Easy drag-and-drop interface

2. **Figma**
   - URL: https://www.figma.com/
   - Create custom frame: 1200 x 630
   - Free tier available
   - More design control

3. **Placid**
   - URL: https://placid.app/
   - Automated OG image generation
   - Can integrate with GitHub Actions

### Command Line Tools

1. **ImageMagick**
   ```bash
   # Install
   brew install imagemagick  # macOS
   
   # Create simple OG image
   convert -size 1200x630 xc:'#0d9488' \
     -gravity center \
     -pointsize 72 -fill white -annotate +0-50 'Solana Privacy Scanner' \
     -pointsize 36 -fill white -annotate +0+50 'sps.guide' \
     og-image.png
   ```

2. **Sharp (Node.js)**
   ```bash
   npm install sharp
   ```
   
   ```javascript
   const sharp = require('sharp');
   
   const svg = `
     <svg width="1200" height="630">
       <rect width="1200" height="630" fill="#0d9488"/>
       <text x="600" y="280" 
             text-anchor="middle" 
             font-size="72" 
             fill="white" 
             font-family="Arial, sans-serif">
         Solana Privacy Scanner
       </text>
       <text x="600" y="350" 
             text-anchor="middle" 
             font-size="36" 
             fill="white" 
             font-family="Arial, sans-serif">
         sps.guide
       </text>
     </svg>
   `;
   
   sharp(Buffer.from(svg))
     .png()
     .toFile('og-image.png');
   ```

### Design Software

1. **Photoshop** - Full control, requires Adobe subscription
2. **GIMP** - Free Photoshop alternative
3. **Affinity Designer** - One-time purchase, professional

---

## Quick Setup Instructions

### 1. Create Images Directory
```bash
mkdir -p docs/public
```

### 2. Generate Images
Use one of the tools above to create:
- `og-image.png` (1200x630)
- `twitter-image.png` (1200x630)
- `apple-touch-icon.png` (180x180)
- `favicon-32x32.png` (32x32)
- `favicon-16x16.png` (16x16)

### 3. Place Files
```
docs/public/
├── og-image.png
├── twitter-image.png
├── apple-touch-icon.png
├── favicon-32x32.png
├── favicon-16x16.png
└── site.webmanifest
```

### 4. Create site.webmanifest
```json
{
  "name": "Solana Privacy Scanner",
  "short_name": "SPS",
  "icons": [
    {
      "src": "/apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    },
    {
      "src": "/favicon-32x32.png",
      "sizes": "32x32",
      "type": "image/png"
    },
    {
      "src": "/favicon-16x16.png",
      "sizes": "16x16",
      "type": "image/png"
    }
  ],
  "theme_color": "#0d9488",
  "background_color": "#ffffff",
  "display": "standalone"
}
```

---

## Testing Your Images

### 1. Facebook/LinkedIn Preview
- URL: https://developers.facebook.com/tools/debug/
- Enter: https://sps.guide
- Check preview appearance

### 2. Twitter Card Validator
- URL: https://cards-dev.twitter.com/validator
- Enter: https://sps.guide
- Check card appearance

### 3. Local Testing
- Open: https://metatags.io/
- Enter your URL
- Preview across all platforms

---

## Best Practices

### Text
- **Readable:** High contrast (white text on dark background)
- **Concise:** Keep text short and impactful
- **Hierarchy:** Clear visual hierarchy (title > subtitle > URL)
- **Font size:** At least 60px for main text

### Images
- **Quality:** Use high-resolution images
- **File size:** Keep under 1MB for fast loading
- **Format:** PNG for quality, JPG for smaller size
- **Safe zone:** Keep important content away from edges (100px margin)

### Colors
- **Contrast:** Ensure WCAG AA compliance
- **Consistency:** Use brand colors (#0d9488)
- **Background:** Solid color or subtle gradient

### Mobile
- **Test on mobile:** Images appear smaller on phones
- **Larger text:** Compensate with bigger font sizes
- **Simplicity:** Less text = better mobile experience

---

## Example Using Canva (Recommended for Quick Start)

1. Go to https://www.canva.com/
2. Create account (free)
3. Click "Create a design" → "Custom size" → 1200 x 630 px
4. Choose a template or start blank
5. Add elements:
   - Background: Solid color #0d9488
   - Text: "Solana Privacy Scanner"
   - Subtext: "Analyze On-Chain Privacy Risks"
   - Footer: "sps.guide"
   - Optional: Add 🕵🏻‍♂️ emoji or icon
6. Download as PNG
7. Save as `og-image.png`
8. Repeat for Twitter (same size works)

---

## Placeholder Images (Temporary)

If you need to deploy immediately, create simple placeholders:

```bash
# Using ImageMagick
convert -size 1200x630 xc:'#0d9488' \
  -gravity center \
  -pointsize 72 -fill white -font Arial-Bold -annotate +0-100 '🕵🏻‍♂️' \
  -pointsize 60 -fill white -font Arial-Bold -annotate +0+0 'Solana Privacy Scanner' \
  -pointsize 32 -fill white -font Arial -annotate +0+80 'Analyze On-Chain Privacy Risks' \
  -pointsize 28 -fill white -font Arial -annotate +0+160 'sps.guide' \
  docs/public/og-image.png

# Copy for Twitter
cp docs/public/og-image.png docs/public/twitter-image.png
```

---

## Final Checklist

- [ ] `og-image.png` created (1200x630)
- [ ] `twitter-image.png` created (1200x630)
- [ ] `apple-touch-icon.png` created (180x180)
- [ ] `favicon-32x32.png` created (32x32)
- [ ] `favicon-16x16.png` created (16x16)
- [ ] `site.webmanifest` created
- [ ] All files placed in `docs/public/`
- [ ] Tested with Facebook debugger
- [ ] Tested with Twitter validator
- [ ] Mobile preview looks good
- [ ] Text is readable at small sizes
- [ ] Brand colors used consistently
- [ ] File sizes under 1MB
- [ ] URLs updated to sps.guide
- [ ] Deployed and verified live

---

## Next Steps

1. Create your images using the tool of your choice
2. Place them in `docs/public/`
3. Build the docs: `npm run docs:build`
4. Deploy to sps.guide
5. Test with Facebook/Twitter validators
6. Iterate if needed

The configuration in `config.ts` is already set up to use these images!
