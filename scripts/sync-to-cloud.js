// Script para subir datos locales a la nube
const fetch = require("node-fetch")
const fs = require("fs")
const path = require("path")

async function syncToCloud() {
    console.log("☁️ Sincronizando datos locales a la nube...")

    const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID
    const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY

    if (!JSONBIN_BIN_ID || !JSONBIN_API_KEY) {
        console.error("❌ Variables de entorno no configuradas")
        return
    }

    try {
        // Leer usuarios locales
        const usersPath = path.join(__dirname, "../data/users.json")
        if (!fs.existsSync(usersPath)) {
            console.error("❌ Archivo local users.json no existe")
            return
        }

        const users = JSON.parse(fs.readFileSync(usersPath, "utf8"))

        // Subir a JSONBin
        const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`
        const response = await fetch(JSONBIN_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_API_KEY,
            },
            body: JSON.stringify(users),
        })

        if (response.ok) {
            console.log(`✅ ${users.length} usuarios subidos a la nube`)
            users.forEach((user, index) => {
                console.log(`   ${index + 1}. ${user.name} (${user.email})`)
            })
        } else {
            console.error("❌ Error subiendo a JSONBin:", response.status)
        }
    } catch (error) {
        console.error("❌ Error de sincronización:", error.message)
    }
}

syncToCloud()