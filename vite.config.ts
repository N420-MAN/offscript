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
// React and GSAP change far less often than the site's own code: their own chunks stay cached across deploys.
export default defineConfig({
  plugins: [react(), tailwindcss(), preloadCriticalFonts()],
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
