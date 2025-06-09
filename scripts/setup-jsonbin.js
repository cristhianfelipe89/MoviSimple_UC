// Script para configurar JSONBin y crear el archivo inicial
const fetch = require("node-fetch")

async function setupJSONBin() {
  console.log("🚀 Configurando JSONBin...")

  const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || "$2a$10$example.api.key"

  // Datos iniciales para users.json
  const initialUsers = [
    {
      name: "Jeiner",
      email: "xxx@gmail.com",
      password: "123789",
      createdAt: new Date().toISOString(),
      id: 1,
    },
    {
      name: "Heracots",
      email: "heracots@gmail.com",
      password: "123456",
      createdAt: new Date().toISOString(),
      id: 2,
    },
    {
      name: "Admin",
      email: "admin@test.com",
      password: "admin123",
      createdAt: new Date().toISOString(),
      id: 3,
    },
  ]

  try {
    // Crear nuevo bin
    const response = await fetch("https://api.jsonbin.io/v3/b", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": JSONBIN_API_KEY,
        "X-Bin-Name": "movisimple-users",
      },
      body: JSON.stringify(initialUsers),
    })

    if (response.ok) {
      const data = await response.json()
      console.log("✅ JSONBin configurado exitosamente!")
      console.log(`📁 Bin ID: ${data.metadata.id}`)
      console.log(`🔗 URL: https://api.jsonbin.io/v3/b/${data.metadata.id}`)
      console.log(`👥 Usuarios iniciales: ${initialUsers.length}`)
      console.log("\n🔧 Agregar a variables de entorno de Vercel:")
      console.log(`JSONBIN_BIN_ID=${data.metadata.id}`)
      console.log(`JSONBIN_API_KEY=${JSONBIN_API_KEY}`)
    } else {
      const error = await response.text()
      console.error("❌ Error configurando JSONBin:", error)
    }
  } catch (error) {
    console.error("❌ Error:", error.message)
  }
}

setupJSONBin()