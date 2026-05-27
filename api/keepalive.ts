import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    return res.status(500).json({ error: "Missing Supabase env vars" });
  }

  const response = await fetch(`${url}/rest/v1/leaderboard?select=id&limit=1`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  return res.status(200).json({ ok: response.ok, status: response.status, ts: new Date().toISOString() });
}
