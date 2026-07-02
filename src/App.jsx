import { useState, useRef, useEffect } from "react";
import "./App.css";

function App() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [load, setLoad] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chat, load]); 

  async function send() {
    if (!msg.trim()) return;

    let text = msg;

    setChat((prev) => [
      ...prev,
      {
        type: "user",
        text: text,
      },
    ]);

    setMsg("");
    setLoad(true);

    try {
      // URL telah diganti ke backend Render Anda
      const res = await fetch("https://fusionai-1.onrender.com/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await res.json();

      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: data.reply,
        },
      ]);
    } catch (error) {
      console.error("Gagal menghubungi server:", error);
      setChat((prev) => [
        ...prev,
        {
          type: "ai",
          text: "Maaf, terjadi kesalahan saat menghubungi server. Pastikan backend di Render sudah aktif.",
        },
      ]);
    } finally {
      setLoad(false);
    }
  }

  return (
    <div className="chat-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">⚡</span>
          <div>
            <h1>FusionAI</h1>
          </div>
        </div>
        <div className="sidebar-content">
          <p className="subtitle">Gemini + Groq Intelligence</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="mobile-header">
          <span className="logo-icon">⚡</span>
          <h1>FusionAI</h1>
        </header>

        <div className="chat-area">
          {chat.length === 0 && (
            <div className="empty-state">
              <h2>Halo! Saya FusionAI.</h2>
              <p>Ada yang bisa saya bantu hari ini?</p>
            </div>
          )}

          {chat.map((c, i) => (
            <div key={i} className={`message-wrapper ${c.type}`}>
              <div className="message-bubble">{c.text}</div>
            </div>
          ))}

          {load && (
            <div className="message-wrapper ai">
              <div className="message-bubble loading">
                AI sedang berfikir... 🤖
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <div className="input-box">
            <input
              className="chat-input"
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Tanya sesuatu..."
              disabled={load}
            />
            <button 
              className="send-button" 
              onClick={send} 
              disabled={!msg.trim() || load}
            >
              ➤
            </button>
          </div>
          <div className="disclaimer">
            FusionAI dapat membuat kesalahan. Harap periksa kembali informasi penting.
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;

