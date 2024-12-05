import React, { useState } from "react";
import Tesseract from "tesseract.js";
import axios from "axios";
import "./App.css";

const App = () => {
  const [imageFile, setImageFile] = useState(null);
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const apiKey = import.meta.env.VITE_XAI_KEY;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResponse("");

    // Check if the response is already cached in localStorage
    const cachedResponse = localStorage.getItem(imageFile.name);
    if (cachedResponse) {
      setResponse(cachedResponse);
      setLoading(false);
      return;
    }

    try {
      // Use Tesseract.js to extract text from the image file
      const {
        data: { text },
      } = await Tesseract.recognize(imageFile, "ara", {
        logger: (m) => console.log(m),
      });

      console.log("Extracted text:", text);

      // Prepare the request body for the XAI API
      const requestBody = {
        messages: [
          {
            role: "system",
            content: "You are a test assistant.",
          },
          {
            role: "user",
            content: `Latinize the text: ${text}`,
          },
        ],
        model: "grok-beta",
        stream: false,
        temperature: 0,
      };

      // Send the extracted text to the XAI API
      const response = await axios.post(
        "https://api.x.ai/v1/chat/completions",
        requestBody,
        {
          headers: {
            Authorization: "Bearer " + apiKey,
            "Content-Type": "application/json",
          },
        }
      );

      const content = response.data.choices[0].message.content;
      // Store the response in localStorage
      localStorage.setItem(imageFile.name, content);
      setResponse(content);
    } catch (error) {
      console.error("Error processing image:", error);
      setResponse("Error processing image");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Ottoman Turkish Translator</h1>
      </header>
      <div className="content-container">
        <div className="image-container">
          <form onSubmit={handleSubmit}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
            <button type="submit" disabled={loading || !imageFile}>
              {loading ? "Translating..." : "Translate"}
            </button>
          </form>
          {imageFile && (
            <img
              src={URL.createObjectURL(imageFile)}
              alt="Uploaded"
              className="uploaded-image"
            />
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
