import React, { useState } from "react";
import axios from "axios";
import "./App.css";

const App = () => {
  const [imageUrl, setImageUrl] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_XAI_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    // Check if the response is already cached in localStorage
    const cachedResponse = localStorage.getItem(imageUrl);
    if (cachedResponse) {
      setResponse(cachedResponse);
      setLoading(false);
      return; // Exit if we found a cached response
    }

    const requestBody = {
      model: "grok-vision-beta",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "high",
              },
            },
            {
              type: "text",
              text: "Translate the Ottoman Turkish text in the image into Latin letters and write it for me.",
            },
          ],
        },
      ],
      stream: false,
      temperature: 0.01,
    };

    try {
      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_XAI_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data.choices[0].message.content;
      // Store the response in localStorage
      localStorage.setItem(imageUrl, content);
      setResponse(content);
    } catch (error) {
      console.error("Error sending image:", error);
      setResponse("Error sending image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Image Translator</h1>
      </header>
      <div className="content-container">
        <div className="image-container">
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? "Translating..." : "Translate"}
            </button>
          </form>
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded" className="uploaded-image" />
          )}
        </div>
        <div className="translation-container">
          <h2>Çeviri</h2>
          <p>{response || "Translation will appear here."}</p>
        </div>
      </div>
    </div>
  );
};

export default App;
