import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
      const res = await fetch("https://nexa-2fnl.onrender.com/chat", {
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
          <span className="mark-core" />
        </div>
        <div>
          <h1>Nexa AI</h1>
        </div>
      </div>

      <div className="chat">
        {chat.length === 0 && !load && (
          <div className="empty-state">
            <div className="empty-mark">
              <span className="mark-core" />
            </div>
            <p>Tanya apa sahaja. Saya sedia bantu.</p>
          </div>
        )}

        {chat.map((c, i) => (
          <div key={i} className={`row row-${c.type}`}>
            <div className={c.type}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ node, inline, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const lang = match ? match[1] : "text";
                    const content = String(children).replace(/\n$/, "");
                    const key = `code-${i}-${node.position?.start.offset || i}`;

                    if (inline) {
                      return (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      );
                    }

                    return (
                      <div className="code-block-wrapper">
                        <div className="code-block-header">
                          <span className="code-lang">{lang}</span>
                          <button
                            className="copy-btn"
                            onClick={() => copyCode(content, key)}
                          >
                            {copiedIdx === key ? (
                              <>✓ Disalin!</>
                            ) : (
                              <>
                                <svg
                                  stroke="currentColor"
                                  fill="none"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  height="1em"
                                  width="1em"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                                  <rect
                                    x="8"
                                    y="2"
                                    width="8"
                                    height="4"
                                    rx="1"
                                    ry="1"
                                  ></rect>
                                </svg>
                                Salin
                              </>
                            )}
                          </button>
                        </div>
                        <div className="code-block-body">
                          <SyntaxHighlighter
                            language={lang}
                            style={oneDark}
                            PreTag="div"
                            codeTagProps={{
                              style: {
                                display: "block",
                                whiteSpace: "pre",
                                wordBreak: "normal",
                                overflowWrap: "normal",
                                fontStyle: "normal",
                              },
                            }}
                            customStyle={{
                              margin: 0,
                              padding: "16px",
                              fontSize: "13px",
                              lineHeight: "1.5",
                              backgroundColor: "transparent",
                            }}
                          >
                            {content}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    );
                  },
                }}
              >
                {c.text}
              </ReactMarkdown>
            </div>
          </div>
        ))}

        {load && (
          <div className="row row-ai">
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
