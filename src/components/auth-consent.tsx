import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { styled } from 'styled-components';
import { policies } from '../product/policies';

const Dialog = styled.dialog`
  position:fixed;inset:0;margin:auto;width:min(398px,calc(100% - 32px));max-height:calc(100dvh - 48px);padding:24px 20px 20px;border:0;border-radius:24px;background:var(--st-surface);color:var(--st-ink);overflow-y:auto;box-shadow:0 24px 60px rgb(27 20 32 / 18%);
  &::backdrop{background:rgb(27 20 32 / 45%);}
  .icon{width:40px;height:40px;padding:9px;border-radius:12px;background:var(--st-accent);color:var(--st-brand);margin-bottom:16px;}
  h2{font:600 28px/1.15 'Cormorant Garamond',serif;margin:0 0 8px;letter-spacing:-.2px;}p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .agreements{display:grid;margin:18px 0 20px;border-top:1px solid var(--st-line);}.row{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--st-line);padding:6px 0;}
  .row label{display:flex;align-items:center;gap:12px;flex:1;font-size:14px;font-weight:600;line-height:1.4;cursor:pointer;min-height:48px;}
  .row small{font-size:12px;font-weight:400;color:var(--st-faint);}
  input[type=checkbox]{width:20px;height:20px;min-height:20px;flex:none;padding:0;accent-color:var(--st-brand);}
  .read,.cancel,.document-back{border:0;background:none;color:var(--st-brand);font-size:14px;font-weight:600;min-height:44px;padding:4px;cursor:pointer;}
  .cancel{display:block;margin:8px auto 0;color:var(--st-muted);}.document-back{display:flex;align-items:center;gap:8px;margin-bottom:12px;color:var(--st-muted);}.document-back svg{width:18px;}
  .document{max-height:48dvh;overflow-y:auto;overscroll-behavior:contain;margin:16px 0;display:grid;gap:18px;}.document h3{font-size:15px;font-weight:600;margin:0 0 6px;}
  .primary{border:0;border-radius:14px;background:var(--st-action);color:var(--st-on-action);min-height:52px;width:100%;font-size:16px;font-weight:600;cursor:pointer;padding:12px;}.primary:disabled{opacity:.45;cursor:not-allowed;}
  button:focus-visible{outline:2px solid var(--st-action);outline-offset:3px;}
`;const agreements = [
  { path: '/terms', label: 'Terms of Use' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/refund-policy', label: 'Cancellation Policy' },
] as const;
type DocumentPath = typeof agreements[number]['path'];

export default function AuthConsent({ busy, onAccept, onCancel, profile = false }: { profile?: boolean; busy: boolean; onAccept: () => void; onCancel: () => void }) {const { t } = useI18n();
  const dialog = useRef<HTMLDialogElement>(null);
  const [view, setView] = useState<DocumentPath | null>(null);
  const [checked, setChecked] = useState<string[]>([]);
  useEffect(() => {
    const element = dialog.current;
    const previous = document.body.style.overflow;
    element?.showModal();
    document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = previous; };
  }, []);
  return <Dialog ref={dialog} aria-labelledby="consent-title" aria-busy={busy}
    onCancel={event => { event.preventDefault(); if (!busy) { if (view) setView(null); else onCancel(); } }}>
    {view ? <>
      <button className="document-back" type="button" onClick={() => setView(null)}><ArrowLeftIcon/>{t("Back to agreements")}</button>
      <h2 id="consent-title">{t(policies[view].title)}</h2>
      <div className="document" tabIndex={0} aria-label={t(policies[view].title)}>
        {policies[view].sections.map(([title, body]) => <section key={title}><h3>{t(title)}</h3><p>{t(body)}</p></section>)}
      </div>
      <button className="primary" type="button" onClick={() => setView(null)}>{t("Done reviewing")}</button>
    </> : <>
      <ShieldCheckIcon className="icon"/>
      <h2 id="consent-title">{t("Before we get started")}</h2>
      <p>{t(profile ? "Please review the policies before completing your profile." : "Please review the policies before creating your SajuTeller account.")}</p>
      <div className="agreements">{agreements.map(({ path, label }) => <div className="row" key={path}>
        <label><input type="checkbox" disabled={busy} checked={checked.includes(path)} onChange={e => setChecked(values => e.target.checked ? [...values, path] : values.filter(value => value !== path))}/><span>{t(label)}<br/><small>{path === '/refund-policy' ? t("I have read this policy") : t("Required agreement")}</small></span></label>
        <button type="button" className="read" disabled={busy} aria-label={`${t('Read')} ${t(label)}`} onClick={() => setView(path)}>{t("Read")}</button>
      </div>)}</div>
      <button className="primary" type="button" disabled={busy || checked.length !== agreements.length} onClick={onAccept}>{busy ? t(profile ? "Saving…" : "Creating your account…") : t("Agree and continue")}</button>
      <button className="cancel" type="button" disabled={busy} onClick={onCancel}>{t("Not now")}</button>
    </>}
  </Dialog>;
}
