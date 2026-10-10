import LoadingScreen from '../components/loading_screen';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAccount } from '../product/data';
export default function ProtectedRoute({children}:{children:ReactElement}) {
 const location=useLocation();const{account,loading}=useAccount();
 if(loading)return <LoadingScreen label="Checking your session…"/>;
 if(!account)return <Navigate to={'/sign-in?next='+encodeURIComponent(location.pathname+location.search)} replace/>;
 return children;
}
