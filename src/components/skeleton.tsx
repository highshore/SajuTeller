import { styled, keyframes } from 'styled-components';
import { useI18n } from '../i18n/i18n';
const breathe=keyframes`from{opacity:.5;}to{opacity:1;}`;
export const Skeleton=styled.div.attrs({'aria-hidden':true})`
  border-radius:8px;background:var(--st-elevated);min-width:0;
  animation:${breathe} 1.4s ease-in-out infinite alternate;
  @media(prefers-reduced-motion:reduce){animation:none;}
`;
const Lines=styled.div`display:grid;gap:12px;min-width:0;`;
export function TextSkeleton({lines=3}:{lines?:number}) {
  const {t}=useI18n();
  return <Lines role="status" aria-label={t('Loading…')} data-text-skeleton>
    {Array.from({length:lines},(_,i)=><Skeleton key={i} style={{height:14,width:i===lines-1?'65%':'100%'}}/>)}
  </Lines>;
}
const Card=styled.article`
  min-width:0;border:1px solid var(--st-line);border-radius:22px;overflow:hidden;
  background:var(--st-surface);.photo{aspect-ratio:1.34;border-radius:0;}
  .copy{display:grid;gap:18px;padding:20px;}
`;
export function CardSkeleton(){return <Card aria-hidden="true"><Skeleton className="photo"/><div className="copy">
  <Skeleton style={{height:24,width:'64%'}}/><Skeleton style={{height:32,width:'86%'}}/>
  <Skeleton style={{height:16,width:'72%'}}/><Skeleton style={{height:16,width:'60%'}}/>
  <Skeleton style={{height:32,marginTop:8}}/>
</div></Card>;}
