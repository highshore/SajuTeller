import { useState } from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ChevronLeftIcon, ChevronRightIcon, DevicePhoneMobileIcon, LockClosedIcon, PaperAirplaneIcon, PencilIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';
import { Button, Field } from '../../product/ui';
import { BRANCHES, ELEMENTS, STEMS, chartFor, stemElement } from '../../product/saju';
import { RELATIONS, type CoupleSaved, type SavedPerson } from './store';
import { ELEMENT_INK, ELEMENT_TINT, Screen, SubHead } from './styles';
import { fill } from './copy';

// Figma 152:282 "17 Couple v2 — Who are you reading with?"
const Options = styled.div`
  display:grid;gap:12px;margin-top:24px;
  .option{display:grid;grid-template-columns:40px 1fr;gap:14px;align-items:start;width:100%;text-align:left;padding:16px;border-radius:16px;border:1px solid var(--st-line);background:var(--st-paper);color:var(--st-ink);cursor:pointer;}
  .option.primary{border:2px solid var(--st-action);background:var(--st-accent);padding:15px;}
  .icon{width:40px;height:40px;border-radius:10px;display:grid;place-items:center;background:var(--st-elevated);color:var(--st-ink);}
  .primary .icon{background:var(--st-action);color:var(--st-on-action);}
  .icon svg{width:20px;height:20px;}
  .name{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:16px;font-weight:600;line-height:22px;}
  .tag{font-size:12px;font-weight:600;color:var(--st-action);}
  .desc{display:block;margin-top:4px;font-size:14px;line-height:20px;color:var(--st-muted);}
  .invite{border:1px solid var(--st-line);border-radius:16px;padding:16px;display:grid;gap:14px;background:var(--st-elevated);}
  .preview{font-size:14px;line-height:20px;padding:12px 14px;border-radius:12px;background:var(--st-paper);border:1px solid var(--st-line);overflow-wrap:anywhere;}
  .safe{display:flex;gap:8px;font-size:13px;line-height:19px;color:var(--st-success);background:var(--st-success-bg);padding:10px 12px;border-radius:10px;}
  .safe svg{width:18px;height:18px;flex:none;margin-top:1px;}
  .copied{font-size:13px;color:var(--st-success);min-height:19px;}
`;

const People = styled.section`
  margin-top:36px;padding:0 20px 40px;
  .head{display:flex;align-items:baseline;justify-content:space-between;gap:12px;flex-wrap:wrap;}
  .local{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--st-faint);}.local svg{width:15px;height:15px;}
  ul{margin-top:8px;}
  li{display:flex;align-items:center;gap:4px;border-bottom:1px solid var(--st-line);}
  li:last-child{border-bottom:0;}
  .open{flex:1;min-width:0;display:grid;grid-template-columns:44px 1fr 20px;gap:14px;align-items:center;padding:14px 0;border:0;background:none;color:inherit;text-align:left;cursor:pointer;}
  .avatar{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;font:600 19px 'Noto Serif KR',serif;}
  .who{min-width:0;}.who b{display:block;font-size:16px;font-weight:600;line-height:22px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
  .who small{display:block;font-size:13px;line-height:18px;color:var(--st-muted);}
  .open > svg{width:18px;height:18px;color:var(--st-faint);}
  .remove{width:44px;height:44px;flex:none;display:grid;place-items:center;border:0;background:none;color:var(--st-faint);border-radius:50%;cursor:pointer;}.remove svg{width:18px;height:18px;}
  .empty{margin-top:12px;padding:16px;border-radius:14px;background:var(--st-elevated);font-size:14px;line-height:20px;color:var(--st-muted);}
  .forget{margin-top:8px;min-height:44px;border:0;background:none;padding:0;font-size:13px;font-weight:600;color:var(--st-muted);text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
`;

type StartProps = {
  saved: CoupleSaved;
  onEnter: () => void;
  onOpen: (person: SavedPerson) => void;
  onRemove: (id: string) => void;
  onForget: () => void;
};

