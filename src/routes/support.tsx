import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";

const Wrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 40px 20px;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 48px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 16px 0;
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 48px;
`;

const ContactCard = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
`;

const ContactIcon = styled.div`
  width: 48px;
  height: 48px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  
  svg {
    width: 24px;
    height: 24px;
    color: #6b7280;
  }
`;

const ContactTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 8px 0;
`;

const ContactText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ContactButton = styled.button`
  background: #111827;
  color: #ffffff;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
  
  &:hover {
    background: #374151;
  }
`;

export default function Support() {
  const { t } = useI18n();
  
  return (
    <Wrapper>
      <Header>
        <Title>{t("customerSupport")}</Title>
        <Subtitle>
          We're here to help you with any questions or issues you might have.
        </Subtitle>
      </Header>
      
      <ContactGrid>
        <ContactCard>
          <ContactIcon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ContactIcon>
          <ContactTitle>Live Chat</ContactTitle>
          <ContactText>
            Get instant help from our support team. Available 24/7.
          </ContactText>
          <ContactButton>Start Chat</ContactButton>
        </ContactCard>
        
        <ContactCard>
          <ContactIcon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
              <path d="m22 6-10 7L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ContactIcon>
          <ContactTitle>Email Support</ContactTitle>
          <ContactText>
            Send us an email and we'll get back to you within 24 hours.
          </ContactText>
          <ContactButton>Send Email</ContactButton>
        </ContactCard>
        
        <ContactCard>
          <ContactIcon>
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </ContactIcon>
          <ContactTitle>Phone Support</ContactTitle>
          <ContactText>
            Call us directly for urgent matters. Available during business hours.
          </ContactText>
          <ContactButton>Call Now</ContactButton>
        </ContactCard>
      </ContactGrid>
    </Wrapper>
  );
}
