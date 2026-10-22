import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react';
import { styled } from 'styled-components';
import { MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';
import type { Studio } from '../../product/data';
import { MAX_ZOOM, MIN_ZOOM, boundsOf, cluster, fitBounds, project, toScreen, unproject, viewBounds, type Bounds, type LatLng } from './geo';
import { compactMoney, locatedStudios, studioName } from './studio-meta';

/*
 * All studios at once, over the existing Google Maps Embed API.
 * The Embed API only draws one place pin, so we request a plain "view" map at a known
 * centre + integer zoom and draw our own price pins on top using the same Web Mercator
 * projection. Panning/zooming is handled here (the iframe itself is not interactive)
 * so pins never drift from the street map. Without a key we draw the same pins on a
 * neutral canvas — real relative positions, clearly not a street map.
 */

type Size = { w: number; h: number };
type View = { center: LatLng; zoom: number };
type Located = ReturnType<typeof locatedStudios>[number];

const Surface = styled.div`
  position:absolute;inset:0;overflow:hidden;background:#ece6df;touch-action:none;cursor:grab;user-select:none;
  &[data-dragging='true']{cursor:grabbing;}
  .layer{position:absolute;inset:0;will-change:transform;}
  iframe{position:absolute;inset:0;width:100%;height:100%;border:0;pointer-events:none;}
  .canvas{position:absolute;inset:0;background-color:#efeae4;
    background-image:linear-gradient(rgb(27 20 32 / 6%) 1px,transparent 1px),linear-gradient(90deg,rgb(27 20 32 / 6%) 1px,transparent 1px);
    background-size:64px 64px;}
  .area{position:absolute;transform:translate(-50%,-50%);font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#857c8d;white-space:nowrap;pointer-events:none;}
  .pin{position:absolute;transform:translate(-50%,-100%);display:inline-flex;align-items:center;gap:5px;height:30px;padding:0 10px;border-radius:999px;
    border:1px solid #e8e2ea;background:#fff;color:#1b1420;font:700 13px/1 Inter,system-ui,sans-serif;white-space:nowrap;cursor:pointer;
    box-shadow:0 2px 6px rgb(27 20 32 / 18%);}
  .pin::after{content:'';position:absolute;left:50%;bottom:-5px;width:8px;height:8px;background:inherit;border:inherit;border-top:0;border-left:0;transform:translateX(-50%) rotate(45deg);}
  .pin .dot{width:6px;height:6px;border-radius:50%;background:#b07a12;flex:none;}
  .pin[aria-pressed='true']{background:#4b2d5a;border-color:#4b2d5a;color:#fff;z-index:3;}
  .pin[aria-pressed='true'] .dot{background:#f2c46b;}
  .pin.group{background:#1b1420;border-color:#1b1420;color:#fff;min-width:34px;height:34px;justify-content:center;padding:0 8px;border-radius:17px;font-size:14px;transform:translate(-50%,-50%);box-shadow:0 0 0 4px rgb(27 20 32 / 16%),0 2px 6px rgb(27 20 32 / 18%);}
  .pin.group::after{display:none;}
  .pin:focus-visible{outline:2px solid #4b2d5a;outline-offset:2px;}
  .me{position:absolute;width:16px;height:16px;transform:translate(-50%,-50%);border-radius:50%;background:#4b2d5a;border:3px solid #fff;box-shadow:0 0 0 6px rgb(75 45 90 / 18%);pointer-events:none;}
`;

const Controls = styled.div`
  position:absolute;right:12px;bottom:12px;display:grid;gap:8px;z-index:4;
  button{width:44px;height:44px;border-radius:50%;border:1px solid #e8e2ea;background:#fff;color:#1b1420;display:grid;place-items:center;cursor:pointer;box-shadow:0 2px 8px rgb(27 20 32 / 14%);}
  button:disabled{opacity:.4;cursor:default;}
  button svg{width:20px;height:20px;}
  .zoom{display:grid;border-radius:22px;overflow:hidden;box-shadow:0 2px 8px rgb(27 20 32 / 14%);}
  .zoom button{border-radius:0;box-shadow:none;}
  .zoom button+button{border-top:0;}
  button:focus-visible{outline:2px solid #4b2d5a;outline-offset:2px;}
`;

const Top = styled.div`position:absolute;left:0;right:0;top:0;z-index:5;pointer-events:none;> *{pointer-events:auto;}`;

export type StudioMapProps = {
  studios: Studio[];
  selectedId?: string;
  onSelect: (id: string) => void;
  /** Change to re-fit the view to `studios` (filters changed, "Show all"). */
  fitKey: string;
  /** Studio to centre on at first render (e.g. arriving with ?studio=). */
  focusId?: string;
  apiKey?: string;
  me?: LatLng | null;
  onMoved: (bounds: Bounds) => void;
  top?: ReactNode;
  controls?: ReactNode;
};

/** Map centre that puts `point` in the middle of the area below the floating search bar. */
function centreFor(point: LatLng, zoom: number, topInset: number): LatLng {
  const p = project(point, zoom);
  return unproject({ x: p.x, y: p.y - topInset / 2 }, zoom);
}

const SEOUL: LatLng = { lat: 37.5519, lng: 126.9918 };

export default function StudioMap({ studios, selectedId, onSelect, fitKey, focusId, apiKey, me, onMoved, top, controls }: StudioMapProps) {
  const { t, language } = useI18n();
  const box = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });
  const [topInset, setTopInset] = useState(0);
  const [view, setView] = useState<View>({ center: SEOUL, zoom: 11 });
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const dragStart = useRef<{ x: number; y: number; moved: boolean; id: number } | null>(null);
  const suppressClick = useRef(false);
  const located = useMemo(() => locatedStudios(studios), [studios]);

  useLayoutEffect(() => {
    const node = box.current;
    const topNode = topRef.current;
    if (!node) return;
    const observer = new ResizeObserver(() => {
      setSize(prev => (prev.w === node.clientWidth && prev.h === node.clientHeight ? prev : { w: node.clientWidth, h: node.clientHeight }));
      if (topNode) setTopInset(topNode.offsetHeight);
    });
    observer.observe(node);
    if (topNode) observer.observe(topNode);
    return () => observer.disconnect();
  }, []);

  // Fit all (or focus one) whenever the studio set changes or the map is first measured.
  const fittedFor = useRef('');
  useEffect(() => {
    if (!size.w || !size.h) return;
    const key = `${fitKey}|${size.w}x${size.h}|${topInset}`;
    if (fittedFor.current === key) return;
    const first = !fittedFor.current;
    fittedFor.current = key;
    const focus = first && focusId ? located.find(s => s.id === focusId) : undefined;
    if (focus) { setView({ center: centreFor(focus, 15, topInset), zoom: 15 }); return; }
    const bounds = boundsOf(located);
    if (!bounds) return;
    setView(fitBounds(bounds, size, { top: topInset, right: 56, bottom: 8, left: 8 }, 18));
  }, [fitKey, size, topInset, located, focusId]);

  const moved = useCallback((next: View) => {
    setView(next);
    if (size.w && size.h) onMoved(viewBounds(next.center, next.zoom, size));
  }, [onMoved, size]);

  const zoomBy = useCallback((delta: number) => {
    const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, view.zoom + delta));
    if (zoom !== view.zoom) moved({ center: view.center, zoom });
  }, [view, moved]);

  // Centre on the user's position when it arrives.
  useEffect(() => { if (me) setView(v => ({ center: me, zoom: Math.max(v.zoom, 14) })); }, [me]);

  // Wheel / trackpad zoom, one step per gesture burst.
  const wheelAt = useRef(0);
  useEffect(() => {
    const node = box.current;
    if (!node) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const now = Date.now();
      if (now - wheelAt.current < 350 || Math.abs(e.deltaY) < 4) return;
      wheelAt.current = now;
      zoomBy(e.deltaY < 0 ? 1 : -1);
    };
    node.addEventListener('wheel', onWheel, { passive: false });
    return () => node.removeEventListener('wheel', onWheel);
  }, [zoomBy]);

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.button !== 0) return;
    dragStart.current = { x: e.clientX, y: e.clientY, moved: false, id: e.pointerId };
    suppressClick.current = false;
  };
  const onPointerMove = (e: ReactPointerEvent) => {
    const start = dragStart.current;
    if (!start || start.id !== e.pointerId) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (!start.moved && Math.hypot(dx, dy) < 5) return;
    if (!start.moved) { start.moved = true; box.current?.setPointerCapture(e.pointerId); }
    setDrag({ x: dx, y: dy });
  };
  const onPointerUp = (e: ReactPointerEvent) => {
    const start = dragStart.current;
    dragStart.current = null;
    if (!start || !start.moved) { setDrag(null); return; }
    suppressClick.current = true;
    const c = project(view.center, view.zoom);
    setDrag(null);
    moved({ center: unproject({ x: c.x - (e.clientX - start.x), y: c.y - (e.clientY - start.y) }, view.zoom), zoom: view.zoom });
  };

  // Clusters: the selected studio always gets its own pin.
  const groups = useMemo(() => cluster(located.filter(s => s.id !== selectedId), view.zoom, 34), [located, selectedId, view.zoom]);
  const selected = located.find(s => s.id === selectedId);
  const areas = useMemo(() => {
    if (apiKey) return [];
    const byArea = new Map<string, LatLng[]>();
    located.forEach(s => byArea.set(s.neighborhood, [...(byArea.get(s.neighborhood) || []), s]));
    return [...byArea].map(([name, pts]) => ({ name, at: { lat: pts.reduce((a, p) => a + p.lat, 0) / pts.length, lng: pts.reduce((a, p) => a + p.lng, 0) / pts.length } }));
  }, [apiKey, located]);

  const within = (p: { x: number; y: number }) => p.x > -80 && p.y > -40 && p.x < size.w + 80 && p.y < size.h + 60;
  const screen = (p: LatLng) => toScreen(p, view.center, view.zoom, size);
  // Neighbourhood labels (no-key canvas only), skipping any that would collide.
  const labels: { name: string; x: number; y: number }[] = [];
  if (size.w && areas.length) {
    // Pin boxes as [left, top, right, bottom] in screen px.
    const pins = [...groups.map(g => ({ p: screen(g.at), group: g.items.length > 1 })), ...(selected ? [{ p: screen(selected), group: false }] : [])]
      .map(({ p, group }) => group ? [p.x - 22, p.y - 22, p.x + 22, p.y + 22] : [p.x - 36, p.y - 38, p.x + 36, p.y + 2]);
    for (const a of areas) {
      const p = screen(a.at);
      const half = a.name.length * 4 + 6;
      const y = p.y + 32;
      const box = [p.x - half, y - 8, p.x + half, y + 8];
      const hits = (b: number[]) => b[0] < box[2] && b[2] > box[0] && b[1] < box[3] && b[3] > box[1];
      if (!within(p) || pins.some(hits) || labels.some(l => hits([l.x - l.name.length * 4 - 6, l.y - 8, l.x + l.name.length * 4 + 6, l.y + 8]))) continue;
      labels.push({ name: a.name, x: p.x, y });
    }
  }
  const shift = drag ? `translate(${drag.x}px,${drag.y}px)` : undefined;
  const origin = project(view.center, view.zoom);
  const embed = apiKey ? `https://www.google.com/maps/embed/v1/view?${new URLSearchParams({
    key: apiKey, center: `${view.center.lat.toFixed(6)},${view.center.lng.toFixed(6)}`, zoom: String(view.zoom),
    language: language === 'zh' ? 'zh-CN' : language,
  })}` : '';

  const pick = (fn: () => void) => () => { if (suppressClick.current) { suppressClick.current = false; return; } fn(); };
  const openGroup = (items: Located[]) => {
    const fit = fitBounds(boundsOf(items)!, size, { top: topInset, right: 56, bottom: 8, left: 8 }, 60);
    if (fit.zoom > view.zoom) { moved(fit); return; }
    if (view.zoom >= MAX_ZOOM) { onSelect(items[0].id); return; }
    const mid = { lat: items.reduce((a, p) => a + p.lat, 0) / items.length, lng: items.reduce((a, p) => a + p.lng, 0) / items.length };
    moved({ center: centreFor(mid, view.zoom + 1, topInset), zoom: view.zoom + 1 });
  };

  return <>
    <Surface ref={box} data-dragging={!!drag} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={() => { dragStart.current = null; setDrag(null); }}
      data-map-provider={apiKey ? 'google' : 'none'} role="region" aria-label={t('Map of studios')}>
      <div className="layer" style={{ transform: shift }}>
        {apiKey
          ? <iframe key={embed} title={t('Map of studios')} src={embed} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" tabIndex={-1}/>
          : <div className="canvas" style={{ backgroundPosition: `${-origin.x % 64 + size.w / 2}px ${-origin.y % 64 + size.h / 2}px` }} aria-hidden="true"/>}
        {labels.map(a => <span key={a.name} className="area" style={{ left: a.x, top: a.y }} aria-hidden="true">{a.name}</span>)}
        {size.w > 0 && groups.map(g => {
          const p = screen(g.at);
          if (!within(p)) return null;
          if (g.items.length === 1) {
            const s = g.items[0];
            return <button key={s.id} type="button" className="pin" style={{ left: p.x, top: p.y }} aria-pressed={false}
              aria-label={`${studioName(s, language)}, ${t('From')} ${compactMoney(s.base_price, language)}${s.is_mock ? `, ${t('Preview')}` : ''}`}
              onClick={pick(() => onSelect(s.id))}>{compactMoney(s.base_price, language)}{s.is_mock && <span className="dot" aria-hidden="true"/>}</button>;
          }
          return <button key={g.items.map(s => s.id).join()} type="button" className="pin group" style={{ left: p.x, top: p.y }}
            aria-label={t('{count} studios here. Zoom in').replace('{count}', String(g.items.length))}
            onClick={pick(() => openGroup(g.items))}>{g.items.length}</button>;
        })}
        {selected && size.w > 0 && (() => { const p = screen(selected); return <button type="button" className="pin" style={{ left: p.x, top: p.y }} aria-pressed
          aria-label={`${studioName(selected, language)}, ${t('From')} ${compactMoney(selected.base_price, language)}${selected.is_mock ? `, ${t('Preview')}` : ''}`}
          onClick={pick(() => onSelect(selected.id))}>{compactMoney(selected.base_price, language)}{selected.is_mock && <span className="dot" aria-hidden="true"/>}</button>; })()}
        {me && size.w > 0 && (() => { const p = screen(me); return within(p) ? <span className="me" style={{ left: p.x, top: p.y }} role="img" aria-label={t('Your location')}/> : null; })()}
      </div>
    </Surface>
    <Top ref={topRef}>{top}</Top>
    <Controls>
      {controls}
      <div className="zoom">
        <button type="button" onClick={() => zoomBy(1)} disabled={view.zoom >= MAX_ZOOM} aria-label={t('Zoom in')}><PlusIcon/></button>
        <button type="button" onClick={() => zoomBy(-1)} disabled={view.zoom <= MIN_ZOOM} aria-label={t('Zoom out')}><MinusIcon/></button>
      </div>
    </Controls>
  </>;
}
