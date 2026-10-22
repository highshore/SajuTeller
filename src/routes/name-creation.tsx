import LoadingScreen from '../components/loading_screen';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowPathIcon, CheckIcon, ChevronRightIcon, ShareIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';
import { generateKoreanName, type NameGenerationResponse } from '../services/openai';
import {
  Body, Boxed, Disclaimer, Display, FieldBlock, Kicker, Lede, Night, PageBar, Primary, Secondary, Segmented, Starfield, StickyAction,
} from '../components/readings/shared';

// Figma 06 — Redesign: "12 Korean name — About you" (148:719), "13 — Your names" (148:798), "14 — detail" (148:896).
// Each name comes from generateKoreanName (one name per call). "Suggest another" calls it again with the same
// answers and adds the result to the list. Per-character meanings are read from the AI's own explanation when it
// uses the "字 (Sound, meaning)" pattern; nothing is invented when it doesn't.

interface FormData {
  originalName: string;
  gender: string;
  personality: string[];
}

const TRAITS = [['kind', 'Kind'], ['calm', 'Calm'], ['strong', 'Strong'], ['active', 'Energetic'], ['wise', 'Wise'], ['creative', 'Creative']] as const;
const MAX_TRAITS = 2;

const syllables = (value: string) => Array.from(value.replace(/[\s()（）]/g, ''));

