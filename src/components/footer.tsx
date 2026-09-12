import { Link } from "react-router-dom";
import { styled } from "styled-components";

const FooterWrap = styled.footer`
  margin-top: auto;
  background: #0f0026;
  color: #d8cde7;
  border-top: 1px solid rgba(255,255,255,.08);
`;
const Inner = styled.div`
  width: min(1296px, calc(100% - 48px));
  margin: 0 auto;
  padding: 40px 0;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 32px;
  align-items: end;
  @media(max-width:720px){grid-template-columns:1fr;align-items:start;}
`;
const Brand = styled.div`
  font-family:'Cinzel',serif;
  font-weight:700;
  letter-spacing:1px;
  color:white;
  font-size:18px;
  margin-bottom:10px;
`;
const Copy = styled.p`margin:0;max-width:560px;font-size:13px;line-height:1.65;color:#bca9d3;`;
const Links = styled.div`display:flex;justify-content:flex-end;gap:20px;flex-wrap:wrap;font-size:13px;@media(max-width:720px){justify-content:flex-start;}`;
const FootLink = styled(Link)`color:#eadcfb;&:hover{color:white;}`;

export default function Footer(){
  return <FooterWrap><Inner><div><Brand>K-SAJU · 사주</Brand><Copy>Discover Korean fortune-telling experiences, book with local readers and use multilingual interpretation when you need it.</Copy></div><Links><FootLink to="/intro">What is Saju?</FootLink><FootLink to="/support">Support</FootLink><FootLink to="/faq">FAQ</FootLink><FootLink to="/locations">Explore</FootLink></Links></Inner></FooterWrap>;
}
