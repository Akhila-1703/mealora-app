import React, { useState } from "react";

import {
  card,
  heading,
  subText,
  input,
  primaryBtn,
} from "../../styles/common";

const faqs = [
  {
    q: "How do I skip a meal?",
    a: "Go to Skip Meals page, select the date and confirm skip before cutoff time.",
  },
  {
    q: "When is my tiffin delivered?",
    a: "Lunch: 12 PM - 2 PM | Dinner: 7 PM - 9 PM depending on your location.",
  },
  {
    q: "How do I add money to wallet?",
    a: "Go to Wallet page and click on Add Money.",
  },
  {
    q: "Can I pause my subscription?",
    a: "Yes, you can pause anytime from Subscription page.",
  },
  {
    q: "What is the cancellation policy?",
    a: "You can cancel anytime. Refunds depend on remaining balance.",
  },
];

const Support = () => {
  const [message, setMessage] = useState("");
  const [activeIndex, setActiveIndex] = useState(null);

  const handleSend = () => {
    if (!message.trim()) return;

    alert("AI response coming soon...");
    setMessage("");
  };

  const toggleFAQ = (index) => {
    setActiveIndex(index === activeIndex ? null : index);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <div>
        <h1 className={heading}>Support</h1>
        <p className={subText}>
          Get help from our AI assistant or browse FAQs
        </p>
      </div>

      {/* ================= AI CHAT ================= */}
      <div className={card}>
        <h2 className="font-semibold mb-3">🤖 AI Support Chat</h2>

        {/* Chat bubble */}
        <div className="bg-gray-100 p-3 rounded-xl text-sm text-gray-700 w-fit">
          Hi there! 👋 I'm your assistant. How can I help you today?
        </div>

        {/* Input */}
        <div className="flex gap-2 mt-4">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your question..."
            className={`${input} flex-1`}
          />

          <button onClick={handleSend} className={primaryBtn}>
            Send
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {["How to skip meal?", "Add money to wallet", "Delivery timings"].map(
            (item, i) => (
              <button
                key={i}
                onClick={() => setMessage(item)}
                className="px-3 py-1 border rounded-full text-xs hover:bg-gray-100"
              >
                {item}
              </button>
            )
          )}
        </div>
      </div>

      {/* ================= FAQ ================= */}
      <div className={card}>
        <h2 className="font-semibold mb-3">Frequently Asked Questions</h2>

        <div className="divide-y">
          {faqs.map((faq, index) => (
            <div key={index} className="py-3">
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <p className="text-sm font-medium">{faq.q}</p>
                <span className="text-lg">
                  {activeIndex === index ? "-" : "+"}
                </span>
              </div>

              {activeIndex === index && (
                <p className="text-sm text-gray-500 mt-2">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ================= CONTACT ================= */}
      <div className={card}>
        <h2 className="font-semibold mb-3">Contact Us</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Email */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xl">📧</p>
            <p className="text-sm mt-2 text-gray-500">Email</p>
            <p className="font-medium">support@yourapp.com</p>
          </div>

          {/* Phone */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xl">📞</p>
            <p className="text-sm mt-2 text-gray-500">Phone</p>
            <p className="font-medium">1800-123-4567</p>
          </div>

          {/* Hours */}
          <div className="bg-gray-50 rounded-xl p-4 text-center">
            <p className="text-xl">⏱</p>
            <p className="text-sm mt-2 text-gray-500">Hours</p>
            <p className="font-medium">9 AM – 9 PM daily</p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Support;