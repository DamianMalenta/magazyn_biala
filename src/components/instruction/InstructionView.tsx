import { useState } from 'react'
import {
  APP_URL,
  INSTRUCTION_RULES,
  INSTRUCTION_STEPS,
  MESSENGER_RULES_SHORT,
  MESSENGER_TEMPLATE,
  PHONE_POLICY_NOTE,
  QUICK_STEPS,
} from '../../lib/data/instructionContent'

function img(path: string) {
  return `${import.meta.env.BASE_URL}instrukcja/${path}`
}

export function InstructionView() {
  const [copiedLink, setCopiedLink] = useState(false)
  const [copiedTemplate, setCopiedTemplate] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(APP_URL)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const copyTemplate = async () => {
    try {
      await navigator.clipboard.writeText(MESSENGER_TEMPLATE)
      setCopiedTemplate(true)
      setTimeout(() => setCopiedTemplate(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="flex flex-col gap-8 pb-12 max-w-4xl mx-auto">
      {/* Hero */}
      <section className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900/80 p-6 md:p-8">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
          Dla pracowników
        </p>
        <h2 className="text-2xl md:text-3xl font-black text-white mb-3">
          Jak korzystać z magazynu
        </h2>
        <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-4">
          Wklejasz wiadomość z Messengera — aplikacja sama ustawia stany. Całość zajmuje około
          minuty.
        </p>
        <p className="text-sm text-amber-200/90 bg-amber-950/40 border border-amber-500/30 rounded-lg px-3 py-2 mb-6">
          🖥️ {PHONE_POLICY_NOTE}
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href={APP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-5 py-3 transition"
          >
            Otwórz magazyn ↗
          </a>
          <button
            type="button"
            onClick={() => void copyLink()}
            className="inline-flex items-center justify-center rounded-xl border border-slate-600 hover:border-emerald-500 text-slate-300 hover:text-white font-semibold text-sm px-5 py-3 transition"
          >
            {copiedLink ? 'Link skopiowany ✓' : 'Kopiuj link'}
          </button>
        </div>
        <p className="mt-3 text-[11px] text-slate-500 font-mono break-all">{APP_URL}</p>
      </section>

      {/* Quick steps */}
      <section>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-4">
          Szybkie kroki
        </h3>
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_STEPS.map((text, i) => (
            <li
              key={text}
              className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-4"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600/20 text-emerald-400 font-black text-sm">
                {i + 1}
              </span>
              <p className="text-sm text-slate-300 leading-snug pt-1">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Rules */}
      <section className="grid gap-3">
        {INSTRUCTION_RULES.map((rule) => (
          <div
            key={rule.text}
            className={[
              'rounded-xl border px-4 py-3 text-sm leading-relaxed',
              rule.type === 'ok' && 'border-emerald-500/30 bg-emerald-950/30 text-emerald-100',
              rule.type === 'warn' && 'border-amber-500/30 bg-amber-950/30 text-amber-100',
              rule.type === 'info' && 'border-sky-500/30 bg-sky-950/30 text-sky-100',
            ]
              .filter(Boolean)
              .join(' ')}
          >
            <span className="font-bold mr-2">
              {rule.type === 'ok' ? '✓' : rule.type === 'warn' ? '⚠' : 'ℹ'}
            </span>
            {rule.text}
          </div>
        ))}
      </section>

      {/* Steps with screenshots */}
      <section className="flex flex-col gap-10">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Instrukcja krok po kroku
        </h3>

        {INSTRUCTION_STEPS.map((step, index) => {
          const imageFirst = index % 2 === 0
          return (
            <article
              key={step.id}
              className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden"
            >
              <div
                className={[
                  'flex flex-col gap-0',
                  imageFirst ? 'lg:flex-row' : 'lg:flex-row-reverse',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => setLightbox(img(step.image))}
                  className="lg:w-[55%] shrink-0 bg-slate-950 p-2 sm:p-4 text-left group cursor-zoom-in focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
                  aria-label={`Powiększ: ${step.title}`}
                >
                  <img
                    src={img(step.image)}
                    alt={step.imageAlt}
                    className="w-full rounded-lg border border-slate-800 shadow-xl transition group-hover:border-emerald-500/40"
                    loading="lazy"
                  />
                  <span className="block mt-2 text-[10px] text-slate-600 text-center group-hover:text-slate-400">
                    Kliknij, aby powiększyć
                  </span>
                </button>

                <div className="flex flex-col justify-center p-5 md:p-6 lg:w-[45%]">
                  <span className="text-xs font-black text-emerald-500 mb-1">
                    Krok {step.step}
                  </span>
                  <h4 className="text-lg font-bold text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{step.description}</p>
                </div>
              </div>
            </article>
          )
        })}
      </section>

      {/* Messenger template */}
      <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 md:p-6">
        <h3 className="text-lg font-bold text-white mb-2">Szablon renamentu (Messenger)</h3>
        <p className="text-xs text-slate-500 mb-3">
          Tylko do okresowej kontroli stanu faktycznego — nie do codziennych przywozów i wywozów (+/− na
          komputerze).
        </p>
        <ul className="text-xs text-slate-500 space-y-1 mb-4 list-disc pl-4">
          {MESSENGER_RULES_SHORT.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <pre className="text-[11px] leading-relaxed text-slate-400 font-mono whitespace-pre-wrap bg-slate-950 rounded-xl p-4 border border-slate-800 max-h-56 overflow-y-auto mb-4">
          {MESSENGER_TEMPLATE}
        </pre>
        <button
          type="button"
          onClick={() => void copyTemplate()}
          className="w-full sm:w-auto rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sm font-bold text-slate-200 px-5 py-2.5 transition"
        >
          {copiedTemplate ? 'Szablon skopiowany ✓' : 'Kopiuj szablon do Messengera'}
        </button>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setLightbox(null)}
          onKeyDown={(e) => e.key === 'Escape' && setLightbox(null)}
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-white/80 hover:text-white text-2xl font-bold p-2"
            onClick={() => setLightbox(null)}
            aria-label="Zamknij"
          >
            ×
          </button>
          <img
            src={lightbox}
            alt="Powiększony zrzut ekranu"
            className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
