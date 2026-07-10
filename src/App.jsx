import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [sessions, setSessions] = useState([{ id: 1, chat: [] }]);
  const [activeSessionId, setActiveSessionId] = useState(1);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [copiedIdx, setCopiedIdx] = useState(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const chatEndRef = useRef(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];
  const chat = activeSession.chat;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, load]);

  async function send() {
    if (!msg.trim() || load) return;

    const text = msg;
    const historyForRequest = chat.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text,
    }));

    const newUserMsg = { type: "user", text };

    setSessions(prev => prev.map(s =>
      s.id === activeSessionId ? { ...s, chat: [...s.chat, newUserMsg] } : s
    ));

    setMsg("");
    setLoad(true);
    setError(null);

    try {
      const res = await fetch("https://nexa-2fnl.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyForRequest }),
      });

      if (!res.ok) throw new Error(`Server balas status ${res.status}`);
      const data = await res.json();

      setSessions(prev => prev.map(s =>
        s.id === activeSessionId ? { ...s, chat: [...s.chat, { type: "ai", text: data.answer }] } : s
      ));
    } catch (err) {
      setError("Gagal hubungi server. Cuba refresh.");
      setSessions(prev => prev.map(s =>
        s.id === activeSessionId ? { ...s, chat: [...s.chat, { type: "ai", text: "⚠️ Maaf, saya tak dapat balas sekarang." }] } : s
      ));
      console.error(err);
    } finally {
      setLoad(false);
    }
  }

  function createNewChat() {
    const newId = Date.now();
    setSessions(prev => [{ id: newId, chat: [] }, ...prev]);
    setActiveSessionId(newId);
    setSidebarVisible(false);
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

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const lang = match ? match[1] : "text";
      const content = String(children).replace(/\n$/, "");
      const key = node.position ? `${node.position.start.line}-${node.position.start.column}` : Math.random().toString();

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
            <button className="copy-btn" onClick={() => copyCode(content, key)}>
              {copiedIdx === key ? "Disalin!" : "Salin"}
            </button>
          </div>
          <div className="code-block-body">
            <SyntaxHighlighter
              language={lang}
              style={oneDark}
              customStyle={{
                margin: 0,
                borderRadius: "0 0 10px 10px",
                padding: "15px",
                fontSize: "12.5px",
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
              }}
              codeTagProps={{
                style: {
                  whiteSpace: "pre-wrap",
                  overflowWrap: "break-word",
                },
              }}
            >
              {content}
            </SyntaxHighlighter>
          </div>
        </div>
      );
    },
  };

  return (
    <div className={`app-container ${sidebarVisible ? "sidebar-visible" : ""}`}>
      <aside className="sidebar">
        <button className="new-chat-btn" onClick={createNewChat}>
          <span>+</span> New Chat
        </button>
        <div className="history-section">
          <h3>History</h3>
          <div className="history-list">
            {sessions.map(s => (
              <div
                key={s.id}
                className={`history-item ${s.id === activeSessionId ? "active" : ""}`}
                onClick={() => { setActiveSessionId(s.id); setSidebarVisible(false); }}
              >
                <div className="history-title">
                  {s.chat.length > 0 ? s.chat[0].text : "Empty Chat"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      <div className="app">
        <header className="top">
          <button className="menu-toggle" onClick={() => setSidebarVisible(!sidebarVisible)}>
            ☰
          </button>
          <div className="mark">
            <div className="mark-core" />
          </div>
          <div>
            <h1>Nexa</h1>
            <p>Auto Multi AI Agent</p>
          </div>
        </header>

        <main className="chat">
          {chat.length === 0 && !load && (
            <div className="empty-state">
              <div className="empty-mark">
                <div className="mark-core" />
              </div>
              <p>Tanya apa sahaja. Saya sedia bantu.</p>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} className={`row row-${c.type}`}>
              <div className={c.type}>
                {c.type === "ai" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                    {c.text}
                  </ReactMarkdown>
                ) : (
                  <p className="msg-text">{c.text}</p>
                )}
              </div>
            </div>
          ))}

          {load && (
            <div className="row row-ai">
              <div className="ai">
                <div className="nexa-loading">
                  <div className="nexa-loader">
                    <div className="nexa-blob" />
                    <div className="nexa-blob" />
                    <div className="nexa-blob" />
                  </div>
                  <span className="loading-text">Nexa sedang berfikir...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </main>

        {error && <div className="error-banner">{error}</div>}

        <footer className="inputBox">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tanya sesuatu..."
            disabled={load}
          />
          <button className="send-btn" onClick={send} disabled={load || !msg.trim()} aria-label="Hantar">
            ➤
          </button>
        </footer>
      </div>
    </div>
  );
}

export default App;