/** "大 (Dae, great)" → "great". Returns null when the explanation doesn't name the character that way. */
function charMeaning(meaning: string, hanja: string) {
  const match = meaning.match(new RegExp(`${hanja}\\s*[(（]([^)）]+)[)）]`));
  if (!match) return null;
  const parts = match[1].split(/[,，]/);
  if (parts.length < 2) return null;
  return parts.slice(1).join(',').trim().replace(/^["“'‘]+|["”'’]+$/g, '') || null;
}

function breakdown(result: NameGenerationResponse) {
  const hangul = syllables(result.name_hangul);
  const hanja = syllables(result.name_hanja);
  const roman = result.romanization.split(/[\s\-‐]+/).filter(Boolean);
  if (hangul.length !== hanja.length) return null;
  return hangul.map((h, i) => ({ hangul: h, hanja: hanja[i], roman: roman.length === hangul.length ? roman[i] : null, meaning: charMeaning(result.meaning, hanja[i]) }));
}

const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
function speak(text: string) {
  if (!canSpeak) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

const Intro = styled.header`
  padding: 8px 20px 0;
  .bar { margin: 0 -8px; }
  h2 { margin-bottom: 10px; }
`;

const Chips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  button { min-height: 40px; padding: 8px 16px; border-radius: 99px; border: 1px solid var(--st-accent-line); background: var(--st-surface); color: var(--st-ink);
    font: 600 14px/1.2 Inter, sans-serif; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
  button svg { width: 16px; }
  button[aria-pressed='true'] { background: var(--st-action); border-color: var(--st-action); color: var(--st-on-action); }
  button:disabled { opacity: .45; cursor: not-allowed; }
`;

const NameCard = styled.article<{ $first?: boolean }>`
  border: ${p => p.$first ? '2px solid var(--st-action)' : '1px solid var(--st-line)'};
  border-radius: 18px;
  padding: ${p => p.$first ? '17px' : '18px'};
  background: var(--st-surface);
  display: grid;
  gap: 12px;
  .top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .hangul { margin: 0; font: 500 38px/1.1 'Noto Serif KR', serif; color: var(--st-ink); overflow-wrap: anywhere; }
  .roman { margin: 4px 0 0; font: 600 14px/1.3 Inter, sans-serif; color: var(--st-muted); }
  .listen { flex: none; width: 44px; height: 44px; border-radius: 50%; border: 1px solid var(--st-line); background: var(--st-surface); color: var(--st-ink); display: grid; place-items: center; cursor: pointer; }
  .listen svg { width: 20px; }
  .meaning { display: grid; grid-template-columns: auto minmax(0, 1fr); gap: 12px; align-items: center; background: var(--st-elevated); border-radius: 12px; padding: 12px 14px; }
  .meaning b { font: 500 22px/1.2 'Noto Serif KR', serif; color: var(--st-action); letter-spacing: 3px; }
  .meaning span { font-size: 14px; line-height: 1.5; color: var(--st-ink); display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
  .details { justify-self: end; border: 0; background: none; padding: 0 2px; min-height: 40px; color: var(--st-action); font: 650 14px/1.2 Inter, sans-serif; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; }
  .details svg { width: 16px; }
`;

const Amber = styled.div`
  background: var(--st-preview-bg);
  border-radius: 16px;
  padding: 16px 18px;
  h3 { margin: 0 0 6px; font: 650 15px/1.35 Inter, sans-serif; color: var(--st-preview); }
  p { margin: 0; font-size: 13px; line-height: 1.6; color: var(--st-muted); }
`;

const Master = styled.div`
  border-radius: 18px;
  padding: 22px 20px;
  background: linear-gradient(180deg, #130a1b 0%, #2a1534 100%);
  display: grid;
  gap: 10px;
  h3 { margin: 0; font: 500 26px/1.15 'Cormorant Garamond', serif; color: var(--st-ink); }
  p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--st-muted); }
  a { margin-top: 6px; min-height: 52px; border-radius: 14px; background: var(--st-action); color: var(--st-on-action); display: flex; align-items: center; justify-content: center; text-align: center; padding: 12px; font: 650 15px/1.3 Inter, sans-serif; }
`;

const Seal = styled.div<{ $cols: number }>`
  width: 112px;
  aspect-ratio: 1;
  margin: 8px auto 22px;
  background: #b3261e;
  border-radius: 14px;
  padding: 8px;
  transform: rotate(-4deg);
  box-shadow: 0 10px 30px rgb(0 0 0 / 35%);
  .inner { width: 100%; height: 100%; border: 2px solid #f8e9e4; border-radius: 6px; display: grid; direction: rtl;
    grid-template-rows: repeat(2, 1fr); grid-auto-flow: column; grid-auto-columns: 1fr; place-items: center; padding: 4px; }
  span { font: 600 ${p => p.$cols > 2 ? 18 : 30}px/1 'Noto Serif KR', serif; color: #fbefe9; }
  @media (prefers-reduced-motion: reduce) { transform: none; }
`;

const Hero = styled.div`
  text-align: center;
  padding-bottom: 6px;
  h2 { margin: 0; font: 500 clamp(44px, 14cqi, 56px)/1.1 'Noto Serif KR', serif; color: var(--st-ink); overflow-wrap: anywhere; }
  .roman { margin: 6px 0 16px; font: 500 16px/1.3 Inter, sans-serif; color: var(--st-gold); }
  button { min-height: 44px; padding: 8px 18px; border-radius: 99px; border: 1px solid var(--st-accent-line); background: rgb(11 6 16 / 45%); color: var(--st-ink);
    font: 600 14px/1.2 Inter, sans-serif; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; }
  button svg { width: 18px; }
`;

const CharTable = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid var(--st-line);
  border-radius: 16px;
  overflow: hidden;
  li { display: grid; grid-template-columns: 56px minmax(0, 1fr); gap: 16px; align-items: center; padding: 14px 16px; }
  li + li { border-top: 1px solid var(--st-line); }
  .tile { width: 56px; height: 56px; border-radius: 12px; background: var(--st-accent); display: grid; place-items: center; font: 500 28px/1 'Noto Serif KR', serif; color: var(--st-action); }
  small { display: block; font-size: 12px; color: var(--st-muted); }
  b { display: block; font: 650 16px/1.35 Inter, sans-serif; color: var(--st-ink); margin-top: 2px; }
`;

const Explain = styled.div`
  background: var(--st-elevated);
  border-radius: 16px;
  padding: 16px 18px;
  h3 { margin: 0 0 6px; font: 650 15px/1.35 Inter, sans-serif; }
  p { margin: 0; font-size: 14px; line-height: 1.65; color: var(--st-muted); }
`;

const SectionHead = styled.h2`
  margin: 0 0 12px;
  font: 500 26px/1.2 'Cormorant Garamond', serif;
  color: var(--st-ink);
`;

const NameCreation: React.FC = () => {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState<FormData>({
    originalName: '',
    gender: '',
    personality: []
  });
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<NameGenerationResponse[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  useEffect(() => {
    // URL에서 name 파라미터를 읽어와서 폼에 미리 채우기
    const nameFromUrl = searchParams.get('name');
    if (nameFromUrl) setFormData(prev => ({ ...prev, originalName: nameFromUrl }));
  }, [searchParams]);

  const hasResults = results.length > 0;
  useEffect(() => { window.scrollTo(0, 0); }, [selected, hasResults]);

  const handleInputChange = (field: keyof FormData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handlePersonalityChange = (personality: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      personality: checked ? [...prev.personality, personality] : prev.personality.filter(p => p !== personality)
    }));
    if (errors.personality) setErrors(prev => ({ ...prev, personality: undefined }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.originalName.trim()) newErrors.originalName = t('Please enter your name.');
    if (!formData.gender) newErrors.gender = t('Choose how the name should feel.');
    if (formData.personality.length === 0) newErrors.personality = t('Pick at least one.');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createName = async () => {
    setLoading(true);
    try {
      // OpenAI 호출 (실패 시 서비스 내부 폴백)
      const nameResult = await generateKoreanName(formData);
      setResults(prev => [...prev, nameResult]);
    } catch (error) {
      console.error('이름 생성 오류:', error);
      alert(t('We couldn’t create a name just now. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await createName();
  };

  const handleBack = () => navigate('/');

  const handleShare = (result: NameGenerationResponse) => {
    const shareText = `🎭 ${t('koreanNameCreation')} ${t('result')}\n\n📝 ${t('generatedName')}: ${result.name_hangul} (${result.romanization})\n${t('hanja')}: ${result.name_hanja}\n${result.meaning}\n\n#한국이름 #이름작명 #SajuTeller`;

    if (navigator.share) {
      navigator.share({ title: t('koreanNameCreation'), text: shareText, url: window.location.href }).catch(console.error);
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        alert(t('Copied. Paste it anywhere to share.'));
      }).catch(() => {
        alert(t('Sharing isn’t available here. Copy the name by hand.'));
      });
    } else {
      alert(t('Sharing isn’t available here. Copy the name by hand.'));
    }
  };

  const handleNewName = () => {
    setResults([]);
    setSelected(null);
    setFormData({ originalName: '', gender: '', personality: [] });
  };

  const loader = loading && <LoadingScreen label="Creating your Korean name…"/>;

  // 14 — one name, character by character
  if (selected !== null && results[selected]) {
    const result = results[selected];
    // Only lay out characters when the AI explained them; otherwise hangul and hanja may not correspond.
    const parsed = breakdown(result);
    const rows = parsed && parsed.some(r => r.meaning) ? parsed : null;
    const sealChars = (() => { const h = syllables(result.name_hanja); return h.length === 2 ? [...h, '之', '印'] : h.length === 3 ? [...h, '印'] : h; })();
    return (
      <div lang={language}>
        <Night className="st-night">
          <Starfield/>
          <PageBar title={t('Your name')} onBack={() => setSelected(null)}/>
          {sealChars.length <= 4 && <Seal $cols={sealChars.length} aria-hidden="true"><div className="inner">{sealChars.map((c, i) => <span key={i} lang="zh-Hant">{c}</span>)}</div></Seal>}
          <Hero>
            <h2 lang="ko">{result.name_hangul}</h2>
            <p className="roman">{result.romanization} · <span lang="zh-Hant">{result.name_hanja}</span></p>
            {canSpeak && <button type="button" onClick={() => speak(result.name_hangul)}><SpeakerWaveIcon/>{t('Hear it')}</button>}
          </Hero>
        </Night>
        <Body>
          {rows && <section>
            <SectionHead>{t('Character by character')}</SectionHead>
            <CharTable>
              {rows.map((row, i) => <li key={i}>
                <span className="tile" lang="zh-Hant">{row.hanja}</span>
                <span>
                  <small><span lang="ko">{row.hangul}</span>{row.roman ? ` · ${row.roman}` : ''}</small>
                  {row.meaning && <b>{row.meaning}</b>}
                </span>
              </li>)}
            </CharTable>
          </section>}
          <Explain>
            <h3>{t('What the name means')}</h3>
            <p>{result.meaning}</p>
          </Explain>
          <div style={{ display: 'grid', gap: 10 }}>
            <Primary type="button" onClick={() => handleShare(result)}><ShareIcon/>{t('Share this name')}</Primary>
            <Secondary as={Link} to="/search">{t('Ask a name master to check it')}</Secondary>
          </div>
          <Disclaimer style={{ textAlign: 'center' }}>{t('AI suggestion. Read the meanings before you use it officially.')}</Disclaimer>
        </Body>
      </div>
    );
  }

  // 13 — the names so far
  if (results.length > 0) {
    const firstName = formData.originalName.trim().split(/\s+/)[0];
    return (
      <div lang={language}>
        {loader}
        <Intro>
          <div className="bar"><PageBar title={t('Korean name')} onBack={() => setResults([])}/></div>
          <Display as="h1">{t(results.length === 1 ? 'A name for {name}' : '{count} names for {name}').replace('{name}', firstName).replace('{count}', String(results.length))}</Display>
          <Lede>{t('Open a name to see each character and what it means.')}</Lede>
        </Intro>
        <Body>
          {results.map((result, i) => {
            const rows = breakdown(result);
            const short = rows && rows.every(r => r.meaning) ? rows.map(r => r.meaning).join(' · ') : result.meaning;
            return <NameCard key={i} $first={i === 0}>
              <div className="top">
                <div>
                  <p className="hangul" lang="ko">{result.name_hangul}</p>
                  <p className="roman">{result.romanization}</p>
                </div>
                {canSpeak && <button type="button" className="listen" onClick={() => speak(result.name_hangul)} aria-label={`${t('Hear it')}: ${result.name_hangul}`}><SpeakerWaveIcon/></button>}
              </div>
              <div className="meaning"><b lang="zh-Hant">{result.name_hanja}</b><span>{short}</span></div>
              <button type="button" className="details" onClick={() => setSelected(i)}>{t('Details')}<ChevronRightIcon/></button>
            </NameCard>;
          })}
          <Secondary type="button" onClick={() => void createName()} disabled={loading}><ArrowPathIcon/>{t('Suggest another name')}</Secondary>
          <Amber>
            <h3>{t('Check before you make it official')}</h3>
            <p>{t('These are AI suggestions. Results change each time, and a character can carry a meaning you didn’t intend. Read the meanings, or ask a native speaker.')}</p>
          </Amber>
          <Master className="st-night">
            <Kicker style={{ margin: 0 }}>{t('In person')}</Kicker>
            <h3>{t('Have a name master choose with your Four Pillars')}</h3>
            <p>{t('작명 — naming by the elements — is a real Korean tradition. Ask a studio whether they offer it.')}</p>
            <Link to="/search">{t('Find a reading in Seoul')}</Link>
          </Master>
          <Secondary type="button" onClick={handleNewName}>{t('Start over')}</Secondary>
        </Body>
      </div>
    );
  }

  // 12 — about you
  return (
    <div lang={language}>
      {loader}
      <Intro>
        <div className="bar"><PageBar title={t('Korean name')} onBack={handleBack}/></div>
        <Kicker style={{ color: 'var(--st-action)' }}>{t('Free · AI-assisted')}</Kicker>
        <Display as="h1">{t('A Korean name that fits you')}</Display>
        <Lede>{t('We take inspiration from the sound of your name and the traits you pick, and show every character so you can check it.')}</Lede>
      </Intro>
      <Body as="form" id="name-form" onSubmit={handleSubmit} noValidate>
        <FieldBlock>
          <div className="head"><label htmlFor="originalName">{t('Your name')}</label></div>
          <Boxed><span>{t('Full name')}</span>
            <input id="originalName" type="text" autoComplete="name" value={formData.originalName} onChange={(e) => handleInputChange('originalName', e.target.value)} placeholder={t('enterYourName')}/>
          </Boxed>
          {errors.originalName && <p className="error" role="alert">{errors.originalName}</p>}
        </FieldBlock>

        <FieldBlock>
          <div className="head"><span>{t('The name should feel')}</span></div>
          <Segmented role="group" aria-label={t('The name should feel')}>
            <button type="button" aria-pressed={formData.gender === 'male'} onClick={() => handleInputChange('gender', 'male')}>{t('Masculine')}</button>
            <button type="button" aria-pressed={formData.gender === 'female'} onClick={() => handleInputChange('gender', 'female')}>{t('Feminine')}</button>
          </Segmented>
          {errors.gender && <p className="error" role="alert">{errors.gender}</p>}
        </FieldBlock>

        <FieldBlock>
          <div className="head"><span>{t('What should it say about you?')}</span><small>{t('Pick up to 2')}</small></div>
          <Chips role="group" aria-label={t('What should it say about you?')}>
            {TRAITS.map(([value, label]) => {
              const on = formData.personality.includes(value);
              return <button key={value} type="button" aria-pressed={on} disabled={!on && formData.personality.length >= MAX_TRAITS} onClick={() => handlePersonalityChange(value, !on)}>
                {on && <CheckIcon/>}{t(label)}
              </button>;
            })}
          </Chips>
          {errors.personality && <p className="error" role="alert">{errors.personality}</p>}
        </FieldBlock>
      </Body>
      <StickyAction>
        <Primary type="submit" form="name-form">{t('Create my Korean name')}</Primary>
      </StickyAction>
    </div>
  );
};

export default NameCreation;
