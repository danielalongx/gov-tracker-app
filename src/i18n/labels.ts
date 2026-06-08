// Region and sector display-name translations.
// Keys are the Chinese storage values (unchanged in AsyncStorage).
// Values map lang code → localized display string.

export const REGION_LABEL_MAP: Record<string, Record<string, string>> = {
  '美国': { zh:'美国', en:'USA',       ja:'アメリカ',    ko:'미국',   es:'EE. UU.', fr:'États-Unis', de:'USA',    pt:'EUA',    ru:'США',    ar:'الولايات المتحدة' },
  '欧洲': { zh:'欧洲', en:'Europe',    ja:'ヨーロッパ',  ko:'유럽',   es:'Europa',  fr:'Europe',     de:'Europa', pt:'Europa', ru:'Европа', ar:'أوروبا' },
  '中国': { zh:'中国', en:'China',     ja:'中国',        ko:'중국',   es:'China',   fr:'Chine',      de:'China',  pt:'China',  ru:'Китай',  ar:'الصين' },
  '全部': { zh:'全部', en:'All',       ja:'すべて',      ko:'전체',   es:'Todo',    fr:'Tout',       de:'Alle',   pt:'Todos',  ru:'Все',    ar:'الكل' },
  '丹麦': { zh:'丹麦', en:'Denmark',   ja:'デンマーク',  ko:'덴마크', es:'Dinamarca',fr:'Danemark',  de:'Dänemark',pt:'Dinamarca',ru:'Дания',ar:'الدنمارك' },
};

export const SECTOR_LABEL_MAP: Record<string, Record<string, string>> = {
  '科技':   { zh:'科技',   en:'Tech',           ja:'テクノロジー', ko:'기술',       es:'Tecnología',    fr:'Tech',           de:'Technologie',   pt:'Tecnologia',   ru:'Технологии',       ar:'تقنية' },
  '半导体': { zh:'半导体', en:'Semiconductors', ja:'半導体',       ko:'반도체',     es:'Semiconductores',fr:'Semi-conducteurs',de:'Halbleiter',    pt:'Semicondutores',ru:'Полупроводники',  ar:'أشباه الموصلات' },
  'AI':     { zh:'AI',     en:'AI',             ja:'AI',           ko:'AI',         es:'IA',            fr:'IA',             de:'KI',            pt:'IA',            ru:'ИИ',               ar:'ذكاء اصطناعي' },
  '能源':   { zh:'能源',   en:'Energy',         ja:'エネルギー',   ko:'에너지',     es:'Energía',       fr:'Énergie',        de:'Energie',       pt:'Energia',       ru:'Энергетика',       ar:'طاقة' },
  '新能源': { zh:'新能源', en:'Clean Energy',   ja:'再生可能エネルギー',ko:'친환경에너지',es:'Energía limpia',fr:'Énergie propre',de:'Erneuerbare Energie',pt:'Energia limpa',ru:'Зелёная энергия',ar:'طاقة نظيفة' },
  '金融':   { zh:'金融',   en:'Finance',        ja:'金融',         ko:'금융',       es:'Finanzas',      fr:'Finance',        de:'Finanzen',      pt:'Finanças',      ru:'Финансы',          ar:'مالية' },
  '银行':   { zh:'银行',   en:'Banking',        ja:'銀行',         ko:'은행',       es:'Banca',         fr:'Banque',         de:'Banken',        pt:'Bancos',        ru:'Банки',            ar:'مصارف' },
  '医疗':   { zh:'医疗',   en:'Healthcare',     ja:'ヘルスケア',   ko:'헬스케어',   es:'Salud',         fr:'Santé',          de:'Gesundheit',    pt:'Saúde',         ru:'Здравоохранение',  ar:'رعاية صحية' },
  '消费品': { zh:'消费品', en:'Consumer Goods', ja:'消費財',       ko:'소비재',     es:'Consumo',       fr:'Consommation',   de:'Konsumgüter',   pt:'Bens de consumo',ru:'Потреб. товары',  ar:'سلع استهلاكية' },
  '零售':   { zh:'零售',   en:'Retail',         ja:'小売',         ko:'소매',       es:'Minorista',     fr:'Commerce',       de:'Einzelhandel',  pt:'Varejo',        ru:'Ритейл',           ar:'تجزئة' },
  '工业':   { zh:'工业',   en:'Industrial',     ja:'工業',         ko:'산업',       es:'Industrial',    fr:'Industriel',     de:'Industrie',     pt:'Industrial',    ru:'Промышленность',   ar:'صناعة' },
  '航空':   { zh:'航空',   en:'Aviation',       ja:'航空',         ko:'항공',       es:'Aviación',      fr:'Aviation',       de:'Luftfahrt',     pt:'Aviação',       ru:'Авиация',          ar:'طيران' },
  '房地产': { zh:'房地产', en:'Real Estate',    ja:'不動産',       ko:'부동산',     es:'Inmuebles',     fr:'Immobilier',     de:'Immobilien',    pt:'Imóveis',       ru:'Недвижимость',     ar:'عقارات' },
  '大宗商品':{ zh:'大宗商品',en:'Commodities',  ja:'コモディティ', ko:'원자재',     es:'Materias primas',fr:'Matières premières',de:'Rohstoffe',  pt:'Commodities',   ru:'Сырьё',            ar:'سلع أساسية' },
  '加密货币':{ zh:'加密货币',en:'Crypto',       ja:'暗号資産',     ko:'암호화폐',   es:'Cripto',        fr:'Crypto',         de:'Krypto',        pt:'Cripto',        ru:'Криптовалюта',     ar:'عملات رقمية' },
};
