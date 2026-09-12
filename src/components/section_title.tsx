import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

const Container = styled.div`
  width: min(1296px, calc(100% - 48px));
  margin: 0 auto 28px;
  display: flex;
  align-items: center;
  gap: 18px;
`;
const Rule = styled.div`height:1px;flex:1;background:linear-gradient(90deg,transparent,#8b7355 35%,#d4af37 65%,transparent);opacity:.45;`;
const Title = styled.h2<{ $language: string }>`
  margin:0;
  white-space:nowrap;
  font-family:${p => p.$language === 'ko' ? "'Song Myung','Noto Serif KR',serif" : "'Cormorant Garamond','Cinzel',serif"};
  color: inherit;
  font-size: 30px;
  line-height: 1.2;
  font-weight: 700;
  letter-spacing: .1px;
  @media(max-width:768px){font-size:25px;white-space:normal;text-align:center;}
`;

export function SectionTitle({ children }: { children: string }) {
  const { language } = useI18n();
  return <Container><Rule/><Title $language={language}>{children}</Title><Rule/></Container>;
}
