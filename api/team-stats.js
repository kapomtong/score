export default async function handler(req, res) {
  const key = process.env.API_FOOTBALL_KEY;
  const { teamId } = req.query;

  if (!teamId) {
    return res.status(400).json({ error: "ต้องระบุ teamId" });
  }
  if (!key) {
    return res.status(500).json({
      error: "ยังไม่ได้ตั้งค่า API_FOOTBALL_KEY ใน Environment Variables ของ Vercel",
    });
  }

  try {
    const url = `https://v3.football.api-sports.io/teams/statistics?league=1&season=2026&team=${teamId}`;
    const r = await fetch(url, {
      headers: { "x-apisports-key": key },
    });
    const data = await r.json();

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: data?.message || "เรียกสถิติทีมไม่สำเร็จ" });
    }

    const s = data.response;
    const played = s?.fixtures?.played?.total || 0;
    const goalsFor = s?.goals?.for?.total?.total || 0;
    const goalsAgainst = s?.goals?.against?.total?.total || 0;

    return res.status(200).json({
      teamName: s?.team?.name || "",
      played,
      avgScored: played ? +(goalsFor / played).toFixed(2) : 0,
      avgConceded: played ? +(goalsAgainst / played).toFixed(2) : 0,
      note:
        played < 3
          ? "ตัวอย่างข้อมูลน้อย (แข่งไปไม่กี่นัดในทัวร์นาเมนต์นี้) ความแม่นยำจึงจำกัด"
          : null,
    });
  } catch (e) {
    return res.status(500).json({ error: e.message || "เกิดข้อผิดพลาด" });
  }
}
