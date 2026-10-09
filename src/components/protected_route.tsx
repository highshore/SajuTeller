import { useI18n } from '../i18n/i18n';
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAccount } from '../product/data';
export default function ProtectedRoute({children}:{children:ReactElement}) {const { t } = useI18n();
 const location=useLocation();const{account,loading}=useAccount();
 if(loading)return <p role="status" style={{padding:32}}>{t("Checking your session…")}</p>;
 if(!account)return <Navigate to={'/sign-in?next='+encodeURIComponent(location.pathname+location.search)} replace/>;
 return children;
}
