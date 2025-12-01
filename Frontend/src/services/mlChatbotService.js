class MLChatbotService {
  constructor() {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.baseURL = `${apiBaseUrl}/chatbot`;
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  generateSessionId() {
    return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async sendMessage(message) {
    try {
      const response = await fetch(`${this.baseURL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          sessionId: this.sessionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      if (data.success) {
        this.conversationHistory.push({
          role: 'user',
          content: message,
          timestamp: new Date()
        });
        
        this.conversationHistory.push({
          role: 'assistant',
          content: data.response,
          intent: data.intent,
          confidence: data.confidence,
          suggestedActions: data.suggestedActions,
          timestamp: new Date()
        });

        return {
          success: true,
          message: data.response,
          intent: data.intent,
          confidence: data.confidence,
          suggestedActions: data.suggestedActions
        };
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('ML Chatbot service error:', error);
      
      const fallbackResponse = this.getFallbackResponse(message);
      
      this.conversationHistory.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });
      
      this.conversationHistory.push({
        role: 'assistant',
        content: fallbackResponse.message,
        intent: fallbackResponse.intent,
        confidence: 0.5,
        suggestedActions: fallbackResponse.suggestedActions,
        timestamp: new Date(),
        isFallback: true
      });

      return {
        success: true,
        message: fallbackResponse.message,
        intent: fallbackResponse.intent,
        confidence: 0.5,
        suggestedActions: fallbackResponse.suggestedActions,
        isFallback: true
      };
    }
  }

  getFallbackResponse(message) {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('delivery') && lowerMessage.includes('more than') && lowerMessage.includes('days')) {
      return {
        message: "If your delivery takes more than 10 days, please contact our support team immediately at support@fashionforward.com or call +91-9876543210. We'll investigate the delay and may offer compensation or expedited shipping. You can also track your order status in your account.",
        intent: "shipping",
        suggestedActions: ["Track Order", "Contact Support", "Shipping Policy"]
      };
    }
    
    if (lowerMessage.includes('shipping') || lowerMessage.includes('delivery')) {
      return {
        message: "We offer FREE shipping on all orders above ₹2000! For orders below ₹2000, shipping charges are ₹99. Generally, delivery takes 5-7 business days for most locations. Express delivery (₹199 extra) takes 2-3 business days. We deliver to all major cities across India.",
        intent: "shipping",
        suggestedActions: ["Track Order", "Shipping Policy", "Contact Support"]
      };
    }
    
    if (lowerMessage.includes('return') || lowerMessage.includes('refund')) {
      return {
        message: "You can return products within 30 days of purchase. Visit your order history, select the item you want to return, and follow the return process. We'll provide a prepaid return label. Items must be in original condition with tags attached. Refunds are processed within 5-7 business days.",
        intent: "returns",
        suggestedActions: ["Return Policy", "Start Return", "Contact Support"]
      };
    }
    
    if (lowerMessage.includes('payment') || lowerMessage.includes('pay')) {
      return {
        message: "We accept all major payment methods: Credit/Debit cards (Visa, MasterCard, RuPay), UPI (Google Pay, PhonePe, Paytm), Net Banking, Wallets, and Cash on Delivery (COD). All payments are secure and encrypted. COD is available for orders up to ₹5000.",
        intent: "payment",
        suggestedActions: ["Payment Methods", "Billing Support", "Contact Support"]
      };
    }
    
    if (lowerMessage.includes('account') || lowerMessage.includes('login')) {
      return {
        message: "You can manage your account by clicking on your profile icon. You can view orders, update information, and manage settings. For login issues, try resetting your password.",
        intent: "account",
        suggestedActions: ["My Account", "Reset Password", "Contact Support"]
      };
    }
    
    if (lowerMessage.includes('size') || lowerMessage.includes('fit') || lowerMessage.includes('measurement')) {
      return {
        message: "We provide detailed size charts for each product. Measure your chest, waist, and hip according to our size guide. Most products are true to size, but check individual product descriptions for specific fit notes. If unsure, we recommend sizing up for comfort.",
        intent: "sizing",
        suggestedActions: ["Size Guide", "Size Chart", "Contact Support"]
      };
    }
    
    if (lowerMessage.includes('fashion') || lowerMessage.includes('style') || lowerMessage.includes('trend')) {
      return {
        message: "We offer trendy fashion for men and women! Check our collections for party wear, casual wear, and traditional Indian wear. Currently trending: Oversized shirts, high-waist jeans, crop tops, and statement accessories. Browse our New Arrivals for the latest styles!",
        intent: "fashion",
        suggestedActions: ["Browse Collections", "New Arrivals", "Fashion Guide"]
      };
    }
    
    if (lowerMessage.includes('product') || lowerMessage.includes('item') || lowerMessage.includes('clothing')) {
      return {
        message: "We specialize in fashion-forward clothing for men and women. Our collection includes: Men's - Kurtas, shirts, t-shirts, jeans, jackets, shoes. Women's - Dresses, sarees, tops, jeans, skirts, accessories. We also have accessories like caps, sunglasses, bags, and jewelry.",
        intent: "products",
        suggestedActions: ["Browse Products", "Search Items", "View Categories"]
      };
    }
    
    if (lowerMessage.includes('not working') || lowerMessage.includes('error') || lowerMessage.includes('bug')) {
      return {
        message: "We're sorry for the inconvenience. Please try: 1) Refresh the page, 2) Clear your browser cache, 3) Try a different browser, 4) Check your internet connection. If the issue persists, contact our technical support at tech@fashionforward.com or call +91-9876543210.",
        intent: "technical",
        suggestedActions: ["Contact Support", "Report Issue", "Help Center"]
      };
    }
    
    if (lowerMessage.includes('mobile') || lowerMessage.includes('responsive') || lowerMessage.includes('app')) {
      return {
        message: "Yes, our website is fully responsive and works great on mobile devices. You can shop, track orders, and manage your account from any smartphone or tablet. We're working on a dedicated mobile app for even better mobile experience.",
        intent: "general",
        suggestedActions: ["Browse Products", "Download App", "Contact Support"]
      };
    }
    
    return {
      message: "I'm here to help! I can assist you with orders, shipping, returns, products, payments, sizing, fashion advice, and account-related questions. Could you please provide more details about what you're looking for?",
      intent: "general",
      suggestedActions: ["Browse Products", "Contact Support", "Help Center"]
    };
  }

  async provideFeedback(knowledgeId, helpful, rating = null, comment = null) {
    try {
      const response = await fetch(`${this.baseURL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          knowledgeId: knowledgeId,
          helpful: helpful,
          rating: rating,
          comment: comment
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send feedback');
      }

      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Feedback error:', error);
      return false;
    }
  }

  async getConversationHistory() {
    try {
      const response = await fetch(`${this.baseURL}/conversations/${this.sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to get conversation history');
      }

      const data = await response.json();
      return data.success ? data.messages : [];
    } catch (error) {
      console.error('Get conversation history error:', error);
      return [];
    }
  }

  getSessionId() {
    return this.sessionId;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }
}

export default MLChatbotService;
