export class CitationAgent {
  formatAPA(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'apa');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // APA format: Author, A. A. (Year). Title of work. Publisher.
    return `${authors} (${year}). ${title}.`;
  }

  formatMLA(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'mla');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // MLA format: Author. "Title." Year.
    return `${authors}. "${title}." ${year}.`;
  }

  formatIEEE(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'ieee');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // IEEE format: [1] A. Author, "Title," Year.
    return `${authors}, "${title}," ${year}.`;
  }

  formatChicago(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'chicago');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // Chicago format: Author. Year. "Title."
    return `${authors}. ${year}. "${title}."`;
  }

  formatBibTeX(paper: any): string {
    const key = this.generateBibTeXKey(paper);
    const title = paper.title || 'Untitled';
    const year = paper.year || new Date().getFullYear();
    
    // Format authors for BibTeX (Last, First and Last, First)
    const authorsFormatted = paper.authors && paper.authors.length > 0
      ? paper.authors.map((author: string) => {
          const parts = author.trim().split(' ');
          if (parts.length >= 2) {
            const lastName = parts[parts.length - 1];
            const firstName = parts.slice(0, -1).join(' ');
            return `${lastName}, ${firstName}`;
          }
          return author;
        }).join(' and ')
      : 'Unknown Author';
    
    return `@article{${key},
  author = {${authorsFormatted}},
  title = {${title}},
  year = {${year}}
}`;
  }

  formatHarvard(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'harvard');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // Harvard format: Author, A. (Year) Title. 
    return `${authors} (${year}) ${title}.`;
  }

  formatVancouver(paper: any): string {
    const authors = this.formatAuthors(paper.authors, 'vancouver');
    const year = paper.year || new Date().getFullYear();
    const title = paper.title || 'Untitled';
    
    // Vancouver format: Author A. Title. Year.
    return `${authors}. ${title}. ${year}.`;
  }

  private formatAuthors(authors: string[], style: string): string {
    if (!authors || authors.length === 0) {
      return 'Unknown Author';
    }

    // Filter out empty or invalid author names
    const validAuthors = authors.filter(a => a && a.trim().length > 0);
    
    if (validAuthors.length === 0) {
      return 'Unknown Author';
    }

    const firstAuthor = validAuthors[0].trim();
    
    switch (style) {
      case 'apa':
        if (validAuthors.length === 1) {
          return this.formatAuthorAPA(firstAuthor);
        } else if (validAuthors.length === 2) {
          return `${this.formatAuthorAPA(validAuthors[0])} & ${this.formatAuthorAPA(validAuthors[1])}`;
        } else {
          return `${this.formatAuthorAPA(firstAuthor)} et al.`;
        }
      
      case 'mla':
        if (validAuthors.length === 1) {
          return this.formatAuthorMLA(firstAuthor);
        } else if (validAuthors.length === 2) {
          return `${this.formatAuthorMLA(validAuthors[0])}, and ${validAuthors[1]}`;
        } else {
          return `${this.formatAuthorMLA(firstAuthor)}, et al.`;
        }
      
      case 'ieee':
        if (validAuthors.length === 1) {
          return this.formatAuthorIEEE(firstAuthor);
        } else if (validAuthors.length <= 6) {
          return validAuthors.map(a => this.formatAuthorIEEE(a)).join(', ');
        } else {
          return `${this.formatAuthorIEEE(firstAuthor)} et al.`;
        }
      
      case 'chicago':
        if (validAuthors.length === 1) {
          return this.formatAuthorChicago(firstAuthor);
        } else {
          return `${this.formatAuthorChicago(firstAuthor)} et al.`;
        }
      
      case 'harvard':
        if (validAuthors.length === 1) {
          return this.formatAuthorHarvard(firstAuthor);
        } else if (validAuthors.length === 2) {
          return `${this.formatAuthorHarvard(validAuthors[0])} and ${this.formatAuthorHarvard(validAuthors[1])}`;
        } else {
          return `${this.formatAuthorHarvard(firstAuthor)} et al.`;
        }
      
      case 'vancouver':
        if (validAuthors.length <= 6) {
          return validAuthors.map(a => this.formatAuthorVancouver(a)).join(', ');
        } else {
          return validAuthors.slice(0, 3).map(a => this.formatAuthorVancouver(a)).join(', ') + ', et al.';
        }
      
      default:
        return firstAuthor;
    }
  }

  // APA: Smith, J. A.
  private formatAuthorAPA(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
    return `${lastName}, ${initials}`;
  }

  // MLA: Smith, John
  private formatAuthorMLA(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstName}`;
  }

  // IEEE: J. A. Smith
  private formatAuthorIEEE(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join(' ');
    return `${initials} ${lastName}`;
  }

  // Chicago: Smith, John A.
  private formatAuthorChicago(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const firstName = parts.slice(0, -1).join(' ');
    return `${lastName}, ${firstName}`;
  }

  // Harvard: Smith, J.A.
  private formatAuthorHarvard(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase() + '.').join('');
    return `${lastName}, ${initials}`;
  }

  // Vancouver: Smith JA
  private formatAuthorVancouver(author: string): string {
    const parts = author.trim().split(' ');
    if (parts.length < 2) return author;
    
    const lastName = parts[parts.length - 1];
    const initials = parts.slice(0, -1).map(name => name.charAt(0).toUpperCase()).join('');
    return `${lastName} ${initials}`;
  }

  private generateBibTeXKey(paper: any): string {
    // Get first author's last name
    let authorKey = 'unknown';
    if (paper.authors && paper.authors.length > 0) {
      const firstAuthor = paper.authors[0].trim();
      const parts = firstAuthor.split(' ');
      authorKey = parts[parts.length - 1].toLowerCase().replace(/[^a-z]/g, '');
    }
    
    const year = paper.year || new Date().getFullYear();
    
    // Get first word of title
    let titleKey = '';
    if (paper.title) {
      const titleWords = paper.title.split(' ').filter((w: string) => w.length > 3);
      if (titleWords.length > 0) {
        titleKey = titleWords[0].toLowerCase().replace(/[^a-z]/g, '');
      }
    }
    
    return titleKey ? `${authorKey}${year}${titleKey}` : `${authorKey}${year}`;
  }
}