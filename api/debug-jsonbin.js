// Debug para ver el contenido del archivo JSON en la nube
module.exports = async (req, res) => {
    const debugKey = req.query.key
    if (debugKey !== "debug123") {
        return res.status(403).json({ message: "Acceso denegado" })
    }

    try {
        const JSONBIN_BIN_ID = process.env.JSONBIN_BIN_ID || "675f8a3ead19ca34f8c8f123"
        const JSONBIN_API_KEY = process.env.JSONBIN_API_KEY || "$2a$10$example.api.key"
        const JSONBIN_URL = `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`

        console.log("🔍 Verificando archivo users.json en JSONBin...")

        const response = await fetch(JSONBIN_URL + "/latest", {
            method: "GET",
            headers: {
                "X-Master-Key": JSONBIN_API_KEY,
                "Content-Type": "application/json",
            },
        })

        if (response.ok) {
            const data = await response.json()
            const users = data.record || []

            return res.status(200).json({
                message: "Contenido del archivo users.json en la nube",
                storage: "JSONBin Cloud Storage",
                binId: JSONBIN_BIN_ID,
                totalUsers: users.length,
                users: users.map((user) => ({
                    name: user.name,
                    email: user.email,
                    hasPassword: !!user.password,
                    createdAt: user.createdAt,
                })),
                rawData: users,
            })
        } else {
            const error = await response.text()
            return res.status(500).json({
                message: "Error accediendo al archivo JSON",
                error,
                binId: JSONBIN_BIN_ID,
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Error verificando archivo JSON",
            error: error.message,
        })
    }
}