import { lazy, Suspense, useEffect, useState } from 'react';

const Lottie = lazy(() => import('lottie-react'));
const emoji = {
  'crystal-ball': '🔮',
  'waving-hand': '👋',
  sparkles: '✨',
  'love-letter': '💌',
  locked: '🔒',
};
export type EmojiName = keyof typeof emoji;

/** Google's Noto animations play once; reduced-motion users get a still frame. */
export default function AnimatedEmoji({ name, size = 64 }: { name: EmojiName; size?: number }) {
  const [animation, setAnimation] = useState<{ name: EmojiName; data: object } | null>(null);
  const data = animation?.name === name ? animation.data : null;
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/emoji/${name}.json`, { signal: controller.signal })
      .then(response => { if (!response.ok) throw new Error('Emoji unavailable'); return response.json(); })
      .then(data => setAnimation({ name, data })).catch(() => { /* The native emoji remains visible if the asset fails. */ });
    return () => controller.abort();
  }, [name]);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReducedMotion(media.matches);
    media.addEventListener('change', sync);
    return () => media.removeEventListener('change', sync);
  }, []);
  const fallback = <span style={{ fontSize: size * .75, lineHeight: 1 }}>{emoji[name]}</span>;
  return <span className="animated-emoji" data-emoji={name} data-reduced-motion={reducedMotion} aria-hidden="true"
    style={{ width: size, height: size, display: 'inline-grid', placeItems: 'center', flexShrink: 0 }}>
    {data ? <Suspense fallback={fallback}><Lottie key={`${name}-${reducedMotion}`} animationData={data} loop={false} autoplay={!reducedMotion} style={{ width: size, height: size }}/></Suspense> : fallback}
  </span>;
}
