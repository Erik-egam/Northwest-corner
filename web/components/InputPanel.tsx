'use client'

import { Minus, Plus, Play } from 'lucide-react'

export interface Origin {
  name: string
  supply: string
}

export interface Destination {
  name: string
  demand: string
}

interface Props {
  origins: Origin[]
  destinations: Destination[]
  costs: string[][]
  useCosts: boolean
  onOriginChange: (idx: number, field: 'name' | 'supply', value: string) => void
  onDestinationChange: (idx: number, field: 'name' | 'demand', value: string) => void
  onCostChange: (i: number, j: number, value: string) => void
  onUseCostsChange: (use: boolean) => void
  onAddOrigin: () => void
  onRemoveOrigin: (idx: number) => void
  onAddDestination: () => void
  onRemoveDestination: (idx: number) => void
  onSolve: () => void
  error?: string | null
}

export default function InputPanel({
  origins, destinations, costs, useCosts,
  onOriginChange, onDestinationChange, onCostChange, onUseCostsChange,
  onAddOrigin, onRemoveOrigin, onAddDestination, onRemoveDestination,
  onSolve, error,
}: Props) {
  const m = origins.length
  const n = destinations.length

  const totalSupply = origins.reduce((s, o) => s + (Number(o.supply) || 0), 0)
  const totalDemand = destinations.reduce((s, d) => s + (Number(d.demand) || 0), 0)
  const balanced = totalSupply === totalDemand && totalSupply > 0

  const inputCls = 'w-full text-center text-sm bg-white border-2 border-[#C7D2FE] rounded-lg px-1 py-1.5 focus:outline-none focus:border-[#4F46E5] transition-colors'
  const nameCls = 'w-full text-center text-xs font-semibold text-[#4F46E5] bg-[#EEF2FF] border border-[#C7D2FE] rounded-lg px-1 py-1 focus:outline-none focus:border-[#4F46E5] transition-colors'

  return (
    <div className="clay-card p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-[#1E1B4B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Configurar Problema
        </h2>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <span className="text-sm text-[#4F46E5] font-medium">Costos</span>
          <button
            type="button"
            onClick={() => onUseCostsChange(!useCosts)}
            aria-label="Activar costos"
            className={`relative w-11 h-6 rounded-full transition-colors duration-200 cursor-pointer ${useCosts ? 'bg-[#4F46E5]' : 'bg-gray-300'}`}
          >
            <span className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${useCosts ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
        </label>
      </div>

      {/* Add/Remove buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onAddOrigin}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] text-sm font-medium hover:bg-[#E0E7FF] transition-colors cursor-pointer"
        >
          <Plus size={14} /> Origen
        </button>
        {m > 1 && (
          <button
            type="button"
            onClick={() => onRemoveOrigin(m - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Minus size={14} /> Origen
          </button>
        )}
        <button
          type="button"
          onClick={onAddDestination}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#EEF2FF] text-[#4F46E5] border border-[#C7D2FE] text-sm font-medium hover:bg-[#E0E7FF] transition-colors cursor-pointer"
        >
          <Plus size={14} /> Destino
        </button>
        {n > 1 && (
          <button
            type="button"
            onClick={() => onRemoveDestination(n - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 text-red-500 border border-red-200 text-sm font-medium hover:bg-red-100 transition-colors cursor-pointer"
          >
            <Minus size={14} /> Destino
          </button>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E0E7FF]">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-[#EEF2FF]">
              <th className="p-2 text-left font-medium text-gray-400 text-xs whitespace-nowrap min-w-[110px]">
                Origen \ Destino
              </th>
              {destinations.map((dest, j) => (
                <th key={j} className="p-2 min-w-[90px]">
                  <div className="flex flex-col gap-1">
                    <input
                      value={dest.name}
                      onChange={e => onDestinationChange(j, 'name', e.target.value)}
                      className={nameCls}
                      aria-label={`Nombre destino ${j + 1}`}
                    />
                    <input
                      type="number"
                      value={dest.demand}
                      onChange={e => onDestinationChange(j, 'demand', e.target.value)}
                      placeholder="Demanda"
                      className={inputCls}
                      aria-label={`Demanda destino ${j + 1}`}
                    />
                  </div>
                </th>
              ))}
              <th className="p-2 text-center text-gray-400 text-xs font-medium whitespace-nowrap">
                Oferta
              </th>
            </tr>
          </thead>
          <tbody>
            {origins.map((origin, i) => (
              <tr key={i} className="border-t border-[#EEF2FF] hover:bg-[#F5F7FF] transition-colors">
                <td className="p-2">
                  <div className="flex flex-col gap-1">
                    <input
                      value={origin.name}
                      onChange={e => onOriginChange(i, 'name', e.target.value)}
                      className={nameCls}
                      aria-label={`Nombre origen ${i + 1}`}
                    />
                    <input
                      type="number"
                      value={origin.supply}
                      onChange={e => onOriginChange(i, 'supply', e.target.value)}
                      placeholder="Oferta"
                      className={inputCls}
                      aria-label={`Oferta origen ${i + 1}`}
                    />
                  </div>
                </td>
                {destinations.map((_, j) => (
                  <td key={j} className="p-2">
                    {useCosts ? (
                      <input
                        type="number"
                        value={costs[i]?.[j] ?? '0'}
                        onChange={e => onCostChange(i, j, e.target.value)}
                        className={inputCls}
                        aria-label={`Costo origen ${i + 1} destino ${j + 1}`}
                      />
                    ) : (
                      <div className="border-2 border-dashed border-gray-200 rounded-lg h-9 flex items-center justify-center text-gray-300 text-xs">
                        —
                      </div>
                    )}
                  </td>
                ))}
                <td className="p-2 text-center font-bold text-[#1E1B4B] text-base">
                  {Number(origin.supply) || 0}
                </td>
              </tr>
            ))}

            {/* Demand row */}
            <tr className="border-t-2 border-[#C7D2FE] bg-[#EEF2FF]">
              <td className="p-2 text-right text-gray-500 text-xs font-medium">Demanda:</td>
              {destinations.map((dest, j) => (
                <td key={j} className="p-2 text-center font-bold text-[#1E1B4B]">
                  {Number(dest.demand) || 0}
                </td>
              ))}
              <td className="p-2 text-center text-xs">
                {totalSupply > 0 && (
                  <span className={`font-bold text-sm ${balanced ? 'text-emerald-600' : 'text-red-500'}`}>
                    {balanced ? '✓' : '✗'}
                  </span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Balance indicator */}
      {totalSupply > 0 && (
        <div className={`flex items-center gap-2 text-sm px-4 py-2 rounded-xl ${balanced ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
          <span className="text-base">{balanced ? '✓' : '⚠'}</span>
          {balanced
            ? `Problema balanceado — Oferta = Demanda = ${totalSupply}`
            : `Desbalanceado — Oferta: ${totalSupply} ≠ Demanda: ${totalDemand}`}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm px-4 py-2 rounded-xl bg-red-50 text-red-600 border border-red-200">
          <span>⚠</span> {error}
        </div>
      )}

      <button
        type="button"
        onClick={onSolve}
        disabled={!balanced}
        className="w-full bg-[#4F46E5] text-white rounded-xl py-3.5 font-bold text-base hover:bg-[#4338CA] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_0_0_#3730a3]"
      >
        <Play size={18} fill="white" />
        Resolver y Visualizar
      </button>
    </div>
  )
}
