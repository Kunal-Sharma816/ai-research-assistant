import express from 'express';
import Chat from '../models/Chat';
import Paper from '../models/Paper';
import { SummarizerAgent } from '../services/summarizerAgent';

const router = express.Router();
const summarizerAgent = new SummarizerAgent();

// Create a new chat session for a paper
router.post('/session', async (req, res) => {
  try {
    const { paperId } = req.body;
    
    if (!paperId) {
      return res.status(400).json({ 
        error: 'Paper ID required',
        message: 'Please provide a paperId to create a chat session'
      });
    }

    // Verify paper exists
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        error: 'Paper not found',
        message: `No paper found with ID: ${paperId}`
      });
    }

    // Create new chat session
    const chat = new Chat({ 
      paperId, 
      messages: [] 
    });
    
    await chat.save();

    console.log(`✅ Chat session created: ${chat._id} for paper: ${paper.title}`);

    res.json({ 
      success: true,
      chatId: chat._id, 
      paperId: chat.paperId,
      paperTitle: paper.title
    });
    
  } catch (error: any) {
    console.error('❌ Create chat session error:', error);
    res.status(500).json({ 
      error: 'Failed to create chat session',
      message: error.message
    });
  }
});

// Send a message in a chat session
router.post('/message', async (req, res) => {
  try {
    const { chatId, message } = req.body;
    
    // Validation
    if (!chatId || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both chatId and message are required'
      });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Invalid message',
        message: 'Message must be a non-empty string'
      });
    }

    // Find chat session
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat not found',
        message: `No chat session found with ID: ${chatId}`
      });
    }

    // Find associated paper
    const paper = await Paper.findById(chat.paperId);
    if (!paper) {
      return res.status(404).json({ 
        error: 'Paper not found',
        message: 'The paper associated with this chat session was not found'
      });
    }

    console.log(`💬 Processing message in chat ${chatId}`);
    console.log(`   Question: ${message.substring(0, 100)}...`);

    // Add user message to chat history
    chat.messages.push({ 
      role: 'user', 
      content: message.trim(), 
      timestamp: new Date() 
    });

    // Build chat history context (last 10 messages for context)
    const recentMessages = chat.messages.slice(-10);
    const chatHistory = recentMessages
      .map(m => `${m.role}: ${m.content}`)
      .join('\n');

    // Get AI response
    let response: string;
    try {
      response = await summarizerAgent.answerQuestion(
        paper.fullText, 
        message.trim(), 
        chatHistory
      );
      console.log(`✅ Response generated: ${response.length} characters`);
    } catch (error: any) {
      console.error('❌ AI response error:', error);
      
      // Provide helpful error message to user
      response = `I apologize, but I encountered an error processing your question: ${error.message}

Please try:
- Asking a simpler or more specific question
- Rephrasing your question
- Waiting a moment and trying again

If you continue to see this error, there may be an issue with the API configuration.`;
    }

    // Add assistant response to chat history
    chat.messages.push({ 
      role: 'assistant', 
      content: response, 
      timestamp: new Date() 
    });

    // Save updated chat
    await chat.save();

    res.json({ 
      success: true,
      response, 
      chatId: chat._id,
      messageCount: chat.messages.length
    });
    
  } catch (error: any) {
    console.error('❌ Process message error:', error);
    res.status(500).json({ 
      error: 'Failed to process message',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get chat history
router.get('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat not found',
        message: `No chat session found with ID: ${req.params.chatId}`
      });
    }

    // Get paper details
    const paper = await Paper.findById(chat.paperId).select('title authors');

    res.json({
      success: true,
      chat: {
        id: chat._id,
        paperId: chat.paperId,
        messages: chat.messages,
        createdAt: chat.createdAt,
        messageCount: chat.messages.length
      },
      paper: paper ? {
        title: paper.title,
        authors: paper.authors
      } : null
    });
    
  } catch (error: any) {
    console.error('❌ Get chat error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chat',
      message: error.message
    });
  }
});

// Get all chats for a paper
router.get('/paper/:paperId', async (req, res) => {
  try {
    const chats = await Chat.find({ paperId: req.params.paperId })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({
      success: true,
      chats: chats.map(chat => ({
        id: chat._id,
        paperId: chat.paperId,
        messageCount: chat.messages.length,
        createdAt: chat.createdAt,
        lastMessage: chat.messages.length > 0 
          ? chat.messages[chat.messages.length - 1] 
          : null
      })),
      count: chats.length
    });
    
  } catch (error: any) {
    console.error('❌ Get paper chats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch chats',
      message: error.message
    });
  }
});

// Delete a chat session
router.delete('/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findByIdAndDelete(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ 
        error: 'Chat not found' 
      });
    }

    res.json({ 
      success: true,
      message: 'Chat deleted successfully',
      chatId: req.params.chatId
    });
    
  } catch (error: any) {
    console.error('❌ Delete chat error:', error);
    res.status(500).json({ 
      error: 'Failed to delete chat',
      message: error.message
    });
  }
});

export default router;