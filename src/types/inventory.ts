export type Category = 'LODÓWKA' | 'ZAMRAŻARKA' | 'OPAKOWANIA';

export type Unit = 'kg.' | 'szt.' | 'opak.';

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  unit: Unit;
  qty: number;
}

export type ParseLogType = 'info' | 'category' | 'success' | 'warning' | 'skip';

export interface ParseLog {
  id: string;
  type: ParseLogType;
  message: string;
}

export interface QuarantineItem {
  id: string;
  rawLine: string;
  rawName: string;
  qty: number;
  unit: Unit;
  suggestedCategory: Category;
  suggestedUnit: Unit;
}

export interface ParsedLineResult {
  kind: 'skip' | 'category' | 'matched' | 'quarantine';
  log: ParseLog;
  category?: Category;
  itemId?: string;
  qty?: number;
  quarantine?: Omit<QuarantineItem, 'id'>;
}

export interface ParseResult {
  logs: ParseLog[];
  updatedItemIds: string[];
  quarantine: QuarantineItem[];
}

export const CATEGORIES: Category[] = ['LODÓWKA', 'ZAMRAŻARKA', 'OPAKOWANIA'];

export const UNITS: Unit[] = ['kg.', 'szt.', 'opak.'];

export const CATEGORY_META: Record<
  Category,
  { label: string; accent: string; border: string; bg: string }
> = {
  LODÓWKA: {
    label: 'Lodówka',
    accent: 'text-blue-400',
    border: 'border-blue-500/30',
    bg: 'bg-blue-500/10',
  },
  ZAMRAŻARKA: {
    label: 'Zamrażarka',
    accent: 'text-cyan-400',
    border: 'border-cyan-500/30',
    bg: 'bg-cyan-500/10',
  },
  OPAKOWANIA: {
    label: 'Opakowania',
    accent: 'text-orange-400',
    border: 'border-orange-500/30',
    bg: 'bg-orange-500/10',
  },
};

export const UNIT_LABELS: Record<Unit, string> = {
  'kg.': 'kilogramy',
  'szt.': 'sztuki',
  'opak.': 'opakowania',
};
