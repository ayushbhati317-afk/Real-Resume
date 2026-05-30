const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = Number(process.env.PORT || 3000);
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5.2";
const ROOT = __dirname;

const MASTER_PROMPT = `You are an intelligent AI assistant integrated into an ATS Resume Checker website.

Your purpose:
- Help users quickly and clearly
- Guide users through website features
- Answer questions accurately
- Assist with resume checking, job description generation, interview preparation, and real-world job search questions

Behavior rules:
- Be clear, concise, and helpful
- Avoid unnecessary long explanations unless user asks
- Use simple language
- If the user is confused, guide them step-by-step
- If you don't know something, say: "I'm not fully sure, but here's my best answer"

Interaction style:
- Friendly but professional
- Not overly casual, not robotic
- Avoid emojis unless the user uses them first

Website awareness:
- Assume you are inside a web app
- Help users navigate features even if they don't know how to use them
- Suggest next steps when useful
- If a user asks something unrelated to the website, still answer helpfully but briefly redirect to relevant features if possible

Special abilities:
- Help users upload and analyze resumes
- Explain resume scores and suggest improvements
- Guide users in using tools on this website
- Provide smart suggestions based on user input
- Help users create realistic job descriptions and prepare for real-world jobs

Safety rules:
- Do not generate harmful, illegal, or unsafe content
- Do not provide sensitive or misleading information
- Refuse politely if request is inappropriate

Response rules:
- Prefer short paragraphs or bullet points
- Focus on actionable answers
- Keep most answers within 2 to 5 short lines unless the user asks for detail
- Avoid repeating the same information

Context handling:
- Use previous messages if available to maintain context
- Do not contradict earlier responses

Goal:
Make the user feel the assistant is smart, fast, and genuinely helpful.`;

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  response.end(JSON.stringify(payload));
}

function readRequestJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON request."));
      }
    });
  });
}

function trimContext(context = {}) {
  return {
    page: "ATS Resume Checker",
    atsScore: context.atsScore ?? null,
    keywordScore: context.keywordScore ?? null,
    sectionScore: context.sectionScore ?? null,
    formatScore: context.formatScore ?? null,
    missingKeywords: Array.isArray(context.missingKeywords) ? context.missingKeywords.slice(0, 12) : [],
    resumeText: String(context.resumeText || "").slice(0, 6000),
    jobDescription: String(context.jobDescription || "").slice(0, 4000),
    jobTitle: String(context.jobTitle || "").slice(0, 120),
    jobLevel: String(context.jobLevel || "").slice(0, 80),
    keySkills: String(context.keySkills || "").slice(0, 400)
  };
}

function normalizeHistory(messages = []) {
  return messages
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 2000)
    }));
}

async function handleAssistant(request, response) {
  if (!OPENAI_API_KEY) {
    sendJson(response, 503, {
      error: "AI backend is not configured. Set OPENAI_API_KEY before starting the server."
    });
    return;
  }

  try {
    const payload = await readRequestJson(request);
    const context = trimContext(payload.context);
    const history = normalizeHistory(payload.messages);
    const latestMessage = String(payload.message || "").slice(0, 2000);

    const input = [
      {
        role: "user",
        content: `Website context:\n${JSON.stringify(context, null, 2)}`
      },
      ...history,
      {
        role: "user",
        content: latestMessage
      }
    ];

    const aiResponse = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions: MASTER_PROMPT,
        input,
        max_output_tokens: 450
      })
    });

    const data = await aiResponse.json();

    if (!aiResponse.ok) {
      sendJson(response, aiResponse.status, {
        error: data.error?.message || "AI request failed."
      });
      return;
    }

    sendJson(response, 200, {
      answer: data.output_text || "I'm not fully sure, but here's my best answer: please try asking again with a little more detail."
    });
  } catch (error) {
    sendJson(response, 500, {
      error: error.message || "Something went wrong, try again."
    });
  }
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const cleanPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
  const filePath = path.normalize(path.join(ROOT, cleanPath));

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  fs.readFile(filePath, (error, content) => {
    if (error) {
      response.writeHead(404);
      response.end("Not found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(content);
  });
}

const server = http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/assistant") {
    handleAssistant(request, response);
    return;
  }

  if (request.method === "GET") {
    serveStatic(request, response);
    return;
  }

  response.writeHead(405);
  response.end("Method not allowed");
});

server.listen(PORT, () => {
  console.log(`ATS Resume Checker running at http://localhost:${PORT}`);
});
