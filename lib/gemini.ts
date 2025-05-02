import { GoogleGenerativeAI } from '@google/generative-ai';

// Get API key from environment
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

// Validate API key format
const isValidApiKey = (key: string | undefined): boolean => {
    return typeof key === 'string' && key.length > 0;
};

// Initialize Gemini client with validation
if (!isValidApiKey(GEMINI_API_KEY)) {
    console.error('[Gemini] Invalid API key format. Please check your .env.local file.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// System message to control the AI's behavior
const SYSTEM_PROMPT = `You are a helpful financial education assistant. Your role is to:

- Provide general financial education and explanations
- Explain financial concepts and terms
- Share general budgeting and saving tips
- Offer information about different types of financial instruments
- Help users with budgeting and saving
- Help users with debt management
- Help users with retirement planning
- Help users with insurance planning
- Help users with investment planning
- Help users with tax planning


You must NOT:
- Give specific investment advice
- Recommend specific stocks, funds, or investment products
- Make predictions about market movements
- Provide specific portfolio recommendations

If asked for specific investment recommendations, explain that you can only provide general information and education, and recommend consulting with a qualified financial advisor for specific investment advice.`;

export async function getFinancialAdvice(userMessage: string) {
    try {
        // Validate API key before making request
        if (!isValidApiKey(GEMINI_API_KEY)) {
            throw new Error('Invalid API key configuration. Please check your environment variables.');
        }

        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash",
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 500,
            }
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: SYSTEM_PROMPT }],
                },
                {
                    role: "model",
                    parts: [{ text: "I understand. I will provide general financial education and information while avoiding specific investment advice." }],
                },
            ],
        });

        const result = await chat.sendMessage(userMessage);
        const response = await result.response;
        const text = response.text();

        return {
            success: true,
            message: text
        };
    } catch (error: any) {
        console.error('[Gemini] Error:', error);
        // Provide more specific error messages
        let errorMessage = 'Failed to get response';
        if (error.message.includes('401')) {
            errorMessage = 'Invalid API key. Please check your API key configuration in .env.local file.';
        } else if (error.message.includes('429')) {
            errorMessage = 'Rate limit exceeded. Please try again later.';
        } else if (error.message.includes('404')) {
            errorMessage = 'Model not found. Please check the model name and API version.';
        }
        return {
            success: false,
            message: errorMessage
        };
    }
} 