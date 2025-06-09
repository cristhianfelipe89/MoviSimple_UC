// Login leyendo desde JSONBin (archivo JSON en la nube)
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
        const { email, password } = req.body

        if (!email || !password) {
            return res.status(400).json({ message: "Email y contraseña son requeridos" })
        }

        const normalizedEmail = email.toLowerCase().trim()

        // Configuración JSONBin
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || "675f8a3ead19ca34f8c8f123"
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || "$2a$10$example.api.key"
        const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

        console.log(`🔍 Intentando login: ${normalizedEmail}`)

        // LEER archivo users.json desde la nube
        console.log("📖 Leyendo users.json desde JSONBin...")
        const response = await fetch(JSONBIN_URL + "/latest", {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_API_KEY,
                "Content-Type": "application/json",
            },
        })

        let users = []
        if (response.ok) {
            const data = await response.json()
            users = data.record || []
            console.log(`📋 Usuarios en archivo: ${users.length}`)
            console.log(`📧 Emails disponibles: ${users.map((u) => u.email).join(", ")}`)
        } else {
            console.log("❌ Error leyendo archivo JSON desde la nube")
            return res.status(500).json({ message: "Error accediendo al archivo de usuarios" })
        }

        // Buscar usuario
        const user = users.find((u) => u.email === normalizedEmail && u.password === password)

        if (user) {
            console.log(`✅ Login exitoso: ${normalizedEmail}`)
            return res.status(200).json({
                success: true,
                user: {
                    name: user.name,
                    email: user.email,
                },
            })
        } else {
            console.log(`❌ Login fallido: ${normalizedEmail}`)

            // Debug detallado
            const emailMatch = users.find((u) => u.email === normalizedEmail)
            if (emailMatch) {
                console.log(`📧 Email encontrado pero contraseña incorrecta`)
            } else {
                console.log(`📧 Email no encontrado en archivo JSON`)
            }

            return res.status(401).json({
                success: false,
                message: "Credenciales incorrectas",
            })
        }
    } catch (error) {
        console.error("❌ Error en login:", error)
        return res.status(500).json({
            message: "Error interno del servidor",
            error: error.message,
        })
    }
}