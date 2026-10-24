// Live interpretation (/live-translation) strings added in the ST v2 redesign.
const phrases: Record<string, readonly [string, string, string, string]> = {
  "Live interpretation": ["실시간 통역", "实时口译", "リアルタイム通訳", "Interpretación en vivo"],
  "End": ["종료", "结束", "終了", "Terminar"],
  "Spoken in Korean": ["한국어로 말함", "用韩语说", "韓国語で発話", "Dicho en coreano"],
  "You · spoken in {language}": ["나 · {language}로 말함", "你 · 用{language}说", "あなた · {language}で発話", "Tú · dicho en {language}"],
  "Translation": ["번역", "翻译", "翻訳", "Traducción"],
  "Translating…": ["번역 중…", "翻译中…", "翻訳中…", "Traduciendo…"],
  "No translation came back for this turn.": ["이 발화는 번역되지 않았어요.", "这一句没有返回译文。", "この発話の翻訳は返ってきませんでした。", "No llegó traducción para este turno."],
  "Listening…": ["듣고 있어요…", "正在聆听…", "聞き取っています…", "Escuchando…"],
  "Speaking the translation…": ["번역을 들려주고 있어요…", "正在播报译文…", "翻訳を読み上げています…", "Reproduciendo la traducción…"],
  "Listening · speak in Korean or {language}": ["듣는 중 · 한국어나 {language}로 말해 주세요", "聆听中 · 请说韩语或{language}", "待機中 · 韓国語か{language}で話してください", "Escuchando · habla en coreano o {language}"],
  "Session ended. The transcript stays until you leave this page.": ["세션이 끝났어요. 대화 기록은 이 페이지를 떠나기 전까지 남아 있어요.", "会话已结束。离开此页面前，记录会一直保留。", "セッションを終了しました。このページを離れるまで記録は残ります。", "La sesión terminó. La transcripción se queda hasta que salgas de esta página."],
  "Tap to start": ["눌러서 시작", "点按开始", "タップして開始", "Toca para empezar"],
  "Tap to stop": ["눌러서 중지", "点按停止", "タップして停止", "Toca para detener"],
  "Speech is sent to OpenAI for live translation. The transcript stays on this screen and clears when you leave.": [
    "실시간 번역을 위해 음성이 OpenAI로 전송돼요. 대화 기록은 이 화면에만 남고 페이지를 떠나면 지워져요.",
    "语音会发送至 OpenAI 进行实时翻译。记录只保留在此屏幕上，离开后即清除。",
    "リアルタイム翻訳のため音声は OpenAI に送信されます。記録はこの画面にのみ残り、離れると消去されます。",
    "Tu voz se envía a OpenAI para la traducción en vivo. La transcripción solo queda en esta pantalla y se borra al salir.",
  ],
  "Sign in to start live interpretation.": ["실시간 통역을 시작하려면 로그인하세요.", "请登录后开始实时口译。", "リアルタイム通訳を始めるにはログインしてください。", "Inicia sesión para empezar la interpretación en vivo."],
  "Live interpretation is unavailable right now. Please try again later.": ["지금은 실시간 통역을 사용할 수 없어요. 잠시 후 다시 시도해 주세요.", "实时口译暂时无法使用，请稍后再试。", "現在リアルタイム通訳はご利用いただけません。しばらくしてからもう一度お試しください。", "La interpretación en vivo no está disponible ahora. Inténtalo más tarde."],
  // Recovery, retention and measurement (review feedback)
  "Connection dropped. Reconnecting ({n} of 3)…": ["연결이 끊겼어요. 다시 연결하는 중 ({n}/3)…", "连接中断，正在重新连接（{n}/3）…", "接続が切れました。再接続しています（{n}/3）…", "Se perdió la conexión. Reconectando ({n} de 3)…"],
  "Session ended. The transcript stays in this tab until you close it or clear it.": ["세션이 끝났어요. 대화 기록은 이 탭을 닫거나 지우기 전까지 남아 있어요.", "会话已结束。对话记录会保留在此标签页中，直到您关闭或清除。", "セッションが終了しました。会話の記録はこのタブを閉じるか消去するまで残ります。", "La sesión terminó. La transcripción queda en esta pestaña hasta que la cierres o la borres."],
  "Response time: typical {a}s · slowest 5% {b}s ({n} turns)": ["응답 시간: 보통 {a}초 · 가장 느린 5% {b}초 ({n}회)", "响应时间：通常 {a} 秒 · 最慢 5% {b} 秒（{n} 轮）", "応答時間：通常 {a}秒 · 最も遅い5% {b}秒（{n}回）", "Tiempo de respuesta: normal {a} s · 5 % más lento {b} s ({n} turnos)"],
  "Audio is never saved. Speech goes to OpenAI only to translate it. The text stays in this browser tab until you close the tab or clear it.": ["음성은 저장하지 않아요. 음성은 번역을 위해서만 OpenAI로 전송돼요. 텍스트는 탭을 닫거나 지우기 전까지 이 브라우저 탭에만 남아요.", "音频从不保存。语音仅为翻译而发送给 OpenAI。文字只保留在此浏览器标签页中，直到您关闭或清除。", "音声は保存しません。音声は翻訳のためだけに OpenAI に送られます。テキストはタブを閉じるか消去するまで、このブラウザタブにのみ残ります。", "El audio nunca se guarda. La voz se envía a OpenAI solo para traducirla. El texto queda en esta pestaña del navegador hasta que la cierres o lo borres."],
  "Clear conversation": ["대화 지우기", "清除对话", "会話を消去", "Borrar conversación"],
  "You’ve started many sessions in a short time. Please wait a few minutes and try again.": ["짧은 시간에 세션을 여러 번 시작했어요. 몇 분 뒤에 다시 시도해 주세요.", "您在短时间内开启了多次会话，请等几分钟后再试。", "短時間に何度もセッションを開始しました。数分後にもう一度お試しください。", "Has iniciado muchas sesiones en poco tiempo. Espera unos minutos e inténtalo de nuevo."],
  "The connection was lost. Your conversation is saved in this tab. Tap the microphone to start again.": ["연결이 끊겼어요. 대화는 이 탭에 저장되어 있어요. 마이크를 눌러 다시 시작하세요.", "连接已断开。对话已保存在此标签页中，点击麦克风重新开始。", "接続が切れました。会話はこのタブに保存されています。マイクをタップして再開してください。", "Se perdió la conexión. Tu conversación está guardada en esta pestaña. Toca el micrófono para empezar de nuevo."],
};

export default phrases;
