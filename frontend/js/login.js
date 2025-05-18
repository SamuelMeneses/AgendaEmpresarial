document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const data = {
        username: document.getElementById("loginUsername").value,
        password: document.getElementById("loginPassword").value
    };

    const res = await fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();

    if (res.ok && result.token) {
        const token = result.token;

        localStorage.setItem("token", token);
        const response = await fetch("http://localhost:5000/auth/whoami", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const userInfo = await response.json();

        if (response.ok) {
            // Guarda los datos del usuario
            localStorage.setItem("userInfo", JSON.stringify(userInfo));

            // Redirige a la página iniciosesion.html
            window.location.href = "iniciosesion.html";
        } else {
            document.getElementById("loginMsg").textContent = "No se pudo obtener información del usuario";
        }

    } else {
        document.getElementById("loginMsg").textContent = result.mensaje || "Error en el login";
    }
});
