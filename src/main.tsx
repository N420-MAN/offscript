import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/bricolage-grotesque/wdth.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/dm-mono/400.css'
import './styles/index.css'
import Root from './Root'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
