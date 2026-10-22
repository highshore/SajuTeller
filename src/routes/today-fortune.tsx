import LoadingScreen from '../components/loading_screen';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { InformationCircleIcon, ShareIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';
import { generateFortune, type FortuneResult, type UserInput } from '../services/fortune';
import {
  Body, Boxed, Disclaimer, Display, FieldBlock, Kicker, Lede, Night, PageBar, Primary,
  Secondary, Segmented, Starfield, StickyAction, SwitchRow, Upsell,
} from '../components/readings/shared';
import { ELEMENT_COLOR, ELEMENT_HANJA, dayStem, relationOf, type ElementName, type Relation } from '../components/readings/elements';

// Figma 06 — Redesign: "10 Today's fortune — Birth date" (148:231) and "11 Today's fortune — Result" (148:334).
// The reading text comes from services/fortune (seeded, local templates). The element pairing is calendar math
// on the birth date and today's date. Hour-by-hour energy and Yesterday/Tomorrow are not produced by the
// generator, so they are not shown.

const STORAGE_KEY = 'st.todayFortune.profile';

type Saved = { name: string; birthDate: string; birthTime: string; birthTimeUnknown: boolean };
function readSaved(): Saved | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<Saved>;
    if (typeof parsed.birthDate !== 'string') return null;
    return { name: parsed.name ?? '', birthDate: parsed.birthDate, birthTime: parsed.birthTime ?? '', birthTimeUnknown: Boolean(parsed.birthTimeUnknown) };
  } catch { return null; }
}
function writeSaved(value: Saved | null) {
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch { /* storage unavailable: nothing to remember */ }
}

// The generator's short values are Korean; map them to English source keys so t() can localise them.
const COLOR_KEYS: Record<string, [string, string]> = {
  빨간색: ['Red', '#c8402f'], 파란색: ['Blue', '#3a64c8'], 초록색: ['Green', '#3f8f56'], 노란색: ['Yellow', '#e8c43a'],
  보라색: ['Purple', '#6b3f8a'], 주황색: ['Orange', '#e7843a'], 분홍색: ['Pink', '#e690b0'], 검은색: ['Black', '#1b1420'],
  흰색: ['White', '#ffffff'], 금색: ['Gold', '#c9a76a'], 은색: ['Silver', '#b9bcc4'], 청록색: ['Teal', '#2f8f8a'],
  자주색: ['Plum', '#8a2f6b'], 갈색: ['Brown', '#7a5236'], 회색: ['Gray', '#8a8790'],
};
const DIRECTION_KEYS: Record<string, string> = { 동: 'East', 서: 'West', 남: 'South', 북: 'North' };
const KEYWORD_KEYS: Record<string, string> = {
  '새로운 시작': 'A fresh start', 기회: 'Opportunity', 성장: 'Growth', 변화: 'Change', 희망: 'Hope', 성공: 'Success',
  행복: 'Happiness', 평화: 'Peace', 사랑: 'Love', 우정: 'Friendship', 도전: 'Challenge', 노력: 'Effort', 인내: 'Patience',
  지혜: 'Wisdom', 용기: 'Courage', 꿈: 'Dreams', 목표: 'Goals', 성취: 'Achievement', 만족: 'Contentment',
};
const FOOD_KEYS: Record<string, string> = {
  김치찌개: 'Kimchi stew', 된장찌개: 'Soybean paste stew', 불고기: 'Bulgogi', 비빔밥: 'Bibimbap', 냉면: 'Cold noodles',
  삼겹살: 'Grilled pork belly', 치킨: 'Fried chicken', 피자: 'Pizza', 파스타: 'Pasta', 스시: 'Sushi', 라면: 'Ramyeon',
  떡볶이: 'Tteokbokki', 순두부찌개: 'Soft tofu stew', 갈비: 'Galbi short ribs', 닭볶음탕: 'Spicy braised chicken',
  해물탕: 'Seafood stew', 보쌈: 'Bossam', 족발: 'Jokbal', 닭갈비: 'Dak-galbi', 곱창: 'Gopchang',
};

