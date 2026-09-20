import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Card, Divider, Error as ErrorText, Form, Input, LogoImage, Page, Switcher, Wrapper, GoogleButton, KakaoButton, LanguageSelector, Title } from "../components/auth_components";
import { useI18n } from "../i18n/i18n";
import { safeReturn } from "../product/plans";
import { supabase } from "../supabase";

export function Login(){
 const [params]=useSearchParams();const destination=safeReturn(params.get("next"));
 const {t}=useI18n();const navigate=useNavigate();const [isLoading,setLoading]=useState(false);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [error,setError]=useState('');
 const onGoogle=async()=>{localStorage.setItem('returnUrl',destination);const {error}=await supabase.auth.signInWithOAuth({provider:'google'});if(error)setError(error.message);};
 const onKakao=async()=>{localStorage.setItem('returnUrl',destination);const {error}=await supabase.auth.signInWithOAuth({provider:'kakao'});if(error)setError(error.message);};
 const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setError('');if(isLoading||!email||!password)return;try{setLoading(true);const {error}=await supabase.auth.signInWithPassword({email,password});if(error)setError(error.message);else navigate(destination);}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setLoading(false);}};
 return <Page><LanguageSelector/><Card><LogoImage/><Wrapper><div style={{textAlign:'center'}}><Title>Welcome to SajuTeller</Title><p style={{margin:'8px 0 4px',color:'#6b7280',fontSize:14,lineHeight:1.5}}>Keep your visit requests together and make room for a new Seoul story.</p></div><Form onSubmit={onSubmit}><Input aria-label="Email address" autoComplete="email" name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} type="email" required/><Input aria-label="Password" autoComplete="current-password" name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('password')} type="password" required/><Input type="submit" value={isLoading?t('loading'):t('logIn')}/></Form><Divider>{t('or')}</Divider><div style={{display:'flex',flexDirection:'column',gap:10}}><GoogleButton onClick={onGoogle}/><KakaoButton onClick={onKakao}/></div>{error?<ErrorText>{error}</ErrorText>:null}<Switcher>{t('dontHaveAccount')} <Link to={"/sign-up?next="+encodeURIComponent(destination)}>{t('createOne')} →</Link></Switcher></Wrapper></Card></Page>;
}
