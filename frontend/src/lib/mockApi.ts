// lib/mockApi.ts

export const mockApi = {
  uploadPaper: async (formData: FormData) => {
    await new Promise(resolve => setTimeout(resolve, 2000));

    return {
      paper: {
        id: "1",
        _id: "1",
        title: "Attention Is All You Need",
        authors: [
          "Vaswani",
          "Shazeer",
          "Parmar",
          "Uszkoreit",
          "Jones",
          "Gomez",
          "Kaiser",
          "Polosukhin"
        ],
        abstract:
          "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
        summary:
          "This groundbreaking paper introduces the Transformer architecture, which relies entirely on attention mechanisms.",
        keywords: ["Deep Learning", "Neural Networks", "Transformers", "NLP"],
        relatedPapers: [
          {
            title: "BERT: Pre-training of Deep Bidirectional Transformers",
            authors: ["Devlin", "Chang"],
            year: "2019",
            abstract: "We introduce BERT, a new language representation model...",
            url: "#"
          }
        ]
      }
    };
  },

  createChatSession: async (paperId: string) => ({
    chatId: "chat-1"
  }),

  sendChatMessage: async (chatId: string, message: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    return {
      response:
        "This is a mock response about the paper. The Transformer architecture uses multi-head attention mechanisms."
    };
  },

  generateCitation: async (paperId: string, style: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const citations: Record<string, string> = {
      apa: "Vaswani, A., Shazeer, N., Parmar, N., et al. (2017). Attention is all you need...",
      mla: 'Vaswani, Ashish, et al. "Attention is all you need." (2017).',
      ieee:
        'A. Vaswani et al., "Attention is all you need," NIPS, pp. 5998-6008, 2017.',
      chicago:
        'Vaswani, Ashish, et al. "Attention is all you need." NeurIPS 30 (2017).',
      bibtex: `@article{vaswani2017attention,
  title={Attention is all you need},
  author={Vaswani, Ashish and Shazeer, Noam},
  journal={Advances in neural information processing systems},
  year={2017}
}`
    };

    return { citation: citations[style] ?? citations.apa };
  }
};
