import LoadingScreen from '../components/loading_screen';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { styled } from 'styled-components';
import { ArrowPathIcon, CameraIcon, CheckIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { useI18n } from '../i18n/i18n';
import { Body, Disclaimer, Display, Kicker, Lede, Night, PageBar, Primary, Secondary, Starfield, StickyAction } from '../components/readings/shared';
import { preparePhoto, readFace, type FaceReading, type FaceReadingError } from '../services/face-reading';

// AI face reading (관상). REQ-09: photo shrunk on the device, read once by the server, never stored.
const ZONE_INFO = { upper: ['上停', 'Upper face', 'Forehead · early years'], middle: ['中停', 'Middle face', 'Brows to nose · mid-life'], lower: ['下停', 'Lower face', 'Mouth to chin · later years'] } as const;
const FEATURE_INFO = { forehead: ['額', 'Forehead'], eyebrows: ['眉', 'Eyebrows'], eyes: ['眼', 'Eyes'], nose: ['鼻', 'Nose'], mouth: ['口', 'Mouth'] } as const;
const ERRORS: Record<FaceReadingError, string> = {
  no_face: 'We couldn’t find one clear face. Try a front-facing photo in good light, with only you in it.',
  invalid_image: 'That file couldn’t be read as a photo. Try a JPEG or PNG.',
  unavailable: 'Face reading is unavailable right now. Please try again in a moment.',
};

const Picker = styled.label`
  position: relative;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 10px;
  min-height: 260px;
  border: 1.5px dashed var(--st-accent-line);
  border-radius: 20px;
  background: var(--st-elevated);
  color: var(--st-muted);
  text-align: center;
  cursor: pointer;
  overflow: hidden;
  input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
  svg { width: 34px; color: var(--st-brand); }
  b { display: block; font-size: 16px; color: var(--st-ink); }
  small { font-size: 13px; }
  img { width: 100%; height: 300px; object-fit: cover; }
  &:focus-within { outline: 2px solid var(--st-action); outline-offset: 3px; }
`;
const Tips = styled.ul`
  list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; font-size: 14px; color: var(--st-muted);
  li { display: grid; grid-template-columns: 18px 1fr; gap: 10px; align-items: start; }
  svg { width: 18px; color: var(--st-success); margin-top: 1px; }
`;
const Consent = styled.label`
  display: grid; grid-template-columns: 22px 1fr; gap: 12px; align-items: start; padding: 14px; border-radius: 14px; background: var(--st-accent); font-size: 14px; line-height: 1.5; color: var(--st-ink); cursor: pointer;
  input { width: 20px; height: 20px; margin: 1px 0 0; accent-color: var(--st-action); }
`;
const Section = styled.section`
  display: grid; gap: 12px;
  h3 { margin: 0; font: 600 13px/1.4 Inter, sans-serif; letter-spacing: 1px; text-transform: uppercase; color: var(--st-brand); }
`;
const Zone = styled.article`
  display: grid; grid-template-columns: 52px 1fr; gap: 14px; align-items: start; padding: 16px; border-radius: 16px; border: 1px solid var(--st-line); background: var(--st-surface);
  .hanja { width: 52px; height: 52px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(180deg, #2a1534, #4b2d5a); color: #e9cf98; font: 600 18px 'Noto Serif KR', serif; }
  b { display: block; font-size: 15px; } small { display: block; font-size: 12px; color: var(--st-faint); margin-bottom: 6px; }
  p { margin: 0; font-size: 14px; line-height: 1.55; color: var(--st-muted); }
`;
const Feature = styled.div`
  display: grid; grid-template-columns: 34px 1fr; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--st-line);
  &:last-child { border-bottom: 0; }
  .hanja { font: 600 20px/34px 'Noto Serif KR', serif; color: var(--st-gold); text-align: center; }
  b { font-size: 14px; } p { margin: 2px 0 0; font-size: 14px; line-height: 1.5; color: var(--st-muted); }
`;
const Portrait = styled.img`width: 96px; height: 96px; border-radius: 50%; object-fit: cover; border: 2px solid #c9a76a; box-shadow: 0 0 30px rgb(201 167 106 / 40%); margin: 4px 0 16px;`;
const Advice = styled.div`padding: 16px; border-radius: 16px; background: var(--st-accent); font-size: 15px; line-height: 1.6; color: var(--st-ink); b { display: block; font-size: 13px; color: var(--st-brand); margin-bottom: 4px; }`;
const ErrorText = styled.p`margin: 0; font-size: 14px; line-height: 1.5; color: #b42318;`;

export default function FaceReadingPage() {
  const { t, language } = useI18n();
  const navigate = useNavigate();
  const [photo, setPhoto] = useState<string | null>(null);   // small JPEG, memory only
  const [preview, setPreview] = useState<string | null>(null); // object URL for the thumbnail
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [reading, setReading] = useState<FaceReading | null>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  async function choose(file: File | undefined) {
    setError('');
    if (!file) return;
    try {
      setPhoto(await preparePhoto(file));
      setPreview(URL.createObjectURL(file));
    } catch {
      setError(ERRORS.invalid_image);
    }
  }
  async function submit() {
    if (!photo || !consent || loading) return;
    setLoading(true); setError('');
    try {
      setReading(await readFace(photo, language));
      setPhoto(null); // the photo is not kept once it has been read
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(ERRORS[(err instanceof Error ? err.message : 'unavailable') as FaceReadingError] ?? ERRORS.unavailable);
    } finally {
      setLoading(false);
    }
  }
  function restart() {
    setReading(null); setPhoto(null); setPreview(null); setConsent(false); setError('');
    if (input.current) input.current.value = '';
    window.scrollTo({ top: 0 });
  }

  if (loading) return <LoadingScreen label="Reading your face…"/>;

  if (reading) return <div lang={language}>
    <Night className="st-night">
      <Starfield/>
      <PageBar title={t('AI face reading')} onBack={restart}/>
      {preview && <Portrait src={preview} alt={t('Your photo (stays on this device)')}/>}
      <Kicker>{t('Your gwansang')} · <span lang="ko">관상</span></Kicker>
      <Display>{t('What your face says')}</Display>
      <Lede>{reading.summary}</Lede>
    </Night>
    <Body>
      <Section aria-labelledby="zones-title">
        <h3 id="zones-title">{t('Three zones')}</h3>
        {reading.zones.map(z => { const [hanja, name, sub] = ZONE_INFO[z.zone]; return <Zone key={z.zone}>
          <span className="hanja" lang="zh-Hant" aria-hidden="true">{hanja}</span>
          <div><b>{t(name)}</b><small>{t(sub)}</small><p>{z.reading}</p></div>
        </Zone>; })}
      </Section>
      <Section aria-labelledby="features-title">
        <h3 id="features-title">{t('Five features')}</h3>
        <div>{reading.features.map(f => { const [hanja, name] = FEATURE_INFO[f.feature]; return <Feature key={f.feature}>
          <span className="hanja" lang="zh-Hant" aria-hidden="true">{hanja}</span>
          <div><b>{t(name)}</b><p>{f.reading}</p></div>
        </Feature>; })}</div>
      </Section>
      <Advice><b>{t('A thought to keep')}</b>{reading.advice}</Advice>
      <Disclaimer>{t('Gwansang is a Korean cultural tradition. This AI reading is for fun and reflection, not advice. Your photo was not saved.')}</Disclaimer>
      <div style={{ display: 'grid', gap: 10 }}>
        <Primary as={Link} to="/experiences?topic=face_reading">{t('Get a face reading from a master in Seoul')}</Primary>
        <Secondary type="button" onClick={restart}><ArrowPathIcon/>{t('Try another photo')}</Secondary>
      </div>
    </Body>
  </div>;

  return <div lang={language}>
    <Night className="st-night">
      <Starfield/>
      <PageBar title={t('AI face reading')} onBack={() => navigate(-1)}/>
      <Kicker>{t('Free · 1 minute · photo never saved')}</Kicker>
      <Display>{t('Your face,\nread by AI')}</Display>
      <Lede>{t('Gwansang (관상) reads a face in three zones and five features. Take a selfie in good light, looking straight at the camera.')}</Lede>
    </Night>
    <Body>
      <Picker>
        <input ref={input} type="file" accept="image/*" capture="user" aria-label={t('Take or choose a photo')} onChange={e => void choose(e.target.files?.[0])}/>
        {preview ? <img src={preview} alt={t('Your photo (stays on this device)')}/> : <>
          <CameraIcon aria-hidden="true"/>
          <span><b>{t('Take or choose a photo')}</b><small>{t('A clear, front-facing selfie works best')}</small></span>
        </>}
      </Picker>
      {preview && <Secondary type="button" onClick={() => input.current?.click()}><ArrowPathIcon/>{t('Choose another photo')}</Secondary>}
      <Tips>
        <li><CheckIcon aria-hidden="true"/>{t('Only you in the photo, facing the camera')}</li>
        <li><CheckIcon aria-hidden="true"/>{t('Good light, no sunglasses or mask')}</li>
      </Tips>
      <Consent>
        <input type="checkbox" checked={consent} onChange={e => setConsent(e.target.checked)}/>
        <span>{t('Send my photo to OpenAI to create this reading. It is used once and not saved by SajuTeller.')}</span>
      </Consent>
      <Disclaimer><LockClosedIcon style={{ width: 14, verticalAlign: '-2px', marginRight: 4 }} aria-hidden="true"/>{t('Gwansang is a Korean cultural tradition. This AI reading is for fun and reflection, not advice. It never comments on looks, age or ethnicity.')}</Disclaimer>
      {error && <ErrorText role="alert">{t(error)}</ErrorText>}
    </Body>
    <StickyAction>
      <Primary type="button" disabled={!photo || !consent} onClick={() => void submit()}>{t('Read my face')}</Primary>
      <p>{t(!photo ? 'Add a photo to begin' : !consent ? 'Tick the box above to continue' : 'Takes about 10 seconds')}</p>
    </StickyAction>
  </div>;
}
