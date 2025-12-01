import express from 'express';
import Paper from '../models/Paper';
import { CitationAgent } from '../services/citationAgent';

const router = express.Router();
const citationAgent = new CitationAgent();

router.post('/generate', async (req, res) => {
  try {
    const { paperId, style } = req.body;
    
    // Validation
    if (!paperId || !style) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Both paperId and style are required'
      });
    }

    // Fetch paper from database
    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        error: 'Paper not found',
        message: `No paper found with ID: ${paperId}`
      });
    }

    // Prepare paper data for citation
    const paperData = {
      title: paper.title,
      authors: paper.authors,
      year: paper.year || paper.uploadDate.getFullYear() // Use paper year or fallback to upload year
    };

    // Generate citation based on style
    let citation: string;
    const styleNormalized = style.toLowerCase().trim();
    
    switch (styleNormalized) {
      case 'apa':
        citation = citationAgent.formatAPA(paperData);
        break;
      case 'mla':
        citation = citationAgent.formatMLA(paperData);
        break;
      case 'ieee':
        citation = citationAgent.formatIEEE(paperData);
        break;
      case 'chicago':
        citation = citationAgent.formatChicago(paperData);
        break;
      case 'bibtex':
        citation = citationAgent.formatBibTeX(paperData);
        break;
      case 'harvard':
        citation = citationAgent.formatHarvard(paperData);
        break;
      case 'vancouver':
        citation = citationAgent.formatVancouver(paperData);
        break;
      default:
        return res.status(400).json({ 
          error: 'Invalid citation style',
          message: `Style '${style}' is not supported. Supported styles: APA, MLA, IEEE, Chicago, BibTeX, Harvard, Vancouver`,
          supportedStyles: ['APA', 'MLA', 'IEEE', 'Chicago', 'BibTeX', 'Harvard', 'Vancouver']
        });
    }

    console.log(`✅ Citation generated in ${style} format for paper: ${paper.title}`);

    // Return citation
    res.json({ 
      success: true,
      citation, 
      style: styleNormalized,
      paper: {
        title: paper.title,
        authors: paper.authors,
        year: paperData.year
      }
    });
    
  } catch (error: any) {
    console.error('❌ Citation generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate citation',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get all supported citation styles
router.get('/styles', (req, res) => {
  res.json({
    styles: [
      { name: 'APA', description: 'American Psychological Association (7th edition)' },
      { name: 'MLA', description: 'Modern Language Association (9th edition)' },
      { name: 'IEEE', description: 'Institute of Electrical and Electronics Engineers' },
      { name: 'Chicago', description: 'Chicago Manual of Style (17th edition)' },
      { name: 'Harvard', description: 'Harvard referencing style' },
      { name: 'Vancouver', description: 'Vancouver citation style (medical/scientific)' },
      { name: 'BibTeX', description: 'BibTeX format for LaTeX documents' }
    ]
  });
});

// Generate multiple citation formats at once
router.post('/generate-all', async (req, res) => {
  try {
    const { paperId } = req.body;
    
    if (!paperId) {
      return res.status(400).json({ 
        error: 'Missing paperId' 
      });
    }

    const paper = await Paper.findById(paperId);
    if (!paper) {
      return res.status(404).json({ 
        error: 'Paper not found' 
      });
    }

    const paperData = {
      title: paper.title,
      authors: paper.authors,
      year: paper.year || paper.uploadDate.getFullYear()
    };

    // Generate all citation formats
    const citations = {
      apa: citationAgent.formatAPA(paperData),
      mla: citationAgent.formatMLA(paperData),
      ieee: citationAgent.formatIEEE(paperData),
      chicago: citationAgent.formatChicago(paperData),
      harvard: citationAgent.formatHarvard(paperData),
      vancouver: citationAgent.formatVancouver(paperData),
      bibtex: citationAgent.formatBibTeX(paperData)
    };

    res.json({
      success: true,
      citations,
      paper: {
        title: paper.title,
        authors: paper.authors,
        year: paperData.year
      }
    });

  } catch (error: any) {
    console.error('❌ Generate all citations error:', error);
    res.status(500).json({ 
      error: 'Failed to generate citations',
      message: error.message
    });
  }
});

export default router;