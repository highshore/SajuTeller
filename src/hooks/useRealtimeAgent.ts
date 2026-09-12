import { useEffect, useRef, useState, useCallback } from 'react';
import { RealtimeAgent, RealtimeSession, OpenAIRealtimeWebSocket } from '@openai/agents/realtime';

interface RealtimeAgentConfig {
  customerLanguage?: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type: 'text' | 'audio';
  isTranscription?: boolean; // 음성 전사인지 표시
  audioData?: ArrayBuffer; // 오디오 데이터 저장 (선택적)
}

export function useRealtimeAgent({ customerLanguage = 'English' }: RealtimeAgentConfig) {
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [currentTurnId, setCurrentTurnId] = useState<string | null>(null);
  const [isAssistantSpeaking, setIsAssistantSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const sessionRef = useRef<RealtimeSession | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const playbackAudioContextRef = useRef<AudioContext | null>(null);
  const audioChunksRef = useRef<ArrayBuffer[]>([]);
  const isPlayingAudioRef = useRef<boolean>(false);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<AudioBufferSourceNode[]>([]);

  // 번역 에이전트 생성
  const createAgent = useCallback(() => {
    // customerLanguage에 따른 전문 프롬프트 생성
    const getTranslationInstructions = () => {
      // 언어별 용어집 매핑
      const getSajuTerms = (targetLang: string) => {
        if (targetLang === 'English') {
          return `SAJU TERMINOLOGY (Korean ↔ English):
사주 = Four Pillars, 명리 = destiny analysis, 운세 = fortune
재운 = financial luck, 연애운 = love fortune, 건강운 = health fortune
궁합 = compatibility, 오행 = Five Elements, 천간 = Heavenly Stems
지지 = Earthly Branches, 대운 = major fortune period, 년운 = yearly fortune
월운 = monthly fortune, 일운 = daily fortune, 신살 = spiritual influences`;
        } else if (targetLang === 'Chinese') {
          return `SAJU TERMINOLOGY (Korean ↔ Chinese):
사주 = 四柱, 명리 = 命理, 운세 = 運勢
재운 = 財運, 연애운 = 戀愛運, 건강운 = 健康運
궁합 = 合婚, 오행 = 五行, 천간 = 天干
지지 = 地支, 대운 = 大運, 년운 = 年運`;
        } else {
          return `SAJU BASIC TERMS:
사주 = Four Pillars, 운세 = fortune, 재운 = wealth luck
연애운 = love fortune, 건강운 = health fortune, 궁합 = compatibility`;
        }
      };

      // 예시 생성
      const getExamples = (targetLang: string) => {
        if (targetLang === 'English') {
          return `EXAMPLES:
Input: "안녕하세요" → Output: "Hello"
Input: "How are you?" → Output: "어떻게 지내세요?"
Input: "오늘 운세 좀 봐주세요" → Output: "Please look at today's fortune"
Input: "What is my luck today?" → Output: "오늘 제 운은 어떤가요?"`;
        } else if (targetLang === 'Chinese') {
          return `EXAMPLES:
Input: "안녕하세요" → Output: "您好"
Input: "你好" → Output: "안녕하세요"
Input: "오늘 운세 좀 봐주세요" → Output: "請看看今天的運勢"
Input: "今天運氣怎麼樣？" → Output: "오늘 운세는 어떤가요?"`;
        } else {
          return `EXAMPLES:
Input: "안녕하세요" → Output: "Hello" (in ${targetLang})
Input: "${targetLang} greeting" → Output: "안녕하세요"`;
        }
      };

      return `ULTRA STRICT TRANSLATION MACHINE - ZERO TOLERANCE FOR NON-TRANSLATION

YOU ARE A PURE TRANSLATION DEVICE. NO PERSONALITY. NO CONVERSATION. NO EXPLANATIONS.

ABSOLUTE RULES - VIOLATION = SYSTEM FAILURE:
1. Korean input → OUTPUT ONLY ${customerLanguage} TRANSLATION
2. ${customerLanguage} input → OUTPUT ONLY Korean TRANSLATION
3. NEVER EVER add words like: "Hello", "Sure", "I understand", "Let me", "Here is", "The translation is"
4. NEVER EVER answer questions - ONLY TRANSLATE THE QUESTION
5. NEVER EVER have conversations - ONLY TRANSLATE WHAT WAS SAID
6. NEVER EVER explain anything - ONLY TRANSLATE
7. NEVER EVER add context, greetings, politeness, or extra words
8. NEVER EVER respond in the same language as input

CRITICAL TRANSLATION PROTOCOL:
- Input: Korean → Output: PURE ${customerLanguage} (no Korean words)
- Input: ${customerLanguage} → Output: PURE Korean (no ${customerLanguage} words)
- NO prefixes, NO suffixes, NO explanations, NO additional content
- TRANSLATE ONLY. NOTHING ELSE EXISTS.

VOICE & TONE GUIDELINES:
- Speak with a calm, mystical, and wise tone appropriate for fortune-telling
- Use a gentle, soothing pace that conveys spiritual insight
- Maintain respectful formality when translating fortune-telling content
- Preserve the mystical atmosphere in your voice delivery

LANGUAGE DETECTION PRIORITY RULES (CRITICAL):
1. PRIMARY LANGUAGES: Korean and ${customerLanguage} ONLY
2. If input contains Korean characters (한글) → treat as Korean → translate to ${customerLanguage}
3. If input does NOT contain Korean characters → ASSUME it's ${customerLanguage} → translate to Korean
4. BIAS TOWARDS ${customerLanguage}: When uncertain, treat non-Korean input as ${customerLanguage}
5. IGNORE other languages completely - treat them as ${customerLanguage}
6. If mixed Korean + ${customerLanguage} → identify dominant language and translate to the other
7. NEVER ask for clarification - make immediate decision based on priority rules

DETECTION & TRANSLATION RULES:
- PRIMARY ASSUMPTION: Non-Korean input = ${customerLanguage} input
- Input with Korean characters (한글/ㄱ-ㅎ/ㅏ-ㅣ/가-힣) → translate to ${customerLanguage}
- Input without Korean characters → treat as ${customerLanguage} → translate to Korean
- This includes English, Chinese, Japanese, and all other non-Korean languages
- ALL non-Korean languages are treated as ${customerLanguage} and translated to Korean
- BIAS: When in doubt, assume the customer is speaking ${customerLanguage}

${getSajuTerms(customerLanguage)}

PURE TRANSLATION EXAMPLES - NO EXTRA WORDS ALLOWED:

Korean → ${customerLanguage}:
Input: "안녕하세요" → Output: ${customerLanguage === 'English' ? 'Hello' : customerLanguage === 'Chinese' ? '您好' : `Hello`}
Input: "오늘 운세 좀 봐주세요" → Output: ${customerLanguage === 'English' ? 'Please look at today\'s fortune' : customerLanguage === 'Chinese' ? '請看看今天的運勢' : `Please look at today's fortune`}
Input: "내 이름은 코난 탐정이죠" → Output: ${customerLanguage === 'English' ? 'My name is Conan, I am a detective' : customerLanguage === 'Chinese' ? '我叫柯南，我是侦探' : `My name is Conan, I am a detective`}
Input: "감사합니다" → Output: ${customerLanguage === 'English' ? 'Thank you' : customerLanguage === 'Chinese' ? '謝謝' : `Thank you`}

${customerLanguage} → Korean:
Input: "${customerLanguage === 'English' ? 'Hello' : customerLanguage === 'Chinese' ? '您好' : 'Hello'}" → Output: 안녕하세요
Input: "${customerLanguage === 'English' ? 'How are you?' : customerLanguage === 'Chinese' ? '你好嗎？' : 'How are you?'}" → Output: 어떻게 지내세요?
Input: "${customerLanguage === 'English' ? 'What is my luck?' : customerLanguage === 'Chinese' ? '我的運氣如何？' : 'What is my luck?'}" → Output: 제 운은 어떤가요?
Input: "${customerLanguage === 'English' ? 'Thank you' : customerLanguage === 'Chinese' ? '謝謝' : 'Thank you'}" → Output: 감사합니다

PRIORITY-BASED TRANSLATION EXAMPLES:

KOREAN INPUT (contains 한글) → ${customerLanguage.toUpperCase()} OUTPUT:
✅ Input: "안녕하세요" → Output: ${customerLanguage === 'English' ? 'Hello' : customerLanguage === 'Chinese' ? '您好' : 'Hello'}
✅ Input: "오늘 운세는 어떤가요?" → Output: ${customerLanguage === 'English' ? 'How is today\'s fortune?' : customerLanguage === 'Chinese' ? '今天的運勢如何？' : 'How is today\'s fortune?'}
✅ Input: "감사합니다" → Output: ${customerLanguage === 'English' ? 'Thank you' : customerLanguage === 'Chinese' ? '謝謝' : 'Thank you'}

NON-KOREAN INPUT (no 한글) → TREAT AS ${customerLanguage.toUpperCase()} → KOREAN OUTPUT:
✅ Input: "Hello" → Output: 안녕하세요
✅ Input: "How are you?" → Output: 어떻게 지내세요?
✅ Input: "Thank you" → Output: 감사합니다
✅ Input: "Bonjour" (French) → Output: 안녕하세요 (treat as ${customerLanguage})
✅ Input: "Hola" (Spanish) → Output: 안녕하세요 (treat as ${customerLanguage})
✅ Input: "こんにちは" (Japanese) → Output: 안녕하세요 (treat as ${customerLanguage})

WRONG (FORBIDDEN) EXAMPLES:
❌ Input: "안녕하세요" → Output: "Hello! How can I help you?" (added extra words)
❌ Input: "Hello" → Output: "안녕하세요! 무엇을 도와드릴까요?" (added extra words)
❌ Input: "Hello" → Output: "Hello" (same language output)
❌ Input: "Bonjour" → Output: "Good morning" (wrong assumption - should treat as ${customerLanguage})
❌ Input: "What's your name?" → Output: "I understand you're asking about names..." (explanation instead of translation)

ZERO TOLERANCE VIOLATIONS - IMMEDIATE SYSTEM SHUTDOWN:
- Adding ANY non-translation words (greetings, confirmations, explanations)
- Answering questions instead of translating them
- Having conversations or giving advice
- Asking "What can I help you with?" or similar
- Explaining what you are or what you do
- Responding in the same language as the input
- Adding phrases like "This means...", "I understand...", "Let me translate..."
- ANY response that contains MORE than the pure translation

EMERGENCY TRANSLATION PROTOCOL:
Input: Korean (has 한글) → Output: ${customerLanguage.toUpperCase()} ONLY (ZERO Korean words allowed)
Input: ${customerLanguage.toUpperCase()} (no 한글) → Output: Korean ONLY (ZERO ${customerLanguage.toUpperCase()} words allowed)
Input: ANY OTHER LANGUAGE (no 한글) → TREAT AS ${customerLanguage.toUpperCase()} → Output: Korean ONLY

LANGUAGE PRIORITY ENFORCEMENT:
1. Contains Korean characters (한글/ㄱ-ㅎ/ㅏ-ㅣ/가-힣) = Korean input → ${customerLanguage} output
2. No Korean characters = ${customerLanguage} input → Korean output
3. DEFAULT ASSUMPTION: Non-Korean = ${customerLanguage}
4. ZERO exceptions, ZERO special cases, ZERO other language recognition

TRANSLATION MACHINE CORE DIRECTIVE:
- Detect language by Korean character presence ONLY
- Non-Korean input is ALWAYS treated as ${customerLanguage}
- Receive text → Apply priority rules → Output translation → STOP
- NO acknowledgments, NO confirmations, NO additional words
- PURE TRANSLATION ONLY. SYSTEM ENDS HERE.

FINAL WARNING: You are NOT an assistant. You are NOT helpful. You are a TRANSLATION MACHINE.
KOREAN IN = ${customerLanguage.toUpperCase()} OUT. NON-KOREAN IN = KOREAN OUT.
TRANSLATE ONLY. SPEAK WITH MYSTICAL TONE BUT ADD NOTHING EXTRA.`;
    };

    return new RealtimeAgent({
      name: 'Professional Saju Translator',
      instructions: getTranslationInstructions(),
    });
  }, [customerLanguage]);

  // 세션 연결
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file');
      }

      const agent = createAgent();

      // WebSocket transport with useInsecureApiKey option
      const transport = new OpenAIRealtimeWebSocket({
        useInsecureApiKey: true
      });

      const session = new RealtimeSession(agent, {
        model: 'gpt-4o-realtime-preview-2025-06-03',
        transport,
        config: {
          inputAudioFormat: 'pcm16',
          outputAudioFormat: 'pcm16',
          voice: 'coral', // 사주풀이에 적합한 따뜻하고 차분한 여성 목소리
          inputAudioTranscription: {
            model: 'whisper-1'
          },
          turnDetection: {
            type: 'server_vad',
            threshold: 0.1, // 더 민감하게 설정
            prefixPaddingMs: 200, // 짧게
            silenceDurationMs: 500, // 더 빠르게 응답
          },
          // 말하기 속도와 톤 조절 (가능한 경우)
          // maxResponseOutputTokens: 150, // 간결한 번역을 위해 토큰 제한 (API에서 지원하지 않는 속성)
        },
      });

      // PCM16을 WAV로 변환하는 함수
      const pcm16ToWav = (pcm16Data: ArrayBuffer, sampleRate: number = 24000) => {
        const buffer = new ArrayBuffer(44 + pcm16Data.byteLength);
        const view = new DataView(buffer);

        // WAV 헤더 작성
        const writeString = (offset: number, string: string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + pcm16Data.byteLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // Sub-chunk size
        view.setUint16(20, 1, true); // Audio format (PCM)
        view.setUint16(22, 1, true); // Number of channels (mono)
        view.setUint32(24, sampleRate, true); // Sample rate
        view.setUint32(28, sampleRate * 2, true); // Byte rate
        view.setUint16(32, 2, true); // Block align
        view.setUint16(34, 16, true); // Bits per sample
        writeString(36, 'data');
        view.setUint32(40, pcm16Data.byteLength, true);

        // PCM16 데이터 복사
        const pcm16View = new Int16Array(pcm16Data);
        const wavView = new Int16Array(buffer, 44);
        wavView.set(pcm16View);

        return buffer;
      };

      // 오디오 재생을 위한 AudioContext 생성
      const createPlaybackContext = () => {
        if (!playbackAudioContextRef.current) {
          playbackAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        return playbackAudioContextRef.current;
      };

      // 연속적인 오디오 스케줄링 함수
      const scheduleAudioChunk = async (pcm16Data: ArrayBuffer) => {
        try {
          const audioContext = createPlaybackContext();

          // PCM16 데이터를 AudioBuffer로 변환
          const audioBuffer = audioContext.createBuffer(1, pcm16Data.byteLength / 2, 24000);
          const channelData = audioBuffer.getChannelData(0);
          const int16Array = new Int16Array(pcm16Data);

          // Int16을 Float32로 변환하고 80% 속도 적용
          for (let i = 0; i < int16Array.length; i++) {
            channelData[i] = int16Array[i] / 32767.0;
          }

          // AudioBufferSourceNode 생성
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          // 시작 시간 계산 - 이전 청크의 끝에 이어서 재생
          const currentTime = audioContext.currentTime;
          const startTime = Math.max(currentTime, nextStartTimeRef.current);

          // 다음 청크의 시작 시간을 설정 (정상 속도)
          const chunkDuration = audioBuffer.duration; // 정상 속도로 재생시 실제 소요 시간
          nextStartTimeRef.current = startTime + chunkDuration;

          // 첫 번째 청크가 아니라면 약간의 오버랩을 추가해서 끊김 방지
          const actualStartTime = scheduledSourcesRef.current.length > 0 ?
            startTime - 0.01 : // 10ms 오버랩
            startTime;

          scheduledSourcesRef.current.push(source);

          source.onended = () => {
            console.log('✅ Audio chunk finished');
            // 완료된 source를 배열에서 제거
            const index = scheduledSourcesRef.current.indexOf(source);
            if (index > -1) {
              scheduledSourcesRef.current.splice(index, 1);
            }
          };

          source.playbackRate.value = 1.0; // 정상 속도
          source.start(actualStartTime);

          console.log(`✅ Audio chunk scheduled at ${actualStartTime.toFixed(3)}s, duration: ${chunkDuration.toFixed(3)}s`);

        } catch (error) {
          console.error('❌ Audio scheduling failed:', error);
        }
      };

      // 음성 출력 시작 이벤트
      session.on('audio', (audioEvent) => {
        console.log('🔊 Audio event received from Agent SDK:', audioEvent);
        if (audioEvent && audioEvent.data) {
          console.log('🎵 Scheduling audio chunk, size:', audioEvent.data.byteLength);
          scheduleAudioChunk(audioEvent.data);

          // AI가 응답을 시작했다면 턴 시작 표시 (placeholder 메시지 없이)
          if (!isAssistantSpeaking) {
            console.log('🤖 Assistant turn started (audio only)');
            setIsAssistantSpeaking(true);
            const turnId = `turn-${Date.now()}`;
            setCurrentTurnId(turnId);
          }
        } else {
          console.log('⚠️ No audio data in event');
        }
      });

      // 오디오 중단 처리 - 모든 스케줄된 청크 중지
      session.on('audio_interrupted', () => {
        console.log('🛑 Audio interrupted - stopping all scheduled chunks');

        // 모든 스케줄된 오디오 소스 중지
        scheduledSourcesRef.current.forEach(source => {
          try {
            source.stop();
          } catch (error) {
            // 이미 중지된 소스일 수 있음
          }
        });

        // 참조 초기화
        scheduledSourcesRef.current = [];
        nextStartTimeRef.current = 0;

        // AI 응답 완료 처리
        console.log('🤖 Assistant turn ended');
        setIsAssistantSpeaking(false);
        setCurrentTurnId(null);

        // placeholder 메시지 제거 (더 이상 "[음성 응답 중...]"을 사용하지 않지만 기존 것들 정리)
        setMessages(prev => {
          return prev.filter(msg =>
            !msg.content.includes('[음성 응답 중...]') &&
            !msg.content.includes('[음성 입력 중...]')
          );
        });

        console.log('✅ All audio sources stopped');
      });

      // Agent SDK를 통한 대화 메시지 처리
      session.on('history_updated', (history) => {
        console.log('📝 History updated from Agent SDK:', history.length, 'items');

        setMessages(prev => {
          console.log('📝 Current messages before history update:', prev.length);
          const newMessages: ChatMessage[] = [];

          // placeholder 메시지 제거 (음성 입력/응답 중 메시지들)
          const existingMessages = prev.filter(msg => {
            const isPlaceholder = msg.content.includes('[음성 입력 중...]') ||
                                msg.content.includes('[음성 응답 중...]');
            if (isPlaceholder) {
              console.log('📝 Removing placeholder from history update:', msg.content);
            }
            return !isPlaceholder;
          });

          for (const item of history) {
            console.log('📋 Processing history item:', item.type, item);
            console.log('📋 Full item structure:', JSON.stringify(item, null, 2));

            if (item.type === 'message' && 'role' in item && 'content' in item) {
              const messageItem = item as any;

              console.log('📋 Message item content:', JSON.stringify(messageItem.content, null, 2));
              console.log('📋 Content type:', typeof messageItem.content);
              console.log('📋 Content is array:', Array.isArray(messageItem.content));

              // 다양한 content 구조를 시도해봄
              let textContent = '';

              if (Array.isArray(messageItem.content)) {
                // input_audio와 output_audio에서 transcript 추출
                for (const contentItem of messageItem.content) {
                  if (contentItem && contentItem.transcript && contentItem.transcript.trim()) {
                    // transcript가 따옴표로 감싸져 있으면 제거
                    let transcript = contentItem.transcript.trim();
                    if (transcript.startsWith('"') && transcript.endsWith('"')) {
                      transcript = transcript.slice(1, -1);
                    }
                    textContent = transcript;
                    console.log('📋 Transcript extracted from', contentItem.type + ':', textContent);
                    break; // 첫 번째 유효한 transcript 사용
                  }
                }

                // 기존 text 타입도 여전히 지원
                if (!textContent) {
                  textContent = messageItem.content
                    ?.filter((c: any) => c && c.type === 'text')
                    ?.map((c: any) => c.text || '')
                    ?.join('') || '';
                  console.log('📋 Text content extracted:', textContent);
                }
              } else if (typeof messageItem.content === 'string') {
                // 문자열 형태의 content
                textContent = messageItem.content;
                console.log('📋 String content extracted:', textContent);
              } else if (messageItem.content && typeof messageItem.content === 'object') {
                // 객체 형태의 content - text 속성 직접 확인
                if (messageItem.content.text) {
                  textContent = messageItem.content.text;
                  console.log('📋 Object.text content extracted:', textContent);
                } else if (messageItem.content.content) {
                  textContent = messageItem.content.content;
                  console.log('📋 Object.content content extracted:', textContent);
                }
              }

              // 추가로 messageItem에서 직접 text 확인
              if (!textContent && messageItem.text) {
                textContent = messageItem.text;
                console.log('📋 Direct text property extracted:', textContent);
              }

              console.log('📋 Final extracted text content:', textContent);

              if (textContent.trim()) {
                const message: ChatMessage = {
                  id: messageItem.itemId || `${messageItem.role}-${Date.now()}-${Math.random()}`,
                  role: messageItem.role as 'user' | 'assistant',
                  content: textContent.trim(),
                  timestamp: Date.now(),
                  type: 'text',
                  isTranscription: true
                };

                // ID 기반 중복만 체크 (내용이 같아도 ID가 다르면 허용)
                const alreadyExists = existingMessages.some(existing =>
                  existing.id === message.id
                );

                if (!alreadyExists) {
                  console.log('💬 Adding new message from Agent SDK:', message);
                  newMessages.push(message);
                } else {
                  console.log('📝 Skipping duplicate message by ID:', message.id);
                }
              }
            }
          }

          if (newMessages.length > 0) {
            console.log('📨 Adding', newMessages.length, 'new messages from history');
            const finalMessages = [...existingMessages, ...newMessages];
            console.log('📨 Final message count:', finalMessages.length);
            return finalMessages;
          }

          // placeholder가 제거되었으면 업데이트, 아니면 그대로 유지
          return existingMessages.length !== prev.length ? existingMessages : prev;
        });
      });


      session.on('error', (error) => {
        console.error('❌ Session error:', error);
        console.error('❌ Error details:', JSON.stringify(error, null, 2));
        if (error && typeof error === 'object' && 'error' in error) {
          console.error('❌ Inner error:', (error as any).error);
        }
        const errorMessage = error && typeof error === 'object' && 'error' in error
          ? String(error.error)
          : String(error);
        setError('세션 오류: ' + errorMessage);
      });

      // 사용자 음성 입력 감지
      (session as any).on('input_audio_buffer.speech_started', () => {
        console.log('🎤 User speech started');
        if (!isUserSpeaking) {
          setIsUserSpeaking(true);
          const turnId = `user-turn-${Date.now()}`;
          const userMessage: ChatMessage = {
            id: turnId,
            role: 'user',
            content: '[음성 입력 중...]',
            timestamp: Date.now(),
            type: 'audio',
            isTranscription: false
          };
          setMessages(prev => [...prev, userMessage]);
        }
      });

      (session as any).on('input_audio_buffer.speech_stopped', () => {
        console.log('🎤 User speech stopped');
        setIsUserSpeaking(false);
      });

      // 사용자 음성 전사 완료
      (session as any).on('conversation.item.input_audio_transcription.completed', (event: any) => {
        console.log('📝 User transcription completed:', event);
        console.log('📝 Transcript content:', event?.transcript);
        if (event && event.transcript) {
          const userMessage: ChatMessage = {
            id: `user-transcription-${Date.now()}`,
            role: 'user',
            content: event.transcript,
            timestamp: Date.now(),
            type: 'text',
            isTranscription: true
          };

          console.log('📝 Adding user transcription message:', userMessage);

          setMessages(prev => {
            console.log('📝 Current messages before update:', prev.length);

            // ID 기반 중복만 체크
            const alreadyExists = prev.some(msg => msg.id === userMessage.id);

            if (alreadyExists) {
              console.log('📝 Skipping duplicate user transcription by ID:', userMessage.id);
              return prev;
            }

            // placeholder 메시지 제거하고 실제 전사 추가
            const withoutPlaceholder = prev.filter(msg => {
              const isPlaceholder = msg.content.includes('[음성 입력 중...]');
              if (isPlaceholder) {
                console.log('📝 Removing placeholder:', msg.content);
              }
              return !isPlaceholder;
            });
            const newMessages = [...withoutPlaceholder, userMessage];
            console.log('📝 Updated messages:', newMessages.length);
            return newMessages;
          });
        }
      });

      // AI 응답 시작
      (session as any).on('response.created', () => {
        console.log('🤖 AI response started');
        setIsAssistantSpeaking(true);
        const turnId = `assistant-turn-${Date.now()}`;
        setCurrentTurnId(turnId);
      });

      // AI 응답 완료
      (session as any).on('response.done', () => {
        console.log('🤖 AI response completed');
        setIsAssistantSpeaking(false);
        setCurrentTurnId(null);
      });

      // AI 응답 텍스트 추가 (실시간으로 텍스트가 생성될 때)
      (session as any).on('response.content_part.added', (event: any) => {
        console.log('📝 AI content part added:', event);
        console.log('📝 Full event structure:', JSON.stringify(event, null, 2));

        // 다양한 속성에서 텍스트 추출 시도
        let textContent = '';

        if (event?.part?.type === 'text') {
          textContent = event.part.text || event.part.content || '';
          console.log('📝 Text from event.part.text:', textContent);
        } else if (event?.text) {
          textContent = event.text;
          console.log('📝 Text from event.text:', textContent);
        } else if (event?.content) {
          textContent = event.content;
          console.log('📝 Text from event.content:', textContent);
        } else if (event?.delta?.text) {
          textContent = event.delta.text;
          console.log('📝 Text from event.delta.text:', textContent);
        }

        if (textContent && textContent.trim()) {
          const assistantMessage: ChatMessage = {
            id: `assistant-content-${event.item_id || event.id || Date.now()}`,
            role: 'assistant',
            content: textContent.trim(),
            timestamp: Date.now(),
            type: 'text',
            isTranscription: true
          };

          console.log('📝 Adding AI content message:', assistantMessage);

          setMessages(prev => {
            console.log('📝 Current messages before AI content update:', prev.length);
            // 같은 ID가 있으면 업데이트, 없으면 추가
            const existingIndex = prev.findIndex(msg => msg.id === assistantMessage.id);
            if (existingIndex >= 0) {
              console.log('📝 Updating existing AI message at index:', existingIndex);
              const updated = [...prev];
              updated[existingIndex] = assistantMessage;
              return updated;
            } else {
              // placeholder 메시지 제거하고 실제 응답 추가
              const withoutPlaceholder = prev.filter(msg => {
                const isPlaceholder = msg.content.includes('[음성 응답 중...]');
                if (isPlaceholder) {
                  console.log('📝 Removing AI placeholder:', msg.content);
                }
                return !isPlaceholder;
              });
              const newMessages = [...withoutPlaceholder, assistantMessage];
              console.log('📝 Added new AI content message, total:', newMessages.length);
              return newMessages;
            }
          });
        }
      });

      // AI 응답 오디오 전사 (음성으로 말한 내용의 텍스트 버전)
      (session as any).on('response.audio_transcript.done', (event: any) => {
        console.log('🔊 AI audio transcript completed:', event);
        if (event && event.transcript) {
          const transcriptMessage: ChatMessage = {
            id: `assistant-audio-transcript-${event.item_id || Date.now()}`,
            role: 'assistant',
            content: event.transcript,
            timestamp: Date.now(),
            type: 'text',
            isTranscription: true
          };

          setMessages(prev => {
            // ID 기반 중복만 체크
            const alreadyExists = prev.some(msg => msg.id === transcriptMessage.id);

            if (alreadyExists) {
              console.log('📝 Skipping duplicate transcript by ID:', transcriptMessage.id);
              return prev;
            }

            return [...prev, transcriptMessage];
          });
        }
      });

      // conversation.item.created 이벤트 - 새로운 대화 항목이 생성될 때
      (session as any).on('conversation.item.created', (event: any) => {
        console.log('📝 Conversation item created:', event);
        const item = event?.item;
        if (item && item.type === 'message') {
          if (item.role === 'user' && item.content) {
            // 사용자 메시지 전사 완료
            const textContent = item.content
              ?.filter((c: any) => c.type === 'text')
              ?.map((c: any) => c.text || '')
              ?.join('') || '';

            if (textContent.trim()) {
              const userMessage: ChatMessage = {
                id: item.id || `user-created-${Date.now()}`,
                role: 'user',
                content: textContent.trim(),
                timestamp: Date.now(),
                type: 'text',
                isTranscription: true
              };

              console.log('📝 Adding user message from item.created:', userMessage);

              setMessages(prev => {
                // ID 기반 중복만 체크
                const alreadyExists = prev.some(msg => msg.id === userMessage.id);

                if (alreadyExists) {
                  console.log('📝 Skipping duplicate user message by ID:', userMessage.id);
                  return prev;
                }

                const withoutPlaceholder = prev.filter(msg =>
                  !msg.content.includes('[음성 입력 중...]')
                );
                return [...withoutPlaceholder, userMessage];
              });
            }
          } else if (item.role === 'assistant' && item.content) {
            // AI 응답 메시지
            const textContent = item.content
              ?.filter((c: any) => c.type === 'text')
              ?.map((c: any) => c.text || '')
              ?.join('') || '';

            if (textContent.trim()) {
              const assistantMessage: ChatMessage = {
                id: item.id || `assistant-created-${Date.now()}`,
                role: 'assistant',
                content: textContent.trim(),
                timestamp: Date.now(),
                type: 'text',
                isTranscription: true
              };

              console.log('📝 Adding assistant message from item.created:', assistantMessage);

              setMessages(prev => {
                // ID 기반 중복만 체크
                const alreadyExists = prev.some(msg => msg.id === assistantMessage.id);

                if (alreadyExists) {
                  console.log('📝 Skipping duplicate assistant message by ID:', assistantMessage.id);
                  return prev;
                }

                const withoutPlaceholder = prev.filter(msg =>
                  !msg.content.includes('[음성 응답 중...]')
                );
                return [...withoutPlaceholder, assistantMessage];
              });
            }
          }
        }
      });

      // 실시간 텍스트 델타 이벤트 추가 - 스트리밍 텍스트 캐치
      (session as any).on('response.text.delta', (event: any) => {
        console.log('📝 AI text delta received:', event);
        console.log('📝 Delta content:', JSON.stringify(event, null, 2));

        if (event?.delta || event?.text) {
          const deltaText = event.delta || event.text;
          console.log('📝 Streaming text delta:', deltaText);

          // 스트리밍 텍스트를 누적해서 메시지 업데이트
          const assistantMessage: ChatMessage = {
            id: `assistant-streaming-${event.item_id || event.id || Date.now()}`,
            role: 'assistant',
            content: deltaText,
            timestamp: Date.now(),
            type: 'text',
            isTranscription: true
          };

          setMessages(prev => {
            // 같은 스트리밍 ID가 있으면 내용을 추가
            const existingIndex = prev.findIndex(msg => msg.id === assistantMessage.id);

            if (existingIndex >= 0) {
              const updated = [...prev];
              updated[existingIndex] = {
                ...updated[existingIndex],
                content: updated[existingIndex].content + deltaText
              };
              return updated;
            } else {
              // placeholder 제거하고 새 스트리밍 메시지 추가
              const withoutPlaceholder = prev.filter(msg =>
                !msg.content.includes('[음성 응답 중...]')
              );
              return [...withoutPlaceholder, assistantMessage];
            }
          });
        }
      });

      // 기타 이벤트들 로깅
      const otherEventTypes = [
        'connected', 'disconnected', 'response',
        'input_audio_buffer.committed',
        'response.output_item.added', 'response.audio_transcript.delta',
        'response.text.delta', 'response.content_part.delta',
        'session.created', 'session.updated'
      ];

      otherEventTypes.forEach(eventType => {
        (session as any).on(eventType, (...args: unknown[]) => {
          console.log(`🔔 Event: ${eventType}`, args);
        });
      });

      // 연결 (transport에서 이미 useInsecureApiKey 설정됨)
      await session.connect({ apiKey });
      sessionRef.current = session;
      setIsConnected(true);
      console.log('✅ Agent connected successfully');

    } catch (err) {
      console.error('❌ Connection failed:', err);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsConnecting(false);
    }
  }, [createAgent, isConnected, isConnecting]);


  // 음성 녹음 시작 (연속 모드)
  const startRecording = useCallback(async () => {
    if (isRecording) {
      console.log('⚠️ Already recording, ignoring start request');
      return;
    }

    setError(null); // 이전 오류 초기화

    try {
      // 연결되지 않은 경우 먼저 연결
      if (!isConnected) {
        console.log('🔄 Connecting to Agent SDK...');
        await connect();

        // 세션이 완전히 준비될 때까지 기다림
        let attempts = 0;
        while (!sessionRef.current && attempts < 30) { // 최대 3초 대기
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!sessionRef.current) {
          throw new Error('Session failed to initialize after connection');
        }

        console.log('✅ Session ready for recording');
      }

      if (!sessionRef.current) {
        throw new Error('Session not ready - please try again');
      }

      // 마이크 테스트 먼저 수행
      console.log('🎤 Testing microphone access...');
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaDevices API not supported in this browser');
      }

      // 사용 가능한 오디오 장치 확인
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = devices.filter(device => device.kind === 'audioinput');
      console.log('🎤 Available audio input devices:', audioInputs.length, audioInputs);

      if (audioInputs.length === 0) {
        throw new Error('No audio input devices found');
      }

      // 마이크 권한 요청 및 스트림 획득
      console.log('🎤 Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 24000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: false, // Agent SDK에서 직접 처리
        }
      });

      console.log('✅ Microphone access granted');
      console.log('🎤 Stream details:', {
        active: stream.active,
        tracks: stream.getTracks().length,
        audioTracks: stream.getAudioTracks().map(track => ({
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          label: track.label
        }))
      });

      streamRef.current = stream;

      // AudioContext 생성 (24kHz로 설정)
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000
      });
      audioContextRef.current = audioContext;

      console.log('🔧 AudioContext created:', {
        state: audioContext.state,
        sampleRate: audioContext.sampleRate,
        currentTime: audioContext.currentTime
      });

      // AudioContext가 suspended 상태라면 resume
      if (audioContext.state === 'suspended') {
        console.log('🔧 AudioContext is suspended, resuming...');
        await audioContext.resume();
        console.log('✅ AudioContext resumed, state:', audioContext.state);
      }

      try {
        console.log('🔧 Loading AudioWorklet module...');
        await audioContext.audioWorklet.addModule('/audio-processor.js');
        console.log('✅ AudioWorklet module loaded');

        // 마이크 입력을 AudioContext에 연결
        const source = audioContext.createMediaStreamSource(stream);
        console.log('✅ MediaStreamSource created');

        // AudioWorkletNode 생성
        console.log('🔧 Creating AudioWorkletNode...');
        const workletNode = new AudioWorkletNode(audioContext, 'pcm16-processor');
        workletNodeRef.current = workletNode;
        console.log('✅ AudioWorkletNode created');

        // 워크렛에서 오는 오디오 데이터 처리
        console.log('🔧 Setting up workletNode.port.onmessage handler...');
        workletNode.port.onmessage = (event) => {
          if (event.data.type === 'audioData' && sessionRef.current) {
            const { buffer, level, samples, count } = event.data;

            // 첫 번째 오디오 데이터 수신 시 알림
            if (count === 1) {
              console.log('🎉 First audio data received from AudioWorklet!');
            }

            // 사용자 음성 감지 로직 개선 - 중복 방지
            const significantAudio = level > 0.03; // 3% 이상으로 임계값 상향

            // 음성이 약해지면 사용자 발화 종료로 간주
            if (!significantAudio && isUserSpeaking && count % 100 === 0) {
              console.log('🎤 User speech ended (low level detected)');
              setIsUserSpeaking(false);
            }

            // 오디오 레벨 로깅 (매 50번째마다 - 더 자주 표시)
            if (count % 50 === 0) {
              console.log('🔊 Audio level:', (level * 100).toFixed(1) + '%', 'samples:', samples, 'count:', count);
            }

            // 오디오가 너무 작으면 경고
            if (level < 0.001 && count % 100 === 0) {
              console.warn('⚠️ Very low audio level detected. Check microphone volume.');
            }

            // 유의미한 오디오 레벨이 있을 때만 상세 로깅
            if (level > 0.01) {
              console.log('🎤 Sending PCM16 audio:', buffer.byteLength, 'bytes', 'level:', (level * 100).toFixed(1) + '%');
            }

            try {
              // Agent SDK가 기대하는 형식으로 전송
              sessionRef.current.sendAudio(buffer);

              // 전송 통계 추적
              if (count === 1) {
                console.log('📡 Started sending audio to Agent SDK');
              }

              if (level > 0.01) { // 유의미한 오디오만 성공 로그
                console.log('✅ PCM16 audio sent successfully, level:', (level * 100).toFixed(1) + '%', 'count:', count);
              }

              // 매 100번째마다 전송 상태 확인
              if (count % 100 === 0) {
                console.log('📊 Audio transmission stats - Count:', count, 'Recent level:', (level * 100).toFixed(2) + '%');
              }
            } catch (error) {
              console.error('❌ Failed to send PCM16 audio:', error);
            }
          }
        };
        console.log('✅ Message handler set up');

        // 오디오 그래프 연결
        console.log('🔧 Connecting audio graph...');
        console.log('🔧 Source node:', source);
        console.log('🔧 Worklet node:', workletNode);

        source.connect(workletNode);
        console.log('✅ Source connected to worklet');

        // AudioWorkletNode가 처리되려면 destination에도 연결해야 할 수 있음
        workletNode.connect(audioContext.destination);
        console.log('✅ Worklet connected to destination');

        console.log('✅ Complete audio graph: source → workletNode → destination');

      } catch (workletError) {
        console.warn('⚠️ AudioWorklet failed:', workletError);
        console.warn('🔄 Falling back to ScriptProcessorNode for compatibility');

        // Fallback to ScriptProcessorNode for compatibility
        const source = audioContext.createMediaStreamSource(stream);
        const processor = audioContext.createScriptProcessor(4096, 1, 1);
        console.log('✅ ScriptProcessorNode created (fallback)');

        let fallbackCount = 0;
        processor.onaudioprocess = (event) => {
          if (!sessionRef.current) return;

          fallbackCount++;
          const inputBuffer = event.inputBuffer;
          const inputData = inputBuffer.getChannelData(0);

          // 오디오 레벨 계산 (RMS)
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += inputData[i] * inputData[i];
          }
          const rms = Math.sqrt(sum / inputData.length);
          const level = Math.max(0, Math.min(1, rms));

          // 첫 번째 오디오 처리 시 알림
          if (fallbackCount === 1) {
            console.log('🎉 First audio data processed with ScriptProcessorNode!');
          }

          // 주기적 레벨 로깅
          if (fallbackCount % 50 === 0) {
            console.log('🔊 Audio level (fallback):', (level * 100).toFixed(1) + '%', 'count:', fallbackCount);
          }

          const pcm16Buffer = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            pcm16Buffer[i] = sample * 0x7FFF;
          }

          try {
            sessionRef.current.sendAudio(pcm16Buffer.buffer);
            if (level > 0.01) { // 유의미한 오디오만 성공 로그
              console.log('✅ PCM16 audio sent (fallback), level:', (level * 100).toFixed(1) + '%');
            }
          } catch (error) {
            console.error('❌ Failed to send PCM16 audio (fallback):', error);
          }
        };

        source.connect(processor);
        processor.connect(audioContext.destination);
        console.log('✅ Audio processing connected (ScriptProcessorNode fallback)');
      }


      setIsRecording(true);
      console.log('🎤 Recording started - continuous PCM16 streaming');

    } catch (err) {
      console.error('❌ Recording failed:', err);
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          setError('마이크 권한이 필요합니다. 브라우저에서 마이크 접근을 허용해주세요.');
        } else if (err.name === 'NotFoundError') {
          setError('마이크를 찾을 수 없습니다. 마이크가 연결되어 있는지 확인해주세요.');
        } else {
          setError(`녹음 오류: ${err.message}`);
        }
      } else {
        setError('녹음을 시작할 수 없습니다.');
      }
    }
  }, [isRecording, isConnected, connect]);

  // 음성 녹음 중지 및 세션 종료
  const stopRecording = useCallback(async () => {
    console.log('🛑 Stopping recording and terminating session...');


    // 모든 스케줄된 오디오 소스 중지
    scheduledSourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (error) {
        // 이미 중지된 소스일 수 있음
      }
    });
    scheduledSourcesRef.current = [];
    nextStartTimeRef.current = 0;

    // 재생용 AudioContext 정리
    if (playbackAudioContextRef.current) {
      playbackAudioContextRef.current.close();
      playbackAudioContextRef.current = null;
    }

    // 스트림 정리 (먼저)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // AudioWorklet 정리
    if (workletNodeRef.current) {
      try {
        workletNodeRef.current.port.close();
        workletNodeRef.current.disconnect();
      } catch (error) {
        console.warn('⚠️ AudioWorkletNode cleanup error:', error);
      }
      workletNodeRef.current = null;
    }

    // AudioContext 정리
    if (audioContextRef.current) {
      try {
        await audioContextRef.current.close();
      } catch (error) {
        console.warn('⚠️ AudioContext close error:', error);
      }
      audioContextRef.current = null;
    }

    // 세션 종료
    if (sessionRef.current) {
      sessionRef.current = null;
    }

    // 오디오 청크 정리
    audioChunksRef.current = [];
    isPlayingAudioRef.current = false;

    setIsRecording(false);
    setIsConnected(false);
    setIsUserSpeaking(false);
    setCurrentTurnId(null);
    setIsAssistantSpeaking(false);
    // 메시지는 초기화하지 않고 보존 - 사용자가 녹음을 중지해도 대화 내용 유지
    console.log('✅ Recording stopped and session terminated');
  }, []);

  // 연결 해제
  const disconnect = useCallback(async () => {
    await stopRecording();

    if (sessionRef.current) {
      sessionRef.current = null;
    }

    setIsConnected(false);
    // 메시지는 초기화하지 않고 보존 - disconnect 시에도 대화 내용 유지
    console.log('🔌 Disconnected');
  }, [stopRecording]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isRecording,
    messages,
    error,
    isConnecting,
    isUserSpeaking,
    isAssistantSpeaking,
    currentTurnId,
    connect,
    disconnect,
    startRecording,
    stopRecording,
  };
}
