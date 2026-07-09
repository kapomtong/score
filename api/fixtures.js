export default async function handler(req, res) {
  const key = process.env.API_FOOTBALL_KEY;
  if (!key) {
    return res.status(500).json({
      error: "ยังไม่ได้ตั้งค่า API_FOOTBALL_KEY ใน Environment Variables ของ Vercel",
    });
  }

  try {
    // league=1 คือ FIFA World Cup, season=2026
    const url = `https://v3.football.api-sports.io/fixtures?league=1&season=2026&next=8`;
    const r = await fetch(url, {
      headers: { "x-apisports-key": key },
    });
    const data = await r.json();

    if (!r.ok) {
      return res
        .status(r.status)
        .json({ error: data?.message || "เรียก fixtures ไม่สำเร็จ" });
    }

    const matches = (data.response || []).map((f) => ({
      fixtureId: f.fixture.id,
      date: f.fixture.date,
      venue: f.fixture.venue?.name || "",
      round: f.league.round,
      homeId: f.teams.home.id,
      homeName: f.teams.home.name,
      homeLogo: f.teams.home.logo,
      awayId: f.teams.away.id,
      awayName: f.teams.away.name,
      awayLogo: f.teams.away.logo,
    }));

    return res.status(200).json({ matches });
  } catch (e) {
    return res.status(500).json({ error: e.message || "เกิดข้อผิดพลาด" });
  }
}
