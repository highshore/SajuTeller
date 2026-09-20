import { useEffect, useRef } from "react";
import { styled } from "styled-components";
import { useI18n } from "../i18n/i18n";
import { useRealtimeAgent } from "../hooks/useRealtimeAgent";
import { useUserProfile } from "../hooks/useUserProfile";

// Import mysterious fonts for multiple languages from Google Fonts
const fontLinks = [
  // Korean mysterious fonts
  'https://fonts.googleapis.com/css2?family=Song+Myung&family=Jua&family=Gugi&family=Stylish:wght@400&family=Kirang+Haerang&display=swap',
  // Korean clean fonts  
  'https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap',
  // Latin mysterious fonts
  'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:wght@400;600;700&family=Cormorant+Garamond:wght@400;500;600;700&display=swap',
  // Japanese fonts
  'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@400;500;600;700&family=Sawarabi+Mincho&display=swap',
  // Chinese fonts
  'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;600;700&family=Ma+Shan+Zheng&display=swap'
];

fontLinks.forEach(href => {
  const link = document.createElement('link');
  link.href = href;
  link.rel = 'stylesheet';
  document.head.appendChild(link);
});

// Language-specific font configurations
const getFontFamily = (language: string, type: 'heading' | 'body' | 'accent' | 'price') => {
  const fontConfigs = {
    ko: {
      heading: "'Song Myung', 'Stylish', 'Kirang Haerang', serif",
      body: "'Noto Sans KR', 'Jua', sans-serif",
      accent: "'Gugi', 'Song Myung', cursive",
      price: "'Noto Serif KR', 'Song Myung', serif"
    },
    en: {
      heading: "'Cinzel', 'Crimson Text', serif",
      body: "'Cormorant Garamond', 'Crimson Text', serif",
      accent: "'Cinzel', 'Crimson Text', serif",
      price: "'Crimson Text', serif"
    },
    ja: {
      heading: "'Sawarabi Mincho', 'Noto Serif JP', serif",
      body: "'Noto Sans JP', 'Sawarabi Mincho', sans-serif",
      accent: "'Sawarabi Mincho', 'Noto Serif JP', serif",
      price: "'Noto Serif JP', 'Sawarabi Mincho', serif"
    },
    zh: {
      heading: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      body: "'Noto Sans SC', 'Ma Shan Zheng', sans-serif",
      accent: "'Ma Shan Zheng', 'Noto Serif SC', serif",
      price: "'Noto Serif SC', 'Ma Shan Zheng', serif"
    },
    es: {
      heading: "'Cinzel', 'Crimson Text', serif",
      body: "'Cormorant Garamond', 'Crimson Text', serif",
      accent: "'Cinzel', 'Crimson Text', serif",
      price: "'Crimson Text', serif"
    }
  };
  
  return fontConfigs[language as keyof typeof fontConfigs]?.[type] || fontConfigs.en[type];
};

// ChatMessage 타입 정의 (useRealtimeAgent에서 가져옴)
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type: 'text' | 'audio';
  isTranscription?: boolean;
  audioData?: ArrayBuffer;
}

const Page = styled.div`
  min-height: 100vh;
  width: 100%;

  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 25%, #0f3460 50%, #533483 75%, #7209b7 100%);
  position: relative;
  padding: 2rem 0;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 40% 40%, rgba(120, 219, 255, 0.2) 0%, transparent 50%);
    z-index: 0;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 0;
  }
`;


