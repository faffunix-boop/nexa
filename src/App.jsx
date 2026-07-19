import { useState, useRef, useEffect } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { okaidia } from "react-syntax-highlighter/dist/esm/styles/prism";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./App.css";

function CodeBlock({ lang, content }) {
  const [activeTab, setActiveTab] = useState("kod");
  const [copied, setCopied] = useState(false);

  const canPreview = ["html", "xml", "svg", "htm"].includes(lang.toLowerCase()) ||
    content.trim().startsWith("<!DOCTYPE") ||
    content.trim().startsWith("<html") ||
    content.trim().startsWith("<div") ||
    content.trim().startsWith("<svg");

  function copyToClipboard() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="code-block-wrapper">
      <div className="code-block-header">
        <button className="close-btn-mock" aria-label="Tutup">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {canPreview ? (
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === "kod" ? "active" : ""}`}
              onClick={() => setActiveTab("kod")}
            >
              Kod
            </button>
            <button
              className={`tab-btn ${activeTab === "pratonton" ? "active" : ""}`}
              onClick={() => setActiveTab("pratonton")}
            >
              Pratonton
            </button>
          </div>
        ) : (
          <span className="code-lang">{lang}</span>
        )}
        <button className="copy-btn-chatgpt" onClick={copyToClipboard} aria-label="Salin">
          {copied ? (
            <span className="copied-text">Disalin!</span>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
          )}
        </button>
      </div>
      <div className="code-block-body">
        {activeTab === "pratonton" && canPreview ? (
          <div className="preview-container">
            <iframe
              title="Pratonton"
              srcDoc={content}
              sandbox="allow-scripts"
              className="preview-iframe"
            />
          </div>
        ) : (
          <SyntaxHighlighter
            language={lang}
            style={okaidia}
            wrapLongLines={true}
            customStyle={{
              margin: 0,
              borderRadius: "0",
              padding: "16px 20px",
              fontSize: "13px",
              lineHeight: "1.6",
              background: "#0d0d0d",
              whiteSpace: "pre-wrap",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            codeTagProps={{
              style: {
                whiteSpace: "pre-wrap",
                overflowWrap: "anywhere",
                wordBreak: "break-word",
                fontFamily: '"JetBrains Mono", monospace',
              },
            }}
          >
            {content}
          </SyntaxHighlighter>
        )}
      </div>
    </div>
  );
}

function App() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [load, setLoad] = useState(false);
  const [error, setError] = useState(null);
  const [statusText, setStatusText] = useState("Nexa sedang berfikir...");
  const chatEndRef = useRef(null);

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

    setChat((prev) => [...prev, { type: "user", text }]);
    setMsg("");
    setLoad(true);
    setStatusText("Nexa sedang berfikir...");
    setError(null);

    try {
      const res = await fetch("/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: text, history: historyForRequest }),
      });

      if (!res.ok || !res.body) throw new Error(`Server balas status ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finalAnswer = null;
      let serverError = null;
      const processLog = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop();

        for (const part of parts) {
          if (!part.startsWith("data: ")) continue;
          const data = JSON.parse(part.slice(6));

          if (data.type === "status") {
            setStatusText(data.text);
            processLog.push(data.text);
          } else if (data.type === "answer") {
            finalAnswer = data.text;
          } else if (data.type === "error") {
            serverError = data.text;
          }
        }
      }

      if (serverError) throw new Error(serverError);
      if (finalAnswer === null) throw new Error("Tiada jawapan diterima.");

      setChat((prev) => [...prev, { type: "ai", text: finalAnswer, process: processLog }]);
    } catch (err) {
      setError("Gagal hubungi server. Cuba refresh.");
      setChat((prev) => [...prev, { type: "ai", text: "⚠️ Maaf, saya tak dapat balas sekarang." }]);
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

  const MarkdownComponents = {
    code({ node, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const isInline = !match;
      const lang = match ? match[1] : "text";
      const content = String(children).replace(/\n$/, "");

      if (isInline) {
        return (
          <code className="inline-code" {...props}>
            {children}
          </code>
        );
      }

      return <CodeBlock lang={lang} content={content} />;
    },
  };

  return (
    <div className="app-container">
      <div className="app">
        <header className="top">
          <div className="mark">
            <div className="mark-core" />
          </div>
          <div>
            <h1>Nexa</h1>
            <p>Powered by Multiple AI</p>
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
                  <span className="loading-text">{statusText}</span>
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