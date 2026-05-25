# Método de la Esquina Noroeste

Visualización interactiva del Método de la Esquina Noroeste para resolver problemas de transporte en Investigación de Operaciones.

## ¿Qué es?

El **Método de la Esquina Noroeste** es un algoritmo clásico de programación lineal que genera una solución inicial factible para el **Problema de Transporte**: distribuir unidades desde $m$ orígenes (fábricas, almacenes) hacia $n$ destinos (tiendas, clientes), minimizando el costo total de envío.

Este proyecto ofrece dos implementaciones:

| Implementación | Descripción |
|---|---|
| `northwest_corner.py` | Script Python de línea de comandos, sin dependencias |
| `web/` | Aplicación web interactiva con animación paso a paso |

## Demo (web)

La aplicación permite:

- Configurar orígenes, destinos, oferta, demanda y costos de forma dinámica
- Visualizar la ejecución del algoritmo celda por celda con controles de velocidad
- Obtener el costo total de la solución cuando se proporcionan los costos
- Validar que el problema esté balanceado (oferta total = demanda total)

## Tecnologías

- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Lucide React** (íconos)
- **Python 3** (script standalone)

## Instalación y uso

### Aplicación web

```bash
cd web
pnpm install
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

```bash
# Producción
pnpm build
pnpm start
```

### Script Python

```bash
python northwest_corner.py
```

El script incluye dos ejemplos predefinidos y un modo interactivo para ingresar problemas personalizados.

## Estructura del proyecto

```
metodo-de-la-esquina-noroeste/
├── northwest_corner.py        # Implementación CLI en Python
└── web/
    ├── app/
    │   ├── layout.tsx         # Layout raíz
    │   ├── page.tsx           # Página principal
    │   └── globals.css        # Estilos globales
    ├── components/
    │   ├── InputPanel.tsx     # Panel de configuración del problema
    │   ├── SolutionView.tsx   # Visualización animada de la solución
    │   └── WelcomeModal.tsx   # Pantalla de bienvenida
    └── lib/
        └── northwest-corner.ts  # Algoritmo principal (TypeScript)
```

## Algoritmo

El algoritmo parte desde la celda superior izquierda (esquina noroeste) y en cada paso asigna el máximo posible de unidades:

1. Asignar `min(oferta[i], demanda[j])` a la celda `(i, j)`
2. Reducir oferta y demanda en esa cantidad
3. Si la oferta del origen `i` se agota, avanzar a la fila siguiente
4. Si la demanda del destino `j` se satisface, avanzar a la columna siguiente
5. Repetir hasta cubrir toda la oferta y demanda

## Autores

- **Erik Arroyo**
- **Juan Acosta**
