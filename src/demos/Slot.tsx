import { useEffect, useState } from 'react'

const cache = new Map<string, boolean>()

function probe(url: string, kind: 'image' | 'video'): Promise<boolean> {
  if (kind === 'image') {
    return new Promise((res) => {
      const i = new Image()
      i.onload = () => res(true)
      i.onerror = () => res(false)
      i.src = url
    })
  }
  return fetch(url, { method: 'HEAD' })
    .then((r) => r.ok && (r.headers.get('content-type') ?? '').startsWith('video'))
    .catch(() => false)
}

interface Props {
  /** Path under /media, e.g. "hotel/room-1.jpg". */
  src: string
  kind?: 'image' | 'video'
  className?: string
  style?: React.CSSProperties
  alt?: string
  /** What to show until a real file is dropped in (the generative visual). */
  children?: React.ReactNode
}

/**
 * A place for a photo or a looping video. Drop a file at /public/media/<src> and it appears;
 * without one the generative fallback stays. Videos are skipped on small screens (mobile speed wins).
 */
export function Slot({ src, kind = 'image', className, style, alt = '', children }: Props) {
  const url = `/media/${src}`
  const [ok, setOk] = useState<boolean | null>(cache.get(url) ?? null)
  useEffect(() => {
    if (cache.has(url)) {
      setOk(cache.get(url)!)
      return
    }
    let live = true
    void probe(url, kind).then((v) => {
      cache.set(url, v)
      if (live) setOk(v)
    })
    return () => {
      live = false
    }
  }, [url, kind])

  const small = typeof window !== 'undefined' && window.innerWidth < 720
  if (ok && !(kind === 'video' && small)) {
    return kind === 'image' ? (
      <img src={url} alt={alt} className={className} style={style} loading="lazy" decoding="async" />
    ) : (
      <video src={url} className={className} style={style} muted loop autoPlay playsInline preload="metadata" aria-hidden="true" />
    )
  }
  return <>{children}</>
}
