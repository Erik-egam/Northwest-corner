def northwest_corner(supply, demand, costs=None):
    """
    El Método de la Esquina Noroeste.

    supply: lista de ofertas de cada origen
    demand: lista de demandas de cada destino
    costs:  matriz de costos (opcional, solo para calcular el costo total)
    
    Retorna la matriz de asignaciones y el costo total (si se dan costos).
    """
    m = len(supply)
    n = len(demand)

    supply = supply[:]
    demand = demand[:]

    allocation = [[0] * n for _ in range(m)]

    i, j = 0, 0
    while i < m and j < n:
        qty = min(supply[i], demand[j])
        allocation[i][j] = qty
        supply[i] -= qty
        demand[j] -= qty

        if supply[i] == 0 and demand[j] == 0:
            i += 1
            j += 1
        elif supply[i] == 0:
            i += 1
        else:
            j += 1

    total_cost = None
    if costs is not None:
        total_cost = sum(
            allocation[i][j] * costs[i][j]
            for i in range(m)
            for j in range(n)
            if allocation[i][j] > 0
        )

    return allocation, total_cost


def print_table(supply, demand, costs=None, allocation=None):
    m = len(supply)
    n = len(demand)

    col_w = 10
    dest_labels = [f"D{j+1}" for j in range(n)]
    orig_labels = [f"O{i+1}" for i in range(m)]

    # Encabezado
    header = f"{'':10}" + "".join(f"{d:>{col_w}}" for d in dest_labels) + f"{'Oferta':>{col_w}}"
    print(header)
    print("-" * len(header))

    for i in range(m):
        row = f"{orig_labels[i]:10}"
        for j in range(n):
            cell = ""
            if costs is not None:
                cell += f"c={costs[i][j]}"
            if allocation is not None and allocation[i][j] > 0:
                cell += f" x={allocation[i][j]}"
            row += f"{cell:>{col_w}}"
        row += f"{supply[i]:>{col_w}}"
        print(row)

    print("-" * len(header))
    demand_row = f"{'Demanda':10}" + "".join(f"{d:>{col_w}}" for d in demand)
    print(demand_row)


def main():
    print("=" * 60)
    print("     MÉTODO DE LA ESQUINA NOROESTE — Problema de Transporte")
    print("=" * 60)

    # ── Ejemplo 1 ──────────────────────────────────────────────────
    print("\nEjemplo 1: problema balanceado (suma oferta == suma demanda)")
    supply1 = [30, 40, 50]
    demand1 = [20, 30, 30, 40]
    costs1  = [
        [2, 3, 1, 5],
        [7, 3, 4, 6],
        [8, 5, 2, 3],
    ]

    print("\nTabla de costos y ofertas/demandas:")
    print_table(supply1, demand1, costs=costs1)

    alloc1, cost1 = northwest_corner(supply1, demand1, costs=costs1)

    print("\nAsignaciones (Método de la Esquina Noroeste):")
    print_table(supply1, demand1, costs=costs1, allocation=alloc1)

    print(f"\nCosto total de la solución inicial: {cost1}")

    # ── Ejemplo 2 ──────────────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Ejemplo 2: sin costos (solo asignaciones)")
    supply2 = [100, 200, 150]
    demand2 = [120, 80, 80, 170]

    alloc2, _ = northwest_corner(supply2, demand2)

    print("\nOferta:", supply2)
    print("Demanda:", demand2)
    print("\nMatriz de asignaciones:")
    header = f"{'':6}" + "".join(f"{'D'+str(j+1):>8}" for j in range(len(demand2)))
    print(header)
    for i, row in enumerate(alloc2):
        print(f"{'O'+str(i+1):6}" + "".join(f"{v:>8}" for v in row))

    # ── Modo interactivo ───────────────────────────────────────────
    print("\n" + "=" * 60)
    print("Modo interactivo")
    print("=" * 60)

    try:
        m = int(input("\nNúmero de orígenes: ").strip())
        n = int(input("Número de destinos: ").strip())

        supply = list(map(int, input(f"Oferta de cada origen ({m} valores separados por espacio): ").split()))
        demand = list(map(int, input(f"Demanda de cada destino ({n} valores separados por espacio): ").split()))

        usar_costos = input("¿Ingresar costos? (s/n): ").strip().lower() == "s"
        costs = None
        if usar_costos:
            print(f"Ingresa la matriz de costos fila por fila ({m} filas, {n} columnas cada una):")
            costs = []
            for i in range(m):
                fila = list(map(int, input(f"  Fila {i+1}: ").split()))
                costs.append(fila)

        alloc, total = northwest_corner(supply, demand, costs)

        print("\nAsignaciones:")
        header = f"{'':6}" + "".join(f"{'D'+str(j+1):>8}" for j in range(n))
        print(header)
        for i, row in enumerate(alloc):
            print(f"{'O'+str(i+1):6}" + "".join(f"{v:>8}" for v in row))

        if total is not None:
            print(f"\nCosto total: {total}")

    except (EOFError, KeyboardInterrupt):
        print("\n(Modo interactivo omitido)")


if __name__ == "__main__":
    main()
