import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import DOMPurify from "dompurify";
import { Button } from "antd";

const ChatBot: React.FC = () => {
  const [messages, setMessages] = useState<
    { from: "user" | "bot"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { from: "user", content: input }]);

    try {
      const res = await axios.post("http://localhost:3000/chat-bot", {
        message: input,
      });

      const sanitizedContent = DOMPurify.sanitize(
        res.data.reply.replace(/```html|```/g, "").trim()
      );

      setMessages((prev) => [
        ...prev,
        { from: "bot", content: `${sanitizedContent}` },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          content: "❌ Lỗi khi phản hồi từ Gemini: " + error,
        },
      ]);
    }

    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <>
      {isVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 350,
            maxHeight: 500,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 8,
            padding: 10,
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <h4>💬 Hỏi ChatBot</h4>
            <Button
              size="small"
              onClick={() => setIsVisible(false)}
              style={{ fontWeight: "bold", border: "none" }}
              danger
            >
              X
            </Button>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "8px 0",
              marginBottom: 10,
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent:
                    msg.from === "user" ? "flex-end" : "flex-start",
                  marginBottom: 6,
                }}
              >
                {msg.from === "bot" && (
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "#d1e3ff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                      marginRight: 6,
                    }}
                  >
                    ☁️
                  </div>
                )}
                <div
                  style={{
                    maxWidth: "70%",
                    background: msg.from === "user" ? "#007bff" : "#f1f1f1",
                    color: msg.from === "user" ? "#fff" : "#000",
                    padding: "8px 12px",
                    borderRadius: 12,
                    whiteSpace: "pre-wrap",
                  }}
                  dangerouslySetInnerHTML={
                    msg.from === "bot" ? { __html: msg.content } : undefined
                  }
                >
                  {msg.from === "user" ? msg.content : null}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Gõ tin nhắn..."
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 15,
                border: "1px solid #ccc",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "8px 15px",
                borderRadius: 15,
                color: "white",
                backgroundColor: "blue",
                border: "0px",
              }}
            >
              Gửi
            </button>
          </div>
        </div>
      )}

      {!isVisible && (
        <div
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 50,
            height: 50,
            background: "#007bff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            zIndex: 9999,
            cursor: "pointer",
            color: "#fff",
            fontSize: 22,
          }}
          onClick={() => setIsVisible(true)}
        >
          💬
        </div>
      )}
    </>
  );
};

export default ChatBot;
