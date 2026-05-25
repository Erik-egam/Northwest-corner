'use client'

import { useEffect, useState } from 'react'

export default function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(true)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(30, 27, 75, 0.5)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="clay-card p-8 max-w-sm w-full text-center bounce-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center mx-auto mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
          </svg>
        </div>

        {/* Title */}
        <h2
          className="text-3xl font-bold text-[#1E1B4B] mb-1"
          style={{ fontFamily: "'Crimson Pro', serif" }}
        >
          Método de la Esquina Noroeste
        </h2>
        <p className="text-[#818CF8] text-sm mb-6">Investigación de Operaciones</p>

        {/* Divider */}
        <div className="border-t-2 border-[#EEF2FF] my-5" />

        {/* Authors */}
        <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Desarrollado y presentado por</p>
        <div className="flex flex-col gap-2">
          <div className="bg-[#EEF2FF] rounded-xl py-2.5 px-4">
            <span className="font-bold text-[#4F46E5] text-lg">Erik Arroyo</span>
          </div>
          <div className="bg-[#EEF2FF] rounded-xl py-2.5 px-4">
            <span className="font-bold text-[#4F46E5] text-lg">Juan Acosta</span>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-6 w-full bg-[#4F46E5] text-white rounded-xl py-3 font-bold hover:bg-[#4338CA] active:scale-[0.98] transition-all cursor-pointer shadow-[0_4px_0_0_#3730a3]"
        >
          Comenzar
        </button>
      </div>
    </div>
  )
}
