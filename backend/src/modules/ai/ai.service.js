const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../../config');
const fs = require('fs');
const path = require('path');

class AIService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initializeAI();
  }

  initializeAI() {
    try {
      if (config.gemini.apiKey && config.gemini.apiKey !== 'your_gemini_api_key_here') {
        this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: config.gemini.model });
        console.log(`✅ Gemini AI initialized (${config.gemini.model})`);
      } else {
        console.log('⚠️ Gemini API key not set. AI features will use fallback responses.');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Gemini AI:', error.message);
    }
  }

  /**
   * AI Chat — supports multilingual Indian languages + image analysis
   */
  async chat({ message, imageBase64, imageMimeType, language }) {
    const systemPrompt = `You are "Krishi Mitra AI" — an expert agricultural assistant for Indian farmers.
    
You MUST respond in the user's language. Supported languages:
- Hindi (हिन्दी)
- English
- Punjabi (ਪੰਜਾਬੀ)
- Tamil (தமிழ்)
- Telugu (తెలుగు)
- Marathi (मराठी)
- Gujarati (ગુજરાતી)
- Kannada (ಕನ್ನಡ)
- Bengali (বাংলা)
- Odia (ଓଡ଼ିଆ)

User's preferred language: ${language || 'Hindi'}

Your expertise includes:
- Crop disease identification from images (dry leaves, pest damage, fungal infections, etc.)
- Causes and solutions for crop diseases
- Best farming practices
- Irrigation advice
- Fertilizer recommendations
- Weather impact on crops
- Market price guidance
- Organic farming tips

When analyzing an image:
1. Identify the crop/plant
2. Identify any disease or issue visible
3. Explain why it happened (कारण)
4. Provide actionable treatment/solution (उपाय)
5. Prevention tips for future (रोकथाम)

Keep responses helpful, practical, and farmer-friendly. Use simple language.`;

    if (!this.model) {
      // Fallback response when API key not configured
      return this.getFallbackResponse(message, language);
    }

    try {
      const parts = [{ text: systemPrompt + '\n\nUser: ' + (message || 'Please analyze this image.') }];

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      return {
        reply: text,
        language: language || 'Hindi',
        hasImage: !!imageBase64,
      };
    } catch (error) {
      console.error('AI Chat Error:', error.message);
      // Return fallback instead of crashing — keeps chat alive
      return this.getFallbackResponse(message, language);
    }
  }

  /**
   * Crop disease analysis from image
   */
  async analyzeCropImage({ imageBase64, imageMimeType, cropName, language }) {
    const prompt = `You are an expert agricultural scientist. Analyze this crop image in detail.
    
${cropName ? `The farmer says this is: ${cropName}` : 'Identify the crop first.'}

Respond in ${language || 'Hindi'}.

Please provide:
1. 🌱 पहचान (Identification): What crop/plant is this?
2. 🔍 समस्या (Problem): What disease/issue do you see?
3. 📋 कारण (Cause): Why did this happen?
4. 💊 उपचार (Treatment): Step-by-step solution
5. 🛡️ रोकथाम (Prevention): How to prevent in future
6. ⚠️ गंभीरता (Severity): Low / Medium / High
7. 💡 अतिरिक्त सुझाव (Extra Tips)

Be specific, practical, and use simple language that a farmer can understand.`;

    if (!this.model) {
      return this.getFallbackAnalysis(cropName, language);
    }

    try {
      const parts = [{ text: prompt }];

      if (imageBase64) {
        parts.push({
          inlineData: {
            mimeType: imageMimeType || 'image/jpeg',
            data: imageBase64,
          },
        });
      }

      const result = await this.model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      return {
        analysis: text,
        language: language || 'Hindi',
        cropName: cropName || 'auto-detected',
      };
    } catch (error) {
      console.error('Crop Analysis Error:', error.message);
      // Return fallback instead of crashing
      return this.getFallbackAnalysis(cropName, language);
    }
  }

  /**
   * Fallback response when AI is not configured
   */
  getFallbackResponse(message, language) {
    const responses = {
      Hindi: `🌾 नमस्ते! मैं कृषि मित्र AI हूँ। अभी AI सेवा कॉन्फ़िगर नहीं है।\n\nआपका संदेश: "${message}"\n\n⚠️ कृपया GEMINI_API_KEY सेट करें .env फ़ाइल में AI सुविधाओं को सक्रिय करने के लिए।\n\nइस बीच, आप मंडी भाव देखने के लिए /api/market/prices API का उपयोग कर सकते हैं।`,
      English: `🌾 Hello! I'm Krishi Mitra AI. AI service is not configured yet.\n\nYour message: "${message}"\n\n⚠️ Please set GEMINI_API_KEY in .env file to activate AI features.\n\nMeanwhile, you can use /api/market/prices to check mandi rates.`,
    };

    return {
      reply: responses[language] || responses['Hindi'],
      language: language || 'Hindi',
      isFallback: true,
    };
  }

  getFallbackAnalysis(cropName, language) {
    return {
      analysis: language === 'English'
        ? `🌾 AI Analysis service requires GEMINI_API_KEY to be configured.\n\nPlease add your Gemini API key to the .env file to enable crop disease detection.\n\nFor now, you can check market prices for ${cropName || 'your crop'} using the mandi price search feature.`
        : `🌾 AI विश्लेषण सेवा के लिए GEMINI_API_KEY कॉन्फ़िगर करना आवश्यक है।\n\nकृपया फसल रोग पहचान सक्षम करने के लिए .env फ़ाइल में अपनी Gemini API key जोड़ें।\n\nअभी के लिए, आप मंडी मूल्य खोज सुविधा का उपयोग करके ${cropName || 'अपनी फसल'} के लिए बाजार भाव देख सकते हैं।`,
      language: language || 'Hindi',
      cropName: cropName || 'unknown',
      isFallback: true,
    };
  }
}

module.exports = new AIService();
