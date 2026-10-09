import { styled } from 'styled-components';

export const AuthPanel = styled.section`
  width:100%;max-width:440px;margin:0 auto;padding:32px 24px 48px;min-height:70svh;
  .brand{display:flex;justify-content:center;font:500 32px/40px 'Cormorant Garamond',serif;letter-spacing:.2px;margin:4px 0 24px;}
  .method-heading,.heading{text-align:center;margin-bottom:28px;}
  .animated-emoji{margin-bottom:16px;}
  h1{font:600 28px/1.35 Inter,sans-serif;letter-spacing:-.9px;margin:0 auto 10px;text-align:center;text-wrap:balance;}
  .heading p,.method-heading p{font-size:14px;line-height:1.6;color:var(--st-muted);text-wrap:balance;}
  .method-heading p{font-size:15px;}
  .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap;}
  .providers{display:grid;gap:12px;}
  .provider{display:grid;grid-template-columns:26px minmax(0,1fr) 26px;align-items:center;gap:10px;width:100%;min-height:56px;padding:14px 18px;text-align:center;border:1px solid var(--st-accent-line);border-radius:999px;background:var(--st-surface);color:var(--st-ink);font-size:15px;font-weight:500;cursor:pointer;}
  .provider>span:last-child{grid-column:2;}.provider svg{width:20px;height:20px;justify-self:center;}
  .provider:hover{background:var(--st-elevated);border-color:var(--st-gold);}
  .topline{margin-bottom:24px;}
  .back{display:inline-flex;align-items:center;gap:8px;min-height:44px;border:0;background:none;color:var(--st-muted);font-size:13px;padding:0;cursor:pointer;}
  .back svg{width:18px;height:18px;}
  form,fieldset{display:grid;gap:18px;}fieldset{border:0;padding:0;margin:0;min-width:0;}
  label{display:grid;gap:8px;font-size:14px;font-weight:500;}
  input{width:100%;min-width:0;border:1px solid var(--st-accent-line);border-radius:13px;background:var(--st-surface);color:var(--st-ink);padding:15px 16px;font-size:16px;min-height:55px;box-shadow:none;}
  input::placeholder{color:var(--st-muted);opacity:.7;}input:focus-visible{outline:2px solid var(--st-gold);outline-offset:2px;}
  .password{position:relative;}.password input{padding-right:54px;}
  .password button{display:grid;place-items:center;position:absolute;right:5px;top:5px;width:44px;height:44px;border:0;background:none;color:var(--st-muted);cursor:pointer;}
  .password svg{width:20px;height:20px;}
  small{font-size:12px;line-height:1.4;font-weight:400;color:var(--st-muted);}
  .field-error{color:#ffb4b4;}input[aria-invalid=true]{border-color:#ffb4b4;}.field-success{color:#a4cfad;}
  .forgot{justify-self:end;border:0;background:none;font-size:13px;font-weight:500;color:var(--st-ink);padding:0;min-height:44px;margin-top:-8px;text-decoration:underline;text-underline-offset:3px;cursor:pointer;}
  .primary{display:flex;align-items:center;justify-content:center;border:1px solid var(--st-gold);background:var(--st-gold);color:var(--st-paper);min-height:54px;border-radius:999px;font-size:15px;font-weight:600;cursor:pointer;margin-top:2px;width:100%;padding:14px 18px;text-align:center;}
  .primary:hover{background:#d8ba85;}
  .switch{margin:22px 0 0;text-align:center;font-size:13px;color:var(--st-muted);line-height:1.5;}
  .switch button,.text-button{font:inherit;font-weight:600;text-decoration:underline;text-underline-offset:3px;background:none;border:0;color:var(--st-ink);padding:8px 4px;min-height:44px;cursor:pointer;}
  .text-button{font-size:14px;}.text-button.center{display:block;margin:18px auto 0;}
  .legal{display:flex;justify-content:center;align-items:center;gap:10px;margin-top:34px;font-size:12px;color:var(--st-muted);line-height:1.5;flex-wrap:wrap;}
  .legal a{text-decoration:underline;text-underline-offset:3px;min-height:44px;display:flex;align-items:center;}
  .notice{font-size:13px;line-height:1.5;background:var(--st-elevated);border:1px solid var(--st-line);padding:14px;border-radius:12px;margin:16px 0;overflow-wrap:anywhere;}
  [role=alert]{color:#ffb4b4;}button:disabled{opacity:.5;cursor:not-allowed;}
  button{transition:background-color .15s,border-color .15s;}button:focus-visible{outline:2px solid var(--st-gold);outline-offset:3px;}
  .security{display:grid;gap:18px;text-align:center;}.security h1{margin:0;}.security p{font-size:14px;line-height:1.6;color:var(--st-muted);overflow-wrap:anywhere;}
  .security .animated-emoji{justify-self:center;margin:8px 0;}.security strong{color:var(--st-ink);}.security .notice{margin:0;}.security .text-button{font-weight:500;}
  .security-actions{display:grid;gap:4px;margin-top:8px;}
  @media(prefers-reduced-motion:reduce){button{transition:none;}}
`;
