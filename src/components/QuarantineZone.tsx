import { AlertTriangle, Check, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { InventoryStore } from '@/hooks/useInventory';
import {
  CATEGORIES,
  UNITS,
  type Category,
  type QuarantineItem,
  type Unit,
} from '@/types/inventory';

interface QuarantineZoneProps {
  store: InventoryStore;
}

function QuarantineCard({
  item,
  store,
}: {
  item: QuarantineItem;
  store: InventoryStore;
}) {
  const [name, setName] = useState(item.rawName);
  const [category, setCategory] = useState<Category>(item.suggestedCategory);
  const [unit, setUnit] = useState<Unit>(item.suggestedUnit);

  const handleResolve = () => {
    store.resolveQuarantine(item, {
      name,
      category,
      unit,
      applyQty: true,
    });
  };

  const handlePrefill = () => {
    store.resolveQuarantine(item, {
      name,
      category,
      unit,
      applyQty: false,
    });
  };

  return (
    <div className="rounded-xl border border-red-500/40 bg-red-950/30 p-3">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-bold text-red-200">{item.rawName}</p>
          <p className="font-mono text-[11px] text-gray-400">
            {item.qty} {item.unit} · linia: „{item.rawLine}"
          </p>
        </div>
        <button
          type="button"
          onClick={() => store.dismissQuarantineItem(item.id)}
          className="rounded-lg p-1 text-gray-500 transition hover:bg-white/5 hover:text-gray-300"
          title="Odrzuć"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mb-2 grid grid-cols-1 gap-2">
        <Input
          label="Nazwa SKU"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-xs"
        />
        <div className="grid grid-cols-2 gap-2">
          <Select
            label="Strefa"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>
          <Select
            label="Jednostka"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Button variant="danger" size="sm" onClick={handleResolve} className="w-full">
          <Check className="h-3.5 w-3.5" />
          Dodaj i ustaw {item.qty} {unit}
        </Button>
        <Button variant="ghost" size="sm" onClick={handlePrefill} className="w-full">
          Tylko dodaj do bazy (bez ilości)
        </Button>
      </div>
    </div>
  );
}

export function QuarantineZone({ store }: QuarantineZoneProps) {
  return (
    <div className="rounded-xl border border-red-500/30 bg-red-950/20 p-3">
      <div className="mb-3 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-400" />
        <h3 className="text-xs font-black uppercase tracking-wider text-red-400">
          Kwarantanna ({store.quarantine.length})
        </h3>
      </div>
      <p className="mb-3 text-[11px] text-gray-500">
        Pozycje nierozpoznane przez słownik aliasów. Przypisz je ręcznie jednym kliknięciem.
      </p>
      <div className="flex flex-col gap-2">
        {store.quarantine.map((item) => (
          <QuarantineCard key={item.id} item={item} store={store} />
        ))}
      </div>
    </div>
  );
}
