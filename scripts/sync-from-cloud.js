// Script para sincronizar datos de la nube a archivos locales
const fetch = require("node-fetch")
const fs = require("fs")
const path = require("path")

async function syncFromCloud() {
  console.log("🌐 Sincronizando datos desde la nube...")

  const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID
  const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY

  if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
    console.error("❌ Variables de entorno no configuradas:")
    console.log("💡 JSONBIN_BIN_ID y JSONBIN_API_KEY son requeridas")
    return
  }

  try {
    // Descargar usuarios desde JSONBin
    const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`
    const response = await fetch(JSONBIN_URL + "/latest", {
      headers: { "X-Master-Key": JSONBIN_API_KEY },
    })

    if (response.ok) {
      const data = await response.json()
      const users = data.record || []

      // Crear directorio data si no existe
      const dataDir = path.join(__dirname, "../data")
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }

      // Guardar usuarios en archivo local
      const usersPath = path.join(dataDir, "users.json")
      fs.writeFileSync(usersPath, JSON.stringify(users, null, 2))

      console.log(`✅ ${users.length} usuarios sincronizados desde la nube`)
      console.log(`📁 Guardados en: ${usersPath}`)

      // Mostrar usuarios sincronizados
      users.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email})`)
      })
    } else {
      console.error("❌ Error accediendo a JSONBin:", response.status)
    }
  } catch (error) {
    console.error("❌ Error de sincronización:", error.message)
  }
}

syncFromCloud()