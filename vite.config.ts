import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Preload the three fonts used above the fold so the headline never waits for the CSS to discover them.
function preloadCriticalFonts(): Plugin {
  const wanted = [/bricolage-grotesque-latin-wdth-normal.*\.woff2$/, /instrument-serif-latin-400-italic.*\.woff2$/, /dm-mono-latin-400-normal.*\.woff2$/]
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {})
        return wanted
          .map((re) => files.find((f) => re.test(f)))
          .filter((f): f is string => !!f)
          .map((f) => ({ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${f}`, crossorigin: '' }, injectTo: 'head' as const }))
      },
    },
  }
}

/**
 * Everything that needs the production address: canonical link, absolute Open Graph URLs, the url/email in the
 * structured data, sitemap.xml and robots.txt. Set SITE_URL (e.g. "https://www.example.ma") in the hosting
 * environment; without it the build leaves these out rather than pointing at an unconfirmed domain.
 */
function siteUrl(): Plugin {
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env ?? {}
  const url = (env.SITE_URL ?? '').trim().replace(/\/+$/, '')
  return {
    name: 'site-url',
    apply: 'build',
    transformIndexHtml(html) {
      if (!url) return html.replace('<!--SITE_URL_TAGS-->', '')
      const tags = [`<link rel="canonical" href="${url}/" />`, `<meta property="og:url" content="${url}/" />`].join('\n    ')
      return html
        .replace('<!--SITE_URL_TAGS-->', tags)
        .replaceAll('content="/og.jpg"', `content="${url}/og.jpg"`)
        .replace('"@type":"ProfessionalService",', `"@type":"ProfessionalService","url":"${url}/","image":"${url}/og.jpg",`)
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: `User-agent: *\nAllow: /\n${url ? `\nSitemap: ${url}/sitemap.xml\n` : ''}` })
      if (!url) return
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${url}/</loc><lastmod>${today}</lastmod></url>\n</urlset>\n`,
      })
    },
  }
}

// The 3D scene is code-split via React.lazy in App.tsx, so first paint does not wait for three.js.
// React and GSAP change far less often than the site's own code: their own chunks stay cached across deploys.
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts(), siteUrl()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/, priority: 2 },
            { name: 'gsap', test: /node_modules[\\/](gsap|@gsap)[\\/]/, priority: 1 },
            // only ever reached through the lazy HeroCanvas import, so it still loads after first paint
            { name: 'three', test: /node_modules[\\/](three|@react-three|postprocessing|maath|its-fine|zustand|suspend-react)[\\/]/, priority: 1 },
          ],
        },
      },
    },
  },
})
