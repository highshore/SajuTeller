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
};

export default phrases;
