let usuarioAEliminarId = null;

function eliminarUsuario(id) {
    usuarioAEliminarId = id;
    const modal = document.getElementById("modalConfirmarEliminar");
    modal.classList.add("show");
    modal.classList.remove("hidden");
}

document.getElementById("btnCancelarEliminar").addEventListener("click", () => {
    document.getElementById("modalConfirmarEliminar").classList.remove("show");
    setTimeout(() => {
        document.getElementById("modalConfirmarEliminar").classList.add("hidden");
    }, 300);
});

document.getElementById("btnConfirmarEliminar").addEventListener("click", async () => {
    const modal = document.getElementById("modalConfirmarEliminar");
    modal.classList.remove("show");
    setTimeout(() => {
        modal.classList.add("hidden");
    }, 300);

    try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/auth/eliminar_usuario/${usuarioAEliminarId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`Error al eliminar usuario: ${data.mensaje}`);
            return;
        }

        showEliminar();
        document.body.classList.add('confirmarEliminar');
        verUsuarios();
    } catch (error) {
        alert("Error al eliminar usuario: " + error.message);
    }
});


function showEliminar() {
    const eliminarUsuario = document.getElementById('confirmarEliminar');
    confirmarEliminar.classList.remove('hidden');
    setTimeout(() => {
        confirmarEliminar.classList.add('show');
    }, 10); // para activar la transición

    setTimeout(() => {
        confirmarEliminar.classList.remove('show');
        setTimeout(() => {
            confirmarEliminar.classList.add('hidden');
        }, 500); // espera que termine la transición
    }, 4000); // muestra el mensaje por 4 segundos
}