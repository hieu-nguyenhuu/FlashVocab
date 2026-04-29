import React from 'react'
import { StarRating } from './UI'

export default function FlashCard({ word, showBack, showPhonetic = true, onClick }) {
  if (!word) return null

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center
                  rounded-2xl border cursor-pointer select-none
                  min-h-[260px] sm:min-h-[300px] p-8 gap-4
                  transition-all duration-300 animate-flip-in
                  ${showBack
                    ? 'bg-gradient-to-br from-[#1B2838] to-surface2 border-accent3/40 card-glow-green'
                    : 'bg-gradient-to-br from-[#1E2235] to-surface border-accent/40 card-glow'
                  }`}
    >
      {/* Star rating top-right */}
      <div className="absolute top-4 right-4">
        <StarRating rating={word.ThanhThao || 0} size={13} />
      </div>

      {/* Front */}
      <p className={`font-extrabold text-center text-white leading-tight
                     ${showBack ? 'text-3xl sm:text-4xl' : 'text-4xl sm:text-5xl'}`}>
        {word.TuVung}
      </p>

      {/* Phonetic */}
      {word.PhienAm && (showPhonetic || showBack) && (
        <p className="text-accent font-mono text-base sm:text-lg italic text-center">
          {word.PhienAm}
        </p>
      )}

      {/* Back content */}
      {showBack && (
        <div className="flex flex-col items-center gap-3 animate-fade-in">
          {word.Nghia && (
            <p className="text-accent3 text-xl sm:text-2xl font-bold text-center">
              {word.Nghia}
            </p>
          )}
          {word.ViDu && (
            <p className="text-dim text-sm sm:text-base italic text-center max-w-md">
              "{word.ViDu}"
            </p>
          )}
        </div>
      )}

      {/* Flip hint */}
      {!showBack && (
        <p className="absolute bottom-4 left-1/2 -translate-x-1/2
                      text-dim text-xs font-medium opacity-60">
          Nhấn Space hoặc click để lật thẻ
        </p>
      )}
    </div>
  )
}
