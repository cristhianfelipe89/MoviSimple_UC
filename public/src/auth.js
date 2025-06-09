function register() {
  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  if (!name || !email || !password) {
    alert("Por favor completa todos los campos")
    return
  }

  // Validar email básico
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    alert("Por favor ingresa un email válido")
    return
  }

  // Mostrar indicador de carga
  const submitBtn = document.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Registrando..."
  submitBtn.disabled = true

  fetch("/api/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
    }),
  })
    .then(async (res) => {
      const data = await res.json()

      if (res.ok && data.success) {
        alert(data.message)
        window.location.href = "login.html"
      } else {
        alert(data.message || "Error en el registro")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      alert("Error de conexión. Verifica tu internet e intenta nuevamente.")
    })
    .finally(() => {
      // Restaurar botón
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    })
}

function login() {
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value

  if (!email || !password) {
    alert("Por favor completa todos los campos")
    return
  }

  // Mostrar indicador de carga
  const submitBtn = document.querySelector('button[type="submit"]')
  const originalText = submitBtn.textContent
  submitBtn.textContent = "Iniciando sesión..."
  submitBtn.disabled = true

  fetch("/api/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      email: email.trim().toLowerCase(),
      password,
    }),
  })
    .then(async (res) => {
      const data = await res.json()

      if (res.ok && data.success) {
        // Guardar sesión
        localStorage.setItem(
          "userSession",
          JSON.stringify({
            email: data.user.email,
            name: data.user.name,
            loginTime: Date.now(),
          }),
        )
        window.location.href = "main.html"
      } else {
        alert(data.message || "Credenciales incorrectas")
      }
    })
    .catch((error) => {
      console.error("Error:", error)
      alert("Error de conexión. Verifica tu internet e intenta nuevamente.")
    })
    .finally(() => {
      // Restaurar botón
      submitBtn.textContent = originalText
      submitBtn.disabled = false
    })
}