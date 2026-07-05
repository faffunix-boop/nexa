import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, load]);

  async function send() {
    // Guard: kosong ATAU sedang loading -> tak boleh hantar (elak double-send)
    if (!msg.trim() || load) return;

    const text = msg;
    const historyForRequest = chat.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text,
    }));

    setChat((prev) => [...prev, { type: "user", text }]);
    setMsg("");
    setLoad(true);
    setError(null);

    try {
      const res = await fetch("https://fusionai-3.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyForRequest }),
      });

      if (!res.ok) {
        throw new Error(`Server balas status ${res.status}`);
      }

      const data = await res.json();

      setChat((prev) => [...prev, { type: "ai", text: data.answer }]);
    } catch (err) {
      // Fix: sebelum ni kalau fetch gagal, loading akan stuck selama-lamanya
      setError("Gagal hubungi server. Cuba refresh — server mungkin baru 'bangun' dari sleep.");
      setChat((prev) => [
        ...prev,
        { type: "ai", text: "⚠️ Maaf, saya tak dapat balas sekarang. Sila cuba lagi." },
      ]);
      console.error(err);
    } finally {
      setLoad(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function parseMessage(text) {
    const regex = /```(\w*)\n?([\s\S]*?)```/g;
    const segments = [];
    let lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ type: "text", content: text.slice(lastIndex, match.index) });
      }
      segments.push({ type: "code", lang: match[1] || "text", content: match[2] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ type: "text", content: text.slice(lastIndex) });
    }
    return segments;
  }

  function copyCode(content, key) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(key);
      setTimeout(() => setCopiedIdx(null), 1500);
    });
  }

  return (
    <div className="app">
      <div className="top">
        <div className="mark">
          <span className="mark-cyan" />
          <span className="mark-coral" />
        </div>
        <div>
          <h1>FusionAI</h1>
          <p>Gemini Intelligence</p>
        </div>
      </div>

      <div className="chat">
        {chat.length === 0 && !load && (
          <div className="empty-state">
            <div className="empty-mark">
              <span className="mark-cyan" />
              <span className="mark-coral" />
            </div>
            <p>Tanya apa sahaja. Saya sedia bantu.</p>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className={`row row-${c.type}`}>
            {c.type === "ai" && (
              <span className="msg-mark">
                <span className="mark-cyan" />
                <span className="mark-coral" />
              </span>
            )}
            <div className={c.type}>
              {c.text &&
                parseMessage(c.text).map((seg, idx) => {
                  const key = `${i}-${idx}`;
                  return seg.type === "code" ? (
                    <div key={key} className="code-block-wrapper">
                      <div className="code-block-header">
                        <span className="code-lang">{seg.lang}</span>
                        <button
                          className="copy-btn"
                          onClick={() => copyCode(seg.content, key)}
                        >
                          {copiedIdx === key ? "Disalin!" : "Salin"}
                        </button>
                      </div>
                      <SyntaxHighlighter
                        language={seg.lang}
                        style={oneDark}
                        wrapLongLines={true}
                        customStyle={{
                          margin: 0,
                          borderRadius: "0 0 10px 10px",
                          fontSize: "12.5px",
                        }}
                      >
                        {seg.content}
                      </SyntaxHighlighter>
                    </div>
                  ) : (
                    seg.content.trim() && (
                      <p key={key} className="msg-text">
                        {seg.content}
                      </p>
                    )
                  );
                })}
            </div>
          </div>
        ))}

        {load && (
          <div className="row row-ai">
            <span className="msg-mark">
              <span className="mark-cyan" />
              <span className="mark-coral" />
            </span>
            <div className="ai typing">
              <span className="typing-label">AI sedang berfikir</span>
              <span className="core" />
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {error && <div className="error-banner">{error}</div>}

      <div className="inputBox">
        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tanya sesuatu..."
          disabled={load}
        />
        <button onClick={send} disabled={load || !msg.trim()} aria-label="Hantar">
          ➤
        </button>
      </div>
    </div>
  );
}

export default App;
