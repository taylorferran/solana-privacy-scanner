# Vercel Deployment Guide - v0.2.0

## ✅ Prerequisites Complete

- ✅ Docusaurus v3.9.2 installed
- ✅ Vercel Analytics integrated
- ✅ All packages published to npm (v0.2.0)
- ✅ Documentation built successfully
- ✅ All tests passing (36/36)

---

## Vercel Deployment Setup

### Framework & Build Settings

```
Framework Preset: Other (or leave as detected)
Root Directory: docs
Build Command: npm run build
Output Directory: build
Install Command: npm install
Node.js Version: 20.x
```

### Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Set the configuration above
3. Deploy!

### Deploy via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time - will prompt for settings)
vercel

# Deploy to production
vercel --prod
```

---

## Custom Domain Setup (sps.guide)

After deployment:

1. Go to **Project Settings** → **Domains**
2. Add domain: `sps.guide`
3. Add domain: `www.sps.guide`
4. Copy the DNS records provided
5. Update your domain registrar with:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

---

## Vercel Analytics

Analytics is now integrated via `@vercel/analytics`:

- **Component**: `docs/src/theme/Root.tsx`
- **Package**: `@vercel/analytics` v1.x
- **Type**: React component for Docusaurus
- **Automatic**: Tracks page views, no additional config needed

Once deployed, analytics will be available in your Vercel dashboard under:
**Project** → **Analytics** → **Web Analytics**

---

## Environment Variables

None required! Your scanner uses client-side RPC calls.

---

## Post-Deployment Checklist

- [ ] Verify homepage loads at `https://sps.guide`
- [ ] Test the interactive scanner
- [ ] Check all documentation pages load
- [ ] Verify navigation works
- [ ] Test on mobile/tablet
- [ ] Check analytics are tracking (may take 24hrs)
- [ ] Verify custom domain SSL certificate is active

---

## Useful Commands

```bash
# Local development
cd docs && npm start

# Build locally
cd docs && npm run build

# Serve built site locally
cd docs && npm run serve

# Deploy to Vercel
vercel --prod

# Check deployment logs
vercel logs
```

---

## Current Version Info

- **Core Package**: `solana-privacy-scanner-core@0.2.0`
- **CLI Package**: `solana-privacy-scanner@0.2.0`
- **Documentation**: Docusaurus v3.9.2
- **Node.js**: v20+
- **Framework**: React 19

---

## What's Deployed

### Features
- 🔍 Interactive wallet scanner on homepage
- 📚 Complete documentation (9 heuristics)
- 💻 CLI usage guide
- 📦 Library integration examples
- 🏷️ Known entity detection
- 🧪 Testing guide
- 📝 Changelog
- 🤝 Contributing guide

### Performance
- Static site generation (SSG)
- Optimized bundle size
- Fast page loads
- SEO optimized
- Mobile responsive

---

## Support

If deployment issues occur:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Review build logs in Vercel dashboard
3. Test build locally: `npm run build && npm run serve`
4. Check Node.js version matches (20+)

---

**Ready to deploy!** 🚀
