import LoadingScreen from '../components/loading_screen';
import { useI18n } from '../i18n/i18n';
import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabase';
import { afterSignIn } from '../product/auth';
import { safeReturn } from '../product/plans';
import { Page, Wrap, Notice } from '../product/ui';
export default function AuthCallback(){const { t } = useI18n();const navigate=useNavigate();const[params]=useSearchParams();const started=useRef(false);const[error,setError]=useState('');useEffect(()=>{if(started.current)return;started.current=true;void(async()=>{try{if(params.get('error'))throw new Error(params.get('error_description')||'This sign-in link is no longer valid.');const next=safeReturn(params.get('next')||sessionStorage.getItem('sajuteller-return'));const{data,error}=await supabase.auth.getSession();if(error)throw error;if(!data.session)throw new Error('This link has expired or could not be verified. Request a new link and open it in the same browser.');sessionStorage.removeItem('sajuteller-return');window.history.replaceState({},'',window.location.pathname);navigate(next==='/reset-password'?next:await afterSignIn(next),{replace:true});}catch(e){setError(e instanceof Error?e.message:'Sign-in could not be completed.');}})();},[navigate,params]);return <Page><Wrap style={{maxWidth:440}}>{error?<Notice role="alert">{t(error)}<br/><Link to="/sign-in">{t("Return to sign in")}</Link></Notice>:<LoadingScreen label="Confirming your account…"/>}</Wrap></Page>;}
