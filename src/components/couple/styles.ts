import { styled } from 'styled-components';

// Element tints for hanja tiles (light surface) and glowing pillars (night).
export const ELEMENT_TINT = ['#e6f0dd', '#fbe4d8', '#f5ead2', '#ebebf2', '#e3e5f7'];
export const ELEMENT_INK = ['#3f6b2c', '#a2442a', '#86672c', '#55556b', '#3d4aa0'];
export const ELEMENT_PILLAR = [
  ['#eed99e', '#9eb873', 'rgb(238 217 158 / 50%)'],
  ['#f6c39d', '#d0644a', 'rgb(246 160 120 / 50%)'],
  ['#f0dca6', '#b88f4d', 'rgb(230 190 120 / 50%)'],
  ['#f1f1f7', '#a6a6bd', 'rgb(220 220 235 / 45%)'],
  ['#b8bdf2', '#6b54b3', 'rgb(184 189 242 / 50%)'],
];
export const A_COLOR = '#6b4fb3';
export const B_COLOR = '#b8975a';

export const Screen = styled.div`
  width:100%;min-width:0;background:var(--st-paper);color:var(--st-ink);
  .pad{padding:0 20px;}
  h1{font:600 40px/42px 'Cormorant Garamond',serif;letter-spacing:-.4px;margin:12px 0 12px;}
  html[lang=ko] & h1,html[lang=ja] & h1,html[lang|=zh] & h1{font:600 30px/40px 'Noto Serif KR',serif;letter-spacing:-.5px;}
  html[lang=ko] & h1,html[lang=ko] & h2,html[lang=ko] & p{word-break:keep-all;}
  h2{font:600 26px/30px 'Cormorant Garamond',serif;letter-spacing:-.2px;}
  html[lang=ko] & h2,html[lang=ja] & h2,html[lang|=zh] & h2{font:600 21px/28px 'Noto Serif KR',serif;}
  .eyebrow{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-action);}
  .lead{font-size:15px;line-height:22px;color:var(--st-muted);}
  .sub{font-size:13px;line-height:19px;color:var(--st-muted);margin-top:6px;}
  .hanja{font-family:'Noto Serif KR',serif;font-weight:600;}
  .note{font-size:12px;line-height:18px;color:var(--st-faint);}
  .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
`;

export const SubHead = styled.div`
  display:grid;grid-template-columns:44px 1fr 44px;align-items:center;height:56px;padding:0 8px;
  .title{text-align:center;font-size:16px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
  .count{justify-self:end;padding-right:12px;font-size:13px;color:var(--st-faint);white-space:nowrap;font-variant-numeric:tabular-nums;}
  a,button.icon{width:44px;height:44px;display:grid;place-items:center;border:0;background:none;color:inherit;border-radius:50%;cursor:pointer;}
  svg{width:22px;height:22px;}
`;

export const StickyAction = styled.div`
  position:sticky;bottom:calc(76px + env(safe-area-inset-bottom));z-index:5;margin-top:28px;
  padding:12px 20px 10px;background:linear-gradient(rgb(255 255 255 / 0%),var(--st-paper) 18px);
  display:grid;gap:6px;justify-items:stretch;text-align:center;
  button{width:100%;min-height:52px;border-radius:12px;font-size:16px;}
  .note{color:var(--st-faint);}
`;
