import { useEffect, useRef, useState } from 'react'
import type { Employee } from '../types'
import { filterEmployeesForMention } from '../lib/mentionUtils'

interface MentionTextareaProps {
  value: string
  onChange: (value: string) => void
  onSubmit?: () => void
  employees: Employee[]
  placeholder?: string
  rows?: number
}

export function MentionTextarea({
  value,
  onChange,
  onSubmit,
  employees,
  placeholder,
  rows = 3,
}: MentionTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)
  const [mentionQuery, setMentionQuery] = useState<string | null>(null)
  const [mentionIndex, setMentionIndex] = useState(0)

  const suggestions =
    mentionQuery !== null ? filterEmployeesForMention(employees, mentionQuery).slice(0, 6) : []

  useEffect(() => {
    setMentionIndex(0)
  }, [mentionQuery])

  const detectMention = (text: string, cursor: number) => {
    const before = text.slice(0, cursor)
    const match = before.match(/@([\p{L}\d_.-]*)$/u)
    if (match) {
      setMentionQuery(match[1])
    } else {
      setMentionQuery(null)
    }
  }

  const insertMention = (emp: Employee) => {
    const el = ref.current
    if (!el) return
    const cursor = el.selectionStart
    const before = value.slice(0, cursor)
    const after = value.slice(cursor)
    const atMatch = before.match(/@([\p{L}\d_.-]*)$/u)
    if (!atMatch) return
    const start = cursor - atMatch[0].length
    const firstName = emp.name.trim().split(/\s+/)[0]
    const next = value.slice(0, start) + `@${firstName} ` + after
    onChange(next)
    setMentionQuery(null)
    requestAnimationFrame(() => {
      el.focus()
      const pos = start + firstName.length + 2
      el.setSelectionRange(pos, pos)
    })
  }

  return (
    <div className="relative">
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
          detectMention(e.target.value, e.target.selectionStart)
        }}
        onClick={(e) => detectMention(value, e.currentTarget.selectionStart)}
        onKeyDown={(e) => {
          if (mentionQuery !== null && suggestions.length > 0) {
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setMentionIndex((i) => Math.min(i + 1, suggestions.length - 1))
              return
            }
            if (e.key === 'ArrowUp') {
              e.preventDefault()
              setMentionIndex((i) => Math.max(i - 1, 0))
              return
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
              e.preventDefault()
              insertMention(suggestions[mentionIndex])
              return
            }
            if (e.key === 'Escape') {
              setMentionQuery(null)
              return
            }
          }
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            e.preventDefault()
            onSubmit?.()
          }
        }}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-amber-500 text-sm min-h-[72px] resize-y"
      />

      {mentionQuery !== null && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 bottom-full mb-1 z-20 rounded-xl border border-white/10 bg-slate-900 shadow-xl overflow-hidden">
          {suggestions.map((emp, i) => (
            <li key={emp.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => insertMention(emp)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-left text-sm ${
                  i === mentionIndex ? 'bg-amber-500/20' : 'hover:bg-white/5'
                }`}
              >
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: emp.color }} />
                <span className="font-medium">{emp.name}</span>
                <span className="text-xs text-slate-500">{emp.role}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-[10px] text-slate-500 mt-1">
        Wpisz <kbd className="px-1 rounded bg-white/10">@</kbd> aby oznaczyć osobę · Ctrl+Enter wyślij
      </p>
    </div>
  )
}
