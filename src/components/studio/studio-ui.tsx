import { useEffect, useRef } from 'react';
import { styled } from 'styled-components';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ButtonLink } from '../../product/ui';
import { useI18n } from '../../i18n/i18n';

// Shared pieces for the studio detail and request screens (Figma 03 / 04 / 05 / 06).

// Page column: content first, then a bar that sticks to the bottom of the viewport while the
// page is on screen. Sticky (not fixed) so it never covers the footer that follows the page.
export const Screen = styled.div<{ $tone?: string }>`
  width:100%;min-width:0;min-height:calc(100dvh - var(--ks-header-height, 60px));
  display:flex;flex-direction:column;background:${p => p.$tone || 'var(--st-paper)'};color:var(--st-ink);
  .body{flex:1 0 auto;padding:0 20px 32px;min-width:0;}
  h1,h2,h3,p{margin:0;}
  .display{font:600 32px/1.1 'Cormorant Garamond',serif;letter-spacing:-.3px;overflow-wrap:anywhere;}
  .rule{border:0;border-top:1px solid var(--st-line);margin:28px -20px;}
  section>h2{font:600 26px/1.2 'Cormorant Garamond',serif;letter-spacing:-.2px;margin-bottom:16px;}
  .label-row{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px;}
  .label-row h2{font:600 17px/1.3 Inter,sans-serif;letter-spacing:0;margin:0;}
  .label-row span{font-size:13px;color:var(--st-faint);text-align:right;}
  .muted{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .faint{font-size:13px;line-height:1.5;color:var(--st-faint);}
  .text-link{display:inline-flex;align-items:center;gap:4px;min-height:44px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .text-link svg{width:16px;}
`;

export const StickyBar = styled.div`
  position:sticky;bottom:0;z-index:40;margin-top:auto;
  background:var(--st-surface);border-top:1px solid var(--st-line);box-shadow:0 -8px 24px rgb(27 20 32 / 6%);
  padding:12px 20px calc(12px + env(safe-area-inset-bottom));
  display:grid;gap:8px;
  .row{display:flex;align-items:center;gap:12px;min-width:0;}
  .summary{flex:1;min-width:0;}
  .summary strong{display:block;font-size:17px;font-weight:700;line-height:1.3;overflow-wrap:anywhere;}
  .summary span{display:block;font-size:12px;line-height:1.45;color:var(--st-muted);}
  .row>a,.row>button{flex:none;min-height:52px;padding:12px 22px;border-radius:12px;font-size:15px;max-width:58%;}
  .full{width:100%;min-height:52px;border-radius:12px;font-size:15px;}
  .caption{font-size:12px;line-height:1.45;color:var(--st-faint);text-align:center;}
  @container saju (max-width:360px){padding-inline:16px;.row>a,.row>button{padding:12px 16px;font-size:14px;}}
`;

export const CheckList = styled.ul`
  list-style:none;padding:0;margin:0;display:grid;gap:12px;
  li{display:grid;grid-template-columns:20px 1fr;gap:12px;font-size:15px;line-height:1.45;color:var(--st-ink);}
  svg{width:20px;height:20px;color:var(--st-success);margin-top:1px;}
`;
export function Check({ children }: { children: React.ReactNode }) { return <li><CheckIcon aria-hidden="true" />{children}</li>; }

export const Card = styled.div<{ $tone?: string }>`
  border:1px solid ${p => p.$tone ? 'transparent' : 'var(--st-line)'};background:${p => p.$tone || 'var(--st-surface)'};
  border-radius:16px;padding:16px;min-width:0;
  strong{display:block;font-size:15px;font-weight:700;line-height:1.35;margin-bottom:4px;}
  p{font-size:13px;line-height:1.5;color:var(--st-muted);}
`;

export const PreviewBanner = styled.div`
  background:var(--st-preview-bg);border-radius:16px;padding:16px;
  .title{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px;}
  .tag{font-size:12px;font-weight:700;color:var(--st-preview);background:rgb(255 255 255 / 55%);border-radius:999px;padding:3px 9px;}
  .title strong{font-size:16px;font-weight:700;color:var(--st-preview);}
  p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  a{display:inline-flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:var(--st-preview);text-decoration:underline;text-underline-offset:3px;}
`;

const SheetRoot = styled.div`
  position:fixed;inset:0;z-index:300;display:flex;align-items:flex-end;justify-content:center;
  background:rgb(27 20 32 / 45%);
  .sheet{width:min(100%,var(--st-app-width));background:var(--st-surface);color:var(--st-ink);border-radius:20px 20px 0 0;
    padding:10px 20px calc(20px + env(safe-area-inset-bottom));display:grid;gap:14px;max-height:90dvh;overflow:auto;}
  .grab{width:36px;height:4px;border-radius:2px;background:var(--st-line);margin:0 auto 6px;}
  .top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;}
  h2{font:600 30px/1.15 'Cormorant Garamond',serif;}
  .close{flex:none;width:44px;height:44px;margin:-6px -10px 0 0;display:grid;place-items:center;border:0;background:none;color:var(--st-muted);cursor:pointer;}
  .close svg{width:22px;}
  p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .primary{width:100%;min-height:52px;border-radius:12px;font-size:15px;}
  .kept{display:grid;grid-template-columns:18px 1fr;gap:10px;padding:12px 14px;border-radius:12px;background:var(--st-success-bg);color:var(--st-success);font-size:13px;line-height:1.5;}
  .kept svg{width:18px;margin-top:1px;}
`;

// Shown only at the moment of sending (Figma 06). It routes to the existing sign-in flow,
// which returns to `next`; the draft is kept in sessionStorage by the caller.
export function SignInSheet({ open, next, onClose }: { open: boolean; next: string; onClose: () => void }) {
  const { t } = useI18n();
  const first = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    if (!open) return;
    first.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [open, onClose]);
  if (!open) return null;
  const query = 'next=' + encodeURIComponent(next);
  return <SheetRoot onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="sheet" role="dialog" aria-modal="true" aria-labelledby="send-sign-in-title">
      <div className="grab" aria-hidden="true" />
      <div className="top"><h2 id="send-sign-in-title">{t('Sign in to send your request')}</h2><button className="close" type="button" onClick={onClose} aria-label={t('Close')}><XMarkIcon /></button></div>
      <p>{t('So the studio can reply to you. Browsing and saving never need an account.')}</p>
      <ButtonLink ref={first} className="primary" to={`/sign-in?${query}`}>{t('Sign in or create an account')}</ButtonLink>
      <div className="kept" role="status"><CheckIcon aria-hidden="true" /><span>{t('Your request is kept on this device. You’ll come straight back here to send it.')}</span></div>
    </div>
  </SheetRoot>;
}
