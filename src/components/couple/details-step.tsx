import { useId, type FormEvent } from 'react';
import { styled } from 'styled-components';
import { ChevronLeftIcon, ClockIcon, LockClosedIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../../i18n/i18n';
import { Button, Field } from '../../product/ui';
import { RELATIONS, today, validDate, type CouplePerson, type CoupleRelation } from './store';
import { Screen, StickyAction, SubHead } from './styles';
import { fill } from './copy';

// Figma 152:353 "18 — Their birth details": each field says what it unlocks.
const Form = styled.form`
  .fields{display:grid;gap:18px;margin-top:22px;padding:0 20px;}
  .unlock{display:flex;gap:8px;margin-top:-2px;font-size:13px;line-height:19px;color:var(--st-muted);}
  .unlock svg{width:16px;height:16px;flex:none;margin-top:2px;color:var(--st-gold);}
  .optional{font-weight:400;color:var(--st-faint);}
  fieldset{border:0;padding:0;margin:0;min-width:0;}
  legend{font-size:12px;font-weight:650;margin-bottom:8px;}
  .chips{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}
  .chips label{position:relative;}
  .chips input{position:absolute;opacity:0;inset:0;}
  .chips span{display:grid;place-items:center;min-height:44px;padding:8px 4px;border-radius:12px;border:1px solid var(--st-line);background:var(--st-paper);font-size:13px;font-weight:600;color:var(--st-muted);text-align:center;cursor:pointer;}
  .chips input:checked + span{border-color:var(--st-action);background:var(--st-accent);color:var(--st-ink);}
  .chips input:focus-visible + span{outline:2px solid var(--st-action);outline-offset:2px;}
  .place{display:flex;gap:10px;padding:14px 16px;border-radius:14px;background:var(--st-accent);font-size:13px;line-height:19px;color:var(--st-muted);}
  .place svg{width:18px;height:18px;flex:none;color:var(--st-action);margin-top:1px;}
  .save{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border:1px solid var(--st-line);border-radius:14px;cursor:pointer;}
  .save input{width:20px;height:20px;margin:1px 0 0;flex:none;}
  .save b{display:block;font-size:14px;font-weight:600;line-height:20px;}
  .save small{display:block;font-size:13px;line-height:19px;color:var(--st-muted);margin-top:2px;}
`;

type Props = {
  who: 'you' | 'them';
  step: number;
  person: CouplePerson;
  onChange: (person: CouplePerson) => void;
  relation?: CoupleRelation;
  onRelation?: (relation: CoupleRelation) => void;
  save?: boolean;
  onSave?: (save: boolean) => void;
  onBack: () => void;
  onContinue: () => void;
};


export default function DetailsStep({ who, step, person, onChange, relation, onRelation, save, onSave, onBack, onContinue }: Props) {
  const { t } = useI18n();
  const id = useId();
  const them = who === 'them';
  const name = person.name.trim();
  const ok = validDate(person.date);
  const title = them ? (name ? fill(t('Add {name}’s birth details'), { name }) : t('Their birth details')) : t('Your birth details');
  const submit = (e: FormEvent) => { e.preventDefault(); if (ok) onContinue(); };

  return <Screen>
    <SubHead>
      <button type="button" className="icon" onClick={onBack} aria-label={t('Back')}><ChevronLeftIcon/></button>
      <span className="title">{them ? (name ? fill(t('Add {name}'), { name }) : t('Their details')) : t('Your details')}</span>
      <span className="count">{fill(t('{n} of 2'), { n: String(step) })}</span>
    </SubHead>
    <Form onSubmit={submit} noValidate>
      <div className="pad">
        <h1>{title}</h1>
        <p className="lead">{t('Each detail opens another part of your reading.')}</p>
      </div>
      <div className="fields">
        <Field><span>{them ? t('Their name') : t('Your name')} <span className="optional">{t('(optional)')}</span></span>
          <input value={person.name} onChange={e => onChange({ ...person, name: e.target.value })} maxLength={24} autoComplete={them ? 'off' : 'given-name'} placeholder={them ? t('e.g. Alex') : t('e.g. Daniel')}/>
        </Field>
        <div>
          <Field htmlFor={`${id}-date`}>{t('Birth date')}
            <input id={`${id}-date`} type="date" required min="1900-01-01" max={today()} value={person.date} onChange={e => onChange({ ...person, date: e.target.value })} aria-describedby={`${id}-date-note`}/>
          </Field>
          <p className="unlock" id={`${id}-date-note`} style={{ marginTop: 8 }}><LockClosedIcon aria-hidden="true"/>{them ? t('Opens their Year and Day pillars — the Day pillar is the core self, and its branch is the “spouse palace” that reads how they love.') : t('Opens your Year and Day pillars — the Day pillar is the core self, and its branch is the “spouse palace” that reads how you love.')}</p>
        </div>
        <div>
          <Field htmlFor={`${id}-time`}><span>{t('Birth time')} <span className="optional">{t('(optional)')}</span></span>
            <input id={`${id}-time`} type="time" value={person.time} onChange={e => onChange({ ...person, time: e.target.value })} aria-describedby={`${id}-time-note`}/>
          </Field>
          <p className="unlock" id={`${id}-time-note`} style={{ marginTop: 8 }}><ClockIcon aria-hidden="true"/>{them ? t('Opens their Hour pillar — who they are in private. Unlocks “Everyday life”.') : t('Opens your Hour pillar — who you are in private. Unlocks “Everyday life”.')}</p>
        </div>
        <p className="place"><MapPinIcon aria-hidden="true"/>{t('No birthplace needed here: we read the clock time as you enter it. A master corrects for true solar time in a full reading.')}</p>
        {them && relation && onRelation && <fieldset>
          <legend>{t('You are')}</legend>
          <div className="chips">{RELATIONS.map(([key, label]) => <label key={key}>
            <input type="radio" name={`${id}-relation`} value={key} checked={relation === key} onChange={() => onRelation(key)}/><span>{t(label)}</span>
          </label>)}</div>
        </fieldset>}
        {onSave && <label className="save">
          <input type="checkbox" checked={!!save} onChange={e => onSave(e.target.checked)}/>
          <span><b>{t('Keep these birthdays on this phone')}</b><small>{t('Only in this browser, for “Your people”. Remove them anytime.')}</small></span>
        </label>}
      </div>
      <StickyAction>
        <Button type="submit" disabled={!ok}>{t('Continue')}</Button>
        <span className="note">{t('Only a date is required.')}</span>
      </StickyAction>
    </Form>
  </Screen>;
}
