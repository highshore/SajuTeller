import { useState, type ImgHTMLAttributes } from 'react';
import { styled } from 'styled-components';
const Image=styled.img`
  display:block;opacity:0;transition:opacity .25s ease;
  &[data-ready='true']{opacity:1;}
  @media(prefers-reduced-motion:reduce){transition:none;}
`;
/** The parent reserves geometry; failed images use one local fallback. */
export default function ProgressiveImage({src,fallback='/figma/reading-atmosphere.svg',...props}:ImgHTMLAttributes<HTMLImageElement>&{fallback?:string}) {
  const [failed,setFailed]=useState<string>();const [ready,setReady]=useState<string>();
  const source=failed===src?fallback:src;
  return <Image {...props} src={source} decoding="async" data-ready={ready===source}
    ref={image=>{if(image?.complete&&image.naturalWidth>0)setReady(source);}}
    onLoad={()=>setReady(source)} onError={()=>{if(source!==fallback)setFailed(src);else setReady(source);}}/>;
}
