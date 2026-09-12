import { useState } from "react";
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

const FAQList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FAQItem = styled.div`
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
`;

const FAQQuestion = styled.button<{ $isOpen: boolean }>`
  width: 100%;
  padding: 20px 24px;
  background: none;
  border: none;
  text-align: left;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.15s ease;
  
  &:hover {
    background: #f9fafb;
  }
  
  svg {
    width: 20px;
    height: 20px;
    color: #6b7280;
    transition: transform 0.15s ease;
    transform: ${props => props.$isOpen ? 'rotate(180deg)' : 'rotate(0deg)'};
  }
`;

const FAQAnswer = styled.div<{ $isOpen: boolean }>`
  max-height: ${props => props.$isOpen ? '200px' : '0'};
  overflow: hidden;
  transition: max-height 0.3s ease;
  
  div {
    padding: 0 24px 20px 24px;
    color: #6b7280;
    line-height: 1.6;
    font-size: 14px;
  }
`;

const SearchBox = styled.input`
  width: 100%;
  padding: 16px 20px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  font-size: 16px;
  margin-bottom: 32px;
  
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

export default function FAQ() {
  const { t } = useI18n();
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  
  const faqData = [
    {
      question: "How do I create an account?",
      answer: "You can create an account by clicking the 'Sign up' button and following the registration process. You can also sign up using Google, Apple, or Kakao."
    },
    {
      question: "Is my personal information secure?",
      answer: "Yes, we take your privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent."
    },
    {
      question: "How do I reset my password?",
      answer: "If you've forgotten your password, click 'Forgot Password' on the login page and follow the instructions sent to your email."
    },
    {
      question: "Can I change my language preference?",
      answer: "Yes! You can change your language preference using the language selector in the top navigation bar. We support English, Korean, Chinese, Japanese, and Spanish."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can contact our customer support team through live chat, email, or phone. Visit our Customer Support page for more details."
    },
    {
      question: "What browsers are supported?",
      answer: "Our platform works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience."
    },
    {
      question: "How do I delete my account?",
      answer: "To delete your account, go to your Profile settings and click 'Delete Account'. Please note that this action is irreversible."
    },
    {
      question: "Are there any usage fees?",
      answer: "Our basic services are free to use. Premium features may require a subscription. Check our pricing page for detailed information."
    }
  ];
  
  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(index)) {
      newOpenItems.delete(index);
    } else {
      newOpenItems.add(index);
    }
    setOpenItems(newOpenItems);
  };
  
  const filteredFAQ = faqData.filter(item =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <Wrapper>
      <Header>
        <Title>{t("faq")}</Title>
        <Subtitle>
          Find answers to commonly asked questions about our platform.
        </Subtitle>
      </Header>
      
      <SearchBox
        type="text"
        placeholder="Search frequently asked questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      
      <FAQList>
        {filteredFAQ.map((item, index) => (
          <FAQItem key={index}>
            <FAQQuestion
              onClick={() => toggleItem(index)}
              $isOpen={openItems.has(index)}
            >
              {item.question}
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.25a.75.75 0 01-1.06 0L5.23 8.29a.75.75 0 01.02-1.06z" clipRule="evenodd"/>
              </svg>
            </FAQQuestion>
            <FAQAnswer $isOpen={openItems.has(index)}>
              <div>{item.answer}</div>
            </FAQAnswer>
          </FAQItem>
        ))}
      </FAQList>
    </Wrapper>
  );
}
