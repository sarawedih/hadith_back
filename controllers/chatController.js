const axios = require('axios');

// ❗️تخزين الجلسات لكل مستخدم في الذاكرة (مؤقتًا)
const userSessions = {};

exports.askGroq = async (req, res) => {
  const userMessage = req.body.message;
  const userId = req.body.userId || "default_user"; // إذا لم يُرسل userId نستخدم قيمة افتراضية

  if (!userSessions[userId]) {
    userSessions[userId] = [
        { role: 'system', content: 'أنت مساعد ذكي متخصص في الأحاديث والسيرة. تتحدث فقط باللغة العربية الفصحى. لا تستخدم أي لغة أخرى مهما كانت مثل الإنجليزية أو الفرنسية أو الإسبانية أو الرموز. أي رد بلغة غير العربية يعتبر غير مقبول.'}

    ];
  }

  // 🟣 أضف رسالة المستخدم إلى سجل الجلسة
  userSessions[userId].push({ role: 'user', content: userMessage });

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama3-8b-8192',
        temperature: 0.1,
        messages: userSessions[userId], // ⬅️ كل سجل المحادثة
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer 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`,
        },
      }
    );

    const botReply = response.data.choices[0].message.content;

    // 🟢 أضف رد المساعد إلى الجلسة
    userSessions[userId].push({ role: 'assistant', content: botReply });

    res.json({ reply: botReply });
  } catch (error) {
    console.error(error.message);
    res
      .status(500)
      .json({ reply: 'حدث خطأ أثناء الاتصال بالذكاء الاصطناعي.' });
  }
};
