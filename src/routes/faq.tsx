import { useI18n } from '../i18n/i18n';
import {useState} from 'react';
import {styled} from 'styled-components';
import { MagnifyingGlassIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import {Page,Wrap,ButtonLink} from '../product/ui';
const questions=[
['What is Saju?','Saju is a Korean tradition that interprets the year, month, day, and hour of your birth. A reader uses these four pillars to start a conversation about personality, relationships, work, and timing. It is a cultural practice, not a scientifically proven prediction.'],
['Is this suitable for a first-time visitor?','Yes. Start with the beginner’s guide or take the three-question experience finder. You do not need to know Korean or share birth information to browse.'],
['What does Preview studio mean?','Preview studios are sample listings that show how the marketplace will work. Their photos are illustrative. You can save them or create a preview plan on this device, but it is not a booking and nobody is contacted.'],
['Does sending a request confirm my visit?','No. For real studios, you can request a preferred date and time. The status stays Requested until the host confirms it. There is no payment or immediate reservation in this flow.'],
['How do I cancel?','Open Trips to cancel a request while it is still Requested. For a confirmed visit, contact the studio using its listing details to discuss changes and its terms. Preview plans can simply be removed from this device.'],
['Will the reader speak my language?','Check the language format on each listing. Native or conversational support means the reader speaks that language. AI interpreter support is different and may make mistakes. Confirm the exact format with a real host before your visit.'],
['Do I need my exact birth time?','An exact birth time helps a traditional four-pillars reading. If you do not know it, tell the reader rather than guessing. You do not need to enter birth details to use our experience finder or request a visit.'],
['Where are my saved places and preview plans stored?','They are saved in this browser on this device. Clearing browser data removes them. Real booking requests are linked to your signed-in account.'],
['How can my business join?','Open Become a host, sign in, and submit your studio and language details. The application is saved for review; submitting it does not automatically publish a listing.']
];
// Same accordion as Home "Questions travellers ask" (Figma 138:49).
const Root=styled.div`
 .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
 h1{font:600 40px/1.05 'Cormorant Garamond',serif;letter-spacing:-.5px;margin:8px 0 10px;}
 .lead{font-size:15px;line-height:1.55;color:var(--st-muted);margin-bottom:20px;}
 .search{position:relative;display:block;margin-bottom:8px;}
 .search svg{position:absolute;left:14px;top:50%;width:18px;translate:0 -50%;color:var(--st-faint);pointer-events:none;}
 .search input{width:100%;min-height:48px;padding:12px 16px 12px 42px;border:1px solid var(--st-line);border-radius:999px;background:var(--st-elevated);color:var(--st-ink);font-size:16px;}
 .search input:focus-visible{outline:2px solid var(--st-action);outline-offset:2px;background:var(--st-surface);}
 .sr-only{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
 details{border-bottom:1px solid var(--st-line);padding:18px 0;}
 summary{display:flex;justify-content:space-between;align-items:center;gap:12px;font-size:16px;font-weight:600;line-height:22px;cursor:pointer;list-style:none;min-height:24px;}
 summary::-webkit-details-marker{display:none;}
 summary svg{width:20px;flex:none;color:var(--st-muted);}
 details .minus,details[open] .plus{display:none;}details[open] .minus{display:block;}
 .answer{margin-top:10px;padding:16px;border-radius:12px;background:var(--st-elevated);font-size:14px;line-height:21px;color:var(--st-muted);}
 .none{padding:24px 0;font-size:15px;color:var(--st-muted);}
 .help{margin-top:32px;padding:20px;border-radius:16px;background:var(--st-accent);}
 .help h2{font:600 24px/1.15 'Cormorant Garamond',serif;letter-spacing:0;margin:0 0 6px;}
 .help p{font-size:14px;line-height:1.55;color:var(--st-muted);margin-bottom:16px;}
`;
export default function FAQ(){
 const { t } = useI18n();const[term,setTerm]=useState('');
 const filtered=questions.filter(q=>q.map(t).join(' ').toLowerCase().includes(term.toLowerCase()));
 return <Page><Wrap><Root>
  <span className="kicker">{t("Good questions")}</span><h1>{t("Before you go.")}</h1><p className="lead">{t("Practical answers for curious travelers.")}</p>
  <label className="search"><span className="sr-only">{t("Search questions")}</span><MagnifyingGlassIcon aria-hidden="true"/><input value={term} onChange={e=>setTerm(e.target.value)} placeholder={t("Try languages, birth time, or booking")} type="search"/></label>
  <div>{filtered.map(([q,a],i)=><details key={q} open={!term&&i===0}><summary>{t(q)}<PlusIcon className="plus" aria-hidden="true"/><MinusIcon className="minus" aria-hidden="true"/></summary><div className="answer">{t(a)}</div></details>)}{!filtered.length&&<p className="none">{t("No matching questions. Try a different word.")}</p>}</div>
  <section className="help"><h2>{t("Still wondering?")}</h2><p>{t("From your first Saju question to getting ready for a visit, start here.")}</p><ButtonLink to="/support" $secondary>{t("Help & support")}</ButtonLink></section>
 </Root></Wrap></Page>;
}
