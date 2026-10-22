import { useI18n } from '../i18n/i18n';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { Page, Wrap, ButtonLink } from '../product/ui';

const Root = styled.div`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 10px;}
  .lead{font-size:15px;line-height:1.55;color:var(--st-muted);margin-bottom:24px;}
  .topics{border-top:1px solid var(--st-line);}
  .topics a{display:grid;grid-template-columns:minmax(0,1fr) 18px;align-items:center;gap:12px;padding:18px 0;border-bottom:1px solid var(--st-line);}
  .topics strong{display:block;font-size:16px;font-weight:600;line-height:1.35;}
  .topics span{display:block;font-size:14px;line-height:1.5;color:var(--st-muted);margin-top:4px;}
  .topics svg{width:18px;color:var(--st-faint);}
  .contact{margin-top:32px;padding:20px;border-radius:16px;background:var(--st-elevated);}
  .contact h2{font:600 26px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 8px;}
  .contact p{font-size:14px;line-height:1.55;color:var(--st-muted);}
  .contact a{margin-top:16px;width:100%;}
  .contact .fine{font-size:12px;color:var(--st-faint);margin-top:12px;}
`;
const topics = [
  ['/learn/first-reading', 'New to Saju?', 'Understand the four pillars, what to ask, and what to bring. No prior knowledge needed.'],
  ['/trips', 'Your visit plans', 'Check a request’s status, cancel a pending request, or find your saved preview plans.'],
  ['/faq', 'Quick answers', 'Learn how language support, preview studios, and request-to-book work.'],
  ['/refund-policy', 'Cancellation', 'How cancelling a request works.'],
] as const;

export default function Support() {
  const { t } = useI18n();
  return <Page><Wrap><Root>
    <span className="kicker">{t('A little help along the way')}</span>
    <h1>{t('Travel with fewer unknowns.')}</h1>
    <p className="lead">{t('From your first Saju question to getting ready for a visit, start here.')}</p>
    <nav className="topics" aria-label={t('Help topics')}>{topics.map(([to, title, body]) => <Link key={to} to={to}><div><strong>{t(title)}</strong><span>{t(body)}</span></div><ChevronRightIcon aria-hidden="true"/></Link>)}</nav>
    <section className="contact">
      <h2>{t('Need to contact us?')}</h2>
      <p>{t('Sign in to use the existing messaging area. For a real studio visit, also check the studio’s listed contact details.')}</p>
      <ButtonLink to="/messages">{t('Open messages')}</ButtonLink>
      <p className="fine">{t('Response times and language availability are not guaranteed. Preview studios cannot be contacted or booked.')}</p>
    </section>
  </Root></Wrap></Page>;
}
