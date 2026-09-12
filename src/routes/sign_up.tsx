import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, Divider, Form, Error as ErrorText, Input, LogoImage, Page, Switcher, Wrapper, GoogleButton, AppleButton, KakaoButton, LanguageSelector, Title } from "../components/auth_components";
import { useI18n } from "../i18n/i18n";
import { supabase } from "../supabase";

export function CreateAccount(){
 const {t}=useI18n();const navigate=useNavigate();const [isLoading,setLoading]=useState(false);const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [confirmPassword,setConfirmPassword]=useState('');const [error,setError]=useState('');
 const onGoogle=async()=>{const {error}=await supabase.auth.signInWithOAuth({provider:'google'});if(error)setError(error.message);};
 const onApple=async()=>setError('Apple Sign-In not configured yet');
 const onKakao=async()=>{const {error}=await supabase.auth.signInWithOAuth({provider:'kakao' as any});if(error)setError(error.message);};
 const onSubmit=async(e:React.FormEvent<HTMLFormElement>)=>{e.preventDefault();setError('');if(isLoading||!email||!password||!confirmPassword)return;if(password!==confirmPassword){setError('Passwords do not match');return;}try{setLoading(true);const {error}=await supabase.auth.signUp({email,password});if(error)setError(error.message);else navigate('/');}catch(e){setError(e instanceof Error?e.message:String(e));}finally{setLoading(false);}};
 return <Page><LanguageSelector/><Card><LogoImage/><Wrapper><div style={{textAlign:'center'}}><Title>Create your account</Title><p style={{margin:'8px 0 4px',color:'#6b7280',fontSize:14,lineHeight:1.5}}>Save readings, manage bookings and keep your translated recaps.</p></div><Form onSubmit={onSubmit}><Input name="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={t('email')} type="email" required/><Input name="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder={t('password')} type="password" required/><Input name="confirmPassword" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder={t('confirmPassword')} type="password" required/><Input type="submit" value={isLoading?t('loading'):t('createAccount')}/></Form><Divider>{t('or')}</Divider><div style={{display:'flex',flexDirection:'column',gap:10}}><GoogleButton onClick={onGoogle}/><AppleButton onClick={onApple}/><KakaoButton onClick={onKakao}/></div>{error?<ErrorText>{error}</ErrorText>:null}<Switcher>{t('alreadyHaveAccount')} <Link to="/sign_in">{t('logInHere')} →</Link></Switcher></Wrapper></Card></Page>;
}
