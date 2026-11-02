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

// The 3D scene is code-split via React.lazy in App.tsx, so first paint does not wait for three.js.
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
})
