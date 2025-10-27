// functions/chat.js
// Node 18 runtime in Netlify: global fetch is available.
// This function proxies the user's message to Groq API and returns the assistant text.

exports.handler = async function (event, context) {
  try {
    if (event.httpMethod !== "POST") {
      return { statusCode: 405, body: "Method Not Allowed" };
    }

    const body = JSON.parse(event.body || "{}");
    const userMessage = body.message ?? "";

    // Use environment variable if present; otherwise fall back to a hardcoded test key (not recommended).
    const GROQ_API_KEY = process.env.GROQ_API_KEY || "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";

    if (!GROQ_API_KEY) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Groq API key not configured" })
      };
    }

    const payload = {
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: "You are a helpful website assistant." },
        { role: "user", content: userMessage }
      ],
      temperature: 1,
      max_tokens: 512
    };

    const resp = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return { statusCode: 502, body: `Upstream error: ${resp.status} ${text}` };
    }

    const data = await resp.json();

    const reply = data?.choices?.[0]?.message?.content ?? "";

    return {
      statusCode: 200,
      body: JSON.stringify({ reply })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || String(err) })
    };
  }
};
