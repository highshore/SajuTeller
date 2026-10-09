import { useEffect, useState, type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAccount } from '../product/data';
export default function AdminRoute({ children }: { children: ReactElement }) {
 const {account,loading}=useAccount();const[allowedFor,setAllowedFor]=useState('');const[checkedFor,setCheckedFor]=useState('');
 useEffect(()=>{if(!account)return;let active=true;supabase.from('profiles').select('role').eq('auth_user_id',account.id).single().then(({data})=>{if(active){setAllowedFor(data?.role==='admin'?account.id:'');setCheckedFor(account.id);}});return()=>{active=false;};},[account]);
 if(loading||(account&&checkedFor!==account.id))return <p role="status">Checking access…</p>;
 if(!account||allowedFor!==account.id)return <Navigate to="/" replace/>;
 return children;
}
