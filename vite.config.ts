import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// The 3D scene is code-split via React.lazy in App.tsx, so first paint does not wait for three.js.
export default defineConfig({
  plugins: [react(), tailwindcss()],
})
