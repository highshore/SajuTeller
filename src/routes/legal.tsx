import { useI18n } from '../i18n/i18n';
import { Link, useLocation } from 'react-router-dom';
import { Box, Page, Stack, Wrap } from '../product/ui';
import { policies } from '../product/policies';
export default function Legal(){const{t}=useI18n();const{pathname}=useLocation();const policy=policies[pathname as keyof typeof policies]||policies['/terms'];return <Page><Wrap style={{maxWidth:760}}><h1>{t(policy.title)}</h1><Stack>{policy.sections.map(([title,body])=><Box key={title}><h2>{t(title)}</h2><p>{t(body)}</p></Box>)}<Link to="/support">{t("Questions? Contact support →")}</Link></Stack></Wrap></Page>;}
