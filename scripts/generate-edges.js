// Reemplazo del script Python - misma lógica, diferente lenguaje
const fs = require("fs")
const path = require("path")

// Número total de nodos (igual que en Python)
const numNodes = 6

// Lista para almacenar las conexiones únicas
const edges = []
const existingEdges = new Set() // Para verificar duplicados (u, v)

while (edges.length < 9) {
  // Generar dos nodos aleatorios diferentes
  const nodes = []
  while (nodes.length < 2) {
    const node = Math.floor(Math.random() * numNodes)
    if (!nodes.includes(node)) {
      nodes.push(node)
    }
  }

  // Ordenar para asegurar que u ≠ v y ordenarlos (igual que en Python)
  const [u, v] = nodes.sort((a, b) => a - b)

  if (!existingEdges.has(`${u}-${v}`)) {
    const w = Math.floor(Math.random() * 15) + 1 // Peso aleatorio entre 1 y 15
    edges.push([u, v, w])
    existingEdges.add(`${u}-${v}`)
  }
}

// Generar en ambas ubicaciones para asegurar compatibilidad
const scriptDir = __dirname
const dataDir = path.join(scriptDir, "..", "data")
const publicDataDir = path.join(scriptDir, "..", "public", "data")

// Crear directorios si no existen
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(publicDataDir)) {
  fs.mkdirSync(publicDataDir, { recursive: true })
}

// Guardar en ambas ubicaciones
const dataPath = path.join(dataDir, "edges.json")
const publicDataPath = path.join(publicDataDir, "edges.json")

fs.writeFileSync(dataPath, JSON.stringify(edges, null, 4))
fs.writeFileSync(publicDataPath, JSON.stringify(edges, null, 4))

console.log(`Archivo edges.json generado en: ${dataPath}`)
console.log(`Archivo edges.json generado en: ${publicDataPath}`)