import { Header } from '@/components/Header';
import { InventoryGrid } from '@/components/InventoryGrid';
import { SmartPaste } from '@/components/SmartPaste';
import { useInventory } from '@/hooks/useInventory';

export default function App() {
  const store = useInventory();

  const updatedCount = store.lastParse?.updatedItemIds.length ?? 0;
  const quarantineCount = store.quarantine.length;

  return (
    <div className="flex h-screen flex-col gap-4 p-3 sm:p-4 lg:p-5">
      <Header store={store} />

      {(updatedCount > 0 || quarantineCount > 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {updatedCount > 0 && (
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-bold text-emerald-400">
              Zaktualizowano {updatedCount} pozycji
            </span>
          )}
          {quarantineCount > 0 && (
            <span className="rounded-full bg-amber-500/15 px-3 py-1 font-bold text-amber-400">
              {quarantineCount} w kwarantannie
            </span>
          )}
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col gap-4 lg:flex-row">
        <SmartPaste store={store} />
        <InventoryGrid store={store} />
      </div>
    </div>
  );
}
