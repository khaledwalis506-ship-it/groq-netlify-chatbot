// script.js
// Calls Netlify serverless function at /.netlify/functions/chat

const API_PATH = "/.netlify/functions/chat"; // Netlify function URL

const chatBox = document.getElementById("chat-box");
const inputEl = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

function appendMessage(text, who="bot") {
  const div = document.createElement("div");
  div.className = "message " + (who === "user" ? "user" : "bot");
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const msg = inputEl.value.trim();
  if (!msg) return;
  appendMessage(msg, "user");
  inputEl.value = "";
  // placeholder while waiting
  const placeholder = document.createElement("div");
  placeholder.className = "message bot";
  placeholder.textContent = "Thinking...";
  chatBox.appendChild(placeholder);
  chatBox.scrollTop = chatBox.scrollHeight;

  try {
    const res = await fetch(API_PATH, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: msg })
    });

    const json = await res.json();
    const reply = json?.reply ?? (json?.error ? `Error: ${json.error}` : "No reply.");
    placeholder.textContent = reply;
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) {
    placeholder.textContent = "Network error: " + err.message;
  }
}

sendBtn.addEventListener("click", sendMessage);
inputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMessage();
});
