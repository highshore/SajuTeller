import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, CheckIcon, EnvelopeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { supabase } from '../supabase';
import { safeReturn } from '../product/plans';
import { afterSignIn, authProviders, passwordError } from '../product/auth';
import AuthConsent from './auth-consent';
import { AuthPanel } from './auth-flow.styles';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';
type Confirmation = 'signup' | 'forgot' | 'updated' | null;
const KakaoMark = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#000" d="M12 4C6.98 4 3 7.16 3 11.05c0 2.5 1.66 4.7 4.17 5.95l-.85 3.1c-.07.27.23.48.46.33l3.7-2.45c.5.06 1 .1 1.52.1 5.02 0 9-3.16 9-7.03S17.02 4 12 4z"/></svg>;
const GoogleMark = () => <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.37z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.61-2.4l-3.22-2.51c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.75-5.59-4.11H3.08v2.58A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.94V7.48H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.52l3.33-2.58z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.92 5.48l3.33 2.58C7.2 7.7 9.4 5.95 12 5.95z"/></svg>;
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

  // Presentation only: a sign-in that comes from the request form gets the "sending" copy from Figma.
  const sending = /^\/business\/[^/]+\/(booking|payment)/.test(next);
  const brand = <Link className="brand" to="/" aria-label="SajuTeller home">SajuTeller</Link>;
  const legal = <div className="legal"><span>{t("By continuing you agree to our policies.")}</span><Link to="/terms">{t("Terms of Use")}</Link><Link to="/privacy">{t("Privacy Policy")}</Link></div>;
  const messages = <>{error && <p className="notice" role="alert">{t(error)}</p>}{notice && <p className="notice" role="status">{t(notice)}</p>}</>;
  if (confirmation) return <AuthPanel aria-busy={busy} data-auth-view="confirmation">
    {brand}
    <div className="security">
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
      <h1>{sending ? t("Sign in to send your request") : initialMode === 'signup' ? t("Create your account") : t("Sign in to SajuTeller")}</h1>
      <p>{sending ? t("So the studio can reply to you. Browsing and saving never need an account.") : t("Sign up or sign in to begin your Saju journey.")}</p>
    </div>
    <div className="providers">
      {!providers && !error && <p className="notice" role="status">{t("Loading sign-in options…")}</p>}
      {providers?.kakao && <button className="provider kakao" disabled={busy} onClick={() => void oauth('kakao')}><KakaoMark/><span>{t("Continue with Kakao")}</span></button>}
      {providers?.email && <button className="provider" disabled={busy} onClick={() => setMethods(false)}><EnvelopeIcon/><span>{t("Continue with email")}</span></button>}
      {providers?.google && <button className="provider" disabled={busy} onClick={() => void oauth('google')}><GoogleMark/><span>{t("Continue with Google")}</span></button>}
      {!providers && error && <button className="provider" onClick={() => { setError(''); setAttempt(value => value + 1); }}><span aria-hidden="true">↻</span><span>{t("Retry sign-in options")}</span></button>}
      {providers && !providers.email && !providers.google && !providers.kakao && <p className="notice" role="status">{t("Sign-in is temporarily unavailable. Please try again later.")}</p>}
    </div>{messages}
    {sending && providers && <p className="reassure"><CheckIcon/>{t("After you sign in, you’ll come straight back to your request to send it.")}</p>}
    {legal}
  </AuthPanel>;

  const heading = mode === 'signup' ? t("Create your account") : mode === 'forgot' ? t("Forgot your password?") : mode === 'reset' ? t("Choose a new password") : t("Welcome back");
  const intro = mode === 'signup' ? t("Create an account to begin your Saju journey.") : mode === 'forgot' ? t("We’ll email you a link to reset it.") : mode === 'reset' ? t("Choose a strong password for your account.") : t("Sign in to your SajuTeller account.");
  return <AuthPanel aria-busy={busy} data-auth-view={mode}>
    {consentOpen && <AuthConsent busy={busy} onAccept={() => void authenticate()} onCancel={() => setConsentOpen(false)}/>}
    {mode !== 'reset' && <div className="topline"><button className="back" disabled={busy} onClick={allMethods}><ArrowLeftIcon/>{t("All sign-in options")}</button></div>}
    {brand}
    <div className="heading"><h1>{heading}</h1><p>{intro}</p></div>
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
