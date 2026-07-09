export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "ต้องใช้ POST เท่านั้น" });
  }

  const key = process.env.GEMINI_KEY;
  if (!key) {
    return res.status(500).json({
      error: "ยังไม่ได้ตั้งค่า GEMINI_KEY ใน Environment Variables ของ Vercel",
    });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: "ต้องระบุ prompt" });
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    const data = await r.json();

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: data?.error?.message || "เรียก Gemini ไม่สำเร็จ" });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "ไม่ได้รับคำตอบจากโมเดล";

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || "เกิดข้อผิดพลาด" });
  }
}
