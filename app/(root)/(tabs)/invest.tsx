import { View, Text, SafeAreaView, StyleSheet, ScrollView, TextInput, TouchableOpacity, ActivityIndicator, FlatList, StatusBar, Platform, Alert, KeyboardAvoidingView } from 'react-native'
import React, { useState, useEffect, useRef } from 'react'
import { useUserContext } from '../context/UserContext';
import { useExpenses } from '../context/ExpenseContext';
import { HfInference } from '@huggingface/inference';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';

// Theme colors - match with tailwind.config.js
const COLORS = {
  primary: '#fff',
  accent: '#7b80ff',
  main: '#1f2630',
};

// You'll need to get a free API token from huggingface.co
// This is loaded from the .env.local file for security
const HF_TOKEN = process.env.EXPO_PUBLIC_HUGGING_FACE_TOKEN || "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";
const hf = new HfInference(HF_TOKEN);

// Function to check if API is configured
const isApiConfigured = () => {
  return HF_TOKEN !== "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";
};

// Indian investment dataset
// This would normally be imported from a file
const INDIAN_INVESTMENT_QA = [
  {
    "question": "What is a SIP and how does it work in India?",
    "answer": "SIP (Systematic Investment Plan) is a method of investing in mutual funds where you contribute a fixed amount at regular intervals, typically monthly. It allows you to benefit from rupee-cost averaging by purchasing more units when prices are low and fewer when prices are high. Most fund houses in India allow SIPs starting from ₹500 per month, and you can set up automatic debits from your bank account. SIPs are popular because they instill investment discipline and help in wealth creation over time through the power of compounding. Disclaimer: This information is for educational purposes only and not financial advice."
  },
  {
    "question": "What is the minimum amount required to invest in PPF?",
    "answer": "The Public Provident Fund (PPF) requires a minimum annual investment of ₹500, and the maximum limit is ₹1.5 lakh per financial year. PPF investments have a lock-in period of 15 years, with partial withdrawals allowed after the 6th year. The current interest rate is revised quarterly by the Government of India and is tax-free. PPF investments qualify for tax deduction under Section 80C. Disclaimer: This information is for educational purposes only and not financial advice."
  },
  {
    "question": "What are the tax benefits of ELSS mutual funds in India?",
    "answer": "Equity-Linked Savings Schemes (ELSS) are tax-saving mutual funds that qualify for deductions under Section 80C of the Income Tax Act, with a limit of ₹1.5 lakh per financial year. ELSS funds have a lock-in period of 3 years, the shortest among tax-saving instruments. Gains above ₹1 lakh in a financial year are subject to 10% LTCG tax. Since ELSS invests primarily in equities, it offers higher growth potential but comes with market risks. Disclaimer: This information is for educational purposes only and not financial advice."
  },
  {
    "question": "How is LTCG tax calculated on equity investments in India?",
    "answer": "Long-term capital gains (LTCG) tax on equity investments applies when shares or equity mutual funds are held for more than one year. As per the Income Tax Act, LTCG above ₹1 lakh in a financial year is taxed at 10% without indexation benefits. For example, if your total capital gain is ₹1.5 lakh, only ₹50,000 will be taxed at 10%, resulting in a tax liability of ₹5,000. Disclaimer: This information is for educational purposes only and not financial advice."
  },
  {
    "question": "What is the difference between a regular mutual fund and a direct mutual fund?",
    "answer": "A regular mutual fund is purchased through intermediaries like brokers or banks and includes distribution commissions, resulting in a higher expense ratio. In contrast, a direct mutual fund is bought directly from the fund house without intermediaries, leading to lower expense ratios and potentially higher returns over time. Investors comfortable with researching and choosing funds can benefit from direct plans. Disclaimer: This information is for educational purposes only and not financial advice."
  }
];

// Financial terms dictionary for fallback and enhancing responses
const FINANCIAL_TERMS = {
  "sip": "SIP (Systematic Investment Plan) is a method of investing in mutual funds where investors contribute a fixed amount regularly (typically monthly). It allows investors to benefit from rupee cost averaging and the power of compounding. SIPs in India typically start from as low as ₹500 per month.",
  "elss": "ELSS (Equity Linked Savings Scheme) is a type of mutual fund in India that primarily invests in equities and offers tax benefits under Section 80C of the Income Tax Act. ELSS funds have a lock-in period of 3 years, which is the shortest among all tax-saving instruments under Section 80C.",
  "nps": "NPS (National Pension System) is a voluntary retirement savings scheme designed to enable systematic savings during the subscriber's working life. It offers tax benefits under Section 80C and additional deduction under Section 80CCD(1B).",
  "ltcg": "LTCG (Long Term Capital Gains) is the profit earned from selling investments held for a specific period. For equity investments in India, gains from assets held for more than 1 year are considered LTCG and are taxed at 10% for amounts exceeding ₹1 lakh.",
  "stcg": "STCG (Short Term Capital Gains) is the profit earned from selling investments held for a short period. For equity investments in India, gains from assets held for less than 1 year are considered STCG and are taxed at 15%.",
  "debt fund": "Debt funds are mutual funds that invest in fixed income securities like government bonds, corporate bonds, and money market instruments. They are generally less risky than equity funds but offer lower returns, typically in the range of 7-9% in India.",
  "equity fund": "Equity funds are mutual funds that primarily invest in stocks. They have the potential for higher returns (historically 12-15% over long periods in India) but come with higher risk and volatility.",
  "index fund": "Index funds are passive mutual funds that track a specific market index like Nifty or Sensex. They offer low expense ratios and aim to replicate the performance of the underlying index rather than outperform it.",
  "ppf": "PPF (Public Provident Fund) is a government-backed long-term savings scheme with a 15-year tenure. It offers tax-free returns (currently 7.1% per annum) and qualifies for tax deduction under Section 80C. The minimum annual investment is ₹500, and the maximum is ₹1.5 lakh.",
  "fd": "FD (Fixed Deposit) is a secure investment option offered by banks where you deposit money for a fixed period at a predetermined interest rate. Current FD rates in India range from 5-7% depending on the bank and tenure."
};

