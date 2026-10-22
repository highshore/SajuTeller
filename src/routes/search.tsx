import { useI18n } from '../i18n/i18n';
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { CheckIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button, Field, Page, Wrap } from '../product/ui';
import { ChipRow, PillChip, TitleBlock } from '../components/discovery/ui';

const SearchPanel = styled.form`
  display:grid;gap:24px;
  .query{display:flex;align-items:center;gap:10px;height:52px;padding:0 16px;border:1px solid var(--st-accent-line);border-radius:26px;background:var(--st-surface);}
  .query:focus-within{outline:2px solid var(--st-action);outline-offset:2px;}
  .query svg{width:20px;flex:none;color:var(--st-muted);}
  .query input{border:0;background:transparent;color:var(--st-ink);width:100%;min-width:0;font-size:16px;padding:0;}
  .query input:focus{outline:none;}
  fieldset{border:0;padding:0;margin:0;min-width:0;display:grid;gap:12px;}
  legend{font:600 24px/30px 'Cormorant Garamond',serif;margin-bottom:12px;padding:0;}
  .options{display:grid;border-top:1px solid var(--st-line);}
  .option{display:flex;align-items:center;justify-content:space-between;gap:12px;min-height:64px;padding:12px 0;border:0;border-bottom:1px solid var(--st-line);background:none;color:var(--st-ink);text-align:left;cursor:pointer;}
  .option strong{display:block;font-size:16px;font-weight:600;line-height:22px;}
  .option span{display:block;font-size:14px;line-height:20px;color:var(--st-muted);}
  .option .tick{flex:none;width:24px;height:24px;border-radius:50%;border:1px solid var(--st-accent-line);display:grid;place-items:center;}
  .option[aria-pressed='true'] .tick{background:var(--st-action);border-color:var(--st-action);color:var(--st-on-action);}
  .option .tick svg{width:14px;}
  .option:focus-visible{outline:2px solid var(--st-action);outline-offset:2px;}
`;

export default function Search() {
  const { t, language: interfaceLanguage } = useI18n();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [language, setLanguage] = useState<string>(interfaceLanguage);
  useEffect(() => setLanguage(interfaceLanguage), [interfaceLanguage]);
  const [budget, setBudget] = useState(false);
  const [topic, setTopic] = useState('');
  function submit(e: FormEvent) {
    e.preventDefault();
    const p = new URLSearchParams();
    if (q.trim()) p.set('q', q.trim());
    if (language) p.set('language', language);
    if (budget) p.set('budget', '50000');
    if (topic) p.set('topic', topic);
    navigate('/experiences?' + p);
  }
  const intentions = [['general', t('Four Pillars'), t('Your timing & direction')], ['love', t('Love reading'), t('Relationships & chemistry')], ['name_creation', t('Name consult'), t('A name with meaning')]];
  return <Page><Wrap>
    <TitleBlock style={{ marginBottom: 20 }}><div><span className="kicker">{t('Search')}</span><h1>{t('Find a reading')}</h1></div></TitleBlock>
    <SearchPanel onSubmit={submit}>
      <label className="query"><MagnifyingGlassIcon aria-hidden="true"/><input aria-label={t('Studio or neighborhood')} placeholder={t('Studio or neighborhood in Seoul')} value={q} onChange={e => setQ(e.target.value)} enterKeyHint="search"/></label>
      <fieldset>
        <legend>{t('Filter your experience')}</legend>
        <ChipRow><PillChip type="button" $active={budget} aria-pressed={budget} onClick={() => setBudget(v => !v)}>{t('Under ₩50k')}</PillChip></ChipRow>
        <Field>{t('Reading language')}<select value={language} onChange={e => setLanguage(e.target.value)}><option value="">{t('Any language')}</option>{(['en', 'ko', 'ja', 'zh', 'es'] as const).map(code => <option key={code} value={code}>{new Intl.DisplayNames([interfaceLanguage], { type: 'language' }).of(code)}</option>)}</select></Field>
      </fieldset>
      <fieldset>
        <legend>{t('Browse by intention')}</legend>
        <div className="options">{intentions.map(([value, title, body]) => <button key={value} type="button" className="option" aria-pressed={topic === value} onClick={() => setTopic(topic === value ? '' : value)}>
          <div><strong>{title}</strong><span>{body}</span></div>
          <span className="tick" aria-hidden="true">{topic === value && <CheckIcon/>}</span>
        </button>)}</div>
      </fieldset>
      <Button type="submit" style={{ width: '100%' }}>{t('Show readings')}</Button>
    </SearchPanel>
  </Wrap></Page>;
}
