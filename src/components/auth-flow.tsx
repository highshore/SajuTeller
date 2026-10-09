import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabase';
import { safeReturn } from '../product/plans';
import { afterSignIn, authProviders, passwordError } from '../product/auth';
import AnimatedEmoji, { type EmojiName } from './animated-emoji';
import AuthConsent from './auth-consent';
import { AuthPanel } from './auth-flow.styles';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';
type Confirmation = 'signup' | 'forgot' | 'updated' | null;
function maskEmail(value: string) {
  const [local, domain] = value.split('@');
  return domain ? `${local.slice(0, 2)}•••@${domain}` : value;
}

export default function AuthFlow({ initialMode = 'signin' }: { initialMode?: 'signin' | 'signup' | 'reset' }) {const { t } = useI18n();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const next = safeReturn(params.get('next'));
  const [mode, setMode] = useState<Mode>(initialMode);
  const [methods, setMethods] = useState(initialMode !== 'reset');
  const [providers, setProviders] = useState<Record<string, boolean> | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [consentOpen, setConsentOpen] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const resendDeadline = useRef(0);
  const passwordInput = useRef<HTMLInputElement>(null);
  const confirmInput = useRef<HTMLInputElement>(null);
  const newPassword = mode === 'signup' || mode === 'reset';
  const invalidPassword = newPassword && password.length > 0 ? passwordError(password) : '';
  const mismatch = newPassword && confirm.length > 0 && password !== confirm;
  const passwordsReady = password.length > 0 && !passwordError(password) && password === confirm;
  const callback = (destination = next) => `${window.location.origin}/auth-callback?next=${encodeURIComponent(destination)}`;

  useEffect(() => {
    if (initialMode === 'reset') return;
    const controller = new AbortController();
    authProviders(controller.signal).then(setProviders).catch(() => {
      if (!controller.signal.aborted) setError('Sign-in options could not be loaded. Please try again.');
    });
    return () => controller.abort();
  }, [attempt, initialMode]);
  useEffect(() => {
    if (!cooldown) return;
    const timer = window.setTimeout(() => setCooldown(Math.max(0, Math.ceil((resendDeadline.current - Date.now()) / 1000))), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);

  function startCooldown() {
    resendDeadline.current = Date.now() + 60_000;
    setCooldown(60);
  }
  function switchMode(value: Mode) {
    setMode(value); setMethods(false); setError(''); setNotice('');
    setConfirmation(null); setConsentOpen(false); setPassword(''); setConfirm(''); setShow(false);
  }
  function allMethods() {
    switchMode('signin'); setMethods(true);
  }
  function showError(value: unknown) {
    const authError = value as { code?: string };
    if (authError.code === 'email_not_confirmed') {
      setConfirmation('signup'); setPassword(''); setConfirm('');
    } else if (authError.code === 'invalid_credentials') {
      setError('Your email or password is incorrect. Please try again.');
    } else if (authError.code === 'over_request_rate_limit' || authError.code === 'over_email_send_rate_limit') {
      setError('Too many attempts. Please wait a moment and try again.');
    } else {
      setError('We couldn’t complete your request. Please try again.');
    }
  }
  async function oauth(provider: 'google' | 'kakao') {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const { error } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: callback(), ...(provider === 'kakao' ? { queryParams: { scope: 'profile_nickname profile_image' } } : {}) } });
      if (error) throw error;
    } catch (value) { showError(value); } finally { setBusy(false); }
  }
  async function authenticate() {
    if (busy) return;
    setBusy(true); setError(''); setNotice('');
    try {
      if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback('/reset-password') });
        if (error) throw error;
        setConfirmation('forgot'); startCooldown();
      } else if (mode === 'reset') {
        const { error } = await supabase.auth.updateUser({ password });
        if (error) throw error;
        setConfirmation('updated'); setPassword(''); setConfirm('');
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo: callback() } });
        if (error) throw error;
        if (data.session) navigate(await afterSignIn(next), { replace: true });
        else { setConfirmation('signup'); startCooldown(); setPassword(''); setConfirm(''); }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        navigate(await afterSignIn(next), { replace: true });
      }
    } catch (value) { showError(value); }
    finally { setConsentOpen(false); setBusy(false); }
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || (mode !== 'reset' && !providers?.email)) return;
    setError(''); setNotice('');
    if (newPassword) {
      if (passwordError(password)) { setError(passwordError(password)); passwordInput.current?.focus(); return; }
      if (password !== confirm) { setError('Passwords do not match.'); confirmInput.current?.focus(); return; }
    }
    if (mode === 'signup') { setConsentOpen(true); return; }
    await authenticate();
  }
  async function resend() {
    if (busy || cooldown || !confirmation || confirmation === 'updated') return;
    setBusy(true); setError(''); setNotice('');
    try {
      const { error } = confirmation === 'signup'
        ? await supabase.auth.resend({ type: 'signup', email: email.trim(), options: { emailRedirectTo: callback() } })
        : await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: callback('/reset-password') });
      if (error) throw error;
      startCooldown();
      setNotice('If this email is eligible, a new link will arrive shortly. Check your inbox and spam folder.');
    } catch (value) { showError(value); } finally { setBusy(false); }
  }

  const brand = <Link className="brand" to="/" aria-label="SajuTeller home">SAJUTELLER</Link>;
  const legal = <div className="legal"><Link to="/terms">{t("Terms of Use")}</Link><span aria-hidden="true">|</span><Link to="/privacy">{t("Privacy Policy")}</Link></div>;
  const messages = <>{error && <p className="notice" role="alert">{t(error)}</p>}{notice && <p className="notice" role="status">{t(notice)}</p>}</>;
  if (confirmation) return <AuthPanel aria-busy={busy} data-auth-view="confirmation">
    {brand}
    <div className="security">
      <AnimatedEmoji key={confirmation} name={confirmation === 'updated' ? 'sparkles' : 'love-letter'} size={80}/>
      <h1>{confirmation === 'updated' ? t("Password updated") : t("Check your email")}</h1>
      {confirmation === 'updated' ? <p>{t("Your new password is ready. You can continue to your account.")}</p> : <>
        <p><strong>{maskEmail(email.trim())}</strong></p>
        <p>{confirmation === 'signup' ? t("If this email needs confirmation, you’ll receive a link to finish creating your account.") : t("If an account exists for this email, you’ll receive a link to reset your password.")}</p>
        <p>{confirmation === 'signup' ? t("Already registered? Sign in or reset your password. A confirmed account won’t receive another signup email.") : t("Open the link in your email to choose a new password. Check your spam folder too.")}</p>
      </>}
      {messages}
      {confirmation === 'updated' ? <Link className="primary" to="/profile">{t("Continue to your profile")}</Link> : <>
        <button className="primary" disabled={busy || cooldown > 0} onClick={() => void resend()}>{cooldown ? t('Resend in {seconds}s').replace('{seconds}', String(cooldown)) : t("Resend email")}</button>
        <div className="security-actions">
          <button className="text-button" disabled={busy} onClick={() => switchMode(confirmation === 'signup' ? 'signup' : 'forgot')}>{t("Change email address")}</button>
          <button className="text-button" disabled={busy} onClick={() => switchMode('signin')}>{t("Back to sign in")}</button>
          {confirmation === 'signup' && <button className="text-button" disabled={busy} onClick={() => switchMode('forgot')}>{t("Reset password instead")}</button>}
        </div>
      </>}
    </div>{legal}
  </AuthPanel>;

  if (methods) return <AuthPanel aria-busy={busy} data-auth-view="methods">
    {brand}
    <div className="method-heading">
      <AnimatedEmoji name="crystal-ball" size={88}/>
      <h1 className="sr-only">{t("Sign in to SajuTeller")}</h1>
      <p>{t("Sign up or sign in to begin your Saju journey.")}</p>
    </div>
    <div className="providers">
      {!providers && !error && <p className="notice" role="status">{t("Loading sign-in options…")}</p>}
      {providers?.email && <button className="provider" disabled={busy} onClick={() => setMethods(false)}><EnvelopeIcon/><span>{t("Continue with email")}</span></button>}
      {providers?.kakao && <button className="provider" disabled={busy} onClick={() => void oauth('kakao')}><ChatBubbleOvalLeftIcon/><span>{t("Continue with Kakao")}</span></button>}
      {providers?.google && <button className="provider" disabled={busy} onClick={() => void oauth('google')}><span aria-hidden="true">G</span><span>{t("Continue with Google")}</span></button>}
      {!providers && error && <button className="provider" onClick={() => { setError(''); setAttempt(value => value + 1); }}><span aria-hidden="true">↻</span><span>{t("Retry sign-in options")}</span></button>}
      {providers && !providers.email && !providers.google && !providers.kakao && <p className="notice" role="status">{t("Sign-in is temporarily unavailable. Please try again later.")}</p>}
    </div>{messages}{legal}
  </AuthPanel>;

  const heading = mode === 'signup' ? t("Create your account") : mode === 'forgot' ? t("Forgot your password?") : mode === 'reset' ? t("Choose a new password") : t("Welcome back");
  const intro = mode === 'signup' ? t("Create an account to begin your Saju journey.") : mode === 'forgot' ? t("We’ll email you a link to reset it.") : mode === 'reset' ? t("Choose a strong password for your account.") : t("Sign in to your SajuTeller account.");
  const symbol: EmojiName = mode === 'signup' ? 'sparkles' : mode === 'forgot' || mode === 'reset' ? 'locked' : 'waving-hand';
  return <AuthPanel aria-busy={busy} data-auth-view={mode}>
    {consentOpen && <AuthConsent busy={busy} onAccept={() => void authenticate()} onCancel={() => setConsentOpen(false)}/>}
    {mode !== 'reset' && <div className="topline"><button className="back" disabled={busy} onClick={allMethods}><ArrowLeftIcon/>{t("All sign-in options")}</button></div>}
    {brand}
    <div className="heading"><AnimatedEmoji key={symbol} name={symbol} size={64}/><h1>{heading}</h1><p>{intro}</p></div>
    <form onSubmit={submit}><fieldset disabled={busy || (mode !== 'reset' && !providers?.email)}>
      {mode !== 'reset' && <label>{t("Email address")}<input name="email" type="email" autoComplete="email" autoCapitalize="none" spellCheck={false} required maxLength={254} value={email} onChange={event => { setEmail(event.target.value); setError(''); }} placeholder={t("you@example.com")}/></label>}
      {mode !== 'forgot' && <label>{t("Password")}<div className="password">
        <input ref={passwordInput} aria-label={t("Password")} aria-invalid={!!invalidPassword} aria-describedby={newPassword ? 'password-feedback' : undefined} name="password" type={show ? 'text' : 'password'} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required maxLength={72} value={password} onChange={event => { setPassword(event.target.value); setError(''); }} placeholder={newPassword ? t("At least 10 characters") : t("Enter your password")}/>
        <button type="button" aria-label={show ? t("Hide password") : t("Show password")} aria-pressed={show} onClick={() => setShow(value => !value)}>{show ? <EyeSlashIcon/> : <EyeIcon/>}</button>
      </div>{newPassword && <small id="password-feedback" role="status" className={invalidPassword ? 'field-error' : password ? 'field-success' : ''}>{(invalidPassword && t(invalidPassword)) || (password ? t("✓ Meets requirements") : t("Use 10–72 characters."))}</small>}</label>}
      {newPassword && <label>{t("Confirm password")}<input ref={confirmInput} aria-label={t("Confirm password")} aria-invalid={mismatch} aria-describedby="confirm-feedback" name="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" required maxLength={72} value={confirm} onChange={event => { setConfirm(event.target.value); setError(''); }} placeholder={t("Re-enter your password")}/><small id="confirm-feedback" role="status" className={mismatch ? 'field-error' : passwordsReady ? 'field-success' : ''}>{mismatch ? t("Passwords do not match.") : passwordsReady ? t("✓ Passwords match") : t("Re-enter your password.")}</small></label>}
      {mode === 'signin' && <button className="forgot" type="button" onClick={() => switchMode('forgot')}>{t("Forgot password?")}</button>}
      {messages}
      <button className="primary" type="submit" disabled={newPassword && !passwordsReady}>{busy ? t("Please wait…") : mode === 'signup' ? t("Create account") : mode === 'forgot' ? t("Send reset link") : mode === 'reset' ? t("Update password") : t("Sign in")}</button>
    </fieldset></form>
    {(mode === 'signin' || mode === 'signup') && <p className="switch">{mode === 'signup' ? t("Already have an account?") : t("Don’t have an account?")}{' '}<button disabled={busy} onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? t("Log in") : t("Sign up")}</button></p>}
    {mode === 'forgot' && <button className="text-button center" disabled={busy} onClick={() => switchMode('signin')}>{t("Back to sign in")}</button>}
    {legal}
  </AuthPanel>;
}
