import { Package, Plus, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import type { InventoryStore } from '@/hooks/useInventory';
import { CATEGORIES, UNITS, type Category, type Unit } from '@/types/inventory';
import { useState } from 'react';

interface HeaderProps {
  store: InventoryStore;
}

export function Header({ store }: HeaderProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('OPAKOWANIA');
  const [unit, setUnit] = useState<Unit>('szt.');

  const handleAdd = () => {
    if (store.addItem(name, category, unit)) {
      setName('');
    }
  };

  return (
    <header className="glass-panel shrink-0 rounded-2xl p-4 shadow-xl">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600/20 text-blue-400">
            <Package className="h-6 w-6" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight text-white sm:text-2xl">
              Magazyn Główny
            </h1>
            <p className="text-xs text-gray-500">Inteligentny panel inwentaryzacji</p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end xl:justify-end">
          <Select
            label="Strefa"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="sm:w-40"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </Select>

          <Input
            label="Nowy towar"
            placeholder="Nazwa SKU..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="sm:min-w-[200px]"
          />

          <Select
            label="Jednostka"
            value={unit}
            onChange={(e) => setUnit(e.target.value as Unit)}
            className="sm:w-28"
          >
            {UNITS.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </Select>

          <Button onClick={handleAdd} size="lg" className="sm:self-end">
            <Plus className="h-4 w-4" />
            Dodaj
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={store.resetToDefaults}
            className="sm:self-end"
            title="Przywróć domyślną bazę"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
