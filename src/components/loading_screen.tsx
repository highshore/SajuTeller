import { styled } from 'styled-components';
import AnimatedEmoji from './animated-emoji';
import { useI18n } from '../i18n/i18n';
const State = styled.div<{ $compact: boolean }>`
  width:100%;min-width:0;flex:1;min-height:${p=>p.$compact?'160px':'min(65dvh,560px)'};
  display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
  padding:32px 20px;text-align:center;color:var(--st-muted);background:var(--st-paper);
  p{font-size:13px;line-height:1.6;max-width:28ch;}
`;
/** Stays inside the shell so navigation remains usable while routes load. */
export default function LoadingScreen({label='Loading…',compact=false}:{label?:string;compact?:boolean}) {
  const {t}=useI18n();
  return <State $compact={compact} role="status" aria-live="polite" data-loading-screen>
    <AnimatedEmoji name="crystal-ball" size={compact?64:88} loop/><p>{t(label)}</p>
  </State>;
}
