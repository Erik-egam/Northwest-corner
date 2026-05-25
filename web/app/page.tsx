'use client'

import { useCallback, useState } from 'react'
import InputPanel, { type Destination, type Origin } from '@/components/InputPanel'
import SolutionView from '@/components/SolutionView'
import WelcomeModal from '@/components/WelcomeModal'
import { northwestCorner, type Solution } from '@/lib/northwest-corner'

const INITIAL_ORIGINS: Origin[] = [
  { name: 'Fábrica A', supply: '30' },
  { name: 'Fábrica B', supply: '40' },
  { name: 'Fábrica C', supply: '50' },
]

const INITIAL_DESTINATIONS: Destination[] = [
  { name: 'Tienda 1', demand: '20' },
  { name: 'Tienda 2', demand: '30' },
  { name: 'Tienda 3', demand: '30' },
  { name: 'Tienda 4', demand: '40' },
]

const INITIAL_COSTS: string[][] = [
  ['2', '3', '1', '5'],
  ['7', '3', '4', '6'],
  ['8', '5', '2', '3'],
]

function makeCosts(m: number, n: number, prev: string[][]): string[][] {
  return Array.from({ length: m }, (_, i) =>
    Array.from({ length: n }, (_, j) => prev[i]?.[j] ?? '0')
  )
}

export default function Home() {
  const [origins, setOrigins] = useState<Origin[]>(INITIAL_ORIGINS)
  const [destinations, setDestinations] = useState<Destination[]>(INITIAL_DESTINATIONS)
  const [costs, setCosts] = useState<string[][]>(INITIAL_COSTS)
  const [useCosts, setUseCosts] = useState(true)
  const [solution, setSolution] = useState<Solution | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSolve = useCallback(() => {
    setError(null)
    const supply = origins.map(o => Number(o.supply) || 0)
    const demand = destinations.map(d => Number(d.demand) || 0)
    if (supply.some(v => v <= 0) || demand.some(v => v <= 0)) {
      setError('Todos los valores de oferta y demanda deben ser mayores a 0.')
      return
    }
    const costsMatrix = useCosts
      ? costs.map(row => row.map(c => Number(c) || 0))
      : undefined
    setSolution(northwestCorner(supply, demand, costsMatrix))
  }, [origins, destinations, costs, useCosts])

  const addOrigin = () => {
    const m = origins.length + 1
    const n = destinations.length
    setOrigins(prev => [...prev, { name: `Origen ${m}`, supply: '0' }])
    setCosts(prev => makeCosts(m, n, [...prev, Array(n).fill('0')]))
    setSolution(null)
  }

  const removeOrigin = (idx: number) => {
    if (origins.length <= 1) return
    const next = origins.filter((_, i) => i !== idx)
    setOrigins(next)
    setCosts(prev => makeCosts(next.length, destinations.length, prev.filter((_, i) => i !== idx)))
    setSolution(null)
  }

  const addDestination = () => {
    const m = origins.length
    const n = destinations.length + 1
    setDestinations(prev => [...prev, { name: `Destino ${n}`, demand: '0' }])
    setCosts(prev => makeCosts(m, n, prev))
    setSolution(null)
  }

  const removeDestination = (idx: number) => {
    if (destinations.length <= 1) return
    const next = destinations.filter((_, i) => i !== idx)
    setDestinations(next)
    setCosts(prev => makeCosts(origins.length, next.length, prev.map(row => row.filter((_, i) => i !== idx))))
    setSolution(null)
  }

  const updateOrigin = (idx: number, field: 'name' | 'supply', value: string) => {
    setOrigins(prev => prev.map((o, i) => i === idx ? { ...o, [field]: value } : o))
    if (field === 'supply') setSolution(null)
  }

  const updateDestination = (idx: number, field: 'name' | 'demand', value: string) => {
    setDestinations(prev => prev.map((d, i) => i === idx ? { ...d, [field]: value } : d))
    if (field === 'demand') setSolution(null)
  }

  const updateCost = (i: number, j: number, value: string) => {
    setCosts(prev => prev.map((row, ri) => row.map((c, ci) => ri === i && ci === j ? value : c)))
    setSolution(null)
  }

  return (
    <main className="min-h-dvh p-4 md:p-8">
      <WelcomeModal />
      {/* Header */}
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-[#1E1B4B]" style={{ fontFamily: "'Crimson Pro', serif" }}>
          Método de la Esquina Noroeste
        </h1>
        <p className="text-[#818CF8] mt-2 text-sm md:text-base">
          Problema de Transporte · Visualización interactiva paso a paso
        </p>
      </header>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl mx-auto">
        <InputPanel
          origins={origins}
          destinations={destinations}
          costs={costs}
          useCosts={useCosts}
          onOriginChange={updateOrigin}
          onDestinationChange={updateDestination}
          onCostChange={updateCost}
          onUseCostsChange={setUseCosts}
          onAddOrigin={addOrigin}
          onRemoveOrigin={removeOrigin}
          onAddDestination={addDestination}
          onRemoveDestination={removeDestination}
          onSolve={handleSolve}
          error={error}
        />

        <SolutionView
          solution={solution}
          origins={origins.map(o => ({ name: o.name, supply: Number(o.supply) || 0 }))}
          destinations={destinations.map(d => ({ name: d.name, demand: Number(d.demand) || 0 }))}
          costs={useCosts ? costs.map(r => r.map(c => Number(c) || 0)) : undefined}
        />
      </div>

      <footer className="text-center text-xs text-gray-400 mt-8 pb-4">
        Método de la Esquina Noroeste · Investigación de Operaciones
      </footer>
    </main>
  )
}
