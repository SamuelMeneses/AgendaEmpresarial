const token = localStorage.getItem("token");
const params = new URLSearchParams(window.location.search);
const userId = params.get("id");

const form = document.getElementById("formEditarUsuario");
const enProyectoCheckbox = form.elements["en_proyecto"];
const proyectoCampos = document.getElementById("proyectoCampos");
const btnGuardar = document.getElementById("btnGuardar");

// Mostrar u ocultar campos de proyecto
enProyectoCheckbox.addEventListener("change", () => {
    proyectoCampos.style.display = enProyectoCheckbox.checked ? "block" : "none";
});

// Mostrar notificación tipo toast
function mostrarToast(mensaje, tipo = "success") {
    const toast = document.getElementById("toast");
    toast.textContent = mensaje;
    toast.className = tipo === "error" ? "error" : "";
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 3000);
}

// Cargar datos del usuario
async function cargarDatosUsuario() {
    try {
        const res = await fetch("http://localhost:5000/auth/usuarios", {
            headers: {Authorization: `Bearer ${token}`},
        });
        const usuarios = await res.json();
        const usuario = usuarios.find((u) => u.id == userId);
        if (!usuario) return mostrarToast("Usuario no encontrado", "error");

        form.elements["nombre"].value = usuario.username || "";
        form.elements["apellido"].value = usuario.apellido || "";
        form.elements["email"].value = usuario.email || "";
        form.elements["rol"].value = usuario.rol || "cliente";
        form.elements["telefono"].value = usuario.telefono || "";
        form.elements["empresa"].value = usuario.empresa || "";
        form.elements["cargo"].value = usuario.cargo || "";
        form.elements["jefe_inmediato"].value = usuario.jefe_inmediato || "";
        form.elements["en_proyecto"].checked = usuario.en_proyecto || false;

        if (usuario.en_proyecto) {
            proyectoCampos.style.display = "block";
            form.elements["nombre_proyecto"].value = usuario.nombre_proyecto || "";
            form.elements["lider_proyecto"].value = usuario.lider_proyecto || "";
            form.elements["cargo_proyecto"].value = usuario.cargo_proyecto || "";
        }
    } catch (error) {
        mostrarToast("Error al cargar datos", "error");
    }
}

function validarEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validarTelefono(telefono) {
    const re = /^[0-9\s]{7,15}$/;
    return re.test(telefono);
}

// Enviar formulario
form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = form.elements["email"].value.trim();
    if (!validarEmail(email)) {
        mostrarToast("El correo electrónico no es válido", "error");
        return;
    }

    const telefono = form.elements["telefono"].value.trim();
    if (telefono && !validarTelefono(telefono)) {
        mostrarToast("El teléfono solo debe tener números y espacios (7 a 15 dígitos)", "error");
        return;
    }

    if (!form.checkValidity()) {
        mostrarToast("Completa todos los campos requeridos", "error");
        return;
    }

    btnGuardar.disabled = true;

    const data = {
        email: form.elements["email"].value,
        rol: form.elements["rol"].value,
        telefono: form.elements["telefono"].value,
        empresa: form.elements["empresa"].value,
        cargo: form.elements["cargo"].value,
        jefe_inmediato: form.elements["jefe_inmediato"].value,
        en_proyecto: form.elements["en_proyecto"].checked,
    };

    if (data.en_proyecto) {
        data.nombre_proyecto = form.elements["nombre_proyecto"].value;
        data.lider_proyecto = form.elements["lider_proyecto"].value;
        data.cargo_proyecto = form.elements["cargo_proyecto"].value;
    }

    try {
        const res = await fetch(`http://localhost:5000/auth/editar_usuario/${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await res.json();
        if (!res.ok) throw new Error(result.mensaje || "Error desconocido");
        mostrarToast("Usuario actualizado correctamente");
        setTimeout(() => window.location.href = "iniciosesion.html", 2000);
    } catch (err) {
        mostrarToast("Error: " + err.message, "error");
    } finally {
        btnGuardar.disabled = false;
    }
});

cargarDatosUsuario();