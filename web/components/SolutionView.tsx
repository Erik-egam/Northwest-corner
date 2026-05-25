'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, Gauge } from 'lucide-react'
import { type Solution, type Step } from '@/lib/northwest-corner'

interface Props {
  solution: Solution | null
  origins: { name: string; supply: number }[]
  destinations: { name: string; demand: number }[]
  costs?: number[][]
}

type CellState = 'idle' | 'active' | 'allocated'

function getCellState(r: number, c: number, stepIdx: number, steps: Step[]): CellState {
  if (stepIdx < 0 || steps.length === 0) return 'idle'
  const step = steps[stepIdx]
  if (r === step.i && c === step.j) return 'active'
  if (step.allocation[r][c] > 0) return 'allocated'
  return 'idle'
}

function getSupplyRemaining(r: number, stepIdx: number, steps: Step[], initialSupply: number[]): number {
  if (stepIdx < 0) return initialSupply[r]
  return steps[stepIdx].supply[r]
}

function getDemandRemaining(c: number, stepIdx: number, steps: Step[], initialDemand: number[]): number {
  if (stepIdx < 0) return initialDemand[c]
  return steps[stepIdx].demand[c]
}

function getAllocated(r: number, c: number, stepIdx: number, steps: Step[]): number {
  if (stepIdx < 0) return 0
  return steps[stepIdx].allocation[r][c]
}

const SPEEDS = [
  { label: '0.5×', ms: 3000 },
  { label: '1×', ms: 1800 },
  { label: '2×', ms: 900 },
  { label: '3×', ms: 400 },
]

function StepExplanation({ step, stepIdx, total, origins, destinations }: {
  step: Step
  stepIdx: number
  total: number
  origins: { name: string }[]
  destinations: { name: string }[]
}) {
  const originName = origins[step.i]?.name ?? `Origen ${step.i + 1}`
  const destName = destinations[step.j]?.name ?? `Destino ${step.j + 1}`
  const nextOriginName = origins[step.nextI]?.name ?? `Origen ${step.nextI + 1}`
  const nextDestName = destinations[step.nextJ]?.name ?? `Destino ${step.nextJ + 1}`

  const reasonText = () => {
    const isLastStep = stepIdx === total - 1
    if (step.reason === 'both') {
      return (
        <p className="text-sm text-violet-700">
          <span className="font-semibold">Caso especial (degenerado):</span> tanto la oferta de{' '}
          <span className="font-semibold">{originName}</span> como la demanda de{' '}
          <span className="font-semibold">{destName}</span> se agotaron simultáneamente.{' '}
          {!isLastStep && <>Avanzamos en diagonal hacia <span className="font-semibold">{nextOriginName} → {nextDestName}</span>.</>}
        </p>
      )
    }
    if (step.reason === 'supply') {
      return (
        <p className="text-sm text-indigo-700">
          La oferta de <span className="font-semibold">{originName}</span> se agotó (quedó en 0).{' '}
          {!isLastStep && <>Pasamos al siguiente origen: <span className="font-semibold">{nextOriginName}</span>.</>}
        </p>
      )
    }
    return (
      <p className="text-sm text-emerald-700">
        La demanda de <span className="font-semibold">{destName}</span> quedó satisfecha (quedó en 0).{' '}
        {!isLastStep && <>Pasamos al siguiente destino: <span className="font-semibold">{nextDestName}</span>.</>}
      </p>
    )
  }

  const reasonBg = step.reason === 'both'
    ? 'bg-violet-50 border-violet-200'
    : step.reason === 'supply'
      ? 'bg-indigo-50 border-indigo-200'
      : 'bg-emerald-50 border-emerald-200'

  return (
    <div className="flex flex-col gap-3 slide-in" key={stepIdx}>
      {/* Step header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[#4F46E5] uppercase tracking-wider">
          Paso {stepIdx + 1} de {total}
        </span>
        <span className="text-xs text-gray-400">
          {originName} → {destName}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-[#EEF2FF] rounded-full h-2 overflow-hidden">
        <div
          className="h-2 bg-[#4F46E5] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((stepIdx + 1) / total) * 100}%` }}
        />
      </div>

      {/* Min calculation */}
      <div className="bg-[#EEF2FF] rounded-xl p-3 flex flex-col gap-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Oferta <span className="font-semibold text-[#1E1B4B]">{originName}</span></span>
          <span className="font-bold text-[#1E1B4B]">{step.supplyBefore}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Demanda <span className="font-semibold text-[#1E1B4B]">{destName}</span></span>
          <span className="font-bold text-[#1E1B4B]">{step.demandBefore}</span>
        </div>
        <div className="border-t border-[#C7D2FE] mt-1 pt-2 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-mono">
            min({step.supplyBefore}, {step.demandBefore})
          </span>
          <span className="text-lg font-bold text-[#4F46E5]">= {step.qty}</span>
        </div>
      </div>

      {/* Reason */}
      <div className={`rounded-xl border p-3 ${reasonBg}`}>
        {reasonText()}
      </div>
    </div>
  )
}

export default function SolutionView({ solution, origins, destinations, costs }: Props) {
  const [stepIdx, setStepIdx] = useState(-1)
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const steps = solution?.steps ?? []
  const m = origins.length
  const n = destinations.length

  // Reset when solution changes
  useEffect(() => {
    setStepIdx(-1)
    setIsPlaying(false)
  }, [solution])

  // Auto-play logic
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearTimeout(timerRef.current)
      return
    }
    const advance = () => {
      setStepIdx(prev => {
        if (prev >= steps.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }
    timerRef.current = setTimeout(advance, SPEEDS[speedIdx].ms)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isPlaying, stepIdx, steps.length, speedIdx])

  const goTo = (idx: number) => {
    setIsPlaying(false)
    setStepIdx(Math.max(-1, Math.min(steps.length - 1, idx)))
  }

  const togglePlay = () => {
    if (stepIdx >= steps.length - 1) {
      setStepIdx(0)
      setIsPlaying(true)
    } else if (stepIdx < 0) {
      setStepIdx(0)
      setIsPlaying(true)
    } else {
      setIsPlaying(p => !p)
    }
  }

  const reset = () => {
    setStepIdx(-1)
    setIsPlaying(false)
  }

  const isDone = stepIdx === steps.length - 1 && steps.length > 0

  const initialSupply = origins.map(o => o.supply)
  const initialDemand = destinations.map(d => d.demand)

  if (!solution) {
    return (
      <div className="clay-card p-6 flex flex-col items-center justify-center min-h-64 gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-[#EEF2FF] flex items-center justify-center">
          <Play size={28} className="text-[#4F46E5] ml-1" />
        </div>
        <h2 className="text-2xl font-bold text-[#1E1B4B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Visualización
        </h2>
        <p className="text-gray-500 text-sm max-w-xs">
          Configura el problema en el panel izquierdo y presiona{' '}
          <span className="font-semibold text-[#4F46E5]">Resolver y Visualizar</span> para ver la animación paso a paso.
        </p>
      </div>
    )
  }

  return (
    <div className="clay-card p-6 flex flex-col gap-5">
      <h2 className="text-2xl font-bold text-[#1E1B4B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
        Visualización
      </h2>

      {/* Matrix */}
      <div className="overflow-x-auto">
        <table className="border-collapse text-sm w-full">
          <thead>
            <tr>
              <th className="p-1" />
              {destinations.map((dest, j) => {
                const rem = getDemandRemaining(j, stepIdx, steps, initialDemand)
                return (
                  <th key={j} className="p-1 text-center min-w-[70px]">
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-xs font-semibold text-[#4F46E5] truncate max-w-[80px]" title={dest.name}>
                        {dest.name}
                      </span>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded-full transition-all duration-300 ${rem === 0 && stepIdx >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-[#EEF2FF] text-gray-600'}`}>
                        {rem}
                      </span>
                    </div>
                  </th>
                )
              })}
              <th className="p-1 text-center text-xs text-gray-400">Oferta</th>
            </tr>
          </thead>
          <tbody>
            {origins.map((origin, r) => {
              const rem = getSupplyRemaining(r, stepIdx, steps, initialSupply)
              return (
                <tr key={r}>
                  <td className="p-1 pr-2">
                    <div className="flex flex-col items-end gap-0.5">
                      <span className="text-xs font-semibold text-[#4F46E5] truncate max-w-[80px] text-right" title={origin.name}>
                        {origin.name}
                      </span>
                    </div>
                  </td>
                  {destinations.map((_, c) => {
                    const state = getCellState(r, c, stepIdx, steps)
                    const qty = getAllocated(r, c, stepIdx, steps)
                    const cost = costs?.[r]?.[c]

                    const cellCls = {
                      idle: 'bg-gray-50 border-gray-200 text-gray-300',
                      active: 'bg-[#4F46E5] border-[#4F46E5] text-white scale-105 z-10 relative cell-active',
                      allocated: 'bg-emerald-50 border-emerald-300 text-emerald-800',
                    }[state]

                    return (
                      <td key={c} className="p-1">
                        <div className={`rounded-xl border-2 w-full aspect-square flex flex-col items-center justify-center transition-all duration-300 ease-out min-w-[56px] min-h-[56px] ${cellCls}`}>
                          {state !== 'idle' && qty > 0 ? (
                            <>
                              <span className="font-bold text-base leading-none">{qty}</span>
                              {cost !== undefined && (
                                <span className={`text-xs mt-0.5 leading-none ${state === 'active' ? 'text-indigo-200' : 'text-gray-400'}`}>
                                  c={cost}
                                </span>
                              )}
                            </>
                          ) : cost !== undefined && state === 'idle' ? (
                            <span className="text-xs text-gray-300">{cost}</span>
                          ) : null}
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-1 text-center">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded-full transition-all duration-300 ${rem === 0 && stepIdx >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-[#EEF2FF] text-gray-600'}`}>
                      {rem}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-[#4F46E5] inline-block" /> Celda activa
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-emerald-100 border border-emerald-300 inline-block" /> Asignada
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded-md bg-gray-100 border border-gray-200 inline-block" /> Pendiente
        </span>
      </div>

      {/* Step explanation */}
      <div className="bg-[#F8F9FF] rounded-2xl border border-[#E0E7FF] p-4 min-h-[160px] flex flex-col justify-center">
        {stepIdx < 0 ? (
          <div className="text-center text-gray-400 text-sm">
            <p className="font-medium text-[#1E1B4B] mb-1">Listo para iniciar</p>
            <p>Presiona <span className="text-[#4F46E5] font-semibold">Reproducir</span> para ver el algoritmo paso a paso,<br />o usa las flechas para navegar manualmente.</p>
          </div>
        ) : isDone ? (
          <div className="flex flex-col gap-3 fade-in">
            <div className="text-center">
              <span className="text-2xl">✓</span>
              <h3 className="font-bold text-[#1E1B4B] text-lg mt-1" style={{ fontFamily: "'Crimson Pro', serif" }}>
                ¡Solución encontrada!
              </h3>
              <p className="text-gray-500 text-sm">Se completaron {steps.length} asignaciones.</p>
            </div>
            {solution.totalCost !== null && (
              <div className="bg-[#4F46E5] text-white rounded-xl p-3 text-center">
                <p className="text-xs opacity-80 mb-0.5">Costo total de la solución inicial</p>
                <p className="text-3xl font-bold">{solution.totalCost}</p>
              </div>
            )}
            <p className="text-xs text-gray-400 text-center">
              Esta es una solución inicial factible. Para optimizar, aplica el Método MODI (u-v).
            </p>
          </div>
        ) : (
          <StepExplanation
            step={steps[stepIdx]}
            stepIdx={stepIdx}
            total={steps.length}
            origins={origins}
            destinations={destinations}
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Left: step navigation */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={reset}
            title="Reiniciar"
            className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] transition-colors cursor-pointer"
          >
            <RotateCcw size={16} />
          </button>
          <button
            type="button"
            onClick={() => goTo(stepIdx - 1)}
            disabled={stepIdx < 0}
            className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="px-5 py-2 rounded-xl bg-[#4F46E5] text-white hover:bg-[#4338CA] flex items-center gap-1.5 font-semibold text-sm transition-colors cursor-pointer shadow-[0_3px_0_0_#3730a3]"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} fill="white" />}
            {isPlaying ? 'Pausar' : stepIdx < 0 ? 'Iniciar' : isDone ? 'Reiniciar' : 'Reanudar'}
          </button>
          <button
            type="button"
            onClick={() => goTo(stepIdx + 1)}
            disabled={isDone}
            className="p-2 rounded-xl bg-[#EEF2FF] text-[#4F46E5] hover:bg-[#E0E7FF] disabled:opacity-30 transition-colors cursor-pointer"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Right: speed */}
        <div className="flex items-center gap-1">
          <Gauge size={14} className="text-gray-400" />
          <div className="flex rounded-xl overflow-hidden border border-[#C7D2FE]">
            {SPEEDS.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSpeedIdx(i)}
                className={`px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${speedIdx === i ? 'bg-[#4F46E5] text-white' : 'bg-white text-gray-500 hover:bg-[#EEF2FF]'}`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Step counter */}
      <div className="text-center text-xs text-gray-400">
        {stepIdx < 0
          ? `${steps.length} pasos en total`
          : isDone
            ? 'Algoritmo completado'
            : `Paso ${stepIdx + 1} de ${steps.length}`}
      </div>
    </div>
  )
}
