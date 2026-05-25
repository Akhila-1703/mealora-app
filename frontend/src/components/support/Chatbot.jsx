import React, { useState } from "react";

import { card, input, primaryBtn } from "../../styles/common";

const ChatBot = () => {
  const [messages, setMessages] = useState([
    { text: "Hi! How can I help you?", type: "bot" },
  ]);
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (!inputText) return;

    const userMsg = { text: inputText, type: "user" };

    let botReply = "I didn’t understand. Try asking about wallet, skip, or subscription.";

    if (inputText.toLowerCase().includes("wallet")) {
      botReply = "Go to Wallet page to add money.";
    } else if (inputText.toLowerCase().includes("skip")) {
      botReply = "Use Skip Meals page to skip your meals.";
    } else if (inputText.toLowerCase().includes("subscription")) {
      botReply = "Manage subscription in Subscription page.";
    }

    const botMsg = { text: botReply, type: "bot" };

    setMessages([...messages, userMsg, botMsg]);
    setInputText("");
  };

  return (
    <div className={`${card} flex flex-col h-[400px]`}>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-2 text-sm">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`px-3 py-2 rounded-lg w-fit ${
              msg.type === "user"
                ? "bg-green-100 self-end"
                : "bg-gray-100"
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className={input}
          placeholder="Ask something..."
        />
        <button onClick={handleSend} className={primaryBtn}>
          Send
        </button>
      </div>

    </div>
  );
};

export default ChatBot;