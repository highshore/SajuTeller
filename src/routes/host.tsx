import { useI18n } from '../i18n/i18n';
import { useState } from 'react';
import { ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { styled } from 'styled-components';
import { supabase } from '../supabase';
import { useAccount } from '../product/data';
import { Button, ButtonLink, Field, Notice, Page, Stack, Wrap } from '../product/ui';

const Root = styled.div`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 10px;}
  .lead{font-size:15px;line-height:1.55;color:var(--st-muted);}
  .steps{list-style:none;margin:28px 0 0;padding:24px 0 0;border-top:1px solid var(--st-line);}
  .steps li{display:grid;grid-template-columns:28px minmax(0,1fr);column-gap:14px;position:relative;padding-bottom:20px;}
  .steps li:not(:last-child)::before{content:'';position:absolute;left:13.5px;top:30px;bottom:0;width:1px;background:var(--st-accent-line);}
  .steps li:last-child{padding-bottom:0;}
  .n{width:28px;height:28px;border-radius:50%;border:1px solid var(--st-accent-line);background:var(--st-surface);display:grid;place-items:center;font-size:13px;font-weight:700;}
  .steps h2{font-size:16px;font-weight:600;letter-spacing:0;line-height:22px;padding-top:3px;margin:0;}
  .steps p{font-size:14px;line-height:21px;color:var(--st-muted);}
  .apply{margin-top:36px;padding:20px;border-radius:20px;background:var(--st-elevated);}
  .apply h2{font:600 28px/1.1 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 8px;}
  .apply>p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .apply form{margin-top:20px;}
  .apply button[type=submit],.apply>a{width:100%;margin-top:4px;}
  .apply>a{margin-top:20px;}
  .done svg{width:32px;color:var(--st-success);margin-bottom:12px;}
`;

export default function Host() {
  const { t } = useI18n();
  const { account } = useAccount();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); if (!account || busy) return;
    setBusy(true); setError('');
    const f = new FormData(e.currentTarget);
    const { error } = await supabase.from('sajuteller_host_applications').insert({ business_name: String(f.get('business')), neighborhood: String(f.get('area')), contact_email: String(f.get('email')), languages: String(f.get('languages')), introduction: String(f.get('intro')) });
    if (error) setError('Your application could not be sent. Please try again.'); else setDone(true);
    setBusy(false);
  }
  return <Page><Wrap><Root>
    <span className="kicker">{t('For Saju practitioners')}</span>
    <h1>{t('Your next guest could come from anywhere.')}</h1>
    <p className="lead">{t('Introduce your practice to travelers who want a meaningful Korean experience. Help them arrive curious, prepared, and ready to talk.')}</p>
    <ol className="steps">{[[t('Tell your story'), t('Your practice, your specialties, and what makes a visit with you different.')], [t('Make the details clear'), t('Session lengths, prices, reading languages, and where to meet.')], [t('Welcome a new kind of guest'), t('Set expectations before the visit and make space for a first-time reader.')]].map(([title, text], i) => <li key={title}><span className="n" aria-hidden="true">{i + 1}</span><div><h2>{title}</h2><p>{text}</p></div></li>)}</ol>
    <section className="apply" aria-labelledby="apply-title">{done ? <div className="done"><CheckCircleIcon/><h2 id="apply-title">{t('Your introduction is with us.')}</h2><p>{t('Your application has been saved for review. Applying does not publish a studio or activate bookings.')}</p></div> : <>
      <h2 id="apply-title">{t('Let’s get to know your practice.')}</h2>
      <p>{t('Start with an introduction. Listing details and language support will need review before publication.')}</p>
      {account ? <form onSubmit={submit}><Stack>
        <Field>{t('Business or studio name')}<input name="business" required minLength={2} maxLength={160}/></Field>
        <Field>{t('Neighborhood and city')}<input name="area" required minLength={2} maxLength={160} placeholder={t('e.g. Hongdae, Seoul')}/></Field>
        <Field>{t('Contact email')}<input name="email" type="email" required defaultValue={account.email} maxLength={254}/></Field>
        <Field>{t('Reading languages')}<input name="languages" required minLength={2} maxLength={200} placeholder={t('e.g. Korean, conversational English')}/></Field>
        <Field>{t('Introduce your practice')}<textarea name="intro" required minLength={20} maxLength={3000} placeholder={t('Your experience, the sessions you offer, and how you would welcome an international guest.')}/></Field>
        {error && <Notice role="alert">{t(error)}</Notice>}
        <Button disabled={busy} type="submit">{busy ? t('Sending…') : t('Send introduction')}<ArrowRightIcon/></Button>
      </Stack></form> : <ButtonLink to="/sign-in?next=/host">{t('Sign in to apply')}<ArrowRightIcon/></ButtonLink>}
    </>}</section>
  </Root></Wrap></Page>;
}