const Button = styled.button<{ $primary?: boolean; $danger?: boolean; $customer?: boolean; $business?: boolean; $recording?: boolean; $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: min(180px,100%);
  max-width:100%;
  @media(max-width:600px){padding:14px 18px;font-size:15px;}
  position: relative;
  overflow: hidden;
  
  background: ${(p) => {
    if (p.$recording) return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    if (p.$danger) return "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)";
    if (p.$customer) return "linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)"; // Dark purple
    if (p.$business) return "linear-gradient(135deg, #10b981 0%, #059669 100%)";
    return "linear-gradient(135deg, #4c1d95 0%, #3730a3 100%)"; // Dark purple default
  }};
  color: white;
  box-shadow: ${(p) => {
    if (p.$recording) return "0 4px 15px rgba(239, 68, 68, 0.3)";
    if (p.$danger) return "0 4px 15px rgba(239, 68, 68, 0.3)";
    if (p.$customer) return "0 4px 15px rgba(76, 29, 149, 0.3)"; // Dark purple shadow
    if (p.$business) return "0 4px 15px rgba(16, 185, 129, 0.3)";
    return "0 4px 15px rgba(76, 29, 149, 0.3)"; // Dark purple shadow default
  }};
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: ${(p) => {
      if (p.$recording) return "0 8px 25px rgba(239, 68, 68, 0.4)";
      if (p.$danger) return "0 8px 25px rgba(239, 68, 68, 0.4)";
      if (p.$customer) return "0 8px 25px rgba(76, 29, 149, 0.4)"; // Dark purple hover shadow
      if (p.$business) return "0 8px 25px rgba(16, 185, 129, 0.4)";
      return "0 8px 25px rgba(76, 29, 149, 0.4)"; // Dark purple hover shadow default
    }};
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  ${(p) => p.$recording && `
    animation: pulse 2s infinite;

    @keyframes pulse {
      0% {
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      }
      50% {
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.6), 0 0 0 10px rgba(239, 68, 68, 0.1);
      }
      100% {
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      }
    }
  `}
`;

const Panel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(226, 232, 240, 0.8);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.95);
    border-color: rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.15);
  }
`;

const PanelHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const PanelTitle = styled.h2<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'heading')};
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  line-height: 1.2;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ConversationArea = styled.div`
  height: 60vh;
  min-height: 400px;
  overflow-y: auto;
  padding: 1.5rem;
  background: rgba(248, 250, 252, 0.8);
  border: 2px solid rgba(226, 232, 240, 0.6);
  border-radius: 16px;
  position: relative;
  backdrop-filter: blur(10px);

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #7c3aed, #6d28d9);
  }
`;

const MessageItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
`;


const ProfileIcon = styled.div<{ $isKorean: boolean }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${(p) => p.$isKorean
    ? "linear-gradient(135deg, #8b5cf6, #a855f7)"
    : "linear-gradient(135deg, #4facfe, #00f2fe)"};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
  box-shadow: 0 8px 24px ${(p) => p.$isKorean
    ? "rgba(139, 92, 246, 0.3)"
    : "rgba(79, 172, 254, 0.3)"};
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px ${(p) => p.$isKorean
      ? "rgba(139, 92, 246, 0.4)"
      : "rgba(79, 172, 254, 0.4)"};
  }
`;

const MessageContent = styled.div`
  flex: 1;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  padding: 1.25rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    border-color: rgba(139, 92, 246, 0.2);
  }
`;

const MessageText = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-weight: 500;
  color: #2d3748;
  line-height: 1.5;
  font-size: 1rem;
`;

const TranslationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PrimaryLanguage = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-weight: 600;
  color: #1a202c;
  line-height: 1.5;
  font-size: 1rem;
`;

const SecondaryLanguage = styled.div<{ $language: string }>`
  font-family: ${props => getFontFamily(props.$language, 'body')};
  font-weight: 400;
  color: #4a5568;
  line-height: 1.4;
  font-size: 0.9rem;
  opacity: 0.8;
  font-style: italic;
`;

const RecordingButtons = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
  }
`;

const StatusIndicator = styled.div<{ $isConnected: boolean; $isRecording: boolean; $isConnecting?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: ${(p) => {
    if (p.$isRecording) return "linear-gradient(135deg, #ff6b6b, #ff8e53)";
    if (p.$isConnecting) return "linear-gradient(135deg, #fbbf24, #f59e0b)";
    if (p.$isConnected) return "linear-gradient(135deg, #43e97b, #38f9d7)";
    return "linear-gradient(135deg, #e0e7ff, #c7d2fe)";
  }};
  border-radius: 25px;
  color: ${(p) => (p.$isRecording || p.$isConnected || p.$isConnecting) ? "white" : "#4338ca"};
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 16px;
  box-shadow: 0 4px 16px ${(p) => {
    if (p.$isRecording) return "rgba(255, 107, 107, 0.3)";
    if (p.$isConnecting) return "rgba(251, 191, 36, 0.3)";
    if (p.$isConnected) return "rgba(67, 233, 123, 0.3)";
    return "rgba(67, 56, 202, 0.1)";
  }};
`;

