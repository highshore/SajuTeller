import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { styled } from 'styled-components';
import { policies } from '../product/policies';

const Dialog = styled.dialog`
  position:fixed;inset:0;margin:auto;width:min(398px,calc(100% - 32px));max-height:calc(100dvh - 48px);padding:24px;border:1px solid var(--st-accent-line);border-radius:24px;background:var(--st-surface);color:var(--st-ink);overflow-y:auto;
  &::backdrop{background:#08040dc9;backdrop-filter:blur(5px);}
  .icon{width:48px;height:48px;padding:12px;border-radius:16px;background:var(--st-elevated);color:var(--st-gold);margin-bottom:20px;}
  h2{font-size:23px;line-height:1.3;margin:0 0 12px;font-weight:600;letter-spacing:-.5px;}p{font-size:14px;line-height:1.6;color:var(--st-muted);}
  .agreements{display:grid;gap:8px;margin:24px 0;}.row{display:flex;align-items:center;gap:8px;border-bottom:1px solid var(--st-line);padding:10px 0;}
  .row label{display:flex;align-items:center;gap:12px;flex:1;font-size:13px;line-height:1.5;cursor:pointer;min-height:44px;}
  input[type=checkbox]{width:20px;height:20px;min-height:20px;flex:none;padding:0;accent-color:var(--st-gold);}
  .read,.cancel,.document-back{border:0;background:none;color:var(--st-muted);font-size:13px;min-height:44px;padding:4px;cursor:pointer;}
  .read{text-decoration:underline;text-underline-offset:3px;}.cancel{display:block;margin:8px auto 0;}.document-back{display:flex;align-items:center;gap:8px;margin-bottom:16px;}.document-back svg{width:18px;}
  .document{max-height:48dvh;overflow-y:auto;overscroll-behavior:contain;margin:20px 0;display:grid;gap:20px;}.document h3{font-size:15px;font-weight:600;margin:0 0 8px;}
  .primary{border:0;border-radius:999px;background:var(--st-gold);color:var(--st-paper);min-height:54px;width:100%;font-size:15px;font-weight:600;cursor:pointer;padding:12px;}.primary:disabled{opacity:.5;cursor:not-allowed;}
`;
const agreements = [
  { path: '/terms', label: 'Terms of Use' },
  { path: '/privacy', label: 'Privacy Policy' },
  { path: '/refund-policy', label: 'Cancellation Policy' },
] as const;
type DocumentPath = typeof agreements[number]['path'];

export default function AuthConsent({ busy, onAccept, onCancel }: { busy: boolean; onAccept: () => void; onCancel: () => void }) {const { t } = useI18n();
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
      <p>{t("Please review the policies before creating your SajuTeller account.")}</p>
      <div className="agreements">{agreements.map(({ path, label }) => <div className="row" key={path}>
        <label><input type="checkbox" disabled={busy} checked={checked.includes(path)} onChange={e => setChecked(values => e.target.checked ? [...values, path] : values.filter(value => value !== path))}/><span>{t(label)}<br/><small>{path === '/refund-policy' ? t("I have read this policy") : t("Required agreement")}</small></span></label>
        <button type="button" className="read" disabled={busy} aria-label={`${t('Read')} ${t(label)}`} onClick={() => setView(path)}>{t("Read")}</button>
      </div>)}</div>
      <button className="primary" type="button" disabled={busy || checked.length !== agreements.length} onClick={onAccept}>{busy ? t("Creating your account…") : t("Agree and continue")}</button>
      <button className="cancel" type="button" disabled={busy} onClick={onCancel}>{t("Not now")}</button>
    </>}
  </Dialog>;
}
