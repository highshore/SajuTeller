import { useState } from "react";
import { Link } from "react-router-dom";
import { styled } from "styled-components";
import AppleLogo from "../assets/apple_btn.png";
import KakaoLogo from "../assets/kakao_btn.png";
import { useI18n } from "../i18n/i18n";

const MOBILE_BP = '768px';

export const Page = styled.div`
  min-height: 100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding:56px 20px;
  background:#0f0026;
  position:relative;
  overflow:hidden;
  &::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(139,92,246,.20),transparent 30%),radial-gradient(circle at 85% 80%,rgba(98,16,204,.18),transparent 34%);pointer-events:none;}
  @media(max-width:${MOBILE_BP}){padding:28px 12px 84px;min-height:100dvh;}
`;

export const Card = styled.div`
  width:100%;max-width:512px;background:#fffdf8;color:#1f2937;border-radius:24px;border:1px solid #e8e0d5;padding:44px 48px;box-shadow:0 30px 80px rgba(0,0,0,.32);position:relative;z-index:1;
  @media(max-width:${MOBILE_BP}){padding:30px 22px;border-radius:20px;}
`;

export const Logo = styled.div`display:flex;align-items:center;justify-content:center;margin-bottom:20px;`;
const LogoLink = styled(Link)`display:flex;justify-content:center;align-items:baseline;gap:10px;margin:0 auto 26px;color:#0f0026;`;
export function LogoImage(){return <LogoLink to="/"><span style={{fontFamily:'Cinzel,serif',fontSize:24,fontWeight:700,letterSpacing:'1px'}}>K-SAJU</span><span style={{fontFamily:'Song Myung,serif',fontSize:20,color:'#6210cc'}}>사주</span></LogoLink>;}

export const Wrapper = styled.div`display:flex;flex-direction:column;gap:20px;width:100%;`;
export const Title = styled.h1`font-family:'Cormorant Garamond','Noto Serif KR',serif;font-size:34px;font-weight:700;text-align:center;margin:0;color:#1f2937;`;
export const Form = styled.form`display:flex;flex-direction:column;gap:12px;`;
export const Input = styled.input`
  width:100%;height:50px;border-radius:14px;border:1px solid #d8d0c5;background:#fff;color:#1f2937;padding:0 16px;font-size:15px;outline:none;transition:.16s ease;
  &:focus{border-color:#6210cc;box-shadow:0 0 0 3px rgba(98,16,204,.10);}
  &::placeholder{color:#9ca3af;}
  &[type='submit']{margin-top:10px;background:#6210cc;color:white;border-color:#6210cc;font-weight:750;cursor:pointer;}
  &[type='submit']:hover{background:#5410ad;}
`;
export const Error = styled.span`color:#b91c1c;text-align:center;font-size:13px;line-height:1.5;`;
export const Switcher = styled.div`text-align:center;font-size:13px;color:#6b7280;margin-top:4px;a{color:#6210cc;font-weight:700;}`;
export const Divider = styled.div`
  display:flex;align-items:center;gap:12px;color:#8b7355;font-size:11px;font-weight:800;letter-spacing:.6px;text-transform:uppercase;margin:4px 0;
  &::before,&::after{content:'';height:1px;flex:1;background:#e8e0d5;}
`;
export const SocialRow = styled.div`display:flex;flex-direction:column;gap:10px;`;
export const SocialButton = styled.button`
  height:46px;width:100%;border-radius:14px;border:1px solid #d8d0c5;background:#fff;color:#1f2937;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:650;cursor:pointer;
  &:hover{background:#f8f6f0;}
`;
export const Icon = styled.span`width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;img,svg{max-width:100%;max-height:100%;object-fit:contain;}`;
export const Label = styled.span``;

const LangWrap = styled.div`position:absolute;right:24px;bottom:24px;z-index:5;@media(max-width:${MOBILE_BP}){right:14px;bottom:14px;}`;
const LangButton = styled.button`height:40px;padding:0 14px;border-radius:999px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.08);color:#fff;display:flex;align-items:center;gap:8px;cursor:pointer;`;
const LangMenu = styled.div`position:absolute;right:0;bottom:48px;width:190px;padding:8px;border-radius:16px;background:#fffdf8;border:1px solid #e8e0d5;box-shadow:0 20px 50px rgba(0,0,0,.25);`;
const LangOption = styled.button<{ $active?: boolean }>`width:100%;border:0;border-radius:10px;background:${p=>p.$active?'#f1e8fb':'transparent'};padding:10px 12px;display:flex;gap:10px;align-items:center;cursor:pointer;text-align:left;&:hover{background:#f8f6f0;}`;

export function LanguageSelector(){
  const { language, setLanguage } = useI18n();
  const [open,setOpen] = useState(false);
  const langs=[['en','English','🇺🇸'],['ko','한국어','🇰🇷'],['zh','中文','🇨🇳'],['ja','日本語','🇯🇵'],['es','Español','🇪🇸']] as const;
  const current=langs.find(l=>l[0]===language)??langs[0];
  return <LangWrap><LangButton onClick={()=>setOpen(v=>!v)}><span>{current[2]}</span><span>{current[0].toUpperCase()}</span></LangButton>{open&&<LangMenu>{langs.map(l=><LangOption key={l[0]} $active={language===l[0]} onClick={()=>{setLanguage(l[0] as any);setOpen(false);}}><span>{l[2]}</span><span>{l[1]}</span></LangOption>)}</LangMenu>}</LangWrap>;
}

export function GoogleButton({onClick}:{onClick?:()=>void}){return <SocialButton type="button" onClick={onClick}><Icon><svg viewBox="0 0 24 24"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.06H12v3.9h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.89-1.74 2.99-4.3 2.99-7.37z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.61-2.4l-3.22-2.51c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.75-5.59-4.11H3.08v2.58A10 10 0 0 0 12 22z"/><path fill="#FBBC05" d="M6.41 13.94A6 6 0 0 1 6.1 12c0-.67.11-1.32.31-1.94V7.48H3.08A10 10 0 0 0 2 12c0 1.61.39 3.13 1.08 4.52l3.33-2.58z"/><path fill="#EA4335" d="M12 5.95c1.47 0 2.79.51 3.83 1.51l2.87-2.87A9.63 9.63 0 0 0 12 2a10 10 0 0 0-8.92 5.48l3.33 2.58C7.2 7.7 9.4 5.95 12 5.95z"/></svg></Icon><Label>Continue with Google</Label></SocialButton>}
export function AppleButton({onClick}:{onClick?:()=>void}){return <SocialButton type="button" onClick={onClick}><Icon><img src={AppleLogo} alt=""/></Icon><Label>Continue with Apple</Label></SocialButton>}
export function KakaoButton({onClick}:{onClick?:()=>void}){return <SocialButton type="button" onClick={onClick}><Icon><img src={KakaoLogo} alt=""/></Icon><Label>Continue with Kakao</Label></SocialButton>}
