import axios from 'axios';

export interface IRelatedPaper {
  title: string;
  authors: string[];
  abstract: string;
  url: string;
  year: number;
} 

export class ExplorerAgent {
  private readonly semanticScholarApi = 'https://api.semanticscholar.org/graph/v1';
  private readonly timeout = 10000; // 10 second timeout
  private readonly maxRetries = 2;

  async findRelatedPapers(query: string, limit: number = 10): Promise<IRelatedPaper[]> {
    try {
      console.log(`🔍 Searching for related papers: "${query}"`);
      
      // Clean and validate query
      if (!query || query.trim().length < 3) {
        console.warn('⚠️ Query too short, using default search');
        query = 'machine learning research';
      }

      // Limit query length to avoid API issues
      const cleanQuery = query.substring(0, 200).trim();

      const response = await this.makeRequestWithRetry(
        `${this.semanticScholarApi}/paper/search`,
        {
          params: { 
            query: cleanQuery, 
            limit: Math.min(limit, 20), // Cap at 20
            fields: 'title,authors,abstract,year,url,paperId,citationCount'
          },
          timeout: this.timeout,
          headers: {
            'Accept': 'application/json'
          }
        }
      );

      if (response.data?.data && Array.isArray(response.data.data)) {
        const papers = response.data.data
          .filter((paper: any) => {
            // Filter out papers with missing essential data
            return paper.title && 
                   paper.authors && 
                   paper.authors.length > 0;
          })
          .map((paper: any) => ({
            title: paper.title,
            authors: paper.authors.map((a: any) => a.name || 'Unknown Author'),
            abstract: paper.abstract || 'No abstract available',
            url: paper.url || `https://www.semanticscholar.org/paper/${paper.paperId}`,
            year: paper.year || new Date().getFullYear(),
            citationCount: paper.citationCount || 0
          }))
          // Sort by citation count (most cited first)
          .sort((a: any, b: any) => (b.citationCount || 0) - (a.citationCount || 0))
          // Remove citation count from final result
          .map(({ citationCount, ...paper }: any) => paper)
          .slice(0, limit);

        console.log(`✅ Found ${papers.length} related papers`);
        return papers;
      }

      console.warn('⚠️ No papers found in API response');
      return [];
      
    } catch (error: any) {
      console.error('❌ Related papers search error:', error.message);
      
      // Log more details in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          status: error.response?.status,
          data: error.response?.data
        });
      }
      
      // Return empty array instead of throwing to prevent upload failure
      return [];
    }
  }

  // Helper method to retry requests on failure
  private async makeRequestWithRetry(url: string, config: any, retries: number = 0): Promise<any> {
    try {
      return await axios.get(url, config);
    } catch (error: any) {
      // If we haven't exhausted retries and it's a network error, retry
      if (retries < this.maxRetries && this.isRetryableError(error)) {
        console.log(`⚠️ Request failed, retrying (${retries + 1}/${this.maxRetries})...`);
        await this.delay(1000 * (retries + 1)); // Exponential backoff
        return this.makeRequestWithRetry(url, config, retries + 1);
      }
      throw error;
    }
  }

  // Check if error is retryable
  private isRetryableError(error: any): boolean {
    return (
      error.code === 'ECONNABORTED' || // Timeout
      error.code === 'ENOTFOUND' || // DNS lookup failed
      error.code === 'ECONNREFUSED' || // Connection refused
      (error.response && error.response.status >= 500) // Server error
    );
  }

  // Simple delay helper
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Alternative: Find papers by DOI (if you have DOI)
  async findPaperByDOI(doi: string): Promise<IRelatedPaper | null> {
    try {
      const response = await axios.get(
        `${this.semanticScholarApi}/paper/DOI:${doi}`,
        {
          params: {
            fields: 'title,authors,abstract,year,url'
          },
          timeout: this.timeout
        }
      );

      if (response.data) {
        return {
          title: response.data.title,
          authors: response.data.authors?.map((a: any) => a.name) || [],
          abstract: response.data.abstract || 'No abstract available',
          url: response.data.url || `https://doi.org/${doi}`,
          year: response.data.year || new Date().getFullYear()
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding paper by DOI:', error);
      return null;
    }
  }
}