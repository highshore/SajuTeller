import LoadingScreen from '../components/loading_screen';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { styled } from 'styled-components';
import { useI18n } from '../i18n/i18n';
import { supabase } from '../supabase';
import { safeReturn } from '../product/plans';
import { Button, Field, Notice, Stack } from '../product/ui';
import AnimatedEmoji from '../components/animated-emoji';
import AuthConsent from '../components/auth-consent';
import LocaleSelector from '../components/locale-selector';
const languages = { en: 'English', ko: '한국어', zh: '简体中文', ja: '日本語', es: 'Español' };
const flags = ['🇺🇸', '🇰🇷', '🇨🇳', '🇯🇵', '🇪🇸'];
const steps = [
  { emoji: 'waving-hand', title: 'What should we call you?', body: 'A nickname is perfect. Make yourself at home.' },
  { emoji: 'sparkles', title: 'A reading in your language.', body: 'Choose the language you feel most comfortable with.' },
  { emoji: 'crystal-ball', title: 'Your next chapter starts here.', body: 'You’re ready to explore. Add birth details now, or whenever you feel like it.' },
] as const;
const Wizard = styled.div`
  min-height:100dvh;display:flex;flex-direction:column;padding:12px 24px 0;
  .wizard-header{display:flex;align-items:center;justify-content:space-between;gap:12px;height:56px;}.back{width:44px;height:44px;border:0;border-radius:50%;background:var(--st-elevated);color:var(--st-ink);display:grid;place-items:center;cursor:pointer;}.back svg{width:20px;}.step-label{font-size:11px;letter-spacing:1.5px;color:var(--st-muted);text-transform:uppercase;}
  progress{width:100%;height:3px;border:0;border-radius:3px;overflow:hidden;background:var(--st-line);margin:16px 0 0;color:var(--st-gold);}progress::-webkit-progress-bar{background:var(--st-line);}progress::-webkit-progress-value{background:var(--st-gold);}progress::-moz-progress-bar{background:var(--st-gold);}
  form{display:flex;flex-direction:column;flex:1;}.step-content{padding:28px 0 28px;flex:1;}.intro{margin-bottom:24px;}.intro .eyebrow{font-size:10px;letter-spacing:2px;color:var(--st-gold);text-transform:uppercase;margin:24px 0 12px;}.intro h1{font:600 36px/1.1 'Cormorant Garamond',serif;letter-spacing:-.6px;margin-bottom:16px;outline:none;}.intro>p{font-size:14px;line-height:1.7;color:var(--st-muted);}
  .hint{font-size:12px;line-height:1.6;color:var(--st-muted);margin-top:12px;}.language-list{display:grid;gap:8px;}.language-choice{display:flex;align-items:center;gap:14px;min-height:56px;border:1px solid var(--st-line);background:var(--st-surface);border-radius:18px;padding:14px 16px;cursor:pointer;}.language-choice:has(input:checked){border-color:var(--st-gold);background:var(--st-accent);}.language-choice input{position:absolute;width:1px;height:1px;opacity:0;}.language-choice:has(input:focus-visible){outline:2px solid var(--st-gold);outline-offset:4px;}.flag{font-size:24px;}.language-choice svg{width:19px;margin-left:auto;color:var(--st-gold);}
  .summary{display:flex;align-items:center;gap:14px;border:1px solid var(--st-line);border-radius:20px;background:var(--st-surface);padding:20px;margin-bottom:20px;}.summary>span{display:grid;place-items:center;width:44px;height:44px;flex:none;background:var(--st-accent);color:var(--st-gold);border-radius:50%;font-size:19px;}.summary strong{font-size:16px;overflow-wrap:anywhere;}.summary p{font-size:13px;color:var(--st-muted);margin-top:6px;}
  details{border:1px solid var(--st-line);border-radius:20px;padding:20px;}summary{font-size:14px;cursor:pointer;min-height:24px;}details[open]>summary{margin-bottom:20px;}.privacy{display:flex;align-items:flex-start;gap:9px;font-size:12px;line-height:1.6;color:var(--st-muted);margin:20px 0;}.privacy svg{width:17px;flex:none;color:var(--st-gold);}.check{display:flex;align-items:center;gap:10px;font-size:13px;}
  .wizard-actions{position:sticky;bottom:0;background:var(--st-paper);padding:18px 0 max(20px,env(safe-area-inset-bottom));border-top:1px solid var(--st-line);}.wizard-actions>button{width:100%;border-radius:999px;min-height:54px;}.wizard-actions p{font-size:11px;color:var(--st-muted);line-height:1.5;text-align:center;margin-top:12px;}
`;
export default function Onboarding() {
  const { t, language: uiLanguage } = useI18n();
  const navigate = useNavigate(); const [params] = useSearchParams();
  const [step, setStep] = useState(0); const heading = useRef<HTMLHeadingElement>(null);
  const [name, setName] = useState(''); const [language, setLanguage] = useState('en');
  const [birth, setBirth] = useState(''); const [time, setTime] = useState(''); const [unknown, setUnknown] = useState(true);
  const [city, setCity] = useState(''); const [zone, setZone] = useState('Asia/Seoul');
  const [accepted, setAccepted] = useState(false); const [consent, setConsent] = useState(false);
  const [ready, setReady] = useState(false); const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const [retry, setRetry] = useState(0);
  const initialLanguage = useRef(uiLanguage);
  useEffect(() => { let alive = true; void (async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(); if (error || !user) throw new Error('Please sign in again.');
      const { data: profile, error: pe } = await supabase.from('profiles').select('id,display_name,preferred_language').eq('auth_user_id', user.id).single(); if (pe) throw pe;
      const [b, c] = await Promise.all([
        supabase.from('user_birth_profiles').select('birth_date,birth_time,birth_time_unknown,birth_city,birth_timezone').eq('user_id', profile.id).eq('is_primary', true).limit(1).maybeSingle(),
        supabase.from('sajuteller_user_consents').select('policy_version').eq('user_id', user.id).eq('policy_version', '2026-10-09').maybeSingle(),
      ]);
      if (b.error) throw b.error; if (c.error) throw c.error; if (!alive) return;
      setName(profile.display_name || ''); setLanguage(profile.preferred_language in languages ? profile.preferred_language : initialLanguage.current);
      setAccepted(!!c.data); setBirth(b.data?.birth_date || ''); setTime(b.data?.birth_time?.slice(0, 5) || ''); setUnknown(b.data?.birth_time_unknown ?? true);
      setCity(b.data?.birth_city || ''); setZone(b.data?.birth_timezone || 'Asia/Seoul'); setReady(true); setError('');
    } catch { if (alive) setError('Your profile could not be loaded.'); } finally { if (alive) setLoading(false); }
  })(); return () => { alive = false; }; }, [retry]);
  useEffect(() => { if (ready) { heading.current?.focus(); window.scrollTo(0, 0); } }, [step, ready]);
  async function save(acceptPolicies = false) {
    setBusy(true); setError('');
    try {
      const { error } = await supabase.rpc('sajuteller_save_profile', { p_display_name: name.trim(), p_language: language, p_birth_date: birth || null, p_birth_time: !unknown && time ? time : null, p_birth_time_unknown: unknown, p_birth_city: city || null, p_birth_timezone: zone, p_accept_policies: acceptPolicies });
      if (error) throw error;
      navigate(safeReturn(params.get('next') || '/experiences'), { replace: true });
    } catch { setConsent(false); setError('Could not save your profile.'); } finally { setBusy(false); }
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (busy || !name.trim()) return;
    if (step < 2) { setError(''); setStep(step + 1); }
    else if (!accepted) setConsent(true); else void save();
  }
  const moment = steps[step];
  return <Wizard><header className="wizard-header">
    {step ? <button className="back" disabled={busy} aria-label={t('Back')} onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeftIcon/></button> : <Link className="back" to="/profile" aria-label={t('Back')}><ArrowLeftIcon/></Link>}
    <span className="step-label">{t('Profile')} {step + 1} / 3</span><LocaleSelector/>
  </header><progress max={3} value={step + 1} aria-label={t('Profile setup')}/>
  {loading ? <LoadingScreen label="Loading your profile…"/> : !ready ? <Notice role="alert">{t(error)}<Button onClick={() => { setLoading(true); setRetry(v => v + 1); }}>{t('Retry loading profile')}</Button></Notice> : <form onSubmit={submit}>
    <div className="step-content"><section className="intro"><AnimatedEmoji key={step} name={moment.emoji} size={72}/><p className="eyebrow">{t('Your SajuTeller')}</p><h1 ref={heading} tabIndex={-1}>{t(moment.title)}</h1><p>{t(moment.body)}</p></section>
    {step === 0 && <><Field>{t('Display name')}<input autoComplete="nickname" maxLength={80} required value={name} onChange={e => setName(e.target.value)} placeholder={t('Your nickname')}/></Field><p className="hint">{t('You can change this later in your profile.')}</p></>}
    {step === 1 && <fieldset className="language-list"><legend className="sr-only">{t('Preferred reading language')}</legend>{Object.entries(languages).map(([code, label], i) => <label className="language-choice" key={code}><input type="radio" name="reading-language" value={code} checked={language === code} onChange={() => setLanguage(code)}/><span className="flag" aria-hidden="true">{flags[i]}</span><span lang={code}>{label}</span>{language === code && <CheckIcon/>}</label>)}</fieldset>}
    {step === 2 && <><div className="summary"><span aria-hidden="true">{name.trim().slice(0, 1).toUpperCase()}</span><div><strong>{name.trim()}</strong><p>{languages[language as keyof typeof languages]}</p></div></div>
    <details><summary>{t('Birth details')} · {t('Optional')}</summary><p className="hint" style={{ marginBottom: 20 }}>{t('Save these privately for your readings. You can add them later or remove them here.')}</p><Stack>
      <Field>{t('Birth date')}<input type="date" min="1900-01-01" max={new Date().toISOString().slice(0,10)} value={birth} onChange={e => setBirth(e.target.value)}/></Field>
      <label className="check"><input type="checkbox" checked={unknown} onChange={e => setUnknown(e.target.checked)}/>{t('I don’t know my birth time')}</label>
      {!unknown && <Field>{t('Birth time')}<input type="time" value={time} onChange={e => setTime(e.target.value)}/></Field>}
      <Field>{t('Birthplace')}<input maxLength={160} value={city} onChange={e => setCity(e.target.value)} placeholder={t('City, country')}/></Field>
      <Field>{t('Birth time zone')}<input value={zone} onChange={e => setZone(e.target.value)} list="time-zones" placeholder="Asia/Seoul"/><datalist id="time-zones">{['Asia/Seoul','Asia/Tokyo','Asia/Shanghai','Europe/Madrid','America/New_York','America/Los_Angeles','UTC'].map(z => <option key={z} value={z}/>)}</datalist></Field>
      {birth && <Button type="button" $secondary onClick={() => { setBirth(''); setTime(''); setCity(''); setUnknown(true); }}>{t('Remove birth details on save')}</Button>}
    </Stack></details><p className="privacy"><ShieldCheckIcon/>{t('Birth details stay private. You can explore without adding them.')}</p></>}
    {error && <Notice role="alert">{t(error)}</Notice>}</div>
    <div className="wizard-actions"><Button disabled={busy || !name.trim()}>{busy ? t('Saving…') : step < 2 ? t('Continue') : t('Start exploring')}</Button><p>{t(step < 2 ? 'Just a few small steps.' : 'You can update your preferences anytime.')}</p></div>
  </form>}{consent && <AuthConsent profile busy={busy} onAccept={() => void save(true)} onCancel={() => setConsent(false)}/>}</Wizard>;
}
