export default async function handler(req, res) {
  const q = req.query.q;
  if (!q) {
    return res.status(400).json({ error: "ต้องระบุคำค้นหา (q)" });
  }

  const key = process.env.GOOGLE_SEARCH_KEY;
  const cx = process.env.GOOGLE_SEARCH_CX;

  if (!key || !cx) {
    return res.status(500).json({
      error: "ยังไม่ได้ตั้งค่า GOOGLE_SEARCH_KEY / GOOGLE_SEARCH_CX ใน Environment Variables ของ Vercel",
    });
  }

  try {
    const url = `https://www.googleapis.com/customsearch/v1?key=${key}&cx=${cx}&q=${encodeURIComponent(
      q
    )}`;
    const r = await fetch(url);
    const data = await r.json();

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: data?.error?.message || "เรียก Google Search ไม่สำเร็จ" });
    }

    // ส่งกลับเฉพาะข้อมูลที่จำเป็น ไม่ส่ง key กลับไปให้ฝั่งเบราว์เซอร์
    const items = (data.items || []).slice(0, 5).map((item) => ({
      title: item.title,
      snippet: item.snippet,
      link: item.link,
    }));

    return res.status(200).json({ items });
  } catch (e) {
    return res.status(500).json({ error: e.message || "เกิดข้อผิดพลาด" });
  }
}
