import type { Employee } from '../types'
import { getMentionedEmployees, splitMentionParts } from '../lib/mentionUtils'

interface MentionContentProps {
  content: string
  mentions: string[]
  employees: Employee[]
  className?: string
  done?: boolean
}

export function MentionContent({ content, mentions, employees, className = '', done = false }: MentionContentProps) {
  const parts = splitMentionParts(content)
  const mentioned = getMentionedEmployees(mentions, employees)

  return (
    <div className={className}>
      <p className={`text-sm whitespace-pre-wrap leading-relaxed ${done ? 'line-through text-slate-500' : 'text-amber-100/90'}`}>
        {parts.map((part, i) =>
          part.type === 'mention' ? (
            <span key={i} className="mention-tag">
              {part.value}
            </span>
          ) : (
            <span key={i}>{part.value}</span>
          ),
        )}
      </p>
      {mentioned.length > 0 && !done && (
        <div className="flex flex-wrap gap-1 mt-2">
          {mentioned.map((emp) => (
            <span
              key={emp.id}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border"
              style={{ background: `${emp.color}18`, borderColor: `${emp.color}40`, color: emp.color }}
            >
              @{emp.name.split(/\s+/)[0]}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
