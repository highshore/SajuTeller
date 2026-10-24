// Demo mode (Preview studios take demo requests, sample reviews) and language-support labels. Order: ko, zh, ja, es.
const phrases: Record<string, readonly [string, string, string, string]> = {
  // Language support
  "Human interpreter": ["통역사 동석", "现场口译员", "通訳者が同席", "Intérprete presencial"],
  "Interpreter": ["통역사", "口译员", "通訳", "Intérprete"],
  // Studio page and cards
  "{name} is a sample studio for trying SajuTeller. Demo requests and chat get automated replies, its reviews are samples, and nothing is booked.": ["{name}은(는) SajuTeller를 체험해 보기 위한 샘플 스튜디오예요. 데모 요청과 채팅에는 자동으로 답장하고, 후기도 샘플이며, 실제로 예약되지 않아요.", "{name} 是用于体验 SajuTeller 的示例工作室。演示请求和聊天会自动回复，评价也是示例，不会产生任何预约。", "{name}はSajuTellerを試すためのサンプルスタジオです。デモリクエストとチャットには自動で返信し、レビューもサンプルで、予約は発生しません。", "{name} es un estudio de muestra para probar SajuTeller. Las solicitudes y el chat de demo reciben respuestas automáticas, sus reseñas son de muestra y no se reserva nada."],
  "{n} review": ["후기 {n}개", "{n} 条评价", "レビュー{n}件", "{n} reseña"],
  "{n} reviews": ["후기 {n}개", "{n} 条评价", "レビュー{n}件", "{n} reseñas"],
  "Sample reviews": ["샘플 후기", "示例评价", "サンプルレビュー", "Reseñas de muestra"],
  "Sample review": ["샘플 후기", "示例评价", "サンプルレビュー", "Reseña de muestra"],
  "{n} out of 5 stars": ["5점 만점에 {n}점", "5 星中的 {n} 星", "5つ星中{n}", "{n} de 5 estrellas"],
  "Rated {r} out of 5 from {n} reviews": ["후기 {n}개, 평균 {r}점 (5점 만점)", "{n} 条评价，平均 {r} 分（满分 5 分）", "レビュー{n}件、平均{r}（5点満点）", "{r} de 5 según {n} reseñas"],
  "Chat with the demo host (automated)": ["데모 호스트와 채팅하기 (자동 답장)", "与演示接待聊天（自动回复）", "デモホストとチャット（自動返信）", "Chatea con el anfitrión de demo (automático)"],
  "Chat with the demo host": ["데모 호스트와 채팅", "与演示接待聊天", "デモホストとチャット", "Chatear con el anfitrión de demo"],
  "Reviews appear here after guests visit.": ["방문한 손님들의 후기가 여기에 표시돼요.", "客人到访后，评价会显示在这里。", "来店したお客さまのレビューがここに表示されます。", "Las reseñas aparecen aquí cuando los clientes visitan el estudio."],
  "Send a demo request": ["데모 요청 보내기", "发送演示请求", "デモリクエストを送る", "Enviar una solicitud de demo"],
  "Sample studio: the reply is automated and nothing is booked.": ["샘플 스튜디오: 답장은 자동이며 실제로 예약되지 않아요.", "示例工作室：自动回复，不会产生预约。", "サンプルスタジオ：返信は自動で、予約は発生しません。", "Estudio de muestra: la respuesta es automática y no se reserva nada."],
  // Request flow
  "Your demo request is in.": ["데모 요청을 보냈어요.", "演示请求已发送。", "デモリクエストを送信しました。", "Tu solicitud de demo está enviada."],
  "This sample studio replies automatically in about two minutes. Watch it change in My Journey. Nothing is booked and no payment is taken.": ["샘플 스튜디오가 약 2분 뒤 자동으로 답장해요. 내 여정에서 상태가 바뀌는 걸 확인해 보세요. 예약되거나 결제되는 것은 없어요.", "示例工作室会在约两分钟后自动回复。可在“我的行程”中查看状态变化。不会产生预约或付款。", "サンプルスタジオが約2分後に自動で返信します。マイジャーニーで状態が変わるのを確認してください。予約も支払いも発生しません。", "Este estudio de muestra responde automáticamente en unos dos minutos. Míralo cambiar en Mi viaje. No se reserva nada ni se cobra."],
  "This is a demo request. No real studio receives it: the sample studio replies automatically, and nothing is booked.": ["데모 요청이에요. 실제 스튜디오에는 전달되지 않고, 샘플 스튜디오가 자동으로 답장하며, 예약되는 것은 없어요.", "这是演示请求。不会发给真实工作室：示例工作室会自动回复，不会产生预约。", "これはデモリクエストです。実際のスタジオには届かず、サンプルスタジオが自動で返信し、予約は発生しません。", "Es una solicitud de demo. Ningún estudio real la recibe: el estudio de muestra responde automáticamente y no se reserva nada."],
  "Demo requests never collect payment.": ["데모 요청은 결제를 받지 않아요.", "演示请求不会收取任何费用。", "デモリクエストで支払いが発生することはありません。", "Las solicitudes de demo nunca cobran."],
  "You can cancel a demo request before the automated reply arrives.": ["자동 답장이 오기 전까지 데모 요청을 취소할 수 있어요.", "在收到自动回复前，您可以取消演示请求。", "自動返信が届く前ならデモリクエストを取り消せます。", "Puedes cancelar una solicitud de demo antes de que llegue la respuesta automática."],
  "Send demo request": ["데모 요청 보내기", "发送演示请求", "デモリクエストを送信", "Enviar solicitud de demo"],
  "Automated reply from a sample studio. Nothing is booked.": ["샘플 스튜디오의 자동 답장이에요. 예약되는 것은 없어요.", "示例工作室自动回复，不会产生预约。", "サンプルスタジオからの自動返信です。予約は発生しません。", "Respuesta automática de un estudio de muestra. No se reserva nada."],
  "Send a demo request to try the whole flow. The sample studio replies automatically and nothing is booked.": ["데모 요청을 보내 전체 과정을 체험해 보세요. 샘플 스튜디오가 자동으로 답장하며 예약되는 것은 없어요.", "发送演示请求来体验完整流程。示例工作室会自动回复，不会产生预约。", "デモリクエストを送って一連の流れを試してみてください。サンプルスタジオが自動で返信し、予約は発生しません。", "Envía una solicitud de demo para probar todo el proceso. El estudio de muestra responde automáticamente y no se reserva nada."],
  // Trips
  "Demo request": ["데모 요청", "演示请求", "デモリクエスト", "Solicitud de demo"],
  "The sample studio replies automatically in about two minutes": ["샘플 스튜디오가 약 2분 뒤 자동으로 답장해요", "示例工作室会在约两分钟后自动回复", "サンプルスタジオが約2分後に自動で返信します", "El estudio de muestra responde automáticamente en unos dos minutos"],
  "You’ll also get a notification": ["알림으로도 알려 드려요", "您也会收到通知", "通知でもお知らせします", "También recibirás una notificación"],
  "Demo request to a sample studio. The reply is automated, nothing is booked and no studio expects you.": ["샘플 스튜디오에 보낸 데모 요청이에요. 답장은 자동이며, 예약되지 않고 방문을 기다리는 스튜디오도 없어요.", "这是发给示例工作室的演示请求。自动回复，不会产生预约，也没有工作室在等您。", "サンプルスタジオへのデモリクエストです。返信は自動で、予約は発生せず、来店を待つスタジオもありません。", "Solicitud de demo a un estudio de muestra. La respuesta es automática, no se reserva nada y ningún estudio te espera."],
};

export default phrases;
