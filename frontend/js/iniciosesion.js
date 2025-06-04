const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const token = localStorage.getItem("token");

// Mostrar mensaje de bienvenida
if (userInfo) {
    document.getElementById("bienvenida").textContent = `Bienvenido, ${userInfo.username}`;
    document.getElementById("rol").textContent = `Tu rol es: ${userInfo.rol}`;
    document.getElementById("mensaje").textContent = "Has iniciado sesión correctamente";
} else {
    document.getElementById("bienvenida").textContent = "Error: no se encontraron datos de usuario.";
}

// Función principal para mostrar los usuarios
async function verUsuarios() {
    const container = document.getElementById("usuariosContainer");
    container.innerHTML = "<p>Cargando usuarios...</p>";

    try {
        const res = await fetch("http://localhost:5000/auth/usuarios", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            container.innerHTML = `<p>Error: ${data.mensaje}</p>`;
            return;
        }

        container.innerHTML = "";

        data.forEach(usuario => {
            const div = document.createElement("div");
            div.classList.add("usuario");

            let proyectoHTML = "";

            if (usuario.en_proyecto) {
                proyectoHTML = `
                    <p><strong>Nombre Proyecto:</strong> ${usuario.nombre_proyecto || 'No disponible'}</p>
                    <p><strong>Líder Proyecto:</strong> ${usuario.lider_proyecto || 'No disponible'}</p>
                    <p><strong>Cargo Proyecto:</strong> ${usuario.cargo_proyecto || 'No disponible'}</p>
                `;
            }

            // Vista para admin
            if (userInfo.rol === "admin") {
                div.innerHTML = `
                    <p><strong>ID:</strong> ${usuario.id || 'No disponible'}</p>
                    <p><strong>Usuario:</strong> ${usuario.username || 'No disponible'}</p>
                    <p><strong>Apellido:</strong> ${usuario.apellido || 'No disponible'}</p>
                    <p><strong>Teléfono:</strong> ${usuario.telefono || 'No disponible'}</p>
                    <p><strong>Email:</strong> ${usuario.email || 'No disponible'}</p>
                    <p><strong>Rol:</strong> ${usuario.rol || 'No disponible'}</p>
                    <p><strong>Empresa:</strong> ${usuario.empresa || 'No disponible'}</p>
                    <p><strong>Cargo:</strong> ${usuario.cargo || 'No disponible'}</p>
                    <p><strong>Jefe Inmediato:</strong> ${usuario.jefe_inmediato || 'No disponible'}</p>
                    ${proyectoHTML}
                    <div class="acciones">
                        <button onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
                    </div>
                `;
            }
            // Vista para no admin
            else {
                div.innerHTML = `
                    <p><strong>Usuario:</strong> ${usuario.username || 'No disponible'}</p>
                    <p><strong>Apellido:</strong> ${usuario.apellido || 'No disponible'}</p>
                    <p><strong>Correo:</strong> ${usuario.email || 'No disponible'}</p>
                    <p><strong>Empresa:</strong> ${usuario.empresa || 'No disponible'}</p>
                    <p><strong>Cargo:</strong> ${usuario.cargo || 'No disponible'}</p>
                    ${proyectoHTML}
                `;
            }

            container.appendChild(div);
        });

        // Botón para agregar usuario (solo admins)
        if (userInfo.rol === "admin") {
            const btnAgregar = document.createElement("button");
            btnAgregar.textContent = "Agregar Usuario";
            btnAgregar.onclick = agregarUsuario;
            container.appendChild(btnAgregar);
        }

    } catch (error) {
        container.innerHTML = `<p>Error al obtener usuarios: ${error.message}</p>`;
    }
}

// Redireccionar a la vista de edición
function editarUsuario(id) {
    window.location.href = `editarusuario.html?id=${id}`;
}

// Redireccionar a la vista de agregar usuario
function agregarUsuario() {
    window.location.href = "agregarusuario.html";
}