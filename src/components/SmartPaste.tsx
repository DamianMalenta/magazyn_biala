import { ClipboardPaste, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import type { InventoryStore } from '@/hooks/useInventory';
import type { ParseLog } from '@/types/inventory';
import { clsx } from 'clsx';
import { QuarantineZone } from './QuarantineZone';

interface SmartPasteProps {
  store: InventoryStore;
}

const LOG_STYLES: Record<ParseLog['type'], string> = {
  skip: 'text-gray-600',
  category: 'text-blue-400 font-bold',
  success: 'text-emerald-400',
  warning: 'text-amber-400',
  info: 'text-gray-400',
};

export function SmartPaste({ store }: SmartPasteProps) {
  const [text, setText] = useState('');

  const handleParse = () => {
    if (!text.trim()) return;
    store.parseMessenger(text);
    setText('');
  };

  const logs = store.lastParse?.logs ?? [];

  return (
    <aside className="glass-panel flex w-full shrink-0 flex-col overflow-hidden rounded-2xl shadow-xl lg:w-[340px] xl:w-[380px]">
      <div className="border-b border-white/5 p-4">
        <div className="mb-1 flex items-center gap-2">
          <ClipboardPaste className="h-5 w-5 text-emerald-400" />
          <h2 className="text-sm font-black uppercase tracking-wider text-emerald-400">
            Smart Paste
          </h2>
        </div>
        <p className="text-xs leading-relaxed text-gray-500">
          Wklej wiadomość z Messengera. System rozpozna strefy, aliasy i jednostki
          (kg., szt., opak.).
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wklej tekst tutaj..."
          className="min-h-[180px] flex-1 resize-none rounded-xl border border-white/10 bg-surface-900 p-3 font-mono text-xs leading-relaxed outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
        />

        <Button variant="success" size="lg" onClick={handleParse} className="w-full">
          <Sparkles className="h-4 w-4" />
          Przetwórz tekst
        </Button>

        {logs.length > 0 && (
          <div className="rounded-xl border border-white/5 bg-surface-900/80 p-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-500">
              Log parsowania
            </p>
            <div className="flex max-h-48 flex-col gap-1 overflow-y-auto font-mono text-[11px]">
              {logs.map((log) => (
                <div key={log.id} className={clsx(LOG_STYLES[log.type])}>
                  {log.type === 'success' && '✓ '}
                  {log.type === 'warning' && '⚠ '}
                  {log.type === 'category' && '▸ '}
                  {log.message}
                </div>
              ))}
            </div>
          </div>
        )}

        {store.quarantine.length > 0 && (
          <QuarantineZone store={store} />
        )}
      </div>
    </aside>
  );
}
