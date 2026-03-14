const { OpenAI } = require('openai');
const { Sale, Expense, Product } = require('../models');

// Initialize OpenAI connection
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to build a context block from user's data
const buildBusinessContext = async (userId) => {
  // Aggregate data for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const salesCount = await Sale.count({ where: { userId } });
  const expensesCount = await Expense.count({ where: { userId } });
  const productCount = await Product.count({ where: { userId } });

  // Get recent 5 sales for context
  const recentSales = await Sale.findAll({
    where: { userId },
    limit: 5,
    order: [['date', 'DESC']],
    attributes: ['productName', 'quantity', 'totalPrice', 'date']
  });

  return `
--- SYSTEM CONTEXT ---
The user is a small/medium business owner. 
Business metrics overview (lifetime):
- Total Products Configured: ${productCount}
- Total Sales Recorded: ${salesCount}
- Total Expenses Recorded: ${expensesCount}
Recent 5 Sales: ${JSON.stringify(recentSales)}
----------------------
`;
};

// 1. Natural language reports: “How did I perform last month?”
const generateReport = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const context = await buildBusinessContext(req.user.id);
    
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are SmartBiz AI, an expert business analyst for small to medium enterprises. Read the provided system context about the user's business and answer their query accurately, professionally, and concisely." },
        { role: "user", content: `${context}\n\nUser Query: ${prompt}` }
      ],
      temperature: 0.7,
    });

    res.status(200).json({ success: true, data: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Insights Error:', error);
    res.status(500).json({ success: false, message: 'Error generating report' });
  }
};

// 2. Email generator for customer follow-ups or complaints
const generateEmail = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert PR and communications assistant. Write a professional, polite, and clear email based on the user's instructions. Output only the email content without extra commentary." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
    });

    res.status(200).json({ success: true, data: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Email Error:', error);
    res.status(500).json({ success: false, message: 'Error generating email' });
  }
};

// 3. Marketing post writer (“Write a Facebook post for new arrivals”)
const generatePost = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ success: false, message: 'Prompt is required' });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are an expert social media marketer. Create engaging, high-conversion copy for social media platforms based on the user's prompt. Include relevant emojis and hashtags." },
        { role: "user", content: prompt }
      ],
      temperature: 0.8,
    });

    res.status(200).json({ success: true, data: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Post Error:', error);
    res.status(500).json({ success: false, message: 'Error generating social media post' });
  }
};

// 4. Invoice summary (“Explain this invoice in simple terms”)
const summarizeInvoice = async (req, res) => {
  try {
    const { invoiceData } = req.body;
    if (!invoiceData) return res.status(400).json({ success: false, message: 'invoiceData is required' });

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful customer service representative. The user will provide raw invoice/receipt data. Explain the charges simply and politely in a way the end customer would easily understand." },
        { role: "user", content: `Invoice Data:\n${JSON.stringify(invoiceData)}` }
      ],
      temperature: 0.5,
    });

    res.status(200).json({ success: true, data: response.choices[0].message.content });
  } catch (error) {
    console.error('AI Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Error summarizing invoice' });
  }
};

module.exports = {
  generateReport,
  generateEmail,
  generatePost,
  summarizeInvoice
};
