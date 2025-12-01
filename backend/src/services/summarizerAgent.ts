import { getGeminiModel } from '../config/gemini';

export class SummarizerAgent {
  // CHANGED: Use the stable 1.5 Flash model to prevent Quota errors
  // ✅ Remove the string argument so it defaults to 'gemini-pro' from config
  private model = getGeminiModel(); 
  // NEW: Use AI to find the real Title and Authors
  async extractMetadataWithAI(text: string): Promise<{ title: string, authors: string[], year: number | null }> {
    try {
      const truncatedText = text.substring(0, 10000); // First 10k chars usually contain this info

      const prompt = `Analyze the first few pages of this research paper and extract the following metadata in JSON format:
      1. Title (The main title of the paper)
      2. Authors (List of author names)
      3. Year (Publication year, if found. If not, null)

      Return ONLY valid JSON like this:
      {
        "title": "The Title Here",
        "authors": ["Author One", "Author Two"],
        "year": 2024
      }

      Text to analyze:
      ${truncatedText}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const cleanText = response.text().replace(/```json|```/g, '').trim(); // Remove markdown formatting
      
      return JSON.parse(cleanText);
    } catch (error) {
      console.warn('⚠️ AI Metadata extraction failed, falling back to regex:', error);
      // Return null to signal we should use the basic regex fallback
      throw error;
    }
  }

  async summarizePaper(fullText: string): Promise<string> {
    try {
      console.log('🤖 Starting AI summary generation...');
      
      // Check for placeholder
      if (fullText.includes('SCANNED_PDF_WARNING') || fullText.length < 500) {
        return `**Summary Unavailable**\n\nThis document appears to be a scanned PDF or image. Text extraction failed. Please try a text-based PDF.`;
      }

      // Limit text to avoid token limits (1.5 Flash is generous, but let's be safe)
      const truncatedText = fullText.substring(0, 30000);
      
      const prompt = `You are an expert research paper analyst. Provide a comprehensive summary of this paper.
      
      **Paper Content:**
      ${truncatedText}

      **Instructions:**
      Provide a structured summary with these exact headers:
      ## 1. Main Research Question
      ## 2. Methodology
      ## 3. Key Findings
      ## 4. Conclusions & Implications
      ## 5. Significance

      Keep it between 400-600 words. Be specific.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
      
    } catch (error: any) {
      console.error('❌ Summary generation error:', error.message);
      
      if (error.message?.includes('429') || error.message?.includes('quota')) {
        return this.generateQuotaExceededMessage();
      }
      
      return `**Summary Generation Failed**\n\nAn error occurred: ${error.message}. Please try using the chat feature.`;
    }
  }

  async extractKeywords(text: string): Promise<string[]> {
    try {
      const truncatedText = text.substring(0, 10000);
      const prompt = `Extract 8-10 technical keywords from this text. Return them as a comma-separated list. No numbering.`;
      
      const result = await this.model.generateContent(prompt);
      const keywords = result.response.text().split(',').map(k => k.trim());
      return keywords.slice(0, 10);
    } catch (error) {
      console.error('⚠️ Keyword extraction failed, using fallback');
      return ['Research', 'Analysis', 'Academic'];
    }
  }

  async answerQuestion(paperContent: string, question: string, chatHistory: string = ''): Promise<string> {
    try {
      // Logic remains the same, just ensures 1.5 Flash is used
      const truncatedContent = paperContent.substring(0, 40000);
      const truncatedHistory = chatHistory.substring(Math.max(0, chatHistory.length - 2000));
      
      const prompt = `You are a helpful research assistant.
      **Paper Content:** ${truncatedContent}
      **History:** ${truncatedHistory}
      **User Question:** ${question}
      
      Answer based strictly on the paper.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error: any) {
      return "I apologize, but I cannot answer right now due to high traffic or an error. Please try again in a moment.";
    }
  }

  private generateQuotaExceededMessage(): string {
    return `**System Busy (Rate Limit Reached)**
    
    The AI service is currently receiving too many requests per minute.
    
    **What to do:**
    1. Wait 30 seconds.
    2. Try refreshing or re-uploading.
    3. Use the Chat feature (it uses fewer resources).`;
  }
}