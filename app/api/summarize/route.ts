import { NextResponse } from "next/server";

// Free tier model from Google AI Studio. Swap here if you want a different one.
const GEMINI_MODEL = "gemini-2.5-flash";

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return match ? match[1].trim() : null;
}

function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Gemini API key not configured on the server." },
      { status: 500 }
    );
  }

  let body: { url?: string; text?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const { url, text } = body;
  let content = (text ?? "").trim();
  let title = "Pasted text";
  let source: string | null = null;

  if (url) {
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; AmbientDashboard/1.0)" },
      });
      if (!res.ok) throw new Error(`status ${res.status}`);
      const html = await res.text();
      title = extractTitle(html) ?? new URL(url).hostname;
      source = url;
      content = htmlToText(html).slice(0, 20000);
    } catch {
      return NextResponse.json(
        { error: "Could not fetch that URL. Try pasting the text instead." },
        { status: 400 }
      );
    }
  }

  if (!content) {
    return NextResponse.json({ error: "Nothing to summarize." }, { status: 400 });
  }

  const prompt = `You are a concise research assistant for a data scientist. Summarize the content below into clear bullet points capturing the key ideas, methods, results, and practical takeaways. Keep it under 180 words. Use "- " for each bullet.\n\nCONTENT:\n${content}`;

  let geminiRes: Response;
  try {
    geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );
  } catch {
    return NextResponse.json({ error: "Could not reach Gemini." }, { status: 502 });
  }

  if (!geminiRes.ok) {
    return NextResponse.json(
      { error: "Gemini request failed. Check your API key and quota." },
      { status: 502 }
    );
  }

  const data = await geminiRes.json();
  const summary: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";

  if (!summary) {
    return NextResponse.json({ error: "Gemini returned an empty summary." }, { status: 502 });
  }

  return NextResponse.json({ title, source, summary });
}
