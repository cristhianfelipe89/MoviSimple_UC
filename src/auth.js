function register() {
    const name = document.getElementById("name").value
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if (!name || !email || !password) {
        alert("Por favor completa todos los campos")
        return
    }

    fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
    })
        .then((res) => res.json())
        .then((result) => {
            alert(result.message)
            if (result.message === "Usuario registrado correctamente.") {
                window.location.href = "login.html"
            }
        })
        .catch((error) => {
            console.error("Error:", error)
            alert("Error de conexión. Intenta nuevamente.")
        })
}

function login() {
    const email = document.getElementById("email").value
    const password = document.getElementById("password").value

    if (!email || !password) {
        alert("Por favor completa todos los campos")
        return
    }

    fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    })
        .then((res) => res.json())
        .then((result) => {
            if (result.success) {
                localStorage.setItem("userSession", JSON.stringify({ email, loginTime: Date.now() }))
                window.location.href = "main.html"
            } else {
                alert(result.message || "Credenciales incorrectas")
            }
        })
        .catch((error) => {
            console.error("Error:", error)
            alert("Error de conexión. Intenta nuevamente.")
        })
}