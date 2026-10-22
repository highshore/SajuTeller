import { styled } from 'styled-components';

// Figma: "06 Sign in — only when sending" (142:179). Serif heading, Kakao first, calm reassurance note.
export const AuthPanel = styled.section`
  --auth-danger:#b3261e;
  width:100%;max-width:430px;margin:0 auto;padding:28px 20px 40px;min-height:70svh;color:var(--st-ink);
  .brand{display:inline-flex;align-items:center;min-height:32px;font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--st-brand);margin:0 0 6px;}
  .method-heading,.heading{margin-bottom:24px;}
  h1{font:600 34px/1.1 'Cormorant Garamond',serif;letter-spacing:-.3px;margin:0 0 10px;text-wrap:balance;}
  .heading p,.method-heading p{font-size:15px;line-height:1.5;color:var(--st-muted);text-wrap:pretty;}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
  .providers{display:grid;gap:12px;}
  .provider{display:grid;grid-template-columns:22px minmax(0,1fr) 22px;align-items:center;gap:10px;width:100%;min-height:52px;padding:12px 16px;text-align:center;border:1px solid var(--st-accent-line);border-radius:14px;background:var(--st-surface);color:var(--st-ink);font-size:16px;font-weight:600;cursor:pointer;}
  .provider>span:last-child{grid-column:2;}.provider svg{width:20px;height:20px;justify-self:center;}
  .provider:hover{background:var(--st-elevated);}
  .provider.kakao{background:#fee500;border-color:#fee500;color:rgb(0 0 0 / 85%);}
  .provider.kakao:hover{background:#f5dc00;}
  .reassure{display:flex;align-items:flex-start;gap:10px;margin-top:16px;padding:12px 14px;border-radius:12px;background:var(--st-success-bg);color:var(--st-success);font-size:14px;line-height:1.5;}
  .reassure svg{width:18px;height:18px;flex:none;margin-top:2px;}
  .topline{margin:-8px 0 12px;}
  .back{display:inline-flex;align-items:center;gap:8px;min-height:44px;border:0;background:none;color:var(--st-muted);font-size:14px;padding:0;cursor:pointer;}
  .back svg{width:18px;height:18px;}
  form,fieldset{display:grid;gap:18px;}fieldset{border:0;padding:0;margin:0;min-width:0;}
  label{display:grid;gap:8px;font-size:14px;font-weight:600;}
  input{width:100%;min-width:0;border:1px solid var(--st-accent-line);border-radius:12px;background:var(--st-surface);color:var(--st-ink);padding:14px 16px;font-size:16px;min-height:52px;box-shadow:none;}
  input::placeholder{color:var(--st-faint);}
  input:focus-visible{outline:2px solid var(--st-action);outline-offset:2px;border-color:var(--st-action);}
  .password{position:relative;}.password input{padding-right:54px;}
  .password button{display:grid;place-items:center;position:absolute;right:4px;top:4px;width:44px;height:44px;border:0;background:none;color:var(--st-muted);cursor:pointer;}
  .password svg{width:20px;height:20px;}
  small{font-size:12px;line-height:1.4;font-weight:400;color:var(--st-muted);}
  .field-error{color:var(--auth-danger);}input[aria-invalid=true]{border-color:var(--auth-danger);}.field-success{color:var(--st-success);}
  .forgot{justify-self:end;border:0;background:none;font-size:14px;font-weight:500;color:var(--st-brand);padding:0;min-height:44px;margin-top:-8px;cursor:pointer;}
  .primary{display:flex;align-items:center;justify-content:center;border:0;background:var(--st-action);color:var(--st-on-action);min-height:52px;border-radius:14px;font-size:16px;font-weight:600;cursor:pointer;margin-top:2px;width:100%;padding:14px 18px;text-align:center;}
  .primary:hover{filter:brightness(1.12);}
  .switch{margin:20px 0 0;text-align:center;font-size:14px;color:var(--st-muted);line-height:1.5;}
  .switch button,.text-button{font:inherit;font-weight:600;background:none;border:0;color:var(--st-brand);padding:8px 4px;min-height:44px;cursor:pointer;}
  .text-button{font-size:14px;}.text-button.center{display:block;margin:16px auto 0;}
  .legal{display:flex;justify-content:center;align-items:center;gap:0 16px;margin-top:28px;font-size:12px;color:var(--st-faint);line-height:1.5;flex-wrap:wrap;text-align:center;}
  .legal span{flex-basis:100%;}.legal a{text-decoration:underline;text-underline-offset:3px;min-height:44px;display:flex;align-items:center;}
  .notice{font-size:14px;line-height:1.5;background:var(--st-elevated);border:1px solid var(--st-line);padding:12px 14px;border-radius:12px;margin:16px 0;overflow-wrap:anywhere;}
  .notice[role=alert]{color:var(--auth-danger);background:#fdf0ef;border-color:#f3d2cf;}
  button:disabled{opacity:.5;cursor:not-allowed;}
  button{transition:background-color .15s,border-color .15s;}button:focus-visible{outline:2px solid var(--st-action);outline-offset:3px;}
  .security{display:grid;gap:14px;}.security h1{margin:0;}.security p{font-size:15px;line-height:1.55;color:var(--st-muted);overflow-wrap:anywhere;}
  .security strong{color:var(--st-ink);}.security .notice{margin:0;}.security .primary{margin-top:8px;}
  .security-actions{display:grid;justify-items:start;gap:0;margin-top:4px;border-top:1px solid var(--st-line);padding-top:8px;}
  @media(prefers-reduced-motion:reduce){button{transition:none;}}
`;
