import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
const FooterShell = styled.footer`
  border-top:1px solid var(--st-line);padding:28px 0;color:var(--st-muted);background:var(--st-paper);
  .inner{width:min(1160px,calc(100% - 32px));margin:auto;}.top{display:flex;align-items:center;justify-content:space-between;gap:24px;}
  nav{display:flex;flex-wrap:wrap;gap:4px 20px;}nav a{display:inline-flex;align-items:center;min-height:44px;font-size:12px;}
  .brand{font:500 26px/30px 'Cormorant Garamond',serif;color:var(--st-ink);}.details{font-size:11px;line-height:1.7;margin-top:16px;max-width:620px;}summary{cursor:pointer;min-height:32px;}
  @container saju (max-width:650px){.top{align-items:flex-start;flex-direction:column;gap:12px;}.brand{order:-1;}nav{gap:0 18px;}}
`;
export default function Footer({ compact = false }: { compact?: boolean }) { const detail = <p>© {new Date().getFullYear()} SajuTeller. Korean Saju experiences in Seoul.<br/>Saju is a cultural and reflective experience. Booking requests are confirmed separately by the studio.<br/><a href="/emoji/NOTICE.txt" target="_blank" rel="noreferrer" style={{textDecoration:"underline"}}>Animated emoji credits</a></p>; return <FooterShell data-global-footer><div className="inner"><div className="top"><nav aria-label="Footer navigation"><Link to="/support">Help</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/refund-policy">Cancellation</Link><Link to="/host">Become a partner</Link></nav><Link className="brand" to="/">SAJUTELLER</Link></div>{compact ? <details className="details"><summary>About SajuTeller</summary>{detail}</details> : <div className="details">{detail}</div>}</div></FooterShell>; }
