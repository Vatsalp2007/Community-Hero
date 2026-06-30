import { APP_CONFIG } from "./config.js";

const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${APP_CONFIG.visionApiKey}`;

export async function analyzeImageWithVision(base64Image) {
  if (!APP_CONFIG.visionApiKey) {
    return null;
  }
  
  const body = {
    requests: [{
      image: { content: base64Image },
      features: [
        { type: "LABEL_DETECTION", maxResults: 15 },
        { type: "OBJECT_LOCALIZATION", maxResults: 10 },
        { type: "SAFE_SEARCH_DETECTION" }
      ]
    }]
  };
  
  const response = await fetch(VISION_API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.responses?.[0] || null;
}