// Sample Indian investment knowledge base
const INVESTMENT_KNOWLEDGE = {
  "mutual_funds": {
    "equity": {
      "description": "Funds that invest primarily in stocks",
      "typical_returns": "12-15% (long term average)",
      "min_investment": "₹500 (SIP), ₹5,000 (lump sum)",
      "risk": "Medium to High",
      "tax_implications": "LTCG taxed at 10% above ₹1 lakh, STCG at 15%",
      "suitable_for": "Long-term goals (5+ years)"
    },
    "debt": {
      "description": "Funds that invest in fixed income securities like bonds",
      "typical_returns": "7-9%",
      "min_investment": "₹500 (SIP), ₹5,000 (lump sum)",
      "risk": "Low to Medium",
      "tax_implications": "LTCG taxed at 20% with indexation, STCG as per income slab",
      "suitable_for": "Medium-term goals (1-3 years)"
    },
    "hybrid": {
      "description": "Balanced funds with mix of equity and debt",
      "typical_returns": "9-12%",
      "min_investment": "₹500 (SIP), ₹5,000 (lump sum)",
      "risk": "Medium",
      "tax_implications": "Based on equity-debt ratio",
      "suitable_for": "Medium to long-term goals (3-5 years)"
    }
  },
  "government_schemes": {
    "ppf": {
      "description": "Public Provident Fund - Government backed savings scheme",
      "typical_returns": "7.1% (current rate)",
      "min_investment": "₹500 annually",
      "lock_in": "15 years (partial withdrawal after 7 years)",
      "risk": "Very Low",
      "tax_implications": "EEE (tax-free at all stages), 80C benefit up to ₹1.5 lakh"
    },
    "sukanya_samriddhi": {
      "description": "Government savings scheme for girl child education and marriage",
      "typical_returns": "7.6% (current rate)",
      "min_investment": "₹250 annually",
      "lock_in": "21 years or marriage after 18",
      "risk": "Very Low",
      "tax_implications": "EEE (tax-free at all stages), 80C benefit up to ₹1.5 lakh"
    },
    "nps": {
      "description": "National Pension System - retirement focused investment",
      "typical_returns": "9-12% (depending on fund choice)",
      "min_investment": "₹500 monthly",
      "lock_in": "Until retirement (60 years)",
      "risk": "Low to Medium (depending on asset allocation)",
      "tax_implications": "Additional ₹50,000 deduction under 80CCD(1B), 60% lump sum tax-free"
    }
  },
  "fixed_income": {
    "fd": {
      "description": "Bank Fixed Deposits - time deposits with fixed interest rate",
      "typical_returns": "5-7%",
      "min_investment": "₹1,000",
      "lock_in": "Varies (7 days to 10 years)",
      "risk": "Low",
      "tax_implications": "Interest taxed as per income slab, TDS applicable"
    },
    "rd": {
      "description": "Recurring Deposits - regular monthly deposits",
      "typical_returns": "5-6.5%",
      "min_investment": "₹100 monthly",
      "lock_in": "6 months to 10 years",
      "risk": "Low",
      "tax_implications": "Interest taxed as per income slab, TDS applicable"
    }
  },
  "stocks": {
    "direct_equity": {
      "description": "Direct investment in company shares on stock exchanges",
      "typical_returns": "15-18% (long term average)",
      "min_investment": "Price of 1 share",
      "risk": "High",
      "tax_implications": "LTCG taxed at 10% above ₹1 lakh, STCG at 15%",
      "suitable_for": "Long-term wealth creation (7+ years)"
    }
  }
};

// Suggested questions for users (updated)
const SUGGESTED_QUESTIONS = [
  "What investment rules should I know about?",
  "What is the 50-30-20 budget rule?",
  "How does the 15-3-10 Vehicle Rule work?",
  "What is the Rule of 72?",
  "How much emergency fund should I have?",
  "What is the 28/36 debt rule for housing?"
];

// Financial investment rules and strategies
const INVESTMENT_RULES = [
  {
    "name": "50-30-20 Rule",
    "description": "Allocate 50% of income to needs, 30% to wants, and 20% to savings/investments.",
    "application": "Effective for basic personal financial planning and budgeting."
  },
  {
    "name": "15-3-10 Vehicle Rule",
    "description": "Spend a maximum of 15% of annual income on vehicle purchase cost, with 3% for repairs/insurance, and a 10% down payment.",
    "application": "Helps avoid overspending on vehicles that depreciate quickly."
  },
  {
    "name": "100 minus Age Rule",
    "description": "Subtract your age from 100 to determine the percentage of portfolio in equities.",
    "application": "Simple age-based asset allocation strategy for retirement planning."
  },
  {
    "name": "4% Withdrawal Rule",
    "description": "Withdraw 4% of retirement savings annually to maintain portfolio longevity.",
    "application": "Guide for sustainable retirement withdrawals to avoid outliving savings."
  },
  {
    "name": "Emergency Fund Rule",
    "description": "Maintain 3-6 months of expenses in easily accessible savings.",
    "application": "Creates financial buffer for unexpected expenses or income loss."
  },
  {
    "name": "20-4-10 Car Rule",
    "description": "Make a 20% down payment, limit loan to 4 years, and keep total transportation costs under 10% of monthly income.",
    "application": "Ensures vehicle purchases don't strain your finances."
  },
  {
    "name": "Rule of 72",
    "description": "Divide 72 by the expected annual return to estimate years needed to double your investment.",
    "application": "Quick method to understand the power of compound interest."
  },
  {
    "name": "Rule of 114",
    "description": "Divide 114 by interest rate to estimate years needed to triple your investment.",
    "application": "Extension of Rule of 72 for longer-term planning."
  },
  {
    "name": "28/36 Debt Rule",
    "description": "Housing costs should not exceed 28% of income, and total debt payments should be under 36% of income.",
    "application": "Prevents overextending on housing and total debt."
  },
  {
    "name": "1% Home Maintenance Rule",
    "description": "Budget 1% of your home's value annually for maintenance expenses.",
    "application": "Helps avoid financial strain from unexpected home repairs."
  },
  {
    "name": "10-5-3 Rule",
    "description": "Historically, stock markets return ~10%, 5-year bonds ~5%, and savings accounts ~3% annually.",
    "application": "Sets realistic expectations for returns across asset classes."
  },
  {
    "name": "6% Down Payment Rule",
    "description": "Save at least 6% of your desired home value as down payment to avoid high-interest loans.",
    "application": "Minimum threshold for economical home purchasing in India."
  },
  {
    "name": "30X Retirement Rule",
    "description": "Save 30 times your annual expenses before retirement.",
    "application": "Simple calculation for retirement corpus needed."
  },
  {
    "name": "25X Retirement Rule",
    "description": "Save 25 times your annual expenses to achieve financial independence.",
    "application": "Alternative to 4% withdrawal rule for retirement planning."
  },
  {
    "name": "10% Savings Rule",
    "description": "Save at least 10% of your gross income for long-term financial goals.",
    "application": "Minimum savings rate for building wealth over time."
  }
];