const RELATION_COPY: Record<Relation, [string, string]> = {
  same: ['Today feels familiar', 'Today shares your element. Your usual way of doing things fits the day — just don’t push it too far.'],
  feedsToday: ['Today asks you to give', 'Your {you} feeds today’s {today}. You may give more than you get — pace yourself and rest early.'],
  todayFeeds: ['Today is on your side', 'Today’s {today} feeds your {you}. A supportive day to ask for help or begin something small.'],
  youShape: ['Today, you set the pace', 'Your {you} keeps today’s {today} in check. Decisions come easier — make them gently.'],
  todayPresses: ['Today leans toward patience', 'Today’s {today} presses on your {you}. Go slower than usual and let big decisions wait if you can.'],
};

const LOCALES: Record<string, string> = { en: 'en-GB', ko: 'ko-KR', zh: 'zh-CN', ja: 'ja-JP', es: 'es-ES' };

const Orbs = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: start;
  gap: 4px;
  margin: 22px 0 18px;
  figure { margin: 0; display: grid; justify-items: center; gap: 4px; text-align: center; }
  .orb { width: 92px; height: 92px; border-radius: 50%; display: grid; place-items: center; margin-bottom: 8px;
    font: 500 40px/1 'Noto Serif KR', serif; color: #fff8ee;
    background: radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--c) 85%, white) 0%, color-mix(in srgb, var(--c) 55%, transparent) 46%, transparent 72%);
    box-shadow: 0 0 46px color-mix(in srgb, var(--c) 45%, transparent); }
  figcaption b { display: block; font: 600 14px/1.3 Inter, sans-serif; color: var(--st-ink); }
  figcaption small { font-size: 12px; color: var(--st-muted); }
  .meets { align-self: center; margin-top: -40px; display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--st-muted); }
  .meets::before, .meets::after { content: ''; width: 14px; height: 1px; background: var(--st-accent-line); }
`;

const Rows = styled.dl`
  margin: 0;
  border: 1px solid var(--st-line);
  border-radius: 16px;
  overflow: hidden;
  > div { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 12px; padding: 16px; }
  > div + div { border-top: 1px solid var(--st-line); }
  dt { font: 650 14px/1.4 Inter, sans-serif; color: var(--st-ink); }
  dd { margin: 0; font-size: 14px; line-height: 1.6; color: var(--st-muted); min-width: 0; }
`;

const Details = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  > div { background: var(--st-elevated); border-radius: 12px; padding: 12px 14px; min-width: 0; }
  > div.wide { grid-column: 1 / -1; }
  dt { font-size: 12px; color: var(--st-muted); margin-bottom: 4px; }
  dd { margin: 0; font: 600 15px/1.35 Inter, 'Noto Sans KR', sans-serif; color: var(--st-ink); display: flex; align-items: center; gap: 8px; overflow-wrap: anywhere; }
  .swatch { width: 14px; height: 14px; border-radius: 50%; border: 1px solid rgb(27 20 32 / 18%); flex: none; }
`;

const SectionHead = styled.h3`
  margin: 0 0 12px;
  font: 500 24px/1.2 'Cormorant Garamond', serif;
  color: var(--st-ink);
`;

const Reading = styled.div`
  p { margin: 0; font-size: 15px; line-height: 1.75; color: var(--st-ink); }
  .lang-note { margin-top: 10px; font-size: 12px; color: var(--st-faint); }
`;

const Carry = styled.div`
  background: var(--st-accent);
  border-radius: 16px;
  padding: 18px;
  .k { margin: 0 0 8px; font: 700 11px/1.4 Inter, sans-serif; letter-spacing: 1.2px; text-transform: uppercase; color: var(--st-action); }
  p:last-child { margin: 0; font-size: 15px; line-height: 1.7; color: var(--st-ink); }
`;

const ShareCard = styled.div`
  display: grid;
  grid-template-columns: 84px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  border: 1px solid var(--st-line);
  border-radius: 16px;
  padding: 14px;
  .thumb { aspect-ratio: 9 / 14; border-radius: 10px; background: linear-gradient(180deg, #130a1b, #3c1e48); color: #f4eee7;
    display: grid; align-content: center; justify-items: center; gap: 6px; padding: 8px; text-align: center; }
  .thumb small { font-size: 8px; letter-spacing: .8px; color: #c9a76a; text-transform: uppercase; }
  .thumb b { font: 500 20px/1 'Noto Serif KR', serif; }
  .thumb i { font: italic 500 11px/1.2 'Cormorant Garamond', serif; }
  h3 { margin: 0 0 4px; font: 650 15px/1.3 Inter, sans-serif; }
  p { margin: 0 0 8px; font-size: 13px; line-height: 1.5; color: var(--st-muted); }
  button { border: 0; background: none; padding: 0; min-height: 36px; color: var(--st-action); font: 650 14px/1.3 Inter, sans-serif; display: inline-flex; align-items: center; gap: 6px; cursor: pointer; }
  button svg { width: 17px; }
`;

const ErrorText = styled.p`margin: 8px 0 0; text-align: center; font-size: 13px; color: #b3261e;`;

export default function TodayFortune() {
  const navigate = useNavigate();
  const { t, language } = useI18n();
  const saved = useMemo(readSaved, []);
  const [fortune, setFortune] = useState<FortuneResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [userInput, setUserInput] = useState<UserInput>({
    name: saved?.name ?? '',
    birthDate: saved?.birthDate ?? '',
    birthTime: saved?.birthTime ?? '',
    nationality: '' // 더 이상 사용하지 않지만 호환성을 위해 유지
  });
  const [birthTimeUnknown, setBirthTimeUnknown] = useState(saved?.birthTimeUnknown ?? false);
  const [remember, setRemember] = useState(Boolean(saved));
  const [formError, setFormError] = useState('');

  useEffect(() => { window.scrollTo(0, 0); }, [showForm]);

  const handleInputChange = (field: keyof UserInput, value: string) => {
    setFormError('');
    setUserInput(prev => ({ ...prev, [field]: value }));
  };

  const handleGenerateFortune = async () => {
    // 입력 검증
    if (!userInput.name || !userInput.birthDate || (!userInput.birthTime && !birthTimeUnknown)) {
      setFormError(t('pleaseEnterAllInformation'));
      return;
    }
    writeSaved(remember ? { name: userInput.name, birthDate: userInput.birthDate, birthTime: userInput.birthTime, birthTimeUnknown } : null);

    setLoading(true);
    setShowForm(false);

    // 운세 생성 시뮬레이션 (2초 대기)
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 실제 운세 생성
    const fortuneResult = generateFortune(userInput);
    setFortune(fortuneResult);
    setLoading(false);
  };

  const handleBack = () => navigate('/');

  const handleShareFortune = () => {
    if (!fortune) return;

    const shareText = `🍀 ${t('todayFortune')}\n\n${fortune.overall}\n\n💕 ${t('loveFortune')}: ${fortune.love}\n💼 ${t('businessFortune')}: ${fortune.business}\n🏥 ${t('healthFortune')}: ${fortune.health}\n💰 ${t('wealthFortune')}: ${fortune.wealth}\n\n🍀 ${t('luckyColor')}: ${fortune.luckyColor}\n🔢 ${t('luckyNumber')}: ${fortune.luckyNumber}\n🧭 ${t('luckyDirection')}: ${fortune.luckyDirection}\n🎯 ${t('todayAction')}: ${fortune.luckyAction}\n🍽️ ${t('todayFood')}: ${fortune.food}\n🔑 ${t('todayKeyword')}: ${fortune.keyword}\n💡 ${t('todayAdvice')}: ${fortune.advice}\n\n#${t('todayFortune')} #SajuTeller #${t('fortune')}`;

    if (navigator.share) {
      // 네이티브 공유 기능 사용 (모바일)
      navigator.share({ title: t('todayFortune'), text: shareText, url: window.location.href }).catch(console.error);
    } else if (navigator.clipboard) {
      // 클립보드에 복사 (데스크톱)
      navigator.clipboard.writeText(shareText).then(() => {
        alert(t('fortuneCopiedToClipboard'));
      }).catch(() => handleFallbackShare(shareText));
    } else {
      handleFallbackShare(shareText);
    }
  };

  const handleFallbackShare = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      alert(t('fortuneCopiedToClipboard'));
    } catch {
      alert(t('cannotCopyFortune'));
    }
    document.body.removeChild(textArea);
  };

  // Element pairing: the birth day's heavenly stem against today's.
  const pairing = useMemo(() => {
    const [y, m, d] = userInput.birthDate.split('-').map(Number);
    if (!y || !m || !d) return null;
    const now = new Date();
    const you = dayStem(y, m, d);
    const today = dayStem(now.getFullYear(), now.getMonth() + 1, now.getDate());
    return { you, today, relation: relationOf(you.element, today.element) };
  }, [userInput.birthDate]);

  if (loading) return <LoadingScreen label="Reading today’s energy…"/>;

  if (showForm) {
    return (
      <div lang={language}>
        <Night className="st-night">
          <Starfield/>
          <PageBar title={t('Today’s fortune')} onBack={handleBack}/>
          <Kicker>{t('Free · 1 minute · no account')}</Kicker>
          <Display>{t('When were you born?')}</Display>
          <Lede>{t('Your birth date sets your element. Each day, we read how it meets the day’s energy.')}</Lede>
        </Night>

        <Body as="form" onSubmit={(e: FormEvent) => { e.preventDefault(); void handleGenerateFortune(); }} noValidate>
          <FieldBlock>
            <div className="head"><label htmlFor="name">{t('What should we call you?')}</label></div>
            <Boxed><span>{t('First name')}</span>
              <input id="name" type="text" autoComplete="given-name" value={userInput.name} onChange={(e) => handleInputChange('name', e.target.value)} placeholder={t('enterYourName')} required/>
            </Boxed>
          </FieldBlock>

          <FieldBlock>
            <div className="head"><label htmlFor="birthDate">{t('Birth date')}</label></div>
            <Boxed><span>{t('Date')}</span>
              <input id="birthDate" type="date" value={userInput.birthDate} max={new Date().toISOString().split('T')[0]} onChange={(e) => handleInputChange('birthDate', e.target.value)} required/>
            </Boxed>
            <p className="hint"><InformationCircleIcon/>{t('Use your solar (Gregorian) birth date.')}</p>
          </FieldBlock>

          <FieldBlock>
            <div className="head"><span>{t('Birth time')}</span><small>{t('Optional')}</small></div>
            <Segmented role="group" aria-label={t('Birth time')}>
              <button type="button" aria-pressed={!birthTimeUnknown} onClick={() => { setFormError(''); setBirthTimeUnknown(false); }}>{t('I know it')}</button>
              <button type="button" aria-pressed={birthTimeUnknown} onClick={() => { setFormError(''); setBirthTimeUnknown(true); handleInputChange('birthTime', ''); }}>{t('Not sure')}</button>
            </Segmented>
            {birthTimeUnknown
              ? <p className="hint"><InformationCircleIcon/>{t('Without a time, we read from your birth date alone. Today’s fortune still works.')}</p>
              : <Boxed><span>{t('Time')}</span>
                  <input id="birthTime" type="time" value={userInput.birthTime} onChange={(e) => handleInputChange('birthTime', e.target.value)}/>
                </Boxed>}
          </FieldBlock>

          <SwitchRow>
            <span><b>{t('Remember on this phone')}</b><small>{t('Come back tomorrow without typing it again')}</small></span>
            <input type="checkbox" checked={remember} onChange={(e) => { setRemember(e.target.checked); if (!e.target.checked) writeSaved(null); }}/>
            <span className="track" aria-hidden="true"/>
          </SwitchRow>
          <button type="submit" hidden aria-hidden="true" tabIndex={-1}/>
        </Body>

        <StickyAction>
          <Primary type="button" onClick={() => void handleGenerateFortune()}>{t('Show today’s fortune')}</Primary>
          {formError && <ErrorText role="alert">{formError}</ErrorText>}
        </StickyAction>
      </div>
    );
  }

  if (!fortune) {
    return (
      <div lang={language}>
        <Night className="st-night">
          <PageBar title={t('Today’s fortune')} onBack={handleBack}/>
          <Display>{t('cannotLoadFortune')}</Display>
          <Lede>{t('pleaseTryAgainLater')}</Lede>
        </Night>
        <Body><Primary type="button" onClick={() => window.location.reload()}>{t('Try again')}</Primary></Body>
      </div>
    );
  }

  const element = (name: ElementName) => t(name);
  const [headline, line] = pairing ? RELATION_COPY[pairing.relation] : ['', ''];
  const dateLabel = new Intl.DateTimeFormat(LOCALES[language] ?? 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date());
  const color = COLOR_KEYS[fortune.luckyColor];
  const vocab = (map: Record<string, string>, value: string) => (map[value] ? t(map[value]) : value);
  const generatedLang = language === 'ko' ? undefined : 'ko';

  return (
    <div lang={language}>
      <Night className="st-night">
        <Starfield/>
        <PageBar title={t('Today’s fortune')} onBack={handleBack}/>
        <Kicker>{dateLabel}</Kicker>
        <Display>{t(headline)}</Display>
        {pairing && <>
          <Orbs aria-label={`${t('You')}: ${element(pairing.you.element)} · ${t('Today')}: ${element(pairing.today.element)}`}>
            <figure>
              <span className="orb" style={{ ['--c' as string]: ELEMENT_COLOR[pairing.you.element] }} lang="zh-Hant" aria-hidden="true">{ELEMENT_HANJA[pairing.you.element]}</span>
              <figcaption><b>{t('You')}</b><small>{element(pairing.you.element)} · <span lang="zh-Hant">{pairing.you.stem}</span></small></figcaption>
            </figure>
            <span className="meets" aria-hidden="true">{t('meets')}</span>
            <figure>
              <span className="orb" style={{ ['--c' as string]: ELEMENT_COLOR[pairing.today.element] }} lang="zh-Hant" aria-hidden="true">{ELEMENT_HANJA[pairing.today.element]}</span>
              <figcaption><b>{t('Today')}</b><small>{element(pairing.today.element)} · <span lang="zh-Hant">{pairing.today.stem}</span></small></figcaption>
            </figure>
          </Orbs>
          <Lede>{t(line).replace('{you}', element(pairing.you.element)).replace('{today}', element(pairing.today.element))}</Lede>
        </>}
      </Night>

      <Body>
        <Reading>
          <SectionHead>{t('Today’s reading')}</SectionHead>
          <p lang={generatedLang}>{fortune.overall}</p>
          {generatedLang && <p className="lang-note">{t('The detailed reading is written in Korean for now.')}</p>}
        </Reading>

        <Rows>
          <div><dt>{t('Work')}</dt><dd lang={generatedLang}>{fortune.business}</dd></div>
          <div><dt>{t('Love')}</dt><dd lang={generatedLang}>{fortune.love}</dd></div>
          <div><dt>{t('Money')}</dt><dd lang={generatedLang}>{fortune.wealth}</dd></div>
          <div><dt>{t('Health')}</dt><dd lang={generatedLang}>{fortune.health}</dd></div>
        </Rows>

        <section>
          <SectionHead>{t('Today’s details')}</SectionHead>
          <Details>
            <div className="wide"><dt>{t('Word for the day')}</dt><dd>{vocab(KEYWORD_KEYS, fortune.keyword)}</dd></div>
            <div><dt>{t('Colour')}</dt><dd>{color && <span className="swatch" style={{ background: color[1] }}/>}{color ? t(color[0]) : fortune.luckyColor}</dd></div>
            <div><dt>{t('Number')}</dt><dd>{fortune.luckyNumber}</dd></div>
            <div><dt>{t('Direction')}</dt><dd>{vocab(DIRECTION_KEYS, fortune.luckyDirection)}</dd></div>
            <div><dt>{t('Food')}</dt><dd>{vocab(FOOD_KEYS, fortune.food)}</dd></div>
          </Details>
        </section>

        <Carry>
          <p className="k">{t('Something to carry')}</p>
          <p lang={generatedLang}>{fortune.advice}</p>
        </Carry>

        <ShareCard>
          <div className="thumb" aria-hidden="true">
            <small>{dateLabel}</small>
            {pairing && <b lang="zh-Hant">{ELEMENT_HANJA[pairing.you.element]}·{ELEMENT_HANJA[pairing.today.element]}</b>}
            <i>{t(headline)}</i>
          </div>
          <div>
            <h3>{t('Share today’s fortune')}</h3>
            <p>{t('Send it to yourself or a friend.')}</p>
            <button type="button" onClick={handleShareFortune}><ShareIcon/>{t('Share')}</button>
          </div>
        </ShareCard>

        <Disclaimer>{t('For reflection and fun — not advice.')}</Disclaimer>
        <Secondary type="button" onClick={() => setShowForm(true)}>{t('Change birth details')}</Secondary>
      </Body>

      <Upsell className="st-night">
        <Kicker>{t('Go deeper in person')}</Kicker>
        <h2>{t('That was one pillar.\nA master reads all four.')}</h2>
        <p>{t('Sit with a saju master in Seoul, with a live interpreter.')}</p>
        <div className="actions">
          <Link className="primary" to="/search">{t('Find a reading in Seoul')}</Link>
          <Link className="secondary" to="/couple">{t('Check couple compatibility — free')}</Link>
        </div>
      </Upsell>
    </div>
  );
}
