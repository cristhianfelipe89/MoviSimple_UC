// Implementación orientada a objetos con la clase GraphSimple
document.addEventListener("DOMContentLoaded", () => {
  // Clase para modelar el grafo y aplicar Dijkstra
  class GraphSimple {
    constructor() {
      this.edges = []
      this.nodes = new Set()
      this.tarifa = 0.25 // $0.25 por segundo
    }

    // Cargar el grafo desde un archivo JSON
    async loadGraph() {
      try {
        // Intentar cargar desde múltiples ubicaciones
        let response
        try {
          response = await fetch("/data/edges.json")
          if (!response.ok) throw new Error("No encontrado en /data/")
        } catch (error) {
          console.log("Intentando cargar desde ubicación alternativa...")
          response = await fetch("/public/data/edges.json")
          if (!response.ok) throw new Error("No encontrado en /public/data/")
        }

        this.edges = await response.json()

        // Extraer todos los nodos únicos del grafo
        this.edges.forEach((edge) => {
          this.nodes.add(edge[0])
          this.nodes.add(edge[1])
        })

        console.log("Grafo cargado:", this.edges)
        console.log(
          "Nodos encontrados:",
          Array.from(this.nodes).sort((a, b) => a - b),
        )

        return Array.from(this.nodes).sort((a, b) => a - b)
      } catch (error) {
        console.error("Error cargando el grafo:", error)

        // Fallback: usar datos hardcodeados si no se puede cargar el archivo
        console.log("Usando datos de grafo por defecto...")
        this.edges = [
          [0, 1, 8],
          [0, 2, 12],
          [0, 3, 7],
          [1, 2, 6],
          [1, 4, 9],
          [2, 3, 4],
          [2, 4, 11],
          [3, 5, 10],
          [4, 5, 5],
        ]

        // Extraer nodos del grafo por defecto
        this.edges.forEach((edge) => {
          this.nodes.add(edge[0])
          this.nodes.add(edge[1])
        })

        console.log("Grafo por defecto cargado:", this.edges)
        return Array.from(this.nodes).sort((a, b) => a - b)
      }
    }

    // Implementación del algoritmo de Dijkstra
    dijkstra(start) {
      const allNodes = Array.from(this.nodes)
      const dist = {}
      const prev = {}
      const visited = {}

      // Inicializar distancias
      allNodes.forEach((node) => {
        dist[node] = Number.POSITIVE_INFINITY
        prev[node] = null
        visited[node] = false
      })

      dist[start] = 0

      for (let i = 0; i < allNodes.length; i++) {
        let u = null

        // Encontrar el nodo no visitado con menor distancia
        allNodes.forEach((node) => {
          if (!visited[node] && (u === null || dist[node] < dist[u])) {
            u = node
          }
        })

        if (u === null || dist[u] === Number.POSITIVE_INFINITY) break
        visited[u] = true

        // Actualizar distancias de los vecinos
        this.edges.forEach((edge) => {
          const a = edge[0]
          const b = edge[1]
          const w = edge[2]

          if (a === u && !visited[b] && dist[b] > dist[a] + w) {
            dist[b] = dist[a] + w
            prev[b] = a
          }
          if (b === u && !visited[a] && dist[a] > dist[b] + w) {
            dist[a] = dist[b] + w
            prev[a] = b
          }
        })
      }

      return { dist, prev }
    }

    // Calcular la ruta entre dos nodos
    calculateRoute(start, end) {
      if (!this.nodes.has(start) || !this.nodes.has(end)) {
        throw new Error("Uno de los nodos seleccionados no existe en el grafo")
      }

      const result = this.dijkstra(start)
      const dist = result.dist
      const prev = result.prev

      if (dist[end] === Number.POSITIVE_INFINITY) {
        throw new Error("No hay ruta disponible entre estos nodos")
      }

      // Reconstruir la ruta
      const path = []
      let current = end
      while (current !== null) {
        path.unshift(current)
        current = prev[current]
      }

      return {
        path,
        time: dist[end], // Tiempo en segundos
        cost: this.calculateCost(dist[end]), // Costo en $
      }
    }

    // Calcular el costo de un viaje
    calculateCost(time) {
      return time * this.tarifa
    }

    // Verificar si un nodo existe en el grafo
    hasNode(nodeId) {
      return this.nodes.has(nodeId)
    }

    // Obtener todos los nodos del grafo
    getNodes() {
      return Array.from(this.nodes).sort((a, b) => a - b)
    }

    // Obtener todas las aristas del grafo
    getEdges() {
      return this.edges
    }
  }

  // Instancia global del grafo
  const graph = new GraphSimple()

  // Inicializar la aplicación
  async function initApp() {
    try {
      const nodeArray = await graph.loadGraph()
      createGraphVisualization(nodeArray)
      fillSelects(nodeArray)
    } catch (error) {
      alert("Error al cargar la aplicación: " + error.message)
    }
  }

  function createGraphVisualization(nodeArray) {
    const map = document.getElementById("map")
    if (!map) {
      console.error("Elemento map no encontrado")
      return
    }

    map.innerHTML = ""
    map.style.position = "relative"

    // Posiciones exactas según la imagen de referencia
    const nodePositions = {
      0: { x: 90, y: 50 }, // Extremo derecho
      1: { x: 70, y: 70 }, // Centro-abajo (si existe)
      2: { x: 30, y: 85 }, // Abajo izquierda
      3: { x: 10, y: 50 }, // Izquierda
      4: { x: 25, y: 15 }, // Arriba izquierda
      5: { x: 75, y: 15 }, // Arriba derecha
    }

    // Dimensiones del contenedor
    const mapWidth = 800
    const mapHeight = 400

    // Crear un contenedor SVG para las aristas
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
    svg.setAttribute("width", "100%")
    svg.setAttribute("height", "100%")
    svg.setAttribute("viewBox", `0 0 ${mapWidth} ${mapHeight}`)
    svg.style.position = "absolute"
    svg.style.top = "0"
    svg.style.left = "0"
    svg.style.zIndex = "1"
    svg.style.pointerEvents = "none"
    map.appendChild(svg)

    console.log("Creando aristas para el grafo:", graph.getEdges())

    // Array para almacenar posiciones de pesos y evitar colisiones
    const weightPositions = []
    const processedEdges = new Set()

    // Función para verificar si dos círculos se superponen
    function circlesOverlap(x1, y1, x2, y2, radius = 20) {
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      return distance < radius * 2
    }

    // Función para encontrar una posición libre para el peso
    function findFreePosition(originalX, originalY, radius = 20) {
      let x = originalX
      let y = originalY
      let attempts = 0
      const maxAttempts = 50

      while (attempts < maxAttempts) {
        let hasCollision = false

        // Verificar colisión con pesos existentes
        for (const pos of weightPositions) {
          if (circlesOverlap(x, y, pos.x, pos.y, radius)) {
            hasCollision = true
            break
          }
        }

        if (!hasCollision) {
          return { x, y }
        }

        // Si hay colisión, intentar una nueva posición en espiral
        const angle = (attempts * 0.5) % (2 * Math.PI)
        const distance = Math.min(attempts * 3, 40)
        x = originalX + Math.cos(angle) * distance
        y = originalY + Math.sin(angle) * distance

        // Mantener dentro de los límites
        x = Math.max(25, Math.min(mapWidth - 25, x))
        y = Math.max(25, Math.min(mapHeight - 25, y))

        attempts++
      }

      return { x: originalX, y: originalY } // Si no encuentra posición, usar la original
    }

    // Dibujar las aristas
    graph.getEdges().forEach((edge, index) => {
      const [nodeA, nodeB, weight] = edge

      // Crear clave única para la arista (sin importar dirección)
      const edgeKey = `${Math.min(nodeA, nodeB)}-${Math.max(nodeA, nodeB)}`

      // Solo procesar si no hemos visto esta arista antes
      if (!processedEdges.has(edgeKey)) {
        processedEdges.add(edgeKey)

        console.log(`Creando arista ${nodeA} ↔ ${nodeB} con peso ${weight}`)

        if (nodePositions[nodeA] && nodePositions[nodeB]) {
          // Calcular posiciones en píxeles
          const x1 = (nodePositions[nodeA].x / 100) * mapWidth
          const y1 = (nodePositions[nodeA].y / 100) * mapHeight
          const x2 = (nodePositions[nodeB].x / 100) * mapWidth
          const y2 = (nodePositions[nodeB].y / 100) * mapHeight

          // Crear línea completa de centro a centro
          const line = document.createElementNS("http://www.w3.org/2000/svg", "line")
          line.setAttribute("x1", x1)
          line.setAttribute("y1", y1)
          line.setAttribute("x2", x2)
          line.setAttribute("y2", y2)
          line.setAttribute("stroke", "#666")
          line.setAttribute("stroke-width", "3")
          line.setAttribute("opacity", "1")
          line.id = `edge-${Math.min(nodeA, nodeB)}-${Math.max(nodeA, nodeB)}`
          svg.appendChild(line)

          // Calcular posición original del peso en el punto medio
          const originalMidX = (x1 + x2) / 2
          const originalMidY = (y1 + y2) / 2

          // Encontrar posición libre para el peso
          const freePosition = findFreePosition(originalMidX, originalMidY)
          weightPositions.push(freePosition)

          // Crear fondo amarillo para el peso en la posición libre
          const weightBg = document.createElementNS("http://www.w3.org/2000/svg", "circle")
          weightBg.setAttribute("cx", freePosition.x)
          weightBg.setAttribute("cy", freePosition.y)
          weightBg.setAttribute("r", "18")
          weightBg.setAttribute("fill", "#ffd700")
          weightBg.setAttribute("stroke", "#333")
          weightBg.setAttribute("stroke-width", "2")
          weightBg.id = `weight-bg-${Math.min(nodeA, nodeB)}-${Math.max(nodeA, nodeB)}`
          svg.appendChild(weightBg)

          // Crear texto del peso
          const text = document.createElementNS("http://www.w3.org/2000/svg", "text")
          text.setAttribute("x", freePosition.x)
          text.setAttribute("y", freePosition.y)
          text.setAttribute("text-anchor", "middle")
          text.setAttribute("dominant-baseline", "central")
          text.setAttribute("fill", "#333")
          text.setAttribute("font-size", "14")
          text.setAttribute("font-weight", "bold")
          text.setAttribute("font-family", "Arial, sans-serif")
          text.textContent = weight
          text.id = `weight-text-${Math.min(nodeA, nodeB)}-${Math.max(nodeA, nodeB)}`
          svg.appendChild(text)

          console.log(
            `Peso ${weight} colocado en (${freePosition.x.toFixed(1)}, ${freePosition.y.toFixed(1)}) - original: (${originalMidX.toFixed(1)}, ${originalMidY.toFixed(1)})`,
          )
        }
      }
    })

    // Crear nodos usando SVG
    nodeArray.forEach((nodeId) => {
      // Calcular posición exactamente igual que las líneas
      const nodeX = (nodePositions[nodeId].x / 100) * mapWidth
      const nodeY = (nodePositions[nodeId].y / 100) * mapHeight

      // Crear nodo como círculo SVG
      const nodeCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle")
      nodeCircle.setAttribute("cx", nodeX)
      nodeCircle.setAttribute("cy", nodeY)
      nodeCircle.setAttribute("r", "20")
      nodeCircle.setAttribute("fill", "#f8f9fa") // Fondo gris claro
      nodeCircle.setAttribute("stroke", "#333")
      nodeCircle.setAttribute("stroke-width", "2")
      nodeCircle.setAttribute("id", `node-circle-${nodeId}`)
      nodeCircle.style.cursor = "pointer"
      svg.appendChild(nodeCircle)

      // Crear texto del nodo
      const nodeText = document.createElementNS("http://www.w3.org/2000/svg", "text")
      nodeText.setAttribute("x", nodeX)
      nodeText.setAttribute("y", nodeY)
      nodeText.setAttribute("text-anchor", "middle")
      nodeText.setAttribute("dominant-baseline", "central")
      nodeText.setAttribute("fill", "#333") // Texto negro por defecto
      nodeText.setAttribute("font-size", "16")
      nodeText.setAttribute("font-weight", "bold")
      nodeText.setAttribute("font-family", "Arial, sans-serif")
      nodeText.textContent = nodeId
      nodeText.setAttribute("id", `node-text-${nodeId}`)
      nodeText.style.cursor = "pointer"
      nodeText.style.pointerEvents = "none"
      svg.appendChild(nodeText)

      // Agregar event listeners
      nodeCircle.addEventListener("click", () => selectNode(nodeId))

      console.log(`Nodo ${nodeId} posicionado en SVG: (${nodeX}, ${nodeY})`)
    })

    console.log("Visualización del grafo completada")
  }

  function selectNode(nodeId) {
    const originSelect = document.getElementById("origin")
    const destinationSelect = document.getElementById("destination")

    // Si no hay origen seleccionado, seleccionar como origen
    if (!originSelect.value) {
      originSelect.value = nodeId
    } else if (!destinationSelect.value && originSelect.value != nodeId) {
      // Si hay origen pero no destino, seleccionar como destino
      destinationSelect.value = nodeId
    } else {
      // Si ambos están seleccionados, reiniciar con este nodo como origen
      originSelect.value = nodeId
      destinationSelect.value = ""
    }

    updateNodeSelection()
  }

  function updateNodeSelection() {
    const originValue = document.getElementById("origin").value
    const destinationValue = document.getElementById("destination").value

    // Limpiar todas las selecciones - volver al estado por defecto
    document.querySelectorAll("circle[id^='node-circle-']").forEach((circle) => {
      circle.setAttribute("fill", "#f8f9fa") // Gris claro
      circle.setAttribute("stroke", "#333")
      circle.setAttribute("stroke-width", "2")
    })

    // Resetear todos los textos a negro
    document.querySelectorAll("text[id^='node-text-']").forEach((text) => {
      text.setAttribute("fill", "#333")
    })

    // Marcar origen en azul
    if (originValue) {
      const originCircle = document.getElementById(`node-circle-${originValue}`)
      if (originCircle) {
        originCircle.setAttribute("fill", "#007bff")
        originCircle.setAttribute("stroke", "#0056b3")
        originCircle.setAttribute("stroke-width", "3")
      }
      const originText = document.getElementById(`node-text-${originValue}`)
      if (originText) {
        originText.setAttribute("fill", "white") // Texto blanco sobre azul
      }
    }

    // Marcar destino en verde
    if (destinationValue) {
      const destinationCircle = document.getElementById(`node-circle-${destinationValue}`)
      if (destinationCircle) {
        destinationCircle.setAttribute("fill", "#28a745")
        destinationCircle.setAttribute("stroke", "#1e7e34")
        destinationCircle.setAttribute("stroke-width", "3")
      }
      const destinationText = document.getElementById(`node-text-${destinationValue}`)
      if (destinationText) {
        destinationText.setAttribute("fill", "white") // Texto blanco sobre verde
      }
    }
  }

  function fillSelects(nodeArray) {
    const origin = document.getElementById("origin")
    const destination = document.getElementById("destination")

    if (!origin || !destination) {
      console.error("Elementos select no encontrados")
      return
    }

    // Limpiar opciones existentes excepto la primera
    origin.innerHTML = '<option value="">Seleccionar origen</option>'
    destination.innerHTML = '<option value="">Seleccionar destino</option>'

    nodeArray.forEach((nodeId) => {
      const opt1 = document.createElement("option")
      opt1.value = nodeId
      opt1.innerText = `Nodo ${nodeId}`
      origin.appendChild(opt1)

      const opt2 = document.createElement("option")
      opt2.value = nodeId
      opt2.innerText = `Nodo ${nodeId}`
      destination.appendChild(opt2)
    })

    // Agregar event listeners para actualizar la visualización
    origin.addEventListener("change", updateNodeSelection)
    destination.addEventListener("change", updateNodeSelection)
  }

  // Función para calcular la ruta (expuesta globalmente)
  window.calculateRoute = () => {
    const src = Number.parseInt(document.getElementById("origin").value)
    const dst = Number.parseInt(document.getElementById("destination").value)

    if (isNaN(src) || isNaN(dst)) {
      alert("Por favor selecciona origen y destino")
      return
    }

    if (src === dst) {
      alert("El origen y destino deben ser diferentes")
      return
    }

    try {
      // Usar la clase GraphSimple para calcular la ruta
      const result = graph.calculateRoute(src, dst)
      console.log("Ruta encontrada:", result.path)
      animatePath(result.path, result.time, result.cost)
    } catch (error) {
      alert(error.message)
    }
  }

  function animatePath(path, totalTime, totalCost) {
    const progressText = document.getElementById("progress")
    const progressBar = document.getElementById("progressBar")
    const result = document.getElementById("result")

    if (!progressText || !progressBar || !result) {
      console.error("Elementos de progreso no encontrados")
      return
    }

    progressText.innerText = "Calculando ruta..."
    progressBar.style.width = "0%"
    result.innerText = ""

    // Resetear todas las aristas a su estilo original
    document.querySelectorAll("line").forEach((line) => {
      line.setAttribute("stroke", "#666")
      line.setAttribute("stroke-width", "3")
      line.setAttribute("opacity", "1")
    })

    // Resetear todos los fondos de peso
    document.querySelectorAll("circle[id^='weight-bg-']").forEach((bg) => {
      bg.setAttribute("fill", "#ffd700")
      bg.setAttribute("stroke", "#333")
    })

    // Resetear todos los textos de peso
    document.querySelectorAll("text[id^='weight-text-']").forEach((text) => {
      text.setAttribute("fill", "#333")
    })

    let i = 0
    const totalSteps = path.length

    function step() {
      if (i < path.length) {
        const progress = ((i + 1) / totalSteps) * 100
        progressBar.style.width = `${progress}%`

        if (i === 0) {
          progressText.innerText = `Iniciando en nodo ${path[i]} (azul)`
        } else {
          progressText.innerText = `Ruta: ${path.slice(0, i + 1).join(" → ")} (recorrido en rojo)`

          // Resaltar la arista entre el nodo anterior y el actual
          const prevNode = path[i - 1]
          const currentNode = path[i]

          // Crear clave de arista normalizada
          const edgeKey = `${Math.min(prevNode, currentNode)}-${Math.max(prevNode, currentNode)}`
          const edgeId = `edge-${edgeKey}`
          const weightBgId = `weight-bg-${edgeKey}`
          const weightTextId = `weight-text-${edgeKey}`

          const edge = document.getElementById(edgeId)
          const weightBg = document.getElementById(weightBgId)
          const weightText = document.getElementById(weightTextId)

          if (edge) {
            edge.setAttribute("stroke", "#dc3545")
            edge.setAttribute("stroke-width", "5")
            edge.setAttribute("opacity", "1")
          }

          if (weightBg) {
            weightBg.setAttribute("fill", "#dc3545")
            weightBg.setAttribute("stroke", "#c82333")
          }

          if (weightText) {
            weightText.setAttribute("fill", "white")
          }
        }

        // Resaltar el nodo actual en el path
        document.querySelectorAll("circle[id^='node-circle-']").forEach((circle) => {
          // Solo resetear nodos que no sean origen ni destino
          const nodeId = circle.id.replace("node-circle-", "")
          if (nodeId !== path[0].toString() && nodeId !== path[path.length - 1].toString()) {
            circle.setAttribute("fill", "#f8f9fa") // Gris claro
            circle.setAttribute("stroke", "#333")
            circle.setAttribute("stroke-width", "2")
          }
        })

        // Resetear textos de nodos intermedios
        document.querySelectorAll("text[id^='node-text-']").forEach((text) => {
          const nodeId = text.id.replace("node-text-", "")
          if (nodeId !== path[0].toString() && nodeId !== path[path.length - 1].toString()) {
            text.setAttribute("fill", "#333") // Texto negro
          }
        })

        const currentNodeCircle = document.getElementById(`node-circle-${path[i]}`)
        const currentNodeText = document.getElementById(`node-text-${path[i]}`)
        if (currentNodeCircle && i > 0 && i < path.length - 1) {
          currentNodeCircle.setAttribute("fill", "#dc3545") // Rojo para recorrido
          currentNodeCircle.setAttribute("stroke", "#c82333")
          currentNodeCircle.setAttribute("stroke-width", "3")
          if (currentNodeText) {
            currentNodeText.setAttribute("fill", "white") // Texto blanco sobre rojo
          }
        }

        i++
        setTimeout(step, 1500)
      } else {
        progressText.innerText = `Ruta completa: ${path.join(" → ")} | Inicio: azul, Destino: verde, Recorrido: rojo`
        result.innerText = `Tiempo total: ${totalTime} segundos\nCosto estimado: $${totalCost.toFixed(2)}`

        // Mantener los colores finales por más tiempo
        setTimeout(() => {
          // Resetear aristas y pesos después de mostrar el resultado
          document.querySelectorAll("line").forEach((line) => {
            line.setAttribute("stroke", "#666")
            line.setAttribute("stroke-width", "3")
            line.setAttribute("opacity", "1")
          })

          document.querySelectorAll("circle[id^='weight-bg-']").forEach((bg) => {
            bg.setAttribute("fill", "#ffd700")
            bg.setAttribute("stroke", "#333")
          })

          document.querySelectorAll("text[id^='weight-text-']").forEach((text) => {
            text.setAttribute("fill", "#333")
          })

          // Resetear selección de nodos
          document.getElementById("origin").value = ""
          document.getElementById("destination").value = ""
          updateNodeSelection()
        }, 5000)
      }
    }

    step()
  }

  // Iniciar la aplicación
  initApp()
})