export interface PlanData {
  total: number | "unlimited";
  throttledSpeed?: number; // Kbps
  dailyCap?: number;       // MB
}

export interface Plan {
  id: string;
  carrier: string;
  mvno: "SKT" | "KT" | "LGU+";
  network: "LTE" | "5G";
  name: string;
  monthlyFee: number;
  data: PlanData;
  voice: number | "unlimited";
  sms: number | "unlimited";
  benefits: string[];
  contractMonths: number;
  simFee?: number;
  activationFee?: number;
  url?: string;
  lastUpdated: string;
}

export type SortKey = "fee_asc" | "fee_desc" | "data_desc" | "updated";

export interface FilterState {
  search: string;
  mvno: Array<"SKT" | "KT" | "LGU+">;
  maxFee: number;
  minDataGb: number;
  unlimitedVoice: boolean;
  noContract: boolean;
  network: "ALL" | "LTE" | "5G";
}
