// AI Plant Care Assistant Page - Main chatbot interface
// Supports text, image, and combined queries with conversation memory via Gemini Chat Sessions
import { useState, useRef, useEffect } from "react";
import "./PlantCareAI.css";

const PlantCareAI = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [selectedImages, setSelectedImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [inputText]);

  // Handle image selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Limit to 5 images
    const validFiles = files.slice(0, 5).filter((file) => {
      const isValidType = file.type.startsWith("image/");
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      return isValidType && isValidSize;
    });

    if (validFiles.length === 0) {
      alert("Please select valid image files (max 10MB each).");
      return;
    }

    setSelectedImages((prev) => [...prev, ...validFiles].slice(0, 5));
  };

  // Remove selected image
  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Create image URLs for preview
  const getImagePreviewUrl = (file) => {
    return URL.createObjectURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate input
    if (!inputText.trim() && selectedImages.length === 0) {
      return;
    }

    const userMessage = inputText.trim();
    const images = [...selectedImages];

    // Clear input
    setInputText("");
    setSelectedImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    // Add user message to chat
    const newMessage = {
      id: Date.now(),
      type: "user",
      text: userMessage,
      images: images,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setIsLoading(true);

    try {
      // Prepare FormData
      const formData = new FormData();

      if (userMessage) {
        formData.append("message", userMessage);
      }

      if (sessionId) {
        formData.append("sessionId", sessionId);
      }

      images.forEach((image, index) => {
        formData.append("images", image);
      });

      // Send request to backend
      const response = await fetch("/api/ai-chat/message", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send message");
      }

      // Store session ID for conversation continuity
      if (data.sessionId) {
        setSessionId(data.sessionId);
      }

      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: "ai",
        text: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Chat error:", error);

      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        text: error.message || "Sorry, something went wrong. Please try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle textarea keypress (Enter to send, Shift+Enter for new line)
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Format message text with comprehensive markdown-like formatting and structure
  const formatMessageText = (text) => {
    if (!text) return "";

    // Split by paragraphs first
    const paragraphs = text.split(/\n\n+/);

    return paragraphs
      .map((paragraph, index) => {
        const trimmedParagraph = paragraph.trim();

        // Skip empty paragraphs
        if (!trimmedParagraph) return null;

        // Handle bullet points/lists (lines starting with * or -)
        const lines = trimmedParagraph.split(/\n/);
        const bulletLines = lines.filter((line) => /^\s*[\*\-]\s+/.test(line));

        if (bulletLines.length > 0) {
          // This is a list - process all lines
          const listItems = lines
            .filter((line) => line.trim())
            .map((line, itemIndex) => {
              // Remove * or - at the beginning and clean up
              const cleanLine = line.replace(/^\s*[\*\-]\s+/, "").trim();

              if (!cleanLine) return null;

              // Format bold text within list items
              const formattedLine = cleanLine
                .split(/(\*\*[^*]+\*\*)/)
                .map((part, partIndex) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={partIndex} style={{ color: "#16a34a" }}>
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                });

              return (
                <li
                  key={itemIndex}
                  style={{ marginBottom: "8px", lineHeight: "1.6" }}
                >
                  {formattedLine}
                </li>
              );
            })
            .filter(Boolean);

          return (
            <ul
              key={index}
              style={{
                margin: "16px 0",
                paddingLeft: "20px",
                listStyleType: "disc",
              }}
            >
              {listItems}
            </ul>
          );
        }

        // Handle headings (lines ending with :)
        if (trimmedParagraph.endsWith(":") && trimmedParagraph.length < 100) {
          return (
            <h3
              key={index}
              style={{
                color: "#16a34a",
                fontSize: "1.1em",
                fontWeight: "600",
                margin: "20px 0 12px 0",
                borderBottom: "2px solid #22c55e",
                paddingBottom: "4px",
              }}
            >
              {trimmedParagraph}
            </h3>
          );
        }

        // Handle numbered sections (1. 2. etc)
        if (/^\d+\.\s/.test(trimmedParagraph)) {
          const formattedText = trimmedParagraph
            .split(/(\*\*[^*]+\*\*)/)
            .map((part, partIndex) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={partIndex} style={{ color: "#16a34a" }}>
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            });

          return (
            <div
              key={index}
              style={{
                margin: "16px 0",
                padding: "12px 16px",
                backgroundColor: "#f0fdf4",
                borderLeft: "4px solid #22c55e",
                borderRadius: "0 8px 8px 0",
              }}
            >
              {formattedText}
            </div>
          );
        }

        // Regular paragraphs with bold formatting
        const formattedParagraph = trimmedParagraph
          .split(/(\*\*[^*]+\*\*)/)
          .map((part, partIndex) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={partIndex} style={{ color: "#16a34a" }}>
                  {part.slice(2, -2)}
                </strong>
              );
            }
            return part;
          });

        return (
          <p
            key={index}
            style={{
              margin: "12px 0",
              lineHeight: "1.7",
              color: "#374151",
            }}
          >
            {formattedParagraph}
          </p>
        );
      })
      .filter(Boolean);
  };

  return (
    <div className="plant-care-ai-page">
      <div className="chat-container">
        {/* Chat Messages */}
        <div
          className={`chat-messages ${messages.length === 0 ? "empty" : ""}`}
        >
          {messages.length === 0 ? (
            <div className="chat-header">
              <h1 className="chat-title">🌱 Plant Care AI Assistant</h1>
              <p className="chat-subtitle">
                Get expert plant care advice, disease diagnosis, and plant
                identification. You can send text questions, upload plant
                photos, or combine both for the best results!
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.type}`}
              >
                {message.images && message.images.length > 0 && (
                  <div className="message-images">
                    {message.images.map((image, index) => (
                      <img
                        key={index}
                        src={getImagePreviewUrl(image)}
                        alt={`Uploaded plant ${index + 1}`}
                        className="message-image"
                      />
                    ))}
                  </div>
                )}
                {message.type === "ai"
                  ? formatMessageText(message.text)
                  : message.text}
              </div>
            ))
          )}

          {isLoading && (
            <div className="loading-message">
              <div className="loading-spinner"></div>
              <span>Analyzing your plant question...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Sticky Search Bar */}
      <div className="search-bar-container">
        <form onSubmit={handleSubmit} className="search-bar">
          {/* Image Upload Button */}
          <button
            type="button"
            className={`image-upload-btn ${
              selectedImages.length > 0 ? "has-images" : ""
            }`}
            onClick={() => fileInputRef.current?.click()}
            title={`Upload plant photos (${selectedImages.length}/5)`}
          >
            📎
          </button>

          <input
            type="file"
            ref={fileInputRef}
            className="file-input"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
          />

          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            {/* Image Preview */}
            {selectedImages.length > 0 && (
              <div className="image-preview-container">
                {selectedImages.map((image, index) => (
                  <div key={index} className="image-preview">
                    <img
                      src={getImagePreviewUrl(image)}
                      alt={`Preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => removeImage(index)}
                      title="Remove image"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Text Input */}
            <textarea
              ref={textareaRef}
              className="text-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                selectedImages.length > 0
                  ? "Ask something specific about your plant photos..."
                  : "Ask me anything about plant care..."
              }
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Send Button with perfectly sized arrow emoji */}
          <button
            type="submit"
            style={{
              background: "transparent",
              border: "none",
              fontSize: "28px",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: "8px",
              flexShrink: 0,
              opacity:
                (!inputText.trim() && selectedImages.length === 0) || isLoading
                  ? 0.5
                  : 1,
              transition: "all 0.2s ease",
            }}
            disabled={
              (!inputText.trim() && selectedImages.length === 0) || isLoading
            }
            title="Send message"
            onMouseOver={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "scale(1.1)";
              }
            }}
            onMouseOut={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "scale(1)";
              }
            }}
          >
            {isLoading ? (
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  border: "2px solid #ccc",
                  borderTop: "2px solid #000",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              />
            ) : (
              "➤"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlantCareAI;
