// Pairs each spoken transcription with its translation.
// Same matching rules the live page has always used, moved out of render unchanged
// (minus per-render console logging).

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  type: 'text' | 'audio';
  isTranscription?: boolean;
  audioData?: ArrayBuffer;
}

export interface MessageGroup {
  user: ChatMessage;
  assistant?: ChatMessage;
  isComplete: boolean;
}

export const isKorean = (text: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(text);

export function groupTurns(messages: ChatMessage[]): MessageGroup[] {
  const messageGroups: MessageGroup[] = [];
  const processedIndexes = new Set<number>();

  // 먼저 메시지를 timestamp 순으로 정렬
  const sortedMessages = [...messages].sort((a, b) => a.timestamp - b.timestamp);

  // 언어 기반 스마트 매칭
  const findMatchingMessage = (currentMsg: ChatMessage, startIndex: number, direction: 'forward' | 'backward') => {
    const currentIsKorean = isKorean(currentMsg.content);
    const targetRole = currentMsg.role === 'user' ? 'assistant' : 'user';

    const searchRange = direction === 'forward'
      ? Array.from({ length: Math.min(15, sortedMessages.length - startIndex - 1) }, (_, i) => startIndex + 1 + i)
      : Array.from({ length: Math.min(15, startIndex) }, (_, i) => startIndex - 1 - i);

    let bestMatch: { message: ChatMessage; index: number } | null = null;
    let fallbackMatch: { message: ChatMessage; index: number } | null = null;

    for (const j of searchRange) {
      if (j < 0 || j >= sortedMessages.length || processedIndexes.has(j)) continue;

      const candidateMsg = sortedMessages[j];
      if (candidateMsg.role !== targetRole) continue;

      const candidateIsKorean = isKorean(candidateMsg.content);

      // 우선순위 1: 언어가 다른 경우 (정상적인 번역 쌍)
      if (currentIsKorean !== candidateIsKorean) {
        bestMatch = { message: candidateMsg, index: j };
        break;
      }

      // 우선순위 2: 같은 언어인 경우 (AI가 번역하지 않은 경우) — 5초 이내만
      if (!fallbackMatch && currentIsKorean === candidateIsKorean) {
        const timeDiff = Math.abs(currentMsg.timestamp - candidateMsg.timestamp);
        if (timeDiff <= 5000) {
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
      const match = findMatchingMessage(message, i, 'forward');

      if (match) {
        processedIndexes.add(match.index);
        messageGroups.push({ user: message, assistant: match.message, isComplete: true });
      } else {
        messageGroups.push({ user: message, assistant: undefined, isComplete: false });
      }
      processedIndexes.add(i);
    } else if (message.role === 'assistant') {
      const match = findMatchingMessage(message, i, 'backward');

      if (match) {
        processedIndexes.add(match.index);
        messageGroups.push({ user: match.message, assistant: message, isComplete: true });
        processedIndexes.add(i);
      } else {
        const forwardMatch = findMatchingMessage(message, i, 'forward');

        if (forwardMatch) {
          processedIndexes.add(forwardMatch.index);
          messageGroups.push({ user: forwardMatch.message, assistant: message, isComplete: true });
          processedIndexes.add(i);
        } else {
          // 정말로 고아가 된 assistant 메시지
          messageGroups.push({ user: message, assistant: undefined, isComplete: false });
          processedIndexes.add(i);
        }
      }
    }
  }

  return messageGroups.sort((a, b) => a.user.timestamp - b.user.timestamp);
}
