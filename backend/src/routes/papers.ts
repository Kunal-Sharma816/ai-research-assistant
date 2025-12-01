import express from 'express';
import multer from 'multer';
import Paper from '../models/Paper';
import { PdfService } from '../services/pdfServices';
import { SummarizerAgent } from '../services/summarizerAgent';
import { ExplorerAgent } from '../services/explorerAgent';

const router = express.Router();

// Configure Multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

const pdfService = new PdfService();
const summarizerAgent = new SummarizerAgent();
const explorerAgent = new ExplorerAgent();

// Helper to prevent Rate Limiting (429)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/upload', upload.single('pdf'), async (req: any, res: any) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No PDF uploaded' });
    }

    console.log(`📦 Processing file: ${req.file.originalname}`);

    // 1. Extract Text
    const fullText = await pdfService.extractText(req.file.buffer);

    // 2. Extract Basic Metadata (Regex)
    let metadata = pdfService.extractMetadata(fullText);

    // 2.5 Enhance Metadata with AI (Fixes "Untitled" issue)
    try {
        console.log("🧠 AI analyzing metadata...");
        const aiMetadata = await summarizerAgent.extractMetadataWithAI(fullText);
        
        // Merge AI results (AI is usually smarter about Titles)
        if (aiMetadata.title && aiMetadata.title !== "Untitled") {
            metadata.title = aiMetadata.title;
        }
        if (aiMetadata.authors && aiMetadata.authors.length > 0) {
            metadata.authors = aiMetadata.authors;
        }
        if (aiMetadata.year) {
            metadata.year = aiMetadata.year;
        }
        console.log("✅ Metadata enhanced:", metadata.title);
    } catch (e) {
        console.log("⚠️ AI Metadata failed, keeping regex defaults.");
    }

    // 💤 PAUSE: Wait 2 seconds to respect Gemini Rate Limits
    await delay(2000);

    // 3. Generate Summary
    let summary = "Summary unavailable";
    try {
        summary = await summarizerAgent.summarizePaper(fullText);
    } catch (err) {
        console.error("AI Summary failed");
    }

    // 💤 PAUSE: Wait 1 second
    await delay(1000);

    // 4. Extract Keywords (Optional - don't fail upload if this fails)
    let keywords: string[] = [];
    try {
        keywords = await summarizerAgent.extractKeywords(fullText);
    } catch (err) {
        console.warn("Keyword extraction skipped");
        keywords = ["Research", "Analysis"];
    }

    // 5. Find Related Papers (Optional)
    let relatedPapers: any[] = [];
    try {
         // Search using the Title
         relatedPapers = await explorerAgent.findRelatedPapers(metadata.title);
    } catch (err) {
        console.warn("Related papers search skipped");
    }

    // 6. Save to DB
    const paper = new Paper({
      title: metadata.title,
      authors: metadata.authors,
      abstract: metadata.abstract,
      fullText,
      summary,
      keywords,
      relatedPapers,
      year: metadata.year,
      uploadDate: new Date()
    });

    await paper.save();
    console.log('💾 Saved paper to DB:', paper._id);

    res.json({ success: true, paper });

  } catch (error: any) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ error: 'Failed to process PDF', details: error.message });
  }
});

router.get('/', async (req, res) => {
    try {
        const papers = await Paper.find().select('-fullText').sort({ uploadDate: -1 });
        res.json({ papers });
    } catch (error) {
        res.status(500).json({ error: 'Fetch failed' });
    }
});

export default router;