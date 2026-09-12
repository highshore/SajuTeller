import { Link, useLocation } from "react-router-dom";
import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

const FooterContainer = styled.footer<{ $isLocationsPage?: boolean }>`
  background: #f7f7f7;
  border-top: 1px solid #e5e7eb;
  margin-top: auto;
  
  @media (max-width: 768px) {
    /* Hide footer completely on locations page mobile */
    display: ${p => p.$isLocationsPage ? 'none' : 'block'};
  }
`;

const FooterContent = styled.div`
  margin: 0 auto;
  padding: 30px 20px 30px;
`;

const FooterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 32px;
  margin-bottom: 32px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const FooterSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FooterLink = styled(Link)`
  color: #6b7280;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.15s ease;
  
  &:hover {
    color: #111827;
    text-decoration: underline;
  }
`;

const FooterBottom = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
  }
`;

const Copyright = styled.p`
  color: #6b7280;
  font-size: 14px;
  margin: 0;
`;

const SocialLinks = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const SocialLink = styled.a`
  color: #6b7280;
  transition: color 0.15s ease;
  
  &:hover {
    color: #111827;
  }
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

export default function Footer() {
  const { t } = useI18n();
  const location = useLocation();
  const isLocationsPage = location.pathname === '/locations';
  
  return (
    <FooterContainer $isLocationsPage={isLocationsPage}>
      <FooterContent>
        <FooterGrid>
          <FooterSection>
            <SectionTitle>Support</SectionTitle>
            <FooterLink to="/support">{t("customerSupport")}</FooterLink>
            <FooterLink to="/faq">{t("faq")}</FooterLink>
            <FooterLink to="/contact">{t("contact")}</FooterLink>
            <FooterLink to="/safety">{t("safety")}</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <SectionTitle>Company</SectionTitle>
            <FooterLink to="/about">{t("about")}</FooterLink>
            <FooterLink to="/careers">{t("careers")}</FooterLink>
            <FooterLink to="/newsroom">{t("newsroom")}</FooterLink>
            <FooterLink to="/investors">{t("investors")}</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <SectionTitle>Community</SectionTitle>
            <FooterLink to="/blog">{t("blog")}</FooterLink>
            <FooterLink to="/forum">{t("forum")}</FooterLink>
            <FooterLink to="/events">{t("events")}</FooterLink>
            <FooterLink to="/partnerships">{t("partnerships")}</FooterLink>
          </FooterSection>
          
          <FooterSection>
            <SectionTitle>Legal</SectionTitle>
            <FooterLink to="/privacy">{t("privacy")}</FooterLink>
            <FooterLink to="/terms">{t("terms")}</FooterLink>
            <FooterLink to="/cookies">{t("cookies")}</FooterLink>
            <FooterLink to="/compliance">{t("compliance")}</FooterLink>
          </FooterSection>
        </FooterGrid>
        
        <FooterBottom>
          <Copyright>
            © 2024 K-Saju, Inc. {t("allRightsReserved")}
          </Copyright>
          
          <SocialLinks>
            <SocialLink href="https://twitter.com" aria-label="Twitter">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </SocialLink>
            <SocialLink href="https://facebook.com" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </SocialLink>
            <SocialLink href="https://instagram.com" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-2.508 0-4.54-2.032-4.54-4.54s2.032-4.54 4.54-4.54 4.54 2.032 4.54 4.54-2.032 4.54-4.54 4.54zm7.117 0c-2.508 0-4.54-2.032-4.54-4.54s2.032-4.54 4.54-4.54 4.54 2.032 4.54 4.54-2.032 4.54-4.54 4.54z"/>
              </svg>
            </SocialLink>
            <SocialLink href="https://linkedin.com" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
              </svg>
            </SocialLink>
          </SocialLinks>
        </FooterBottom>
      </FooterContent>
    </FooterContainer>
  );
}
