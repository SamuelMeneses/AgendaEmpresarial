document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const data = {
        username: document.getElementById("regUsername").value,
        email: document.getElementById("regEmail").value,
        password: document.getElementById("regPassword").value,
        rol: document.getElementById("regRol").value
    };

    const res = await fetch("http://localhost:5000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    });

    const result = await res.json();
    document.getElementById("registroMsg").textContent = result.mensaje || "Error al registrar";
});