const WaveIcon = styled.div<{ $animate: boolean }>`
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  gap: 2px;

  &::before,
  &::after {
    content: '';
    width: 3px;
    background: currentColor;
    border-radius: 2px;
    animation: ${(p) => p.$animate ? "wave 1.5s ease-in-out infinite" : "none"};
  }

  &::before {
    height: 12px;
    animation-delay: 0s;
  }

  &::after {
    height: 8px;
    animation-delay: 0.3s;
  }

  @keyframes wave {
    0%, 100% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
  }
`;

const ErrorMessage = styled.div`
  background: #fef2f2;
  color: #b91c1c;
  padding: 12px 16px;
  border-radius: 8px;
  margin: 10px 0;
  font-size: 14px;
  text-align: center;
`;


// 언어별 국기 매핑
const LANGUAGE_ICONS: Record<string, string> = {
  "English": "🇺🇸",
  "Chinese": "🇨🇳",
  "Japanese": "🇯🇵",
  "Spanish": "🇪🇸",
};

export default function LiveTranslation() {
  const { t, language } = useI18n();
  const conversationRef = useRef<HTMLDivElement | null>(null);

  // 유저 프로필에서 country 기반으로 언어 설정 가져오기
  const { customerLanguage } = useUserProfile();

  const {
    isConnected,
    isRecording,
    messages,
    error,
    isConnecting,
    startRecording,
    stopRecording,
  } = useRealtimeAgent({
    customerLanguage: customerLanguage
  });


  useEffect(() => {
    if (conversationRef.current) {
      conversationRef.current.scrollTop = conversationRef.current.scrollHeight;
    }
  }, [messages]);

  const handleStartRecording = () => {
    if (!isRecording) {
      startRecording(); // 자동으로 연결도 처리됨
    } else {
      stopRecording();
    }
  };


  return (
    <Page>
      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <Panel>
          <PanelHeader>
            <PanelTitle $language={language}>
              🗣️ {t("liveTranslation")}
            </PanelTitle>
          </PanelHeader>

          <StatusIndicator $isConnected={isConnected} $isRecording={isRecording} $isConnecting={isConnecting}>
            <WaveIcon $animate={isRecording || isConnecting} />
            {isRecording
              ? "🎤 음성 번역 중..."
              : isConnecting
                ? "🔄 번역기 연결 중..."
                : isConnected
                  ? `✅ 번역기 준비됨 (${customerLanguage} ↔ 한국어)`
                  : "🎯 녹음 버튼을 눌러 시작하세요"}
          </StatusIndicator>

          {error && (
            <ErrorMessage>
              {error}
            </ErrorMessage>
          )}

          <RecordingButtons>
            <Button
              onClick={handleStartRecording}
              $customer={!isRecording}
              $danger={isRecording}
              $recording={isRecording}
              disabled={isConnecting}
              $language={language}
            >
              {isConnecting
                ? "🔄 연결 중..."
                : isRecording
                  ? "🛑 녹음 중지"
                  : "🎤 음성 번역하기"}
            </Button>
          </RecordingButtons>

          <ConversationArea ref={conversationRef}>
            {messages.length === 0 && (
              <div style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#6b7280",
                fontSize: "16px",
                lineHeight: 1.6
              }}>
                🎤 음성 버튼을 클릭하고 번역을 시작하세요<br/>
                <span style={{ fontSize: "14px" }}>
                  한국어나 {customerLanguage}로 말씀하시면 즉시 번역해드립니다
                </span>
              </div>
            )}

