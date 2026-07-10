import { useState, useRef, useEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";

const CodeBlock = memo(({ lang, content }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const codeRef = useRef(null);
  const [shouldShowExpand, setShouldShowExpand] = useState(false);

  useEffect(() => {
    if (codeRef.current) {
      const height = codeRef.current.scrollHeight;
      if (height > 300) {
        setShouldShowExpand(true);
      } else {
        setShouldShowExpand(false);
        setIsExpanded(false);
      }
    }
  }, [content]);

  function copyCode() {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(null), 1500);
    });
  }

  const isCollapsed = shouldShowExpand && !isExpanded;

  return (
    <div className={`code-block-wrapper ${isCollapsed ? "collapsed" : ""}`}>
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <div className="code-actions">
          <button
            className="copy-btn"
            onClick={copyCode}
            title="Salin Kod"
          >
            {isCopied ? (
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
          {shouldShowExpand && (
            <button
              className="expand-toggle-btn"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Kecilkan" : "Besarkan"}
            >
              {isExpanded ? (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="4 14 10 14 10 20"></polyline><polyline points="20 10 14 10 14 4"></polyline><line x1="14" y1="10" x2="21" y2="3"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              ) : (
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><polyline points="15 3 21 3 21 9"></polyline><polyline points="9 21 3 21 3 15"></polyline><line x1="21" y1="3" x2="14" y2="10"></line><line x1="3" y1="21" x2="10" y2="14"></line></svg>
              )}
            </button>
          )}
        </div>
      </div>
      <div
        className="code-block-body"
        ref={codeRef}
        style={isCollapsed ? { maxHeight: '300px', overflow: 'hidden' } : {}}
      >
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          PreTag="div"
          wrapLongLines={true}
          codeTagProps={{
            style: {
              display: "block !important",
              fontStyle: "normal",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            },
          }}
          customStyle={{
            margin: 0,
            padding: "16px",
            fontSize: "13px",
            lineHeight: "1.5",
            backgroundColor: "#0d0d0d",
          }}
        >
          {content}
        </SyntaxHighlighter>
        {isCollapsed && (
          <div className="code-expand-overlay" onClick={() => setIsExpanded(true)}>
            <button className="show-more-btn">Tunjuk lagi</button>
          </div>
        )}
      </div>
    </div>
  );
});

function App() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
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
                  code({ node, className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const content = String(children).replace(/\n$/, "");

                    // If no language match and no newline in content, assume it's inline
                    if (!match && !content.includes('\n')) {
                      return (
                        <code className="inline-code" {...props}>
                          {children}
                        </code>
                      );
                    }

                    return <CodeBlock lang={match ? match[1] : "text"} content={content} />;
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
