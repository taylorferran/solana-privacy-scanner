# Placeholder Images Generated! 🎨

All required social media and favicon images have been generated using the detective emoji (🕵🏻‍♂️).

## Generated Images

✅ **og-image.png** (1200x630)
- Open Graph image for Facebook, LinkedIn, WhatsApp
- Features: Detective emoji, title, tagline, domain
- Background: Brand teal gradient

✅ **twitter-image.png** (1200x630)
- Twitter Card image for Twitter/X
- Same design as OG image for consistency
- Optimized for Twitter's preview system

✅ **apple-touch-icon.png** (180x180)
- iOS home screen icon
- Rounded corners with brand color background
- Large detective emoji centered

✅ **favicon-32x32.png** (32x32)
- Standard browser favicon
- Visible in browser tabs
- Teal background with emoji

✅ **favicon-16x16.png** (16x16)
- Smaller favicon for high-DPI displays
- Used in browser UI elements
- Scaled emoji on teal background

## Design Details

**Colors:**
- Primary: `#0d9488` (Brand Teal)
- Secondary: `#0f766e` (Dark Teal)
- Text: `#ffffff` (White)

**Typography:**
- Title: 64px, Bold, White
- Subtitle: 36px, White, 90% opacity
- Domain: 32px, White, 80% opacity
- Badge: 20px, Bold, on translucent white background

**Layout:**
- Detective emoji at top (120px)
- Title centered
- Subtitle below
- Domain at bottom
- "Free • Open Source" badge

## Regenerating Images

If you need to regenerate the images (e.g., to change colors or text):

```bash
npm run generate-images
```

Or directly:

```bash
cd scripts
node generate-images.js
```

## Customization

To customize the images, edit `scripts/generate-images.js`:

- **Colors**: Change `BRAND_COLOR` and `TEXT_COLOR` constants
- **Text**: Modify the SVG text elements
- **Layout**: Adjust x/y coordinates and font sizes
- **Emoji**: Change the emoji character

## Replacing with Custom Images

These are placeholder images. To replace with custom designs:

1. Create your images using Figma, Canva, Photoshop, etc.
2. Save with the same filenames
3. Place in `docs/public/` directory
4. Rebuild: `npm run docs:build`

See `docs/SOCIAL_IMAGES_GUIDE.md` for detailed design recommendations.

## Image Quality

These placeholder images are:
- ✅ Proper dimensions for each platform
- ✅ High quality (PNG format)
- ✅ Brand consistent (using sps.guide colors)
- ✅ Production ready

They'll work well for launch, but you can always upgrade to custom-designed images later.

## Testing Social Previews

Once deployed to sps.guide, test with:

1. **Facebook Debugger**: https://developers.facebook.com/tools/debug/
2. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
3. **Meta Tags Checker**: https://metatags.io/

## Current Status

🎉 **All images generated and ready!**

Your site now has:
- Professional social media previews
- Proper favicons for all devices
- Brand-consistent imagery
- SEO-optimized metadata

**Ready to deploy to sps.guide!**
