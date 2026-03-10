'use client'

interface ResponseLetterProps {
  letter: string
  compact?: boolean
}

export default function ResponseLetter({ letter, compact = false }: ResponseLetterProps) {
  function handlePrint() {
    window.print()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 no-print">
        <h3 className="text-lg font-semibold text-white">Response Letter</h3>
        <button
          onClick={handlePrint}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Print / Save PDF
        </button>
      </div>
      <div
        className={`print-document bg-slate-900 border border-slate-700 rounded-xl p-6 font-mono text-sm text-slate-300 whitespace-pre-wrap leading-relaxed ${compact ? 'max-h-96 overflow-y-auto' : ''}`}
      >
        {letter}
      </div>
    </div>
  )
}
