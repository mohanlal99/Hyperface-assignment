
// Google Gemini Configuration
import { GoogleGenerativeAI } from "@google/generative-ai";

// Use your API key from .env
const genAi = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);


export default genAi