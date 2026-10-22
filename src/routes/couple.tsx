import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useI18n } from '../i18n/i18n';
import { InviteLanding, StartStep } from '../components/couple/start-step';
import DetailsStep from '../components/couple/details-step';
import Reveal from '../components/couple/reveal';
import CoupleResult from '../components/couple/result';
import { readingFor } from '../components/couple/copy';
import { forgetAll, loadSaved, removePerson, savePair, validDate, type CouplePerson, type CoupleRelation, type SavedPerson } from '../components/couple/store';

// Free couple compatibility (Figma "Row 3 · Couple compatibility v2", 152:282 → 152:800).
// Client-only: birthdays never leave the device; "Your people" lives in localStorage when the user opts in.
type Step = 'start' | 'them' | 'you' | 'reveal' | 'result';
const STEPS: Step[] = ['start', 'them', 'you', 'reveal', 'result'];
const blank: CouplePerson = { name: '', date: '', time: '' };

export default function Couple() {
  const { t, language } = useI18n();
  const [params, setParams] = useSearchParams();
  const from = (params.get('from') ?? '').trim().slice(0, 24);
  const rawStep = params.get('step') as Step | null;
  const [saved, setSaved] = useState(loadSaved);
  const [me, setMe] = useState<CouplePerson>(() => saved.me ?? blank);
  const [them, setThem] = useState<CouplePerson>(() => ({ ...blank, name: from }));
  const [relation, setRelation] = useState<CoupleRelation>('partners');
  const [keep, setKeep] = useState(false);
  const [savedId, setSavedId] = useState<string | undefined>();

  // Invitees enter their own birthday first; everyone else starts with the other person.
  const order: Step[] = from ? ['you', 'them'] : ['them', 'you'];
  const reading = useMemo(() => validDate(me.date) && validDate(them.date) ? readingFor(me, them) : null, [me, them]);

  // Steps live in the URL so the browser back button walks the flow. Guard steps whose data is missing.
  let step: Step = rawStep && STEPS.includes(rawStep) ? rawStep : 'start';
  if ((step === 'reveal' || step === 'result') && !reading) step = 'start';
  if (step === order[1] && !validDate((order[0] === 'you' ? me : them).date)) step = 'start';

  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'instant' }); }, [step]);

  const go = (next: Step, replace = false) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'start') nextParams.delete('step'); else nextParams.set('step', next);
    setParams(nextParams, { replace });
  };

  const aName = me.name.trim() || t('You');
  const bName = them.name.trim() || t('Them');

  const finish = () => {
    if (keep) {
      const next = savePair(me, them, relation, savedId);
      setSaved(next);
      setSavedId(next.people[0]?.id);
    }
    go('reveal');
  };

  const openPerson = (person: SavedPerson) => {
    setThem({ name: person.name, date: person.date, time: person.time });
    setRelation(person.relation);
    setSavedId(person.id);
    setKeep(true);
    if (saved.me && validDate(saved.me.date)) { setMe(saved.me); go('result'); } else go('you');
  };

  if (step === 'start') {
    if (from) return <InviteLanding from={from} onStart={() => go(order[0])}/>;
    return <StartStep saved={saved} onEnter={() => { setThem(blank); setSavedId(undefined); go(order[0]); }} onOpen={openPerson}
      onRemove={id => setSaved(removePerson(id))} onForget={() => { setSaved(forgetAll()); setKeep(false); setSavedId(undefined); }}/>;
  }

  if (step === 'them' || step === 'you') {
    const first = step === order[0];
    const isThem = step === 'them';
    return <DetailsStep key={step} who={step} step={first ? 1 : 2}
      person={isThem ? them : me} onChange={isThem ? setThem : setMe}
      relation={isThem ? relation : undefined} onRelation={isThem ? setRelation : undefined}
      save={first ? undefined : keep} onSave={first ? undefined : setKeep}
      onBack={() => window.history.length > 1 ? window.history.back() : go('start', true)}
      onContinue={() => first ? go(order[1]) : finish()}/>;
  }

  if (!reading) return null;
  if (step === 'reveal') return <Reveal reading={reading} aName={aName} bName={bName} onRead={() => go('result', true)} onEdit={() => go(order[0])} onClose={() => go('start')}/>;
  return <CoupleResult reading={reading} aName={aName} bName={bName} language={language} onBack={() => go('start')} onAddTime={who => go(who)}/>;
}