// Define message type to include fromDataset property
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  fromDataset?: boolean;
}

const InvestScreen = () => {
  const { goal, goalAmount, savings } = useUserContext();
  const { expenses } = useExpenses();
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      role: 'assistant', 
      content: "Hello! I can provide information about various investment options available in India. What would you like to know?" 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [qaDataset, setQaDataset] = useState(INDIAN_INVESTMENT_QA);
  const [datasetStatus, setDatasetStatus] = useState('loading'); // 'loading', 'loaded', 'error'
  const [datasetSize, setDatasetSize] = useState(5); // Default to sample size
  const scrollViewRef = useRef<ScrollView>(null);

  // Load the full dataset from a JSON file (if available)
  useEffect(() => {
    const loadDataset = async () => {
      try {
        // First check if we already have the dataset in AsyncStorage
        const jsonData = await AsyncStorage.getItem('investment_dataset');
        if (jsonData) {
          const dataset = JSON.parse(jsonData);
          if (Array.isArray(dataset) && dataset.length > 0) {
            console.log(`Loaded ${dataset.length} QA pairs from storage`);
            setQaDataset(dataset);
            setDatasetSize(dataset.length);
            setDatasetStatus('loaded');
            return;
          }
        }
        
        // If not in AsyncStorage, load from bundled JSON
        setQaDataset(INDIAN_INVESTMENT_QA);
        setDatasetSize(INDIAN_INVESTMENT_QA.length);
        setDatasetStatus('loaded');
        
        // Cache the initial dataset
        await AsyncStorage.setItem('investment_dataset', JSON.stringify(INDIAN_INVESTMENT_QA));
        
        // Try to load the larger dataset from GitHub (this would be replaced with your actual dataset location)
        try {
          const response = await fetch('https://gist.githubusercontent.com/user/investmentdata/indian_investment_dataset.json');
          const fullDataset = await response.json();
          
          if (Array.isArray(fullDataset) && fullDataset.length > INDIAN_INVESTMENT_QA.length) {
            console.log(`Loaded extended dataset with ${fullDataset.length} QA pairs`);
            setQaDataset(fullDataset);
            setDatasetSize(fullDataset.length);
            
            // Cache the extended dataset
            await AsyncStorage.setItem('investment_dataset', JSON.stringify(fullDataset));
          }
        } catch (e) {
          console.log('Could not load extended dataset:', e);
        }
      } catch (error) {
        console.error('Error loading dataset:', error);
        setDatasetStatus('error');
      }
    };
    
    loadDataset();
  }, []);

  // Check for connectivity on component mount
  useEffect(() => {
    checkConnectivity();
  }, []);

  // Simple connectivity check
  const checkConnectivity = async () => {
    try {
      // Try to fetch a small resource
      const response = await fetch('https://www.google.com', { 
        method: 'HEAD'
      });
      setIsConnected(response.ok);
    } catch (error) {
      console.log('Network connectivity issue:', error);
      setIsConnected(false);
    }
  };

  // Find similar question in our dataset
  const findSimilarQuestion = (question: string) => {
    const userQ = question.toLowerCase();
    
    // Check for exact matches first
    const exactMatch = qaDataset.find(
      item => item.question.toLowerCase() === userQ
    );
    if (exactMatch) return exactMatch.answer;
    
    // Calculate similarity scores for each question
    let bestMatch = null;
    let highestScore = 0;
    
    for (const item of qaDataset) {
      const score = calculateSimilarity(
        userQ,
        item.question.toLowerCase()
      );
      
      if (score > highestScore && score > 0.6) { // Threshold for similarity
        highestScore = score;
        bestMatch = item;
      }
    }
    
    return bestMatch ? bestMatch.answer : null;
  };
  
  // Simple word-based similarity calculation
  const calculateSimilarity = (str1: string, str2: string): number => {
    // Tokenize by splitting into words
    const words1 = str1.split(/\W+/).filter(word => word.length > 2);
    const words2 = str2.split(/\W+/).filter(word => word.length > 2);
    
    // Count matching words
    let matchCount = 0;
    for (const word of words1) {
      if (words2.includes(word)) {
        matchCount++;
      }
    }
    
    // Calculate similarity score
    if (words1.length === 0 || words2.length === 0) return 0;
    return matchCount / Math.max(words1.length, words2.length);
  };

  // Enhanced function to detect out-of-scope questions
  const isOutOfScopeQuestion = (question: string): boolean => {
    const lowerQuestion = question.toLowerCase();
    
    // Prohibited topics that we don't want the AI to address
    const prohibitedTopics = [
      'loan shark', 'money laundering', 'tax evasion', 'black money', 
      'insider trading', 'gambling', 'betting', 'casino', 
      'pyramid scheme', 'ponzi', 'get rich quick', 'guaranteed returns',
      'cryptocurrency', 'bitcoin', 'dogecoin', 'ethereum', 'nft',
      'illegal', 'fraud', 'scam', 'smuggling', 'bribe', 
      'hack', 'loophole', 'under the table', 'without paying tax',
      'offshore account', 'shell company'
    ];
    
    // Check if question contains prohibited topics
    for (const topic of prohibitedTopics) {
      if (lowerQuestion.includes(topic)) {
        return true;
      }
    }
    
    // Check if the question is asking for specific investment recommendations
    const specificRecommendationPatterns = [
      'which stock should i buy',
      'which mutual fund is best',
      'where should i invest',
      'best investment for',
      'recommend a',
      'tell me which',
      'which is better',
      'should i buy',
      'should i sell',
      'is it a good time to',
      'will the market',
      'predict the',
      'what will happen to',
      'guaranteed profit',
      'guaranteed return',
      'highest return',
      'safest investment',
      'best return'
    ];
    
    for (const pattern of specificRecommendationPatterns) {
      if (lowerQuestion.includes(pattern)) {
        return true;
      }
    }
    
    // Check for questions that are clearly not about Indian investments
    if (question.length < 10) {
      return true; // Too short to be a valid question
    }
    
    // Check for weird, nonsensical, or non-financial questions
    const nonFinancialPatterns = [
      'how are you', 'your name', 'who are you', 'tell me about yourself',
      'what is the meaning of life', 'tell me a joke', 'sing a song',
      'what is your favorite', 'do you like', 'weather', 'cricket',
      'politics', 'religion', 'god', 'sex', 'dating', 'girlfriend', 'boyfriend',
      'recipe', 'cook', 'movie', 'game', 'play'
    ];
    
    for (const pattern of nonFinancialPatterns) {
      if (lowerQuestion.includes(pattern)) {
        return true;
      }
    }
    
    return false;
  };

  // Function to get investment rule or strategy information
  const getInvestmentRule = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    
    // Extract potential rule numbers from the question
    const extractedNumbers = lowerQuestion.match(/\d+/g) || [];
    
    // Check for questions about rules or strategies
    if (lowerQuestion.includes('rule') || lowerQuestion.includes('strategy') || 
        lowerQuestion.includes('formula') || lowerQuestion.includes('principle') ||
        lowerQuestion.includes('ratio') || lowerQuestion.includes('calculation')) {
      
      // Look for specific rules in the question
      for (const rule of INVESTMENT_RULES) {
        const ruleName = rule.name.toLowerCase();
        // Make matching more flexible
        if (lowerQuestion.includes(ruleName) || 
            (rule.name.includes('-') && lowerQuestion.includes(rule.name.toLowerCase().replace(/-/g, ' '))) ||
            (ruleName.includes('rule') && lowerQuestion.includes(ruleName.replace(' rule', ''))) ||
            // Match rule names without the word "rule"
            (ruleName.includes('rule') && lowerQuestion.includes(ruleName.replace('rule', '').trim())) ||
            // Match for rules with specific formats like 50-30-20
            (rule.name.match(/\d+-\d+-\d+/) && lowerQuestion.includes(rule.name.match(/\d+-\d+-\d+/)?.[0] || '')) ||
            // Match numbers in the rule with numbers in the question
            (ruleName.match(/\d+/) && extractedNumbers.some(num => ruleName.includes(num)))) {
          
          // Create a rich formatted response
          return `# ${rule.name}\n\n${rule.description}\n\n**Application**: ${rule.application}\n\n## Example\nIf your monthly income is ₹60,000:\n${createRuleExample(rule)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
        }
      }
      
      // Handle questions about car/vehicle without mentioning rule names
      if (lowerQuestion.includes('car') || lowerQuestion.includes('vehicle') || lowerQuestion.includes('bike') || lowerQuestion.includes('automobile')) {
        const carRules = INVESTMENT_RULES.filter(r => 
          r.name.toLowerCase().includes('car') || 
          r.description.toLowerCase().includes('vehicle') ||
          r.name.includes('15-3-10') ||
          r.name.includes('20-4-10')
        );
        
        if (carRules.length > 0) {
          const rule = carRules[0];
          return `# ${rule.name}\n\n${rule.description}\n\n**Application**: ${rule.application}\n\n## Example\n${createRuleExample(rule)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
        }
      }
      
      // Handle questions about home/house without mentioning rule names
      if (lowerQuestion.includes('home') || lowerQuestion.includes('house') || lowerQuestion.includes('property') || lowerQuestion.includes('real estate')) {
        const homeRules = INVESTMENT_RULES.filter(r => 
          r.description.toLowerCase().includes('home') || 
          r.name.includes('1%') ||
          r.name.includes('28/36') ||
          r.name.includes('6% Down')
        );
        
        if (homeRules.length > 0) {
          const rule = homeRules[0];
          return `# ${rule.name}\n\n${rule.description}\n\n**Application**: ${rule.application}\n\n## Example\n${createRuleExample(rule)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
        }
      }
      
      // Handle questions about retirement without mentioning rule names
      if (lowerQuestion.includes('retire') || lowerQuestion.includes('old age') || lowerQuestion.includes('pension')) {
        const retirementRules = INVESTMENT_RULES.filter(r => 
          r.description.toLowerCase().includes('retirement') || 
          r.name.includes('4%') ||
          r.name.includes('25X') ||
          r.name.includes('30X')
        );
        
        if (retirementRules.length > 0) {
          const rule = retirementRules[0];
          return `# ${rule.name}\n\n${rule.description}\n\n**Application**: ${rule.application}\n\n## Example\n${createRuleExample(rule)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
        }
      }
      
      // If asking about rules in general
      if (lowerQuestion.includes('what are investment rules') || 
          lowerQuestion.includes('investment strategies') || 
          lowerQuestion.includes('financial rules') ||
          lowerQuestion.includes('what rules') ||
          lowerQuestion.includes('list of rules') ||
          lowerQuestion.includes('common rules') ||
          lowerQuestion.includes('financial strategies') ||
          lowerQuestion.includes('formulas')) {
        
        let response = "# Common Investment Rules and Strategies\n\nHere are some popular investment and financial rules you can ask about:\n\n";
        INVESTMENT_RULES.forEach(rule => {
          response += `• **${rule.name}**: ${rule.description}\n`;
        });
        response += "\nYou can ask for details about any specific rule that interests you.\n\nDisclaimer: These rules are for educational purposes only and not financial advice.";
        return response;
      }
    }
    
    // Check for vehicle-related questions
    if ((lowerQuestion.includes('buy') || lowerQuestion.includes('purchase') || lowerQuestion.includes('afford')) && 
        (lowerQuestion.includes('car') || lowerQuestion.includes('bike') || lowerQuestion.includes('vehicle') || lowerQuestion.includes('automobile'))) {
      
      // Look for car rules
      const vehicleRules = INVESTMENT_RULES.filter(r => 
        r.name.includes('Vehicle') || 
        r.name.includes('Car') || 
        r.description.toLowerCase().includes('vehicle') ||
        r.description.toLowerCase().includes('car')
      );
      
      if (vehicleRules.length > 0) {
        const vehicleRule = vehicleRules[0];
        return `# ${vehicleRule.name}\n\n${vehicleRule.description}\n\n**Application**: ${vehicleRule.application}\n\n## Example Calculation\n${createRuleExample(vehicleRule)}\n\nAnother popular approach is the **${vehicleRules.length > 1 ? vehicleRules[1].name : '20-4-10 Car Rule'}**, which recommends a 20% down payment, 4-year loan term, and total transportation costs under 10% of income.\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
      }
    }
    
    // Budget allocation questions
    if (lowerQuestion.includes('budget') || lowerQuestion.includes('allocate') || lowerQuestion.includes('spending') || 
        lowerQuestion.includes('expense') || lowerQuestion.includes('income allocation')) {
      const budgetRule = INVESTMENT_RULES.find(r => r.name === "50-30-20 Rule");
      if (budgetRule) {
        return `# ${budgetRule.name}\n\n${budgetRule.description}\n\n**Application**: ${budgetRule.application}\n\n## Example\n${createRuleExample(budgetRule)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
      }
    }
    
    // Return calculation or compound interest questions
    if (lowerQuestion.includes('double') || lowerQuestion.includes('compound') || 
        lowerQuestion.includes('growth') || lowerQuestion.includes('triple') ||
        lowerQuestion.includes('calculate return')) {
      const rule72 = INVESTMENT_RULES.find(r => r.name === "Rule of 72");
      const rule114 = INVESTMENT_RULES.find(r => r.name === "Rule of 114");
      
      if (rule72 && rule114) {
        return `# ${rule72.name}\n\n${rule72.description}\n\n**Application**: ${rule72.application}\n\n## Example\n${createRuleExample(rule72)}\n\n# ${rule114.name}\n\n${rule114.description}\n\n**Application**: ${rule114.application}\n\n## Example\n${createRuleExample(rule114)}\n\nDisclaimer: This information is for educational purposes only and not financial advice.`;
      }
    }
    
    return null;
  };
  
  // Helper function to create examples for rules
  const createRuleExample = (rule: typeof INVESTMENT_RULES[0]): string => {
    if (rule.name === "50-30-20 Rule") {
      return "- Needs (50%): ₹30,000 for rent, groceries, utilities, insurance\n- Wants (30%): ₹18,000 for dining out, entertainment, shopping\n- Savings (20%): ₹12,000 for emergency fund, investments, retirement";
    } else if (rule.name === "100 minus Age Rule") {
      return "If you're 30 years old:\n- Equity allocation: 70% (100 - 30)\n- Debt allocation: 30%";
    } else if (rule.name === "4% Withdrawal Rule") {
      return "If your retirement corpus is ₹1 crore:\n- Annual withdrawal: ₹4,00,000 (4% of corpus)\n- Monthly income: ₹33,333";
    } else if (rule.name === "Emergency Fund Rule") {
      return "If your monthly expenses are ₹40,000:\n- Minimum emergency fund: ₹1,20,000 (3 months)\n- Ideal emergency fund: ₹2,40,000 (6 months)";
    } else if (rule.name === "15-3-10 Vehicle Rule") {
      return "If your annual income is ₹6,00,000:\n- Maximum vehicle cost: ₹90,000 (15% of annual income)\n- Annual maintenance budget: ₹18,000 (3% of annual income)\n- Minimum down payment: ₹9,000 (10% of vehicle cost)";
    } else if (rule.name === "20-4-10 Car Rule") {
      return "For a ₹5,00,000 car purchase with monthly income of ₹60,000:\n- Down payment: ₹1,00,000 (20% of car price)\n- Loan term: Maximum 4 years\n- Monthly transportation costs: Maximum ₹6,000 (10% of income)";
    } else if (rule.name === "Rule of 72") {
      return "For an investment with 12% annual returns:\n- Time to double: 72 ÷ 12 = 6 years\nFor an investment with 8% annual returns:\n- Time to double: 72 ÷ 8 = 9 years";
    } else if (rule.name === "Rule of 114") {
      return "For an investment with 6% annual returns:\n- Time to triple: 114 ÷ 6 = 19 years";
    } else if (rule.name === "28/36 Debt Rule") {
      return "For a monthly income of ₹80,000:\n- Housing costs should be below ₹22,400 (28%)\n- Total debt payments should be below ₹28,800 (36%)";
    } else if (rule.name === "1% Home Maintenance Rule") {
      return "For a home valued at ₹50 lakhs:\n- Annual maintenance budget: ₹50,000 (1%)\n- Monthly allocation: ₹4,167";
    } else if (rule.name === "10-5-3 Rule") {
      return "For a ₹1,00,000 investment over 10 years:\n- In stocks: ~₹2,59,000 (10% annually)\n- In bonds: ~₹1,63,000 (5% annually)\n- In savings: ~₹1,34,000 (3% annually)";
    } else if (rule.name === "6% Down Payment Rule") {
      return "For a ₹40 lakh home:\n- Minimum down payment: ₹2.4 lakhs (6%)\n- Recommended down payment: ₹8 lakhs (20%)";
    } else if (rule.name === "30X Retirement Rule") {
      return "If your annual expenses are ₹6 lakhs:\n- Target retirement corpus: ₹1.8 crores (30 × ₹6 lakhs)";
    } else if (rule.name === "25X Retirement Rule") {
      return "If your annual expenses are ₹6 lakhs:\n- Target financial independence corpus: ₹1.5 crores (25 × ₹6 lakhs)";
    } else if (rule.name === "10% Savings Rule") {
      return "For a monthly income of ₹60,000:\n- Minimum monthly savings: ₹6,000 (10%)\n- Annual savings: ₹72,000";
    }
    
    // Generic example
    return "This rule helps you make smarter financial decisions based on your personal situation.";
  };

  // Enhanced model response with better prompting, dataset usage, and safeguards
  const getModelResponse = async (question: string): Promise<string> => {
    try {
      // Check for direct terminology matches first
      const termMatch = findFinancialTerm(question);
      if (termMatch) {
        return termMatch;
      }
      
      // Check if API is configured
      if (!isApiConfigured()) {
        return getFallbackResponse(question);
      }
      
      // If connectivity/API not available, use fallback
      if (!isConnected) {
        return getFallbackResponse(question);
      }
      
      // Check similar questions in dataset
      const similarQuestion = findSimilarQuestion(question);
      if (similarQuestion) {
        return similarQuestion;
      }
      
      // Check for investment rule questions
      const ruleResponse = getInvestmentRule(question);
      if (ruleResponse) {
        return ruleResponse;
      }
      
      // Check if it's a goal-based question
      if (question.toLowerCase().includes("invest") && 
          (question.toLowerCase().includes("year") || 
           question.toLowerCase().includes("month") || 
           question.toLowerCase().includes("time"))) {
        const timeframe = parseGoalTimeframe(question);
        if (timeframe) {
          return getRecommendationForTimeframe(timeframe);
        }
      }
      
      // Get relevant questions from our dataset to provide as context
      const relevantQuestions = getRelevantQuestionsForContext(question);
      let context = "";
      
      if (relevantQuestions.length > 0) {
        context = "Here are some relevant financial facts that might help answer the question:\n\n";
        relevantQuestions.forEach(q => {
          const dataAnswer = INDIAN_INVESTMENT_QA.find(item => item.question.toLowerCase() === q.toLowerCase());
          if (dataAnswer?.answer) {
            context += `Q: ${q}\nA: ${dataAnswer.answer}\n\n`;
          }
        });
      }
      
      // Rich contextual prompt for the model
      const systemPrompt = `You are a helpful financial assistant specialized in Indian investments and personal finance. 
You provide educational information about investment terms and options in India.
Always be factual and accurate. If you're unsure, say you don't know rather than providing incorrect information.
Focus on Indian financial products, tax laws, and investment strategies.

${Object.entries(FINANCIAL_TERMS).map(([term, definition]) => `${term.toUpperCase()}: ${definition}`).join('\n\n')}

For SIPs specifically: 
SIP stands for Systematic Investment Plan. It is a method of investing in mutual funds where you contribute a fixed amount regularly (typically monthly). SIPs allow investors to benefit from rupee cost averaging and the power of compounding. SIPs in India typically start from as low as ₹500 per month.

Remember:
1. Keep explanations clear and simple
2. Focus on Indian investment context when applicable
3. Add "Disclaimer: This information is for educational purposes only and not financial advice" to your answer

${context}

Question: ${question}`;
      
      // Query the model
      const result = await hf!.textGeneration({
        model: "google/flan-t5-xxl",
        inputs: systemPrompt,
        parameters: {
          max_new_tokens: 1024,
          temperature: 0.3,
          top_p: 0.95,
          do_sample: true,
        }
      });
      
      let response = result.generated_text;
      
      // Clean up the response
      response = response.trim();
      
      // Check if response seems irrelevant or too generic
      if (isIrrelevantResponse(response, question)) {
        return getFallbackResponse(question);
      }
      
      // Add disclaimer if not present
      if (!response.toLowerCase().includes('disclaimer') && 
          !response.toLowerCase().includes('educational')) {
        response += "\n\nDisclaimer: This information is for educational purposes only and not financial advice.";
      }
      
      return response;
    } catch (error) {
      console.error('Error calling Hugging Face API:', error);
      Alert.alert(
        'Connection Error', 
        'Could not connect to the AI service. Using offline mode.'
      );
      setIsConnected(false);
      return getFallbackResponse(question);
    }
  };
  
  // Get relevant questions from our dataset to provide as context
  const getRelevantQuestionsForContext = (userQuestion: string) => {
    const lowerQuestion = userQuestion.toLowerCase();
    const relevantQuestions: string[] = [];
    
    // Extract key terms from the user question
    const keyTerms = extractKeyTerms(lowerQuestion);
    
    // Find questions that match these key terms
    for (const item of qaDataset) {
      const qLower = item.question.toLowerCase();
      let matchCount = 0;
      
      for (const term of keyTerms) {
        if (qLower.includes(term)) {
          matchCount++;
        }
      }
      
      // Add questions with enough matching terms
      if (matchCount >= 2 && relevantQuestions.length < 3) {
        relevantQuestions.push(item.question);
      }
    }
    
    return relevantQuestions;
  };
  
  // Extract key financial terms from a question
  const extractKeyTerms = (text: string): string[] => {
    const financialTerms = [
      'sip', 'mutual fund', 'equity', 'debt', 'ppf', 'elss', 'tax', 'ltcg', 
      'stcg', 'nps', 'investment', 'return', 'risk', 'fixed deposit', 'fd', 
      'savings', 'stocks', 'shares', '80c', 'retirement', 'pension'
    ];
    
    const terms = [];
    for (const term of financialTerms) {
      if (text.includes(term)) {
        terms.push(term);
      }
    }
    
    return terms;
  };
  
  // Helper function to check if response is irrelevant
  const isIrrelevantResponse = (response: string, question: string): boolean => {
    const lowerResponse = response.toLowerCase();
    const lowerQuestion = question.toLowerCase();
    
    // Check if common financial terms are mentioned in the question but not in the response
    const financialTerms = ['investment', 'mutual fund', 'sip', 'equity', 'debt', 'return', 'risk', 'tax', 'ppf'];
    
    for (const term of financialTerms) {
      if (lowerQuestion.includes(term) && !lowerResponse.includes(term)) {
        return true;
      }
    }
    
    // Check for generic non-financial responses
    const nonFinancialIndicators = ['liquid that is used', 'food', 'drink', 'i don\'t know', 'not related', 'can\'t help'];
    for (const indicator of nonFinancialIndicators) {
      if (lowerResponse.includes(indicator)) {
        return true;
      }
    }
    
    // Check if the response is too short
    if (response.length < 50 && !lowerResponse.includes('₹')) {
      return true;
    }
    
    return false;
  };
  
  // Helper function to find financial term definitions
  const findFinancialTerm = (question: string): string | null => {
    const lowerQuestion = question.toLowerCase();
    
    // Direct "what is X" questions
    const whatIsMatch = lowerQuestion.match(/what\s+(?:is|are)\s+(?:an?|the)?\s*([a-z\s\-]+)(?:\?|$)/i);
    if (whatIsMatch && whatIsMatch[1]) {
      const term = whatIsMatch[1].trim().toLowerCase();
      
      // Check for exact matches or key term in the dictionary
      for (const [key, definition] of Object.entries(FINANCIAL_TERMS)) {
        if (term === key || term.includes(key) || key.includes(term)) {
          return definition;
        }
      }
      
      // Special cases for plurals or common variations
      if (term === 'sips' || term === 'systematic investment plans' || term === 'sip' || term === 'systematic investment plan') {
        return FINANCIAL_TERMS['sip'];
      }
    }
    
    // Check if any financial term is present in the question
    for (const [key, definition] of Object.entries(FINANCIAL_TERMS)) {
      if (lowerQuestion.includes(key)) {
        return definition;
      }
    }
    
    return null;
  };
  
  // Fallback function for offline mode
  const getFallbackResponse = (question: string): string => {
    // Check for financial term match first
    const termDefinition = findFinancialTerm(question);
    if (termDefinition) {
      return termDefinition + "\n\nDisclaimer: This information is educational only and not financial advice.";
    }
    
    // Simple keyword matching for offline mode
    const lowerQuestion = question.toLowerCase();
    
    // Check for SIP related questions specifically (based on the screenshot error)
    if (lowerQuestion.includes('sip') || lowerQuestion.includes('systematic investment')) {
      return "SIP (Systematic Investment Plan) is a method of investing in mutual funds where you contribute a fixed amount at regular intervals, typically monthly. SIPs help in rupee cost averaging (buying more units when prices are low and fewer when prices are high) and allow you to benefit from the power of compounding over time. In India, you can start a SIP with as little as ₹500 per month in most mutual funds.\n\nDisclaimer: This information is educational only and not financial advice.";
    }
    
    // Check for goal-related questions
    if (lowerQuestion.includes('goal') && goal) {
      return `Based on your goal "${goal}" of ₹${goalAmount.toLocaleString()}, you might want to consider ${getRecommendationForTimeframe(parseGoalTimeframe(goal))}`;
    }
    
    // Check for timeframe questions
    if (lowerQuestion.includes('short term') || lowerQuestion.includes('short-term')) {
      return "For short-term goals (less than 1 year), you might want to consider Liquid Funds, Ultra Short Duration Funds, or Bank Fixed Deposits. These typically offer returns of 5-6% with low risk.";
    }
    
    if (lowerQuestion.includes('medium term') || lowerQuestion.includes('medium-term')) {
      return "For medium-term goals (1-3 years), you could explore Corporate Bond Funds, Banking & PSU Debt Funds, or Post Office Time Deposits. These typically offer returns of 6-8% with moderate risk.";
    }
    
    if (lowerQuestion.includes('long term') || lowerQuestion.includes('long-term')) {
      return "For long-term goals (more than 3 years), you might consider Equity Mutual Funds, Public Provident Fund (PPF), National Pension System (NPS), or ELSS (tax-saving) funds. These can potentially offer higher returns of 10-12% over long periods but come with higher market risk.";
    }
    
    // Check for specific investment types
    if (lowerQuestion.includes('mutual fund')) {
      return "Mutual funds in India pool money from investors to purchase securities like stocks and bonds. They offer professional management and diversification. The main types are Equity funds (higher risk, potentially higher returns), Debt funds (lower risk, stable returns), and Hybrid funds (balanced risk-return profile). You can invest through Systematic Investment Plans (SIPs) with as little as ₹500 per month.";
    }
    
    if (lowerQuestion.includes('ppf') || lowerQuestion.includes('provident fund')) {
      return "Public Provident Fund (PPF) is a government-backed long-term investment scheme with a 15-year lock-in period. It currently offers an interest rate of 7.1% per annum, which is reviewed quarterly. PPF investments qualify for tax deduction under Section 80C and the interest earned is tax-free. The minimum annual investment is ₹500, while the maximum is ₹1.5 lakh.";
    }
    
    if (lowerQuestion.includes('fd') || lowerQuestion.includes('fixed deposit')) {
      return "Bank Fixed Deposits in India offer guaranteed returns at a fixed interest rate for a specific period. Current FD rates range from 5-7% depending on the bank and tenure. The interest earned is taxable as per your income tax slab. Senior citizens typically get an additional 0.5% interest. FDs are considered safe investments but don't provide inflation-beating returns in the long run.";
    }
    
    if (lowerQuestion.includes('equity') || lowerQuestion.includes('stock') || lowerQuestion.includes('share')) {
      return "Equity investments or stocks represent ownership in companies listed on stock exchanges like NSE and BSE. While they offer potentially high returns (historical average of 12-15% annually over long periods), they also carry higher risk due to market volatility. Long-term capital gains on equity are taxed at 10% above ₹1 lakh, while short-term gains are taxed at 15%.";
    }
    
    // Check for tax-related questions
    if (lowerQuestion.includes('tax') || lowerQuestion.includes('80c') || lowerQuestion.includes('deduction')) {
      return "In India, several investment options offer tax benefits. Under Section 80C, you can claim deductions up to ₹1.5 lakh by investing in PPF, ELSS mutual funds, 5-year tax-saving FDs, National Pension System (NPS), and life insurance premiums. NPS offers an additional deduction of up to ₹50,000 under Section 80CCD(1B). Health insurance premiums are deductible under Section 80D. Always consult a tax professional for personalized advice.";
    }
    
    // Default response for unknown questions
    return "That's a great question about investments. In the Indian context, it's important to consider factors like your time horizon, risk tolerance, and tax situation. Would you like to know about specific investment options like mutual funds, PPF, fixed deposits, or stocks?";
  };
  
  // Helper function to parse timeframe from goal text
  const parseGoalTimeframe = (goalText: string) => {
    if (!goalText) return 'medium-term';
    
    const yearMatch = goalText.match(/(\d+)\s*year/i);
    const monthMatch = goalText.match(/(\d+)\s*month/i);
    
    let months = 0;
    if (yearMatch && yearMatch[1]) {
      months += parseInt(yearMatch[1]) * 12;
    }
    if (monthMatch && monthMatch[1]) {
      months += parseInt(monthMatch[1]);
    }
    
    if (months <= 12) return 'short-term';
    if (months <= 36) return 'medium-term';
    return 'long-term';
  };
  
  // Get investment recommendations based on timeframe
  const getRecommendationForTimeframe = (timeframe: string) => {
    switch(timeframe) {
      case 'short-term':
        return "Liquid Funds, Ultra Short Duration Funds, or Bank Fixed Deposits. These are low-risk options suitable for goals less than 1 year away.";
      case 'medium-term':
        return "Corporate Bond Funds, Banking & PSU Debt Funds, or Post Office Time Deposits. These balance risk and returns for 1-3 year goals.";
      case 'long-term':
        return "Equity Mutual Funds, Public Provident Fund (PPF), or ELSS funds. These can potentially offer higher returns for goals more than 3 years away.";
      default:
        return "a mix of investment options based on your risk tolerance. Consider consulting a financial advisor for personalized guidance.";
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = { role: 'user', content: inputText.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    
    try {
      // Get AI response
      const response = await getModelResponse(userMessage.content);
      
      // Check if this response came from our dataset
      const isFromDataset = !!findSimilarQuestion(userMessage.content);
      
      // Add AI response to chat
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response,
        fromDataset: isFromDataset
      }]);
    } catch (error) {
      console.error('Error getting response:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I'm sorry, I couldn't process your request. Please try again later."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle tap on suggested question
  const handleSuggestedQuestion = (question: string) => {
    setInputText(question);
    
    // Auto-send the question
    const userMessage: ChatMessage = { role: 'user', content: question };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    // Immediately look for a match in the dataset
    const datasetAnswer = findSimilarQuestion(question);
    
    if (datasetAnswer) {
      // Use the dataset answer directly
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: datasetAnswer,
          fromDataset: true
        }]);
        setIsLoading(false);
        setInputText('');
      }, 500); // Small delay for better UX
    } else {
      // Get from the model
      getModelResponse(question)
        .then(response => {
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: response,
            fromDataset: false
          }]);
        })
        .catch(error => {
          console.error('Error getting response for suggested question:', error);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm sorry, I couldn't process your request. Please try again later."
          }]);
        })
        .finally(() => {
          setIsLoading(false);
          setInputText('');
        });
    }
  };

  return (
    <SafeAreaView style={[
      styles.container,
      // Use platform-specific padding for better handling of bottom area
      { paddingBottom: 0 }
    ]}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={COLORS.main} 
      />
      
      {/* Header with dataset status */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Investment Guide</Text>
        {datasetStatus === 'loaded' && (
          <View style={styles.datasetBadge}>
            <Text style={styles.datasetText}>Enhanced with {datasetSize} Q&As</Text>
          </View>
        )}
      </View>
      
      {/* Messages area */}
      <View style={styles.mainContent}>
        <ScrollView
          style={styles.messageContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Intro card for first-time users */}
          {messages.length === 1 && (
            <View style={styles.introCard}>
              <Text style={styles.introTitle}>Investment Rules & Strategies</Text>
              <Text style={styles.introText}>
                Ask about common investment rules like:
              </Text>
              <View style={styles.rulesList}>
                {INVESTMENT_RULES.slice(0, 6).map((rule, index) => (
                  <TouchableOpacity 
                    key={index}
                    style={styles.ruleItem}
                    onPress={() => handleSuggestedQuestion(`What is the ${rule.name}?`)}
                  >
                    <Text style={styles.ruleName}>{rule.name}</Text>
                    <Text style={styles.ruleDesc}>{rule.description}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
          
          {messages.map((message, index) => (
            <View 
              key={index} 
              style={[
                styles.messageBubble, 
                message.role === 'user' ? styles.userBubble : styles.assistantBubble
              ]}
            >
              <Text style={[
                styles.messageText,
                message.role === 'user' ? styles.userMessageText : styles.assistantMessageText
              ]}>
                {message.content}
              </Text>
              {message.role === 'assistant' && message.fromDataset && (
                <View style={styles.sourceTag}>
                  <Text style={styles.sourceTagText}>From expert dataset</Text>
                </View>
              )}
            </View>
          ))}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color={COLORS.accent} />
              <Text style={styles.loadingText}>Thinking...</Text>
            </View>
          )}
        </ScrollView>
      </View>
      
      {/* Fixed bottom input area */}
      <View style={styles.inputSection}>
        <View style={styles.suggestedContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.suggestedScroll}>
            {SUGGESTED_QUESTIONS.map((question, index) => (
              <TouchableOpacity
                key={index}
                style={styles.suggestedQuestion}
                onPress={() => handleSuggestedQuestion(question)}
              >
                <Text style={styles.suggestedText}>{question}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about investments..."
            placeholderTextColor={`${COLORS.primary}80`}
            multiline
          />
          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.main,
    display: 'flex',
    flexDirection: 'column',
    marginTop: 15,
  },
  header: {
    backgroundColor: COLORS.main,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.accent}33`, // accent with transparency
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  datasetBadge: {
    backgroundColor: `${COLORS.accent}33`, // accent with transparency
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  datasetText: {
    color: COLORS.accent,
    fontSize: 12,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 120, // Reduced padding so there's no empty space
  },
  messageContainer: {
    flex: 1,
    flexGrow: 1,
    paddingBottom: 100, // Adjusted for the input section height
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Adjusted to match the content properly
  },
  messageBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 12,
    maxWidth: '85%',
    elevation: 1,
    shadowColor: '#000', // Keep black for shadow
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: `${COLORS.accent}4D`, // accent with 30% opacity
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    alignSelf: 'flex-start',
    backgroundColor: `${COLORS.main}CC`, // main with 80% opacity
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: COLORS.primary,
  },
  assistantMessageText: {
    color: COLORS.primary,
  },
  sourceTag: {
    marginTop: 8,
    backgroundColor: `${COLORS.accent}26`, // accent with 15% opacity
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sourceTagText: {
    fontSize: 12,
    color: COLORS.accent,
    fontWeight: '500',
  },
  inputSection: {
    backgroundColor: `${COLORS.main}F0`,
    borderTopWidth: 2,
    borderTopColor: COLORS.accent,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10, // Reduced padding to prevent cutoff
    paddingTop: 10,
    padding: 8,
    position: 'absolute',
    width: '100%',
    zIndex: 1000,
    bottom: 0, // Ensure it's at the bottom
    marginTop: 'auto',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10, // Reduced padding
    alignItems: 'center',
    marginHorizontal: 8,
    backgroundColor: `${COLORS.main}`,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.accent,
    marginBottom: 90,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF", 
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 16, // Slightly reduced radius
    paddingHorizontal: 12, // Reduced padding
    paddingVertical: 8, // Reduced padding
    fontSize: 14, // Slightly smaller font
    color: "#000000",
    maxHeight: 80,
    minHeight: 36, // Reduced min height
  },
  sendButton: {
    width: 60, // Slightly smaller
    height: 40, // Slightly smaller
    marginLeft: 8, // Reduced margin
    borderRadius: 10,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3, // Slightly reduced elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: `${COLORS.accent}80`, // accent with 50% opacity
  },
  sendButtonText: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 15, // Smaller font size
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 8,
    color: COLORS.accent,
    fontSize: 14,
  },
  suggestedContainer: {
    padding: 4, // Further reduced padding
    marginBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: `${COLORS.accent}1A`,
  },
  suggestedScroll: {
    flexDirection: 'row',
  },
  suggestedQuestion: {
    backgroundColor: `${COLORS.accent}1A`,
    paddingHorizontal: 10, // Reduced padding
    paddingVertical: 5, // Reduced padding
    marginRight: 5, // Reduced margin
    borderRadius: 12, // Reduced border radius
    borderWidth: 1,
    borderColor: `${COLORS.accent}4D`,
  },
  suggestedText: {
    fontSize: 12, // Smaller font size
    color: COLORS.accent,
  },
  introCard: {
    backgroundColor: `${COLORS.main}BF`, // main with 75% opacity
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: `${COLORS.accent}33`, // accent with 20% opacity
  },
  introTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  rulesList: {
    marginTop: 8,
  },
  ruleItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: `${COLORS.accent}4D`, // accent with 30% opacity
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: `${COLORS.main}99`, // main with 60% opacity
  },
  ruleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
  },
  ruleDesc: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
  },
});

export default InvestScreen;