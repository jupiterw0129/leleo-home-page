# Changelog

## [1.1.0] - 2026-05-08

### Security
- Add Content Security Policy (CSP) meta header
- Add `rel="noopener noreferrer"` to all `target="_blank"` links (tabnabbing prevention)
- Add `noopener,noreferrer` to all `window.open()` calls
- Add `SameSite=Lax; Secure` cookie attributes
- Add `Referrer-Policy` header
- Block `javascript:`, `data:`, `vbscript:` protocols in URL search
- Add security HTTP headers in wrangler config (X-Content-Type-Options, X-Frame-Options, Permissions-Policy)

### Performance
- Preload critical local fonts (faken.ttf, Digital-Play-Italic-St-1.ttf, xy_z.ttf)
- Add inline critical CSS for initial render
- Improve Vite build config: CSS code splitting, asset inlining, module preload polyfill
- Better chunk splitting strategy (vue, vuetify, chartjs, typeit, vendor)
- Organized output directory structure (js/css/img/fonts/assets)
- Add `Cache-Control` headers for static assets
- Add `legalComments: 'none'` to reduce bundle size
- Add `cssMinify: 'esbuild'` for CSS minification

### Code Quality
- Migrate `beforeDestroy` → `beforeUnmount` (Vue 3 API)
- Fix `getMusicInfo` error handling (loading state on failure)
- Use `VITE_MUSIC_API` environment variable for API URL
- Remove commented-out dead code
- Add Open Graph meta tags for social sharing

### Build & Version Management
- Add `.env.production` and `.env.development` files
- Add `VITE_APP_VERSION` environment variable
- Update `package.json` with proper name, version, description
- Version display in about dialog statement
- Add `CHANGELOG.md` for release tracking

## [1.0.0] - Initial release
- Vue 3 + Vuetify 3 personal homepage
- Dynamic wallpapers (static images + WebM videos)
- Polar chart skills visualization (Chart.js)
- Music player with lyrics (Meting API)
- Typewriter effect (TypeIt)
- Customizable theme colors, brightness, blur
- Search engine integration
- Responsive design (PC + mobile)
