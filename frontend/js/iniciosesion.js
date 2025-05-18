const userInfo = JSON.parse(localStorage.getItem("userInfo"));
const token = localStorage.getItem("token");

if (userInfo) {
    document.getElementById("bienvenida").textContent = `Bienvenido, ${userInfo.username}`;
    document.getElementById("rol").textContent = `Tu rol es: ${userInfo.rol}`;
    document.getElementById("mensaje").textContent = "Has iniciado sesión correctamente";
} else {
    document.getElementById("bienvenida").textContent = "Error: no se encontraron datos de usuario.";
}

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

            if (userInfo.rol === "admin") {
                div.innerHTML = `
                    <p><strong>ID:</strong> ${usuario.id}</p>
                    <p><strong>Usuario:</strong> ${usuario.username}</p>
                    <p><strong>Correo:</strong> ${usuario.email}</p>
                    <p><strong>Rol:</strong> ${usuario.rol}</p>
                    <div class="acciones">
                        <button onclick="editarUsuario(${usuario.id})">Editar</button>
                        <button onclick="eliminarUsuario(${usuario.id})">Eliminar</button>
                    </div>
                `;
            } else {
                div.innerHTML = `
                    <p><strong>Usuario:</strong> ${usuario.username}</p>
                    <p><strong>Correo:</strong> ${usuario.email}</p>
                `;
            }

            container.appendChild(div);
        });

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

function editarUsuario(id) {
    alert("Función de editar usuario " + id + " (aún no implementada)");
}

function eliminarUsuario(id) {
    alert("Función de eliminar usuario " + id + " (aún no implementada)");
}

function agregarUsuario() {
    alert("Función de agregar usuario (aún no implementada)");
}