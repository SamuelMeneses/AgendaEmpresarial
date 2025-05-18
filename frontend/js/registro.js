const enProyectoCheckbox = document.getElementById("en_proyecto");
const camposProyectoDiv = document.getElementById("camposProyecto");

enProyectoCheckbox.addEventListener("change", function() {
    if (this.checked) {
        camposProyectoDiv.classList.remove("hidden");
    } else {
        camposProyectoDiv.classList.add("hidden");
    }
});

document.getElementById("registroForm").addEventListener("submit", async function(e) {
    e.preventDefault();

    const enProyectoChecked = document.getElementById("en_proyecto").checked;

    const data = {
        username: document.getElementById("username").value.trim(),
        email: document.getElementById("email").value.trim(),
        password: document.getElementById("password").value,
        rol: document.getElementById("rol").value,
        apellido: document.getElementById("apellido").value.trim(),
        telefono: document.getElementById("telefono").value.trim(),
        empresa: document.getElementById("empresa").value.trim(),
        cargo: document.getElementById("cargo").value.trim(),
        jefe_inmediato: document.getElementById("jefe_inmediato").value.trim(),
        en_proyecto: enProyectoChecked,
    };

    if (enProyectoChecked) {
        data.nombre_proyecto = document.getElementById("nombre_proyecto").value.trim();
        data.lider_proyecto = document.getElementById("lider_proyecto").value.trim();
        data.cargo_proyecto = document.getElementById("cargo_proyecto").value.trim();
    }

    try {
        const res = await fetch("http://localhost:5000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        const result = await res.json();
        const msgElem = document.getElementById("registroMsg");
        if (res.ok) {
            msgElem.style.color = "green";
            msgElem.textContent = result.mensaje || "¡Registro exitoso!";
            document.getElementById("registroForm").reset();
            // Ocultar campos de proyecto si estaban visibles
            if (enProyectoChecked) {
                document.getElementById("camposProyecto").classList.add("hidden");
            }
        } else {
            msgElem.style.color = "red";
            msgElem.textContent = result.mensaje || "Error al registrar";
        }
    } catch (error) {
        document.getElementById("registroMsg").style.color = "red";
        document.getElementById("registroMsg").textContent = "Error de conexión o servidor.";
    }

});
