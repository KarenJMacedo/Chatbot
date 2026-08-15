export type StoreId = "mercadolivre" | "shopee" | "amazon";

export interface StoreDeal {
  store: StoreId;
  storeName: string;
  price: number;
  originalPrice?: number;
  installments?: string;
  shipping?: string;
  seller?: string;
  rating?: number;
  inStock?: boolean;
  url: string;
  highlight?: string;
}

export interface Verdict {
  winner: string;
  reason: string;
  buyingTip?: string;
}

export interface ComparisonData {
  productName: string;
  category?: string;
  averagePrice?: number;
  bestDealStore?: StoreId | string;
  maxSavings?: number;
  savingsPercentage?: number;
  stores: StoreDeal[];
  verdict?: Verdict;
}

export interface GroundingUrl {
  title: string;
  uri: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  comparisonData?: ComparisonData | null;
  groundingUrls?: GroundingUrl[];
  isLoading?: boolean;
  error?: boolean;
}

export interface PriceAlert {
  id: string;
  productName: string;
  targetPrice: number;
  currentPrice: number;
  store: StoreId | string;
  createdAt: string;
}

export interface FavoriteDeal {
  id: string;
  productName: string;
  bestPrice: number;
  bestStore: StoreId | string;
  url: string;
  savedAt: string;
}
