import { useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { styled } from 'styled-components';
import AnimatedEmoji from './animated-emoji';
import { useI18n } from '../i18n/i18n';
const Overlay=styled.div`
  position:fixed;inset:0;z-index:2000;display:grid;place-items:center;
  background:rgb(11 6 16 / 94%);backdrop-filter:blur(3px);
  .label{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
`;
let overlays=0;let previousOverflow='';let previousInert=false;
/** A portal escapes the app container, matching Roundy's viewport loading layer. */
export default function LoadingScreen({label='Loading…'}:{label?:string;compact?:boolean}) {
  const {t}=useI18n();
  useLayoutEffect(()=>{
    const root=document.getElementById('root');
    if(overlays++===0){previousOverflow=document.body.style.overflow;previousInert=root?.inert||false;document.body.style.overflow='hidden';if(root)root.inert=true;}
    return()=>{if(--overlays===0){document.body.style.overflow=previousOverflow;if(root)root.inert=previousInert;}};
  },[]);
  return createPortal(<Overlay role="status" aria-live="polite" aria-label={t(label)} data-loading-screen>
    <AnimatedEmoji name="crystal-ball" size={64} loop/><span className="label">{t(label)}</span>
  </Overlay>,document.body);
}
