const express = require("express")
const fs = require("fs")
const path = require("path")
const fetch = require("node-fetch")

const app = express()
const PORT = process.env.PORT || 3000

// Rutas de archivos locales
const usersPath = path.join(__dirname, "../data/users.json")
const edgesPath = path.join(__dirname, "../data/edges.json")

app.use(express.json())
app.use(express.static(path.join(__dirname, "../public")))

// Función para detectar si estamos en local o producción
function isLocal() {
  return !process.env.VERCEL && !process.env.VERCEL_ENV
}

// Función para leer usuarios (local o nube)
async function readUsers() {
  if (isLocal()) {
    // En local: usar archivo JSON
    try {
      if (fs.existsSync(usersPath)) {
        const data = fs.readFileSync(usersPath, "utf8")
        return JSON.parse(data)
      }
      return []
    } catch (error) {
      console.error("Error leyendo archivo local:", error)
      return []
    }
  } else {
    // En producción: usar JSONBin
    try {
      const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID
      const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY
      const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

      const response = await fetch(JSONBIN_URL + "/latest", {
        headers: { "X-Master-Key": JSONBIN_API_KEY },
      })

      if (response.ok) {
        const data = await response.json()
        return data.record || []
      }
      return []
    } catch (error) {
      console.error("Error leyendo JSONBin:", error)
      return []
    }
  }
}

// Función para escribir usuarios (local o nube)
async function writeUsers(users) {
  if (isLocal()) {
    // En local: escribir archivo JSON
    try {
      const dir = path.dirname(usersPath)
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
      }
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))
      console.log(`✅ Usuarios guardados localmente: ${usersPath}`)
      return true
    } catch (error) {
      console.error("Error escribiendo archivo local:", error)
      return false
    }
  } else {
    // En producción: escribir a JSONBin
    try {
      const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID
      const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY
      const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

      const response = await fetch(JSONBIN_URL, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": JSONBIN_API_KEY,
        },
        body: JSON.stringify(users),
      })

      return response.ok
    } catch (error) {
      console.error("Error escribiendo JSONBin:", error)
      return false
    }
  }
}

// Ruta de registro
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son requeridos" })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const users = await readUsers()

    // Verificar si el email ya existe
    if (users.some((user) => user.email === normalizedEmail)) {
      return res.status(400).json({ message: "El email ya está registrado" })
    }

    // Agregar nuevo usuario
    const newUser = {
      name: name.trim(),
      email: normalizedEmail,
      password,
      createdAt: new Date().toISOString(),
      id: Date.now(),
    }

    users.push(newUser)

    // Guardar usuarios
    const success = await writeUsers(users)

    if (success) {
      console.log(`✅ Usuario registrado: ${normalizedEmail} (${isLocal() ? "LOCAL" : "NUBE"})`)
      return res.status(200).json({
        message: "Usuario registrado correctamente",
        success: true,
        storage: isLocal() ? "Archivo local" : "JSONBin nube",
      })
    } else {
      return res.status(500).json({ message: "Error guardando usuario" })
    }
  } catch (error) {
    console.error("Error en registro:", error)
    return res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta de login
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña son requeridos" })
    }

    const normalizedEmail = email.toLowerCase().trim()
    const users = await readUsers()

    console.log(`🔍 Login attempt: ${normalizedEmail} (${isLocal() ? "LOCAL" : "NUBE"})`)
    console.log(`📋 Total usuarios: ${users.length}`)

    const user = users.find((u) => u.email === normalizedEmail && u.password === password)

    if (user) {
      console.log(`✅ Login exitoso: ${normalizedEmail}`)
      return res.status(200).json({
        success: true,
        user: { name: user.name, email: user.email },
      })
    } else {
      console.log(`❌ Login fallido: ${normalizedEmail}`)
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      })
    }
  } catch (error) {
    console.error("Error en login:", error)
    return res.status(500).json({ message: "Error interno del servidor" })
  }
})

// Ruta de debug
app.get("/api/debug-users", async (req, res) => {
  try {
    const users = await readUsers()
    return res.status(200).json({
      message: `Usuarios desde ${isLocal() ? "archivo local" : "JSONBin nube"}`,
      environment: isLocal() ? "LOCAL" : "PRODUCCION",
      storage: isLocal() ? usersPath : "JSONBin Cloud",
      totalUsers: users.length,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        hasPassword: !!user.password,
        createdAt: user.createdAt,
      })),
    })
  } catch (error) {
    return res.status(500).json({ message: "Error obteniendo usuarios" })
  }
})

// Solo iniciar servidor si estamos en local
if (isLocal()) {
  app.listen(PORT, () => {
    console.log(`🚀 Servidor local ejecutándose en http://localhost:${PORT}`)
    console.log(`📁 Archivos locales en: ${path.join(__dirname, "../data")}`)
    console.log(`🌐 Para producción: usar Vercel con JSONBin`)
  })
}

module.exports = app