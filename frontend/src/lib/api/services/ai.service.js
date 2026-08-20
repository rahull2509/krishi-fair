import { USE_MOCK, http, delay } from "@/lib/api/client";

// Mock advisory snippets — in production this hits backend AI route which
// uses Gemini/Claude with image input.
const HINDI_REPLIES = {
  yellowing:
    "पत्तियाँ पीली होने का मुख्य कारण नाइट्रोजन की कमी, अधिक पानी या जड़ों में फफूंद हो सकता है। तुरंत 1) पानी कम करें, मिट्टी सूखने दें 2) यूरिया 5 ग्राम/लीटर का छिड़काव करें 3) बूँद-बूँद सिंचाई अपनाएँ। 3-4 दिन में सुधार दिखेगा।",
  irrigation:
    "अगले 7 दिन के मौसम के अनुसार: कल हल्की वर्षा का अनुमान है, इसलिए आज सिंचाई न करें। फिर मंगलवार को मिट्टी की नमी जाँचकर 30-40 मिनट सिंचाई करें।",
  harvest:
    "गेहूं की कटाई का सही समय तब होता है जब दाना सख्त हो जाए और 12-14% नमी रह जाए। आम तौर पर बुआई के 120-150 दिन बाद। भूरी पत्तियाँ और झुकी हुई बालियाँ संकेत हैं।",
  default:
    "आपके प्रश्न के अनुसार सबसे अच्छा सुझाव: स्वस्थ फसल के लिए नियमित निरीक्षण, संतुलित खाद, और मौसम के अनुकूल सिंचाई करें। विशेष समस्या हो तो फ़ोटो भेजें — मैं विश्लेषण कर बताऊँगा।",
};

const ENGLISH_REPLIES = {
  yellowing:
    "Yellowing leaves typically indicate nitrogen deficiency, over-watering, or root fungus. Quick fix: 1) reduce irrigation and let topsoil dry, 2) foliar spray of 5 g/L urea, 3) switch to drip. You should see improvement in 3-4 days.",
  irrigation:
    "Based on the next 7-day forecast: light rain expected tomorrow — skip irrigation today. On Tuesday, check soil moisture at 5cm depth and irrigate 30-40 minutes if dry.",
  harvest:
    "Harvest wheat when grains harden and moisture drops to 12-14%, usually 120-150 days after sowing. Brown leaves and bent ears are reliable indicators.",
  default:
    "For a healthy crop: inspect daily, use balanced NPK, and adjust irrigation to weather. Share a photo for any specific problem and I will analyse it.",
};

function pick(message, lang) {
  const m = (message || "").toLowerCase();
  const dict = lang === "hi" || lang === "Hindi" ? HINDI_REPLIES : ENGLISH_REPLIES;
  if (m.includes("पीली") || m.includes("yellow") || m.includes("dry") || m.includes("disease"))
    return dict.yellowing;
  if (m.includes("सिंचाई") || m.includes("irrigat") || m.includes("water"))
    return dict.irrigation;
  if (m.includes("कटाई") || m.includes("harvest") || m.includes("ready"))
    return dict.harvest;
  return dict.default;
}

function fallbackChatResponse(message, language, imageDataUrl) {
  const reply = pick(message, language);
  const isHindi = language === "hi" || language === "Hindi";
  const trailer = imageDataUrl
    ? isHindi
      ? "\n\nफ़ोटो मिली है। लाइव AI अभी उपलब्ध नहीं है, इसलिए यह सामान्य सलाह है: पत्ती के धब्बे, पीलेपन और कीट को ध्यान से देखें; समस्या बढ़े तो कृषि विशेषज्ञ/नज़दीकी कृषि केंद्र से पुष्टि करें।"
      : "\n\nI received the photo. Live AI is unavailable right now, so this is general guidance: inspect spots, yellowing, and pests closely; confirm with a local agronomist if symptoms spread."
    : "";

  return {
    success: true,
    data: {
      reply: reply + trailer,
      language,
      createdAt: new Date().toISOString(),
      isFallback: true,
    },
  };
}

// Helper to convert dataURL to File/Blob for FormData
async function dataUrlToBlob(dataUrl) {
  try {
    const res = await fetch(dataUrl);
    return await res.blob();
  } catch {
    return null;
  }
}

export const aiService = {
  async chat({ message, language = "en", imageDataUrl }) {
    if (USE_MOCK) {
      await delay(900);
      const reply = pick(message, language);
      const trailer =
        imageDataUrl
          ? language === "hi" || language === "Hindi"
            ? "\n\n📷 आपकी भेजी फ़ोटो में पत्तियाँ का रंग और बनावट देखी गई। ऊपर बताए कदम लागू करें।"
            : "\n\n📷 The photo you shared shows leaf colour & texture cues that align with the advice above."
          : "";
      return {
        success: true,
        data: {
          reply: reply + trailer,
          language,
          createdAt: new Date().toISOString(),
        },
      };
    }

    // Real backend — multipart/form-data
    const form = new FormData();
    form.append("message", message);
    form.append("language", language);

    if (imageDataUrl) {
      const blob = await dataUrlToBlob(imageDataUrl);
      if (blob) {
        form.append("image", blob, "upload.jpg");
      }
    }

    try {
      const res = await http.post("/ai/chat", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000, // AI may take longer
      });
      return res.data;
    } catch {
      return fallbackChatResponse(message, language, imageDataUrl);
    }
  },

  async analyzeCrop({ cropName, language = "en", imageDataUrl }) {
    if (USE_MOCK) {
      await delay(1100);
      const isHi = language === "hi" || language === "Hindi";
      return {
        success: true,
        data: {
          cropName,
          findings: isHi
            ? `${cropName} की फसल का प्रारंभिक विश्लेषण: पत्तियाँ हल्की पीली, संभावित नाइट्रोजन कमी (35% संभावना), फफूंद संक्रमण (15%)। सुझाव: यूरिया छिड़काव, सिंचाई कम।`
            : `Preliminary analysis for ${cropName}: leaves slightly yellow — likely nitrogen deficiency (35% probability) and minor fungal stress (15%). Apply foliar urea and reduce irrigation.`,
          confidence: 0.78,
        },
      };
    }

    // Real backend
    const form = new FormData();
    form.append("cropName", cropName);
    form.append("language", language);

    if (imageDataUrl) {
      const blob = await dataUrlToBlob(imageDataUrl);
      if (blob) {
        form.append("image", blob, "upload.jpg");
      }
    }

    try {
      const res = await http.post("/ai/analyze-crop", form, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      });
      return res.data;
    } catch {
      return {
        success: true,
        data: {
          analysis: pick(cropName || "disease", language),
          language,
          cropName,
          isFallback: true,
        },
      };
    }
  },
};
