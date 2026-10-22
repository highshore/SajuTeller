import { TextSkeleton } from '../components/skeleton';
import { useI18n } from '../i18n/i18n';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useAccount, useSaved, languageNames } from '../product/data';
import { supabase } from '../supabase';
import { Page, Wrap, Notice } from '../product/ui';

const Content = styled.div`
  .top{display:flex;align-items:center;justify-content:space-between;gap:12px;}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:4px 0;}
  .edit{display:flex;align-items:center;min-height:44px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .identity{display:flex;align-items:center;gap:16px;margin:20px 0;}
  .avatar{width:64px;height:64px;flex:none;border-radius:50%;display:grid;place-items:center;background:var(--st-brand);color:#fff;font:600 28px/1 'Cormorant Garamond',serif;}
  .identity h2{font:600 26px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:0;overflow-wrap:anywhere;}
  .identity p{font-size:14px;color:var(--st-muted);margin-top:2px;}
  .status{padding:16px;border-radius:16px;background:var(--st-accent);}
  .status.ready{background:var(--st-success-bg);}
  .status strong{display:block;font-size:15px;font-weight:600;}
  .status.ready strong{color:var(--st-success);}
  .status p{font-size:14px;line-height:1.5;color:var(--st-muted);margin-top:2px;}
  .status a{display:inline-flex;align-items:center;min-height:44px;margin-top:2px;font-size:14px;font-weight:600;color:var(--st-brand);}
  .group-title{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-faint);margin:28px 0 4px;}
  .group{border-top:1px solid var(--st-line);}
  .row{display:grid;grid-template-columns:minmax(0,1fr) 18px;align-items:center;gap:12px;min-height:64px;padding:12px 0;border-bottom:1px solid var(--st-line);}
  .row strong{display:block;font-size:16px;font-weight:600;line-height:1.35;}
  .row span{display:block;font-size:13px;line-height:1.45;color:var(--st-muted);margin-top:2px;}
  .row svg{width:18px;color:var(--st-faint);}
  .sign-out{display:block;width:100%;margin-top:24px;min-height:48px;border:1px solid var(--st-line);border-radius:14px;background:none;color:var(--st-ink);font-size:15px;font-weight:600;cursor:pointer;}
  .sign-out:disabled{opacity:.45;cursor:not-allowed;}
`;

export default function Account() {
  const { t } = useI18n();
  const { account } = useAccount();
  const { saved } = useSaved();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ display_name: string; preferred_language: string; onboarding_completed: boolean } | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!account) return;
    let alive = true;
    supabase.from('profiles').select('display_name,preferred_language,onboarding_completed').eq('auth_user_id', account.id).single().then(({ data, error }) => {
      if (alive) { if (error) setError('Your profile could not be loaded.'); else setProfile(data); }
    });
    return () => { alive = false; };
  }, [account]);
  const loadingProfile = !profile && !error;
  const language = t(languageNames[profile?.preferred_language || 'en']);
  const groups: [string, [string, string, string][]][] = [
    ['Your trips', [
      ['/trips', t('Your bookings'), t('Visit requests & preview plans')],
      ['/messages', t('Messages'), t('Open your existing messages.')],
      ['/saved', t('Saved readings'), `${saved.length} · ${t('Saved on this device')}`],
      ['/notifications', t('Notifications'), t('Updates and offers from SajuTeller')],
    ]],
    ['Account', [
      ['/onboarding?next=/profile', t('Personal information'), t('Name, birthday & preferences')],
      ['/onboarding?next=/profile', t('Reading language'), `${language} · ${t('Prices in KRW')}`],
      ['/privacy', t('Privacy & data'), t('How your account and birth details are used')],
      ['/support', t('Help & support'), t('Questions about your reading')],
    ]],
  ];
  return <Page><Wrap><Content>
    <div className="top"><h1>{t('Your profile')}</h1><Link className="edit" to="/onboarding?next=/profile">{t('Edit')}</Link></div>
    <div className="identity">
      <span className="avatar" aria-hidden="true">{profile?.display_name?.[0]?.toUpperCase() || 'S'}</span>
      <div style={{ flex: 1, minWidth: 0 }}>{loadingProfile ? <TextSkeleton lines={2}/> : <><h2>{profile?.display_name || t('Your account')}</h2><p>{language} · KRW</p></>}</div>
    </div>
    {loadingProfile ? <TextSkeleton lines={2}/> : <div className={'status' + (profile?.onboarding_completed ? ' ready' : '')}>
      <strong>{profile?.onboarding_completed ? t('Your profile is ready') : t('Complete your profile')}</strong>
      <p>{profile?.onboarding_completed ? t('Your preferences are saved for your next reading.') : t('Add your name and reading preferences to get started.')}</p>
      {!profile?.onboarding_completed && <Link to="/onboarding?next=/profile">{t('Continue')}</Link>}
    </div>}
    {groups.map(([title, rows]) => <section key={title}><h2 className="group-title">{t(title)}</h2><div className="group">{rows.map(([to, label, sub]) => <Link className="row" key={label} to={to}><div><strong>{label}</strong><span>{sub}</span></div><ChevronRightIcon aria-hidden="true"/></Link>)}</div></section>)}
    {error && <Notice role="alert" style={{ marginTop: 20 }}>{t(error)}</Notice>}
    <button className="sign-out" disabled={busy} onClick={async () => { setBusy(true); const { error } = await supabase.auth.signOut(); if (error) { setError('Could not sign out. Please try again.'); setBusy(false); } else navigate('/'); }}>{busy ? t('Signing out…') : t('Sign out')}</button>
  </Content></Wrap></Page>;
}
