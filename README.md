# MoviSimple 🚗

Aplicación web que simula viajes óptimos utilizando el algoritmo de Dijkstra en un grafo de 6 nodos.

## 📋 Descripción

MoviSimple es una aplicación que demuestra la implementación del algoritmo de Dijkstra para encontrar rutas óptimas. Los usuarios pueden registrarse, iniciar sesión y calcular la ruta más corta entre dos puntos en un mapa visual.

### Características

- **Algoritmo de Dijkstra** implementado en JavaScript
- **Visualización interactiva** del grafo
- **Sistema de autenticación** con registro y login
- **Animación** del recorrido de la ruta óptima
- **Cálculo de costos** basado en tiempo de viaje

## 🛠️ Tecnologías

- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Backend**: Node.js, Express, Vercel Functions
- **Persistencia**: Archivos JSON locales + JSONBin (nube)

## 🚀 Instalación

### Requisitos previos
- Node.js 18+
- npm

### Pasos

1. **Clonar el repositorio**
\`\`\`bash
git clone https://github.com/cristhianfelipe89/MoviSimple_UC.git
cd MoviSimple_UC
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Generar datos del grafo**
\`\`\`bash
npm run build
\`\`\`

4. **Iniciar el servidor local**
\`\`\`bash
npm run dev
\`\`\`

5. **Abrir la aplicación**
\`\`\`
http://localhost:3000
\`\`\`

## 📱 Uso

1. **Registro**: Crear una cuenta en la página principal
2. **Login**: Iniciar sesión con las credenciales
3. **Seleccionar ruta**: 
   - Hacer clic en un nodo para seleccionar origen (azul)
   - Hacer clic en otro nodo para destino (verde)
   - Presionar "Calculate Route"
4. **Ver resultados**: Observar la animación y el costo del viaje

### Usuarios de prueba
- `grrm@gmail.com` / `456789`
- `jm@gmail.com` / `123456`


---

**Desarrollado como proyecto educativo para demostrar la implementación práctica de las estructura de datos y el desarrollo de vanilla javascript.**
