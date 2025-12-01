import * as pdfjsLib from 'pdfjs-dist';

export class PdfService {

  async extractText(buffer: Buffer): Promise<string> {
    try {
      console.log('📄 Starting PDF extraction...');
      
      // Convert Buffer to Uint8Array
      const data = new Uint8Array(buffer);

      // Load the document
      const loadingTask = pdfjsLib.getDocument({
        data,
        useSystemFonts: true,
        disableFontFace: true, // Helps in Node environments
      });

      const pdfDocument = await loadingTask.promise;
      const numPages = pdfDocument.numPages;

      console.log(`✅ PDF loaded. Total pages: ${numPages}`);

      let fullText = '';
      
      // Process pages sequentially to avoid memory spikes
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            
            const pageText = textContent.items
              .map((item: any) => item.str || '')
              .join(' ');
              
            fullText += pageText + '\n\n';
        } catch (err) {
            console.error(`⚠️ Error extracting page ${pageNum}`, err);
        }
      }

      // Validation checks
      if (fullText.trim().length < 50) {
        console.warn('⚠️ Very little text extracted - PDF might be scanned/image-based');
        return `[SCANNED_PDF_WARNING] This document appears to be an image-based PDF. Text extraction is limited.`;
      }

      return fullText;

    } catch (error: any) {
      console.error('❌ PDF extraction failed:', error.message);
      throw new Error(`PDF Extraction Failed: ${error.message}`);
    }
  }

  extractMetadata(text: string): { title: string; authors: string[]; abstract: string; year: number | null } {
    // Default values
    let title = 'Untitled Research Paper';
    let authors = ['Unknown Author'];
    let abstract = 'Abstract unavailable.';
    let year: number | null = null;

    const lines = text.split('\n').filter(line => line.trim().length > 0);

    // 1. Try to find Title (usually first meaningful line)
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 10 && line.length < 200) {
        title = line;
        break;
      }
    }

    // 2. Try to find Abstract
    const abstractMatch = text.match(/Abstract[:\s]+([\s\S]{100,1500}?)(?:\n\n|Introduction)/i);
    if (abstractMatch) {
      abstract = abstractMatch[1].trim();
    } else {
        // Fallback: Take first large paragraph
        abstract = text.substring(0, 500) + "...";
    }

    // 3. Try to find Year
    const yearMatch = text.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
      year = parseInt(yearMatch[0]);
    }

    return {
      title: title.substring(0, 200),
      authors, // Author extraction is very hard with Regex, keeping simple for now
      abstract: abstract.substring(0, 2000),
      year
    };
  }
}