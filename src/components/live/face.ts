// Face-to-face view (REQ-11): the phone lies flat between reader and visitor. The top half faces the
// reader and always shows Korean; the bottom half faces the visitor and shows the visitor's language.
import { isKorean, type MessageGroup } from './group-turns';

export type FaceLine = { id: string; text: string; own: boolean; pending: boolean };
export type FaceView = { reader: FaceLine[]; visitor: FaceLine[] };

export function faceView(groups: MessageGroup[], keep = 3): FaceView {
  const reader: FaceLine[] = [];
  const visitor: FaceLine[] = [];
  for (const g of groups) {
    const spoken = g.user.content.trim();
    if (!spoken) continue;
    const spokenKo = isKorean(spoken);
    const translated = g.isComplete ? g.assistant?.content.trim() : undefined;
    const id = g.user.id;
    if (spokenKo) {
      reader.push({ id, text: spoken, own: true, pending: false });
      visitor.push({ id, text: translated && !isKorean(translated) ? translated : '…', own: false, pending: !translated });
    } else {
      visitor.push({ id, text: spoken, own: true, pending: false });
      reader.push({ id, text: translated && isKorean(translated) ? translated : '…', own: false, pending: !translated });
    }
  }
  return { reader: reader.slice(-keep), visitor: visitor.slice(-keep) };
}
