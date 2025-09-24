import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  // Toggle Chat Window
  const toggleChat = () => {
    setIsOpen(!isOpen);
  };

  // Handle user input and send request to Flask
  const sendMessage = async () => {
    if (!input.trim()) return; // Prevent empty messages

    const userMessage = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await axios.post("http://127.0.0.1:5000/chat", { query: input });
      const botMessage = { text: response.data.response, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error fetching response:", error);
      setMessages((prev) => [...prev, { text: "Error connecting to chatbot server!", sender: "bot" }]);
    }

    setInput(""); // Clear input field
  };

  return (
    <div className="chatbot-container">
      {/* Chat Icon */}
      <div className="chat-icon" title="Open Chatbot" onClick={toggleChat}>
        <img
          src="https://i.ibb.co/fSNP7Rz/icons8-chatgpt-512.png"
          alt="ChatGPT"
          className="chat-icon-img"
        />
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window active">
          <div className="chatbot-header">
            <h3>Construction Chatbot</h3>
            <button className="close-btn" onClick={toggleChat}>✖</button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask about construction..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
