import { Link, useLocation } from 'react-router-dom';
import { Box, Page, Stack, Wrap } from '../product/ui';
import { policies } from '../product/policies';
export default function Legal(){const{pathname}=useLocation();const policy=policies[pathname as keyof typeof policies]||policies['/terms'];return <Page><Wrap style={{maxWidth:760}}><h1>{policy.title}</h1><Stack>{policy.sections.map(([title,body])=><Box key={title}><h2>{title}</h2><p>{body}</p></Box>)}<Link to="/support">Questions? Contact support →</Link></Stack></Wrap></Page>;}