export function StartStep({ saved, onEnter, onOpen, onRemove, onForget }: StartProps) {
  const { t } = useI18n();
  const [inviting, setInviting] = useState(false);
  const [myName, setMyName] = useState(saved.me?.name ?? '');
  const [copied, setCopied] = useState('');
  const link = `${window.location.origin}/couple${myName.trim() ? `?from=${encodeURIComponent(myName.trim())}` : ''}`;
  const message = myName.trim() ? fill(t('{name} wants to compare your Saju — free, on your own phone.'), { name: myName.trim() }) : t('Let’s compare our Saju — free, on your own phone.');

  async function share() {
    const text = `${message} ${link}`;
    try {
      if (navigator.share) { await navigator.share({ text: message, url: link }); return; }
      await navigator.clipboard.writeText(text);
      setCopied(t('Invite copied. Paste it in any chat.'));
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') setCopied(t('Couldn’t copy. Select the text above instead.'));
    }
  }

  const relationLabel = (r: string) => t(RELATIONS.find(([key]) => key === r)?.[1] ?? 'Partners');

  return <Screen>
    <SubHead><Link to="/" aria-label={t('Back')}><ChevronLeftIcon/></Link><span className="title">{t('Compatibility')}</span><span/></SubHead>
    <div className="pad">
      <div className="eyebrow">{t('Free · Couples & friends')}</div>
      <h1>{t('Who are you reading with?')}</h1>
      <p className="lead">{t('Compare your Saju with a partner, a date, a friend or family.')}</p>
      <Options>
        <button type="button" className="option primary" onClick={onEnter}>
          <span className="icon" aria-hidden="true"><PencilIcon/></span>
          <span><span className="name">{t('Enter their birthday')}</span><span className="desc">{t('Quick. Works with just a date — your reading opens right here.')}</span></span>
        </button>
        <button type="button" className="option" aria-expanded={inviting} aria-controls="couple-invite" onClick={() => setInviting(v => !v)}>
          <span className="icon" aria-hidden="true"><PaperAirplaneIcon/></span>
          <span><span className="name">{t('Invite them')}</span><span className="desc">{t('Send a link. They open it and read on their own phone.')}</span></span>
        </button>
        {inviting && <div className="invite" id="couple-invite">
          <Field>{t('Your first name (optional)')}<input value={myName} onChange={e => setMyName(e.target.value)} maxLength={24} autoComplete="given-name" placeholder={t('So they know who it’s from')}/></Field>
          <div className="preview">{message}<br/><span style={{ color: 'var(--st-muted)' }}>{link}</span></div>
          <p className="safe"><ShieldCheckIcon aria-hidden="true"/>{t('The link holds no birth details. They type their own on their phone — nothing is sent to you or to us.')}</p>
          <Button type="button" $secondary onClick={share}><PaperAirplaneIcon aria-hidden="true"/>{t('Share invite')}</Button>
          <p className="copied" role="status">{copied}</p>
        </div>}
      </Options>
    </div>
    <People aria-labelledby="couple-people">
      <div className="head"><h2 id="couple-people">{t('Your people')}</h2><span className="local"><DevicePhoneMobileIcon aria-hidden="true"/>{t('Saved on this phone only')}</span></div>
      {saved.people.length ? <>
        <ul>{saved.people.map(person => {
          const chart = chartFor(person.date, person.time || undefined);
          const el = chart ? stemElement(chart.day.stem) : 0;
          return <li key={person.id}>
            <button type="button" className="open" onClick={() => onOpen(person)}>
              <span className="avatar" lang="zh-Hant" style={{ background: ELEMENT_TINT[el], color: ELEMENT_INK[el] }} aria-hidden="true">{chart ? STEMS[chart.day.stem] : '?'}</span>
              <span className="who"><b>{person.name || t('Them')}</b><small>{relationLabel(person.relation)} · {t('Day pillar')} <span lang="zh-Hant">{chart ? `${STEMS[chart.day.stem]}${BRANCHES[chart.day.branch]}` : ''}</span> {t(ELEMENTS[el])}</small></span>
              <ChevronRightIcon aria-hidden="true"/>
            </button>
            <button type="button" className="remove" onClick={() => onRemove(person.id)} aria-label={fill(t('Remove {name} from this phone'), { name: person.name || t('Them') })}><XMarkIcon/></button>
          </li>;
        })}</ul>
        <button type="button" className="forget" onClick={onForget}>{t('Remove all birthdays from this phone')}</button>
      </> : <p className="empty">{t('No one yet. After a reading you can keep birthdays on this phone — they never go to our servers.')}</p>}
    </People>
  </Screen>;
}

// Figma 152:532 "21 — Alex opens the invite": privacy-first landing for whoever receives the link.
const Landing = styled.div`
  .top{padding:28px 20px 32px;background:linear-gradient(180deg,#130a1b,#3c1e48);color:#f4eee7;text-align:center;}
  .faces{display:flex;justify-content:center;}
  .faces span{width:56px;height:56px;border-radius:50%;display:grid;place-items:center;font:600 22px 'Noto Serif KR',serif;color:#1b1420;border:2px solid #1b1420;}
  .faces span:first-child{background:#e3e5f7;}.faces span:last-child{background:#e6f0dd;margin-left:-10px;}
  h1{color:#f4eee7;margin:18px 0 10px;}
  .top p{font-size:15px;line-height:22px;color:#b8acbf;}
  .locked{margin-top:22px;padding:16px;border-radius:14px;background:rgb(255 255 255 / 6%);border:1px solid rgb(255 255 255 / 10%);display:grid;gap:8px;}
  .locked i{display:block;height:8px;border-radius:4px;background:rgb(255 255 255 / 14%);}
  .locked i:nth-child(2){width:72%;}
  .locked span{display:flex;align-items:center;justify-content:center;gap:6px;margin-top:4px;font-size:13px;font-weight:600;color:#c9a76a;}.locked svg{width:16px;height:16px;}
  .body{padding:20px;display:grid;gap:14px;}
  .safe{display:flex;gap:8px;font-size:13px;line-height:19px;color:var(--st-success);background:var(--st-success-bg);padding:12px;border-radius:10px;}
  .safe svg{width:18px;height:18px;flex:none;margin-top:1px;}
  .body button{min-height:52px;font-size:16px;border-radius:12px;}
  .note{text-align:center;}
`;

export function InviteLanding({ from, onStart }: { from: string; onStart: () => void }) {
  const { t } = useI18n();
  return <Screen><Landing>
    <div className="top">
      <div className="faces" aria-hidden="true"><span>{from.slice(0, 1).toUpperCase()}</span><span>?</span></div>
      <h1>{fill(t('{name} wants to read your Saju together'), { name: from })}</h1>
      <p>{t('Add both birthdays on this phone to open your free compatibility reading.')}</p>
      <div className="locked" aria-hidden="true"><i/><i/><span><LockClosedIcon/>{t('Opens when you add your dates')}</span></div>
    </div>
    <div className="body">
      <p className="safe"><ShieldCheckIcon aria-hidden="true"/>{fill(t('This link carries no birth details, and what you type stays on this phone. {name} doesn’t see it unless you share it.'), { name: from })}</p>
      <Button type="button" onClick={onStart}>{t('Start with my birthday')}</Button>
      <p className="note">{t('No account needed.')}</p>
    </div>
  </Landing></Screen>;
}
