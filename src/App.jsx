import { useState, useRef, useEffect, useLayoutEffect, memo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./App.css";

const CodeBlock = memo(({ lang, content }) => {
  const [isCopied, setIsCopied] = useState(false);

  function copyCode() {
    navigator.clipboard.writeText(content).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 1500);
    });
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <span className="code-lang">{lang}</span>
        <div className="code-actions">
          <button className="copy-btn" onClick={copyCode} title="Salin Kod">
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
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
                Salin
              </>
            )}
          </button>
        </div>
      </div>
      <div className="code-block-body">
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          PreTag="div"
          wrapLongLines={true}
          codeTagProps={{
            style: {
              display: "inline-block",
              fontStyle: "normal",
              wordBreak: "break-word",
              whiteSpace: "pre-wrap",
              background: "transparent",
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
      </div>
    </div>
  );
});

function App() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [sessions, setSessions] = useState(() => {
    const saved = localStorage.getItem("nexa_chat_sessions");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("nexa_chat_sessions", JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, load]);

  function startNewChat() {
    if (chat.length > 0) {
      const newSession = {
        id: Date.now(),
        title: chat[0].text.substring(0, 30) + (chat[0].text.length > 30 ? "..." : ""),
        messages: chat,
        timestamp: new Date().toISOString(),
      };

      // Update history if current session exists, otherwise add new
      if (currentSessionId) {
        setSessions(prev => prev.map(s => s.id === currentSessionId ? newSession : s));
      } else {
        setSessions(prev => [newSession, ...prev]);
      }
    }
    setChat([]);
    setCurrentSessionId(null);
    setSidebarOpen(false);
  }

  function loadSession(s) {
    // Save current if needed
    if (chat.length > 0 && !currentSessionId) {
       const newSession = {
        id: Date.now(),
        title: chat[0].text.substring(0, 30) + (chat[0].text.length > 30 ? "..." : ""),
        messages: chat,
        timestamp: new Date().toISOString(),
      };
      setSessions(prev => [newSession, ...prev]);
    }

    setChat(s.messages);
    setCurrentSessionId(s.id);
    setSidebarOpen(false);
  }

  async function send() {
    if (!msg.trim() || load) return;

    const text = msg;
    const newMessages = [...chat, { type: "user", text }];

    setChat(newMessages);
    setMsg("");
    setLoad(true);
    setError(null);

    try {
      const historyForRequest = chat.map((m) => ({
        role: m.type === "user" ? "user" : "assistant",
        content: m.text,
      }));

      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyForRequest }),
      });

      if (!res.ok) throw new Error(`Server balas status ${res.status}`);
      const data = await res.json();
      const updatedMessages = [...newMessages, { type: "ai", text: data.answer }];

      setChat(updatedMessages);

      // Auto-save/update session in history
      if (currentSessionId) {
        setSessions(prev => prev.map(s =>
          s.id === currentSessionId ? { ...s, messages: updatedMessages } : s
        ));
      } else {
        // Create new session in history after first AI response
        const newId = Date.now();
        const newSession = {
          id: newId,
          title: text.substring(0, 30) + (text.length > 30 ? "..." : ""),
          messages: updatedMessages,
          timestamp: new Date().toISOString(),
        };
        setSessions(prev => [newSession, ...prev]);
        setCurrentSessionId(newId);
      }
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
    <div className={`app-container ${sidebarOpen ? "sidebar-visible" : ""}`}>
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={startNewChat}>
          <span>+</span> Chat Baru
        </button>

        <div className="history-section">
          <h3>History</h3>
          <div className="history-list">
            {sessions.length === 0 && <p className="empty-history">Tiada sejarah chat</p>}
            {sessions.map((s) => (
              <div
                key={s.id}
                className={`history-item ${currentSessionId === s.id ? "active" : ""}`}
                onClick={() => loadSession(s)}
              >
                <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                <span className="history-title">{s.title}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="app">
        <div className="top">
          <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
            ☰
          </button>
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
            <div className="ai nexa-loading">
              <div className="nexa-loader">
                <div className="nexa-blob"></div>
                <div className="nexa-blob"></div>
                <div className="nexa-blob"></div>
              </div>
              <span className="loading-text">Nexa sedang berfikir...</span>
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
    </div>
  );
}

export default App;
