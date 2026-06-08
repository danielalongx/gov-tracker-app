export interface StockInfo {
  ticker: string;
  name: string;
  sector: string;
  mockPrice: number;
  mockChange: number;   // percent, positive = gain
  mockPE: number;
  mockMarketCap: string;
}

/** 20 popular stocks shown as chips. Also used for mock search. */
export const POPULAR_STOCKS: StockInfo[] = [
  { ticker: 'AAPL',    name: 'Apple Inc',          sector: '科技',  mockPrice: 189.30, mockChange:  1.24, mockPE: 29.5, mockMarketCap: '$2.9T'  },
  { ticker: 'NVDA',    name: 'NVIDIA',              sector: '半导体', mockPrice: 875.40, mockChange:  3.82, mockPE: 72.1, mockMarketCap: '$2.15T' },
  { ticker: 'TSLA',    name: 'Tesla',               sector: '新能源', mockPrice: 192.50, mockChange: -1.43, mockPE: 48.3, mockMarketCap: '$613B'  },
  { ticker: 'MSFT',    name: 'Microsoft',           sector: '科技',  mockPrice: 415.80, mockChange:  0.87, mockPE: 35.2, mockMarketCap: '$3.09T' },
  { ticker: 'GOOGL',   name: 'Alphabet',            sector: '科技',  mockPrice: 173.20, mockChange:  1.55, mockPE: 24.8, mockMarketCap: '$2.14T' },
  { ticker: 'META',    name: 'Meta Platforms',      sector: '科技',  mockPrice: 502.70, mockChange:  2.31, mockPE: 26.9, mockMarketCap: '$1.28T' },
  { ticker: 'AMZN',    name: 'Amazon',              sector: '消费品', mockPrice: 183.60, mockChange:  0.63, mockPE: 55.7, mockMarketCap: '$1.91T' },
  { ticker: 'BABA',    name: 'Alibaba',             sector: '科技',  mockPrice:  76.20, mockChange: -0.52, mockPE: 10.1, mockMarketCap: '$183B'  },
  { ticker: 'TSM',     name: 'TSMC',                sector: '半导体', mockPrice: 152.40, mockChange:  2.14, mockPE: 22.4, mockMarketCap: '$789B'  },
  { ticker: 'ASML',    name: 'ASML Holding',        sector: '半导体', mockPrice: 932.10, mockChange:  1.76, mockPE: 38.5, mockMarketCap: '$367B'  },
  { ticker: 'JPM',     name: 'JPMorgan Chase',      sector: '金融',  mockPrice: 196.80, mockChange:  0.45, mockPE: 11.8, mockMarketCap: '$570B'  },
  { ticker: 'GS',      name: 'Goldman Sachs',       sector: '金融',  mockPrice: 458.30, mockChange:  1.02, mockPE: 13.4, mockMarketCap: '$148B'  },
  { ticker: 'XOM',     name: 'ExxonMobil',          sector: '能源',  mockPrice: 112.70, mockChange: -0.38, mockPE:  13.2, mockMarketCap: '$449B'  },
  { ticker: 'CVX',     name: 'Chevron',             sector: '能源',  mockPrice: 157.20, mockChange:  0.21, mockPE: 14.1, mockMarketCap: '$292B'  },
  { ticker: 'JNJ',     name: 'Johnson & Johnson',   sector: '医疗',  mockPrice: 152.60, mockChange: -0.74, mockPE: 14.8, mockMarketCap: '$368B'  },
  { ticker: 'PFE',     name: 'Pfizer',              sector: '医疗',  mockPrice:  27.40, mockChange: -1.08, mockPE:  8.3, mockMarketCap: '$155B'  },
  { ticker: 'KO',      name: 'Coca-Cola',           sector: '消费品', mockPrice:  62.10, mockChange:  0.16, mockPE: 22.6, mockMarketCap: '$267B'  },
  { ticker: 'MCD',     name: "McDonald's",          sector: '消费品', mockPrice: 287.50, mockChange:  0.93, mockPE: 23.1, mockMarketCap: '$206B'  },
  { ticker: '0700.HK', name: '腾讯控股',             sector: '科技',  mockPrice: 388.00, mockChange:  1.44, mockPE: 21.3, mockMarketCap: 'HK$3.7T'},
  { ticker: '9988.HK', name: '阿里巴巴',             sector: '消费品', mockPrice:  82.50, mockChange: -0.61, mockPE:  9.8, mockMarketCap: 'HK$1.6T'},
  // extras for search
  { ticker: 'AMD',     name: 'AMD',                 sector: '半导体', mockPrice: 171.30, mockChange:  2.87, mockPE: 41.2, mockMarketCap: '$277B'  },
  { ticker: 'INTC',    name: 'Intel',               sector: '半导体', mockPrice:  28.70, mockChange: -1.62, mockPE: 12.9, mockMarketCap: '$121B'  },
  { ticker: 'NFLX',    name: 'Netflix',             sector: '科技',  mockPrice: 612.80, mockChange:  1.33, mockPE: 43.7, mockMarketCap: '$264B'  },
  { ticker: 'V',       name: 'Visa',                sector: '金融',  mockPrice: 278.40, mockChange:  0.54, mockPE: 31.8, mockMarketCap: '$572B'  },
  { ticker: 'MA',      name: 'Mastercard',          sector: '金融',  mockPrice: 460.90, mockChange:  0.88, mockPE: 35.4, mockMarketCap: '$428B'  },
  { ticker: 'COST',    name: 'Costco',              sector: '零售',  mockPrice: 765.20, mockChange:  0.47, mockPE: 51.3, mockMarketCap: '$340B'  },
  { ticker: 'WMT',     name: 'Walmart',             sector: '零售',  mockPrice:  67.80, mockChange:  0.29, mockPE: 30.2, mockMarketCap: '$547B'  },
  { ticker: 'DIS',     name: 'Disney',              sector: '消费品', mockPrice:  91.40, mockChange: -0.83, mockPE: 21.7, mockMarketCap: '$167B'  },
  { ticker: 'BRK.B',   name: 'Berkshire Hathaway',  sector: '金融',  mockPrice: 397.60, mockChange:  0.61, mockPE: 22.4, mockMarketCap: '$869B'  },
  { ticker: 'PLTR',    name: 'Palantir',            sector: 'AI',    mockPrice:  23.80, mockChange:  4.12, mockPE: 68.9, mockMarketCap: '$51B'   },
];