{(() => {
              console.log('Processing messages:', messages.length);

              // 메시지를 쌍으로 그룹화하는 로직 개선
              const messageGroups: Array<{ user: ChatMessage; assistant?: ChatMessage; isComplete: boolean }> = [];
              const processedIndexes = new Set<number>();

              // 먼저 메시지를 timestamp 순으로 정렬
              const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

              // 언어 감지 함수
              const isKorean = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

              // 언어 기반 스마트 매칭
              const findMatchingMessage = (currentMsg: ChatMessage, startIndex: number, direction: 'forward' | 'backward') => {
                const currentIsKorean = isKorean(currentMsg.content);
                const targetRole = currentMsg.role === 'user' ? 'assistant' : 'user';

                const searchRange = direction === 'forward'
                  ? Array.from({ length: Math.min(15, sortedMessages.length - startIndex - 1) }, (_, i) => startIndex + 1 + i)
                  : Array.from({ length: Math.min(15, startIndex) }, (_, i) => startIndex - 1 - i);

                let bestMatch = null;
                let fallbackMatch = null;

                for (const j of searchRange) {
                  if (j < 0 || j >= sortedMessages.length || processedIndexes.has(j)) continue;

                  const candidateMsg = sortedMessages[j];
                  if (candidateMsg.role !== targetRole) continue;

                  const candidateIsKorean = isKorean(candidateMsg.content);

                  // 우선순위 1: 언어가 다른 경우 (정상적인 번역 쌍)
                  if (currentIsKorean !== candidateIsKorean) {
                    bestMatch = { message: candidateMsg, index: j };
                    break; // 완벽한 매칭이므로 즉시 반환
                  }

                  // 우선순위 2: 같은 언어인 경우 (AI가 번역하지 않은 경우)
                  if (!fallbackMatch && currentIsKorean === candidateIsKorean) {
                    // 시간 차이가 5초 이내인 경우만 fallback으로 고려
                    const timeDiff = Math.abs(currentMsg.timestamp - candidateMsg.timestamp);
                    if (timeDiff <= 5000) { // 5초 이내
                      fallbackMatch = { message: candidateMsg, index: j };
                    }
                  }
                }

                return bestMatch || fallbackMatch;
              };

              for (let i = 0; i < sortedMessages.length; i++) {
                if (processedIndexes.has(i)) continue;

                const message = sortedMessages[i];

                if (message.role === 'user') {
                  // 사용자 메시지에 대응하는 assistant 메시지를 찾음
                  const match = findMatchingMessage(message, i, 'forward');

                  if (match) {
                    processedIndexes.add(match.index);
                    messageGroups.push({
                      user: message,
                      assistant: match.message,
                      isComplete: true
                    });
                  } else {
                    messageGroups.push({
                      user: message,
                      assistant: undefined,
                      isComplete: false
                    });
                  }
                  processedIndexes.add(i);
                } else if (message.role === 'assistant') {
                  // assistant 메시지에 대응하는 user 메시지를 찾음
                  const match = findMatchingMessage(message, i, 'backward');

                  if (match) {
                    processedIndexes.add(match.index);
                    messageGroups.push({
                      user: match.message,
                      assistant: message,
                      isComplete: true
                    });
                    processedIndexes.add(i);
                  } else {
                    // 앞뒤로 검색해서 매칭 시도
                    const forwardMatch = findMatchingMessage(message, i, 'forward');

                    if (forwardMatch) {
                      processedIndexes.add(forwardMatch.index);
                      messageGroups.push({
                        user: forwardMatch.message,
                        assistant: message,
                        isComplete: true
                      });
                      processedIndexes.add(i);
                    } else {
                      // 정말로 고아가 된 assistant 메시지
                      console.warn('Orphaned assistant message:', message.content);
                      messageGroups.push({
                        user: message as any,
                        assistant: undefined,
                        isComplete: false
                      });
                      processedIndexes.add(i);
                    }
                  }
                }
              }

              console.log('Message groups created:', messageGroups.length);

              // 그룹을 timestamp 순으로 정렬
              const sortedGroups = messageGroups.sort((a, b) => a.user.timestamp - b.user.timestamp);

              return sortedGroups.map((group, groupIndex) => {
                if (group.isComplete && group.assistant) {
                  // 완전한 번역 쌍
                  const userMessage = group.user;
                  const assistantMessage = group.assistant;

                  // 입력한 언어 감지 (사용자가 실제로 입력한 언어)
                  const userIsKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(userMessage.content);
                  const assistantIsKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(assistantMessage.content);

                  // 메시지 쌍에서 한국어와 고객 언어 분리
                  let customerText = '';
                  let koreanText = '';
                  let inputLanguageIcon = '';

                  // 정상적인 번역 쌍인지 확인
                  const isProperTranslation = userIsKorean !== assistantIsKorean;

                  if (isProperTranslation) {
                    // 정상적인 번역 쌍 처리
                    if (userIsKorean) {
                      // 사용자가 한국어로 입력 → AI가 고객 언어로 번역
                      koreanText = userMessage.content;        // 입력: 한국어
                      customerText = assistantMessage.content; // 번역: 고객 언어
                      inputLanguageIcon = "🇰🇷";             // 한국어로 입력했음을 표시
                    } else {
                      // 사용자가 고객 언어로 입력 → AI가 한국어로 번역
                      customerText = userMessage.content;      // 입력: 고객 언어
                      koreanText = assistantMessage.content;   // 번역: 한국어
                      inputLanguageIcon = LANGUAGE_ICONS[customerLanguage] || "🇺🇸"; // 고객 언어로 입력했음을 표시
                    }
                  } else {
                    // AI가 같은 언어로 응답한 경우 (번역 실패)
                    if (userIsKorean) {
                      // 둘 다 한국어인 경우
                      koreanText = userMessage.content;
                      customerText = `[번역 필요: ${assistantMessage.content}]`; // 번역되지 않았음을 표시
                      inputLanguageIcon = "🇰🇷";
                    } else {
                      // 둘 다 고객 언어인 경우
                      customerText = userMessage.content;
                      koreanText = `[번역 필요: ${assistantMessage.content}]`; // 번역되지 않았음을 표시
                      inputLanguageIcon = LANGUAGE_ICONS[customerLanguage] || "🇺🇸";
                    }
                  }

                  console.log(`Group ${groupIndex}: User(${userIsKorean ? 'KR' : 'EN'}): "${userMessage.content}" → AI: "${assistantMessage.content}"`);

                  return (
                    <MessageItem key={`group-${groupIndex}`}>
                      <ProfileIcon $isKorean={userIsKorean}>
                        {inputLanguageIcon}
                      </ProfileIcon>
                      <MessageContent>
                        <TranslationContainer>
                          <PrimaryLanguage $language={language}>{customerText}</PrimaryLanguage>
                          <SecondaryLanguage $language={language}>{koreanText}</SecondaryLanguage>
                        </TranslationContainer>
                      </MessageContent>
                    </MessageItem>
                  );
                } else {
                  // 불완전한 메시지 (번역이 아직 진행 중이거나 오류)
                  const message = group.user;
                  const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(message.content);

                  console.warn(`Incomplete group ${groupIndex}: "${message.content}" (role: ${message.role})`);

                  return (
                    <MessageItem key={`incomplete-${groupIndex}`}>
                      <ProfileIcon $isKorean={isKorean}>
                        {message.role === "user"
                          ? (isKorean ? "🇰🇷" : (LANGUAGE_ICONS[customerLanguage] || "🇺🇸"))
                          : "🔄"}
                      </ProfileIcon>
                      <MessageContent>
                        <MessageText $language={language}>
                          {message.content}
                          {!group.isComplete && message.role === 'user' && (
                            <div style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px' }}>
                              번역 중...
                            </div>
                          )}
                        </MessageText>
                      </MessageContent>
                    </MessageItem>
                  );
                }
              });
            })()}
          </ConversationArea>
        </Panel>
      </div>
    </Page>
  );
}