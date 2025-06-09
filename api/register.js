// Registro usando JSONBin como archivo JSON en la nube
module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS")
    res.setHeader("Access-Control-Allow-Headers", "Content-Type")

    if (req.method === "OPTIONS") {
        return res.status(200).end()
    }

    if (req.method !== "POST") {
        return res.status(405).json({ message: "Método no permitido" })
    }

    try {
        const { name, email, password } = req.body

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Todos los campos son requeridos" })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Formato de email inválido" })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Configuración JSONBin
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || "675f8a3ead19ca34f8c8f123" // ID del bin
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || "$2a$10$example.api.key" // Tu API key
        const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

        console.log(`📝 Intentando registrar: ${normalizedEmail}`)

        // 1. LEER archivo JSON desde la nube
        console.log("📖 Leyendo users.json desde JSONBin...")
        const readResponse = await fetch(JSONBIN_URL + "/latest", {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_API_KEY,
                "Content-Type": "application/json",
            },
        })

        let users = []
        if (readResponse.ok) {
            const data = await readResponse.json()
            users = data.record || []
            console.log(`📋 Usuarios existentes: ${users.length}`)
        } else {
            console.log("📄 Archivo no existe, creando nuevo...")
            users = []
        }

        // 2. VERIFICAR si el email ya existe
        if (users.some((user) => user.email === normalizedEmail)) {
            return res.status(400).json({ message: "El email ya está registrado" })
        }

        // 3. AGREGAR nuevo usuario
        const newUser = {
            name: name.trim(),
            email: normalizedEmail,
            password,
            createdAt: new Date().toISOString(),
            id: Date.now(),
        }

        users.push(newUser)
        console.log(`➕ Agregando usuario. Total: ${users.length}`)

        // 4. SOBRESCRIBIR archivo JSON en la nube
        console.log("💾 Sobrescribiendo users.json en JSONBin...")
        const writeResponse = await fetch(JSONBIN_URL, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-Master-Key": JSONBIN_API_KEY,
            },
            body: JSON.stringify(users),
        })

        if (!writeResponse.ok) {
            const error = await writeResponse.text()
            console.error("❌ Error escribiendo en JSONBin:", error)
            return res.status(500).json({ message: "Error guardando usuario en la nube" })
        }

        console.log(`✅ Usuario registrado exitosamente: ${normalizedEmail}`)

        return res.status(200).json({
            message: "Usuario registrado correctamente en users.json",
            success: true,
            user: {
                name: newUser.name,
                email: newUser.email,
            },
            debug: {
                totalUsers: users.length,
                storage: "JSONBin Cloud JSON File",
            },
        })
    } catch (error) {
        console.error("❌ Error en registro:", error)
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}