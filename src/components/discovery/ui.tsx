import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { useI18n } from '../../i18n/i18n';

// Shared discovery building blocks (ST v2). Light canvas, Cormorant titles, pill chips.

export const Badge = styled.span<{ $tone?: 'preview' | 'success' }>`
  display:inline-flex;align-items:center;flex:none;height:22px;padding:0 8px;border-radius:6px;
  font:600 12px/1 Inter,system-ui,sans-serif;white-space:nowrap;
  background:${p => p.$tone === 'success' ? 'var(--st-success-bg)' : 'var(--st-preview-bg)'};
  color:${p => p.$tone === 'success' ? 'var(--st-success)' : 'var(--st-preview)'};
`;

export const PillChip = styled.button<{ $active?: boolean }>`
  flex:none;display:inline-flex;align-items:center;gap:6px;min-height:40px;padding:0 14px;border-radius:999px;
  border:1px solid ${p => p.$active ? 'var(--st-ink)' : 'var(--st-accent-line)'};
  background:${p => p.$active ? 'var(--st-ink)' : 'var(--st-surface)'};
  color:${p => p.$active ? 'var(--st-paper)' : 'var(--st-ink)'};
  font-size:14px;font-weight:600;white-space:nowrap;cursor:pointer;
  svg{width:16px;height:16px;}
  &:focus-visible{outline:2px solid var(--st-action);outline-offset:2px;}
`;

export const ChipRow = styled.div`
  display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:2px 0 4px;
  &::-webkit-scrollbar{display:none;}
`;

/** Kicker + Cormorant title, as in Home's "Readings in Seoul". */
export const TitleBlock = styled.header`
  display:flex;align-items:flex-end;justify-content:space-between;gap:16px;min-width:0;
  .kicker{display:block;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 34px/40px 'Cormorant Garamond',serif;letter-spacing:-.4px;margin:6px 0 0;overflow-wrap:anywhere;}
  .side{flex:none;display:flex;align-items:center;gap:4px;min-height:44px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .side svg{width:16px;}
`;

export const Lede = styled.p`font-size:15px;line-height:22px;color:var(--st-muted);margin:10px 0 0;`;

const EmptyBox = styled.div`
  border:1px solid var(--st-line);border-radius:16px;padding:22px 20px;background:var(--st-surface);
  h2{font:600 24px/30px 'Cormorant Garamond',serif;margin:0;letter-spacing:0;}
  p{font-size:14px;line-height:21px;color:var(--st-muted);margin:8px 0 0;}
  .actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px;}
  .actions a,.actions button{display:inline-flex;align-items:center;min-height:44px;padding:0 18px;border-radius:12px;font-size:14px;font-weight:600;cursor:pointer;}
  .primary{background:var(--st-action);color:var(--st-on-action);border:0;}
  .secondary{border:1px solid var(--st-accent-line);background:transparent;color:var(--st-ink);}
`;

/** Plain, honest empty state: what happened and one way forward. */
export function EmptyState({ title, body, to, action, onAction, secondary }: { title: string; body: string; to?: string; action?: string; onAction?: () => void; secondary?: { to: string; label: string } }) {
  const { t } = useI18n();
  return <EmptyBox role="status">
    <h2>{t(title)}</h2>
    <p>{t(body)}</p>
    {(action || secondary) && <div className="actions">
      {action && (onAction ? <button type="button" className="primary" onClick={onAction}>{t(action)}</button> : <Link className="primary" to={to || '/experiences'}>{t(action)}</Link>)}
      {secondary && <Link className="secondary" to={secondary.to}>{t(secondary.label)}</Link>}
    </div>}
  </EmptyBox>;
}
