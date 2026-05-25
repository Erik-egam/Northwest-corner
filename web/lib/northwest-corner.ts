export interface Step {
  i: number
  j: number
  qty: number
  supplyBefore: number
  demandBefore: number
  reason: 'supply' | 'demand' | 'both'
  supply: number[]
  demand: number[]
  allocation: number[][]
  nextI: number
  nextJ: number
}

export interface Solution {
  steps: Step[]
  finalAllocation: number[][]
  totalCost: number | null
}

export function northwestCorner(
  supply: number[],
  demand: number[],
  costs?: number[][]
): Solution {
  const m = supply.length
  const n = demand.length
  const s = supply.slice()
  const d = demand.slice()
  const allocation: number[][] = Array.from({ length: m }, () => Array(n).fill(0))
  const steps: Step[] = []

  let i = 0
  let j = 0

  while (i < m && j < n) {
    const ci = i
    const cj = j
    const qty = Math.min(s[i], d[j])
    const supplyBefore = s[i]
    const demandBefore = d[j]

    allocation[ci][cj] = qty
    s[i] -= qty
    d[j] -= qty

    let reason: Step['reason']
    if (s[i] === 0 && d[j] === 0) {
      reason = 'both'
      i++
      j++
    } else if (s[i] === 0) {
      reason = 'supply'
      i++
    } else {
      reason = 'demand'
      j++
    }

    steps.push({
      i: ci,
      j: cj,
      qty,
      supplyBefore,
      demandBefore,
      reason,
      supply: s.slice(),
      demand: d.slice(),
      allocation: allocation.map(r => r.slice()),
      nextI: Math.min(i, m - 1),
      nextJ: Math.min(j, n - 1),
    })
  }

  let totalCost: number | null = null
  if (costs) {
    totalCost = 0
    for (const step of steps) {
      totalCost += step.qty * costs[step.i][step.j]
    }
  }

  return { steps, finalAllocation: allocation, totalCost }
}
