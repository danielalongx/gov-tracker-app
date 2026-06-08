export interface MatrixEntry {
  ticker: string
  name: string
  sector: string
  score: number        // 0–100
  signalCount: number  // signals in past 90 days
  trend: 'up' | 'down' | 'flat'
  topSignal?: string
  mockPrice: number
  mockChange: number
  mockPE: number
  mockMarketCap: string
}

export const MATRIX_DATA: MatrixEntry[] = [
  // ── Mega-cap Tech / AI ────────────────────────────────────────────────────
  { ticker: 'NVDA',    name: 'NVIDIA',              sector: '半导体', score: 94, signalCount: 47, trend: 'up',   topSignal: 'Blackwell GPU出货量超预期，数据中心收入再创纪录',    mockPrice: 875.40, mockChange:  3.82, mockPE: 72.1, mockMarketCap: '$2.15T' },
  { ticker: 'AAPL',    name: 'Apple Inc',           sector: '科技',  score: 91, signalCount: 41, trend: 'up',   topSignal: 'Apple Intelligence功能在iOS 18引发用户升机潮',       mockPrice: 189.30, mockChange:  1.24, mockPE: 29.5, mockMarketCap: '$2.9T'  },
  { ticker: 'MSFT',    name: 'Microsoft',           sector: '科技',  score: 88, signalCount: 38, trend: 'up',   topSignal: 'Azure AI云业务同比增速加速至31%，超分析师预期',       mockPrice: 415.80, mockChange:  0.87, mockPE: 35.2, mockMarketCap: '$3.09T' },
  { ticker: 'TSLA',    name: 'Tesla',               sector: '新能源', score: 86, signalCount: 44, trend: 'up',   topSignal: 'Robotaxi发布会披露FSD V13路测数据，市场情绪回暖',  mockPrice: 192.50, mockChange:  2.87, mockPE: 48.3, mockMarketCap: '$613B'  },
  { ticker: 'META',    name: 'Meta Platforms',      sector: '科技',  score: 84, signalCount: 36, trend: 'up',   topSignal: 'Llama 4模型发布，广告AI化率突破60%创历史新高',       mockPrice: 502.70, mockChange:  2.31, mockPE: 26.9, mockMarketCap: '$1.28T' },
  { ticker: 'GOOGL',   name: 'Alphabet',            sector: '科技',  score: 82, signalCount: 33, trend: 'up',   topSignal: 'Gemini Ultra集成Search，广告市场份额企稳回升',       mockPrice: 173.20, mockChange:  1.55, mockPE: 24.8, mockMarketCap: '$2.14T' },
  { ticker: 'AMZN',    name: 'Amazon',              sector: '消费品', score: 81, signalCount: 31, trend: 'up',   topSignal: 'AWS季度收入破250亿，Bedrock企业AI订单创新高',        mockPrice: 183.60, mockChange:  0.63, mockPE: 55.7, mockMarketCap: '$1.91T' },
  { ticker: 'TSM',     name: 'TSMC',                sector: '半导体', score: 80, signalCount: 29, trend: 'up',   topSignal: '台积电2nm量产时间表确认，CoWoS封装产能大幅扩充',   mockPrice: 152.40, mockChange:  2.14, mockPE: 22.4, mockMarketCap: '$789B'  },
  { ticker: 'AVGO',    name: 'Broadcom',            sector: '半导体', score: 83, signalCount: 28, trend: 'up',   topSignal: '定制AI芯片订单激增，数据中心连接器市场份额扩大',     mockPrice: 1342.00, mockChange: 1.93, mockPE: 34.7, mockMarketCap: '$628B'  },
  { ticker: 'ARM',     name: 'Arm Holdings',        sector: '半导体', score: 79, signalCount: 26, trend: 'up',   topSignal: 'AI服务器采用ARM架构趋势加速，版税收入超预期',        mockPrice: 127.60, mockChange:  2.45, mockPE: 96.3, mockMarketCap: '$133B'  },

  // ── Semiconductors ────────────────────────────────────────────────────────
  { ticker: 'AMD',     name: 'AMD',                 sector: '半导体', score: 78, signalCount: 25, trend: 'up',   topSignal: 'MI300X供货增加，大型云厂商AI训练订单持续落地',       mockPrice: 171.30, mockChange:  2.87, mockPE: 41.2, mockMarketCap: '$277B'  },
  { ticker: 'ASML',    name: 'ASML Holding',        sector: '半导体', score: 77, signalCount: 23, trend: 'flat', topSignal: 'EUV设备新订单超预期，中国禁令影响可控',              mockPrice: 932.10, mockChange:  1.76, mockPE: 38.5, mockMarketCap: '$367B'  },
  { ticker: 'QCOM',    name: 'Qualcomm',            sector: '半导体', score: 72, signalCount: 21, trend: 'up',   topSignal: 'Snapdragon X Elite PC市场反馈积极，移动端份额提升', mockPrice: 175.60, mockChange:  1.42, mockPE: 18.7, mockMarketCap: '$197B'  },
  { ticker: 'AMAT',    name: 'Applied Materials',   sector: '半导体', score: 62, signalCount: 18, trend: 'flat', topSignal: '半导体设备出货量温和复苏，存储端需求回暖',           mockPrice: 218.40, mockChange:  0.94, mockPE: 22.8, mockMarketCap: '$183B'  },
  { ticker: 'LRCX',    name: 'Lam Research',        sector: '半导体', score: 58, signalCount: 16, trend: 'flat', topSignal: 'HBM生产相关刻蚀设备需求增长，存储订单改善',          mockPrice: 912.30, mockChange:  0.61, mockPE: 28.4, mockMarketCap: '$127B'  },
  { ticker: 'MRVL',    name: 'Marvell Technology',  sector: '半导体', score: 55, signalCount: 15, trend: 'up',   topSignal: '5G基站及定制AI芯片双线推进，季度指引超预期',         mockPrice: 78.20,  mockChange:  1.88, mockPE: 52.1, mockMarketCap: '$67B'   },
  { ticker: 'ON',      name: 'ON Semiconductor',    sector: '半导体', score: 42, signalCount: 12, trend: 'down', topSignal: '汽车半导体需求疲软拖累指引，库存去化仍需时间',        mockPrice: 64.30,  mockChange: -1.23, mockPE: 19.4, mockMarketCap: '$28B'   },
  { ticker: 'INTC',    name: 'Intel',               sector: '半导体', score: 37, signalCount: 14, trend: 'down', topSignal: 'Foundry部门持续亏损，18A工艺量产时间点存疑',         mockPrice:  28.70, mockChange: -1.62, mockPE: 12.9, mockMarketCap: '$121B'  },
  { ticker: '2382.HK', name: '舜宇光学',             sector: '半导体', score: 44, signalCount: 13, trend: 'up',   topSignal: 'AR/VR光学模组出货量超预期，车载镜头业务加速放量',  mockPrice: 68.30,  mockChange:  2.14, mockPE: 21.3, mockMarketCap: 'HK$77B' },

  // ── Software / Cloud ──────────────────────────────────────────────────────
  { ticker: 'CRM',     name: 'Salesforce',          sector: '科技',  score: 67, signalCount: 20, trend: 'up',   topSignal: 'Agentforce AI销售助手客户数快速增长，ARR超预期',    mockPrice: 290.40, mockChange:  1.67, mockPE: 44.2, mockMarketCap: '$282B'  },
  { ticker: 'ORCL',    name: 'Oracle',              sector: '科技',  score: 65, signalCount: 19, trend: 'up',   topSignal: 'OCI云基础设施新签合同创历史峰值，多云战略奏效',      mockPrice: 143.80, mockChange:  1.34, mockPE: 27.9, mockMarketCap: '$395B'  },
  { ticker: 'SAP',     name: 'SAP SE',              sector: '科技',  score: 38, signalCount: 11, trend: 'flat', topSignal: 'S/4HANA云迁移进度符合预期，欧洲企业软件需求稳定',   mockPrice: 218.60, mockChange:  0.43, mockPE: 31.5, mockMarketCap: '$253B'  },
  { ticker: 'ADBE',    name: 'Adobe',               sector: '科技',  score: 51, signalCount: 14, trend: 'flat', topSignal: 'Firefly AI订阅转化率回升，创意云收入高于预期',       mockPrice: 430.20, mockChange:  0.82, mockPE: 28.7, mockMarketCap: '$194B'  },
  { ticker: 'SNOW',    name: 'Snowflake',           sector: '科技',  score: 60, signalCount: 17, trend: 'up',   topSignal: 'Cortex AI数据平台需求激增，大客户消费增速加速',      mockPrice: 178.30, mockChange:  3.21, mockPE: 0,    mockMarketCap: '$59B'   },
  { ticker: 'NET',     name: 'Cloudflare',          sector: '科技',  score: 63, signalCount: 18, trend: 'up',   topSignal: 'AI推理网络边缘节点扩张加速，企业安全订单激增',        mockPrice: 107.40, mockChange:  2.54, mockPE: 152.3, mockMarketCap: '$35B'  },
  { ticker: 'DDOG',    name: 'Datadog',             sector: '科技',  score: 57, signalCount: 16, trend: 'up',   topSignal: 'AI workload监控需求高速增长，NRR维持在120%以上',    mockPrice: 138.70, mockChange:  1.98, mockPE: 88.4, mockMarketCap: '$44B'   },
  { ticker: 'MDB',     name: 'MongoDB',             sector: '科技',  score: 46, signalCount: 13, trend: 'flat', topSignal: 'Atlas云数据库增速放缓，但AI应用场景开拓有进展',       mockPrice: 278.50, mockChange:  0.37, mockPE: 89.2, mockMarketCap: '$20B'   },
  { ticker: 'SHOP',    name: 'Shopify',             sector: '科技',  score: 61, signalCount: 17, trend: 'up',   topSignal: '商家AI营销工具渗透率提升，GMV增速超分析师预期',      mockPrice: 84.60,  mockChange:  2.14, mockPE: 73.2, mockMarketCap: '$107B'  },
  { ticker: 'UBER',    name: 'Uber',                sector: '科技',  score: 53, signalCount: 15, trend: 'up',   topSignal: '自动驾驶合作协议落地多个城市，出行订单量创新高',      mockPrice: 77.30,  mockChange:  1.62, mockPE: 24.5, mockMarketCap: '$162B'  },
  { ticker: 'SPOT',    name: 'Spotify',             sector: '科技',  score: 33, signalCount: 10, trend: 'flat', topSignal: '付费会员数稳健增长，播客广告收入超预期',              mockPrice: 374.80, mockChange:  0.52, mockPE: 89.3, mockMarketCap: '$75B'   },
  { ticker: 'SNAP',    name: 'Snap',                sector: '科技',  score: 19, signalCount: 8,  trend: 'down', topSignal: '广告市场份额持续收缩，DAU增长不及预期',               mockPrice:  10.20, mockChange: -2.41, mockPE:  0,   mockMarketCap: '$17B'   },
  { ticker: '3888.HK', name: '金山软件',             sector: '科技',  score: 29, signalCount: 9,  trend: 'flat', topSignal: '企业办公AI化转型进度稳健，云端订阅收入增长',         mockPrice: 28.45,  mockChange:  0.34, mockPE: 38.7, mockMarketCap: 'HK$31B' },

  // ── China Tech / Consumer ─────────────────────────────────────────────────
  { ticker: '0700.HK', name: '腾讯控股',             sector: '科技',  score: 71, signalCount: 22, trend: 'up',   topSignal: '微信AI助手商业化落地，游戏业务超预期回暖',          mockPrice: 388.00, mockChange:  1.44, mockPE: 21.3, mockMarketCap: 'HK$3.7T'},
  { ticker: 'BABA',    name: 'Alibaba',             sector: '科技',  score: 52, signalCount: 15, trend: 'flat', topSignal: '云计算业务扭亏为盈，国际电商增速超预期',              mockPrice:  76.20, mockChange: -0.52, mockPE: 10.1, mockMarketCap: '$183B'  },
  { ticker: '9988.HK', name: '阿里巴巴',             sector: '消费品', score: 48, signalCount: 14, trend: 'flat', topSignal: '淘宝AI购物功能上线，用户粘性数据改善',               mockPrice:  82.50, mockChange: -0.61, mockPE:  9.8, mockMarketCap: 'HK$1.6T'},
  { ticker: '3690.HK', name: '美团',                sector: '科技',  score: 54, signalCount: 16, trend: 'up',   topSignal: '无人配送规模化进展超预期，单量持续创新高',            mockPrice: 158.40, mockChange:  1.82, mockPE: 27.4, mockMarketCap: 'HK$978B'},
  { ticker: '9999.HK', name: '网易',                sector: '科技',  score: 41, signalCount: 12, trend: 'flat', topSignal: '《逆水寒》手游出海战略落地，海外收入占比提升',        mockPrice: 145.60, mockChange:  0.43, mockPE: 15.6, mockMarketCap: 'HK$198B'},
  { ticker: '9618.HK', name: '京东',                sector: '消费品', score: 36, signalCount: 11, trend: 'flat', topSignal: '即时零售业务增速超预期，物流成本优化见效',            mockPrice:  98.70, mockChange:  0.21, mockPE: 12.3, mockMarketCap: 'HK$626B'},

  // ── Finance ───────────────────────────────────────────────────────────────
  { ticker: 'JPM',     name: 'JPMorgan Chase',      sector: '金融',  score: 66, signalCount: 19, trend: 'up',   topSignal: 'AI辅助信贷风控上线，交易银行手续费同比+18%',        mockPrice: 196.80, mockChange:  0.45, mockPE: 11.8, mockMarketCap: '$570B'  },
  { ticker: 'BRK.B',   name: 'Berkshire Hathaway',  sector: '金融',  score: 64, signalCount: 18, trend: 'up',   topSignal: '巴菲特大幅增持西方石油，现金储备再创历史纪录',        mockPrice: 397.60, mockChange:  0.61, mockPE: 22.4, mockMarketCap: '$869B'  },
  { ticker: 'GS',      name: 'Goldman Sachs',       sector: '金融',  score: 56, signalCount: 15, trend: 'flat', topSignal: 'AI驱动并购咨询业务回暖，IB手续费同比增长',           mockPrice: 458.30, mockChange:  1.02, mockPE: 13.4, mockMarketCap: '$148B'  },
  { ticker: 'V',       name: 'Visa',                sector: '金融',  score: 61, signalCount: 16, trend: 'up',   topSignal: '跨境支付量持续增长，新兴市场渗透率提升',              mockPrice: 278.40, mockChange:  0.54, mockPE: 31.8, mockMarketCap: '$572B'  },
  { ticker: 'MA',      name: 'Mastercard',          sector: '金融',  score: 59, signalCount: 15, trend: 'up',   topSignal: 'AI反欺诈系统升级，商户接入量环比增长',               mockPrice: 460.90, mockChange:  0.88, mockPE: 35.4, mockMarketCap: '$428B'  },
  { ticker: 'COIN',    name: 'Coinbase',            sector: '金融',  score: 49, signalCount: 13, trend: 'up',   topSignal: '比特币ETF获批推动托管业务增长，监管环境好转',        mockPrice: 228.40, mockChange:  3.87, mockPE: 32.1, mockMarketCap: '$57B'   },
  { ticker: 'SQ',      name: 'Block',               sector: '金融',  score: 45, signalCount: 12, trend: 'flat', topSignal: 'Cash App用户增长放缓，商家支付业务持续扩张',          mockPrice:  67.30, mockChange: -0.43, mockPE: 29.7, mockMarketCap: '$40B'   },
  { ticker: 'PYPL',    name: 'PayPal',              sector: '金融',  score: 32, signalCount: 10, trend: 'down', topSignal: '竞争压力持续，活跃用户增长低于预期',                  mockPrice:  61.40, mockChange: -0.87, mockPE: 14.3, mockMarketCap: '$62B'   },
  { ticker: 'MS',      name: 'Morgan Stanley',      sector: '金融',  score: 47, signalCount: 13, trend: 'flat', topSignal: '财富管理AUM突破5万亿，机构交易业务回暖',              mockPrice: 106.80, mockChange:  0.73, mockPE: 17.2, mockMarketCap: '$179B'  },
  { ticker: 'BAC',     name: 'Bank of America',     sector: '金融',  score: 39, signalCount: 11, trend: 'flat', topSignal: '净利息收入预期上调，零售银行存款稳定',                mockPrice:  37.60, mockChange:  0.32, mockPE: 12.4, mockMarketCap: '$291B'  },
  { ticker: 'WFC',     name: 'Wells Fargo',         sector: '金融',  score: 28, signalCount: 9,  trend: 'flat', topSignal: '资产上限有望解除，信贷成本优于预期',                  mockPrice:  52.30, mockChange:  0.17, mockPE: 11.7, mockMarketCap: '$199B'  },
  { ticker: 'C',       name: 'Citigroup',           sector: '金融',  score: 25, signalCount: 8,  trend: 'flat', topSignal: '重组成本高企，国际业务盈利能力仍待改善',              mockPrice:  61.40, mockChange: -0.24, mockPE: 10.8, mockMarketCap: '$120B'  },
  { ticker: 'AXP',     name: 'American Express',    sector: '金融',  score: 35, signalCount: 10, trend: 'flat', topSignal: '高端消费客群持消费韧性，信贷质量优于行业',             mockPrice: 234.70, mockChange:  0.54, mockPE: 19.6, mockMarketCap: '$173B'  },
  { ticker: 'BLK',     name: 'BlackRock',           sector: '金融',  score: 43, signalCount: 12, trend: 'up',   topSignal: '私募信贷与基础设施基金净流入创历史新高',              mockPrice: 850.40, mockChange:  0.89, mockPE: 23.1, mockMarketCap: '$132B'  },
  { ticker: 'SCHW',    name: 'Charles Schwab',      sector: '金融',  score: 27, signalCount: 8,  trend: 'flat', topSignal: '利率下行周期中息差收窄，客户资产流入稳定',             mockPrice:  72.80, mockChange:  0.21, mockPE: 25.3, mockMarketCap: '$133B'  },
  { ticker: 'ICE',     name: 'Intercontinental Exch', sector: '金融', score: 31, signalCount: 9, trend: 'flat', topSignal: '衍生品交易量创新高，按揭数据服务增速加快',            mockPrice: 146.70, mockChange:  0.38, mockPE: 31.8, mockMarketCap: '$83B'   },
  { ticker: '2318.HK', name: '中国平安',             sector: '金融',  score: 34, signalCount: 10, trend: 'flat', topSignal: '寿险新业务价值回升，科技子板块估值重评',             mockPrice:  38.45, mockChange:  0.87, mockPE: 6.8,  mockMarketCap: 'HK$437B'},
  { ticker: '1398.HK', name: '工商银行',             sector: '金融',  score: 22, signalCount: 7,  trend: 'flat', topSignal: '降息周期净息差承压，但资产质量保持稳健',             mockPrice:  4.78,  mockChange:  0.21, mockPE: 4.3,  mockMarketCap: 'HK$1.7T'},
  { ticker: '0939.HK', name: '建设银行',             sector: '金融',  score: 20, signalCount: 6,  trend: 'flat', topSignal: '地方政府债务化解推进，不良率保持低位',               mockPrice:  5.62,  mockChange:  0.18, mockPE: 4.1,  mockMarketCap: 'HK$1.4T'},
  { ticker: 'PLTR',    name: 'Palantir',            sector: 'AI',    score: 69, signalCount: 21, trend: 'up',   topSignal: 'AIP军政府合同持续落地，商业客户数量快速增长',        mockPrice:  23.80, mockChange:  4.12, mockPE: 68.9, mockMarketCap: '$51B'   },

  // ── Healthcare ────────────────────────────────────────────────────────────
  { ticker: 'JNJ',     name: 'Johnson & Johnson',   sector: '医疗',  score: 30, signalCount: 9,  trend: 'flat', topSignal: '创新药管线推进顺利，分拆后聚焦医疗器械与制药',       mockPrice: 152.60, mockChange: -0.74, mockPE: 14.8, mockMarketCap: '$368B'  },
  { ticker: 'PFE',     name: 'Pfizer',              sector: '医疗',  score: 16, signalCount: 7,  trend: 'down', topSignal: 'COVID产品收入骤降后重组进行中，肿瘤药获FDA批准',     mockPrice:  27.40, mockChange: -1.08, mockPE:  8.3, mockMarketCap: '$155B'  },
  { ticker: 'ABBV',    name: 'AbbVie',              sector: '医疗',  score: 40, signalCount: 11, trend: 'up',   topSignal: 'Skyrizi/Rinvoq销售超预期，美沙乐失专利冲击可控',  mockPrice: 168.30, mockChange:  0.94, mockPE: 17.4, mockMarketCap: '$297B'  },
  { ticker: 'MRK',     name: 'Merck',               sector: '医疗',  score: 38, signalCount: 10, trend: 'flat', topSignal: 'Keytruda适应症持续扩展，ADC管线进展超预期',         mockPrice: 128.40, mockChange:  0.53, mockPE: 14.2, mockMarketCap: '$325B'  },
  { ticker: 'BMY',     name: 'Bristol-Myers Squibb', sector: '医疗', score: 23, signalCount: 7,  trend: 'down', topSignal: '专利悬崖压力增大，新药临床数据不及预期',             mockPrice:  49.60, mockChange: -0.63, mockPE: 10.1, mockMarketCap: '$101B'  },
  { ticker: 'GILD',    name: 'Gilead Sciences',     sector: '医疗',  score: 18, signalCount: 6,  trend: 'flat', topSignal: '艾滋病预防针剂lenacapavir商业化推进顺利',           mockPrice:  76.40, mockChange:  0.28, mockPE: 11.7, mockMarketCap: '$95B'   },
  { ticker: 'AMGN',    name: 'Amgen',               sector: '医疗',  score: 26, signalCount: 8,  trend: 'flat', topSignal: '减肥药MariTide三期数据公布，市场预期分歧',           mockPrice: 281.40, mockChange:  0.43, mockPE: 18.3, mockMarketCap: '$150B'  },
  { ticker: 'BIIB',    name: 'Biogen',              sector: '医疗',  score: 14, signalCount: 5,  trend: 'flat', topSignal: '阿尔茨海默症药物商业化落地缓慢，定价争议持续',       mockPrice: 198.30, mockChange: -0.32, mockPE: 16.4, mockMarketCap: '$29B'   },
  { ticker: 'MRNA',    name: 'Moderna',             sector: '医疗',  score: 12, signalCount: 5,  trend: 'down', topSignal: '疫苗收入大幅下滑，RSV等新管线仍处早期阶段',         mockPrice:  70.20, mockChange: -1.43, mockPE:  0,   mockMarketCap: '$27B'   },
  { ticker: 'REGN',    name: 'Regeneron',           sector: '医疗',  score: 33, signalCount: 9,  trend: 'up',   topSignal: 'Dupixent适应症扩展顺利，眼科ADC管线数据亮眼',       mockPrice: 822.40, mockChange:  0.86, mockPE: 22.7, mockMarketCap: '$87B'   },

  // ── Consumer / Retail ─────────────────────────────────────────────────────
  { ticker: 'KO',      name: 'Coca-Cola',           sector: '消费品', score: 21, signalCount: 6,  trend: 'flat', topSignal: '新兴市场定价能力持续，有机增速维持中个位数',          mockPrice:  62.10, mockChange:  0.16, mockPE: 22.6, mockMarketCap: '$267B'  },
  { ticker: 'MCD',     name: "McDonald's",          sector: '消费品', score: 24, signalCount: 7,  trend: 'flat', topSignal: '全球同店销售增速放缓，AI点餐系统扩张加速',           mockPrice: 287.50, mockChange:  0.93, mockPE: 23.1, mockMarketCap: '$206B'  },
  { ticker: 'NKE',     name: 'Nike',                sector: '消费品', score: 17, signalCount: 6,  trend: 'down', topSignal: '中国区销售连续下滑，新CEO推动直销渠道重组',          mockPrice:  74.30, mockChange: -0.98, mockPE: 18.4, mockMarketCap: '$111B'  },
  { ticker: 'SBUX',    name: 'Starbucks',           sector: '消费品', score: 20, signalCount: 6,  trend: 'down', topSignal: '中国区同店下滑收窄，新CEO渠道策略调整落地',          mockPrice:  80.40, mockChange: -0.54, mockPE: 22.7, mockMarketCap: '$91B'   },
  { ticker: 'EBAY',    name: 'eBay',                sector: '消费品', score: 11, signalCount: 4,  trend: 'flat', topSignal: '二手商品市场复苏温和，广告收入增速改善',              mockPrice:  48.70, mockChange:  0.23, mockPE: 10.4, mockMarketCap: '$26B'   },
  { ticker: 'ETSY',    name: 'Etsy',                sector: '消费品', score: 10, signalCount: 4,  trend: 'down', topSignal: '宏观消费趋弱拖累GMS，AI推荐算法优化有限',            mockPrice:  56.80, mockChange: -1.24, mockPE: 17.2, mockMarketCap: '$7B'    },
  { ticker: 'BKNG',    name: 'Booking Holdings',    sector: '消费品', score: 45, signalCount: 12, trend: 'up',   topSignal: '欧洲夏季旅游需求超预期，ADR与出行量双升',            mockPrice: 3847.00, mockChange: 0.93, mockPE: 21.4, mockMarketCap: '$147B'  },
  { ticker: 'DIS',     name: 'Disney',              sector: '消费品', score: 29, signalCount: 8,  trend: 'flat', topSignal: '主题公园收入超预期，流媒体首次实现季度盈利',          mockPrice:  91.40, mockChange: -0.83, mockPE: 21.7, mockMarketCap: '$167B'  },
  { ticker: 'PARA',    name: 'Paramount Global',    sector: '消费品', score: 8,  signalCount: 3,  trend: 'down', topSignal: '流媒体战略摇摆，并购传闻不断但尚无定论',             mockPrice:  10.80, mockChange: -1.85, mockPE:  0,   mockMarketCap: '$7B'    },
  { ticker: 'WBD',     name: 'Warner Bros Discovery', sector: '消费品', score: 9, signalCount: 3, trend: 'flat', topSignal: 'Max流媒体订阅略超预期，但债务压力持续制约扩张',     mockPrice:  8.40,  mockChange: -0.47, mockPE:  0,   mockMarketCap: '$20B'   },
  { ticker: 'RIVN',    name: 'Rivian',              sector: '新能源', score: 13, signalCount: 5,  trend: 'flat', topSignal: '大众汽车合资谈判推进，R2 SUV预订量超出预期',         mockPrice:  11.40, mockChange:  1.77, mockPE:  0,   mockMarketCap: '$11B'   },
  { ticker: 'F',       name: 'Ford Motor',          sector: '新能源', score: 15, signalCount: 5,  trend: 'flat', topSignal: 'Mustang Mach-E销量回升，EV亏损收窄进度符合预期',    mockPrice:  11.60, mockChange: -0.34, mockPE:  6.4, mockMarketCap: '$46B'   },

  // ── Retail ────────────────────────────────────────────────────────────────
  { ticker: 'WMT',     name: 'Walmart',             sector: '零售',  score: 43, signalCount: 12, trend: 'up',   topSignal: '电商业务占比突破25%，广告收入成新增长极',             mockPrice:  67.80, mockChange:  0.29, mockPE: 30.2, mockMarketCap: '$547B'  },
  { ticker: 'COST',    name: 'Costco',              sector: '零售',  score: 50, signalCount: 13, trend: 'up',   topSignal: '会员费涨价反应平稳，续费率保持92%历史高位',          mockPrice: 765.20, mockChange:  0.47, mockPE: 51.3, mockMarketCap: '$340B'  },
  { ticker: 'TGT',     name: 'Target',              sector: '零售',  score: 16, signalCount: 5,  trend: 'down', topSignal: '可自由支配品类需求疲软，库存减值拖累利润',            mockPrice: 141.30, mockChange: -1.47, mockPE: 15.1, mockMarketCap: '$65B'   },
  { ticker: 'HD',      name: 'Home Depot',          sector: '零售',  score: 32, signalCount: 9,  trend: 'flat', topSignal: '房屋装修需求随房贷利率下行逐步回暖',                  mockPrice: 342.60, mockChange:  0.53, mockPE: 24.7, mockMarketCap: '$340B'  },
  { ticker: 'LOW',     name: "Lowe's",              sector: '零售',  score: 28, signalCount: 8,  trend: 'flat', topSignal: '专业承包商客群韧性强，消费者端需求仍偏弱',            mockPrice: 236.40, mockChange:  0.38, mockPE: 20.9, mockMarketCap: '$137B'  },
  { ticker: 'NFLX',    name: 'Netflix',             sector: '科技',  score: 68, signalCount: 20, trend: 'up',   topSignal: '广告支持版订阅增速超预期，体育直播战略奏效',          mockPrice: 612.80, mockChange:  1.33, mockPE: 43.7, mockMarketCap: '$264B'  },

  // ── Energy ────────────────────────────────────────────────────────────────
  { ticker: 'XOM',     name: 'ExxonMobil',          sector: '能源',  score: 36, signalCount: 10, trend: 'flat', topSignal: '低碳氢能布局加速，二叠纪盆地产量再创新高',           mockPrice: 112.70, mockChange: -0.38, mockPE: 13.2, mockMarketCap: '$449B'  },
  { ticker: 'CVX',     name: 'Chevron',             sector: '能源',  score: 31, signalCount: 9,  trend: 'flat', topSignal: '哈萨克斯坦产量扩张顺利，股票回购持续推进',           mockPrice: 157.20, mockChange:  0.21, mockPE: 14.1, mockMarketCap: '$292B'  },
  { ticker: 'BP',      name: 'BP',                  sector: '能源',  score: 18, signalCount: 6,  trend: 'down', topSignal: '低碳转型节奏放缓，股东回报计划小幅下调',             mockPrice:  33.40, mockChange: -0.54, mockPE: 9.4,  mockMarketCap: '$97B'   },
  { ticker: 'SHEL',    name: 'Shell',               sector: '能源',  score: 15, signalCount: 5,  trend: 'flat', topSignal: 'LNG出货量维持高位，LNG加气站网络扩张',               mockPrice:  67.80, mockChange:  0.13, mockPE: 10.2, mockMarketCap: '$213B'  },
  { ticker: 'SLB',     name: 'Schlumberger',        sector: '能源',  score: 24, signalCount: 7,  trend: 'flat', topSignal: '中东深海钻探合同增加，数字油田服务业务增速',         mockPrice:  43.60, mockChange:  0.37, mockPE: 14.8, mockMarketCap: '$62B'   },
  { ticker: 'HAL',     name: 'Halliburton',         sector: '能源',  score: 17, signalCount: 5,  trend: 'down', topSignal: '北美勘探活动下滑，国际业务部分对冲',                  mockPrice:  28.40, mockChange: -0.63, mockPE: 10.3, mockMarketCap: '$25B'   },

  // ── Industrials ───────────────────────────────────────────────────────────
  { ticker: 'GE',      name: 'GE Aerospace',        sector: '工业',  score: 55, signalCount: 15, trend: 'up',   topSignal: '航空发动机积压订单创新高，维修服务利润率扩张',        mockPrice: 173.40, mockChange:  1.82, mockPE: 38.7, mockMarketCap: '$188B'  },
  { ticker: 'HON',     name: 'Honeywell',           sector: '工业',  score: 37, signalCount: 10, trend: 'flat', topSignal: '航空航天与建筑自动化业务强劲，工业部门较弱',          mockPrice: 213.40, mockChange:  0.43, mockPE: 24.6, mockMarketCap: '$141B'  },
  { ticker: 'CAT',     name: 'Caterpillar',         sector: '工业',  score: 34, signalCount: 9,  trend: 'flat', topSignal: '基础设施建设带动大型设备需求，能源分部超预期',         mockPrice: 348.70, mockChange:  0.61, mockPE: 16.4, mockMarketCap: '$175B'  },
  { ticker: 'DE',      name: 'John Deere',          sector: '工业',  score: 22, signalCount: 7,  trend: 'down', topSignal: '农机需求下行周期延续，精准农业订阅增长抵消不足',      mockPrice: 387.40, mockChange: -0.83, mockPE: 12.7, mockMarketCap: '$104B'  },

  // ── Telecom / Media ───────────────────────────────────────────────────────
  { ticker: 'T',       name: 'AT&T',                sector: '通信',  score: 14, signalCount: 4,  trend: 'flat', topSignal: '光纤扩建持续但资本开支压力较大，股息可持续性待观察',  mockPrice:  17.40, mockChange:  0.06, mockPE: 7.8,  mockMarketCap: '$124B'  },
  { ticker: 'VZ',      name: 'Verizon',             sector: '通信',  score: 12, signalCount: 4,  trend: 'flat', topSignal: '5G固定无线接入用户超预期，但整体ARPU承压',            mockPrice:  39.60, mockChange:  0.11, mockPE: 8.7,  mockMarketCap: '$167B'  },
  { ticker: 'TMUS',    name: 'T-Mobile',            sector: '通信',  score: 35, signalCount: 10, trend: 'up',   topSignal: '用户增量超越竞争对手，AI客服降本效果显著',            mockPrice: 195.30, mockChange:  0.78, mockPE: 23.4, mockMarketCap: '$228B'  },
  { ticker: 'CMCSA',   name: 'Comcast',             sector: '通信',  score: 19, signalCount: 6,  trend: 'flat', topSignal: '有线电视用户流失加速，宽带业务护城河依然稳固',         mockPrice:  37.80, mockChange: -0.21, mockPE: 9.8,  mockMarketCap: '$146B'  },
];
