import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Button, Page, Wrap } from '../product/ui';

const Finder = styled.div`
  .kicker{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);}
  .progress{display:flex;gap:6px;margin:14px 0 28px;}
  .progress span{height:4px;flex:1;border-radius:2px;background:var(--st-line);}
  .progress span[data-done='true']{background:var(--st-brand);}
  .step{font-size:13px;font-weight:600;color:var(--st-muted);}
  h1{font:600 32px/38px 'Cormorant Garamond',serif;letter-spacing:-.3px;margin:6px 0 8px;outline:none;}
  .desc{font-size:15px;line-height:22px;color:var(--st-muted);margin:0 0 20px;}
  .choices{display:grid;gap:10px;}
  .nav{display:flex;gap:12px;margin-top:24px;}
  .fine{font-size:13px;line-height:19px;color:var(--st-faint);margin-top:20px;}
`;
const Choice = styled.button<{ $selected: boolean }>`
  border:1px solid ${p => p.$selected ? 'var(--st-brand)' : 'var(--st-line)'};
  background:${p => p.$selected ? 'var(--st-accent)' : 'var(--st-surface)'};
  color:var(--st-ink);border-radius:14px;padding:14px 16px;text-align:left;cursor:pointer;
  display:flex;justify-content:space-between;align-items:center;gap:12px;min-height:68px;
  strong{display:block;font-size:16px;font-weight:600;line-height:22px;}
  span{display:block;font-size:13px;line-height:19px;color:var(--st-muted);margin-top:2px;}
  svg{width:20px;flex-shrink:0;color:var(--st-brand);}
  &:focus-visible{outline:2px solid var(--st-action);outline-offset:2px;}
`;
const questions = [{ key: 'topic', title: 'What brings you here?', desc: 'There’s no wrong reason to be curious.', choices: [['general', 'My first Saju reading', 'A little of everything.'], ['love', 'Love & connection', 'Relationships, chemistry, and timing.'], ['career', 'My next chapter', 'Work, purpose, and new possibilities.'], ['compatibility', 'An experience together', 'A different kind of date or trip with a friend.']] }, { key: 'language', title: 'How would you like to talk?', desc: 'We’ll look for a reader or interpretation in your language.', choices: [['ko', 'Korean', 'Reader or AI interpretation.'], ['en', 'English', 'Reader or AI interpretation.'], ['ja', 'Japanese', 'Reader or AI interpretation.'], ['zh', 'Chinese', 'Reader or AI interpretation.'], ['es', 'Spanish', 'Reader or AI interpretation.'], ['', 'I’m flexible', 'Show me every language.']] }, { key: 'budget', title: 'What feels comfortable?', desc: 'A starting budget for one person. You can adjust it later.', choices: [['50000', 'Up to ₩50,000', 'A gentle first step.'], ['80000', 'Up to ₩80,000', 'Room for a longer conversation.'], ['', 'Let’s explore', 'Show me all price ranges.']] }];

export default function Match() {
  const { t } = useI18n();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const heading = useRef<HTMLHeadingElement>(null);
  const q = questions[step];
  useEffect(() => { heading.current?.focus(); }, [step]);
  function next() { if (step < 2) setStep(step + 1); else navigate('/experiences?' + new URLSearchParams({ ...answers, matched: '1' }).toString()); }
  const label = t('Question {number} of 3').replace('{number}', String(step + 1));
  return <Page><Wrap><Finder>
    <span className="kicker">{t('Find my reading')}</span>
    <div className="progress" role="progressbar" aria-label={label} aria-valuemin={1} aria-valuemax={3} aria-valuenow={step + 1}>{questions.map((x, i) => <span key={x.key} data-done={i <= step}/>)}</div>
    <span className="step">{label}</span>
    <h1 ref={heading} tabIndex={-1}>{t(q.title)}</h1>
    <p className="desc">{t(q.desc)}</p>
    <div className="choices">{q.choices.map(([value, title, desc]) => <Choice key={value} $selected={answers[q.key] === value} aria-pressed={answers[q.key] === value} onClick={() => setAnswers(v => ({ ...v, [q.key]: value }))}>
      <div><strong>{t(title)}</strong><span>{t(desc)}</span></div>{answers[q.key] === value && <CheckIcon aria-hidden="true"/>}
    </Choice>)}</div>
    <div className="nav">
      {step > 0 && <Button $secondary onClick={() => setStep(step - 1)}><ArrowLeftIcon/>{t('Back')}</Button>}
      <Button disabled={answers[q.key] === undefined} onClick={next} style={{ flex: 1 }}>{step === 2 ? t('See my experiences') : t('Next')}<ArrowRightIcon/></Button>
    </div>
    <p className="fine">{t('This is an experience finder, not a fortune prediction. No account or birth details needed.')}</p>
  </Finder></Wrap></Page>;
}
