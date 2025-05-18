const form = document.getElementById('editarUsuarioForm');
const enProyectoCheckbox = document.getElementById('en_proyecto');
const proyectoCampos = document.getElementById('proyectoCampos');

// Mostrar/ocultar campos de proyecto
enProyectoCheckbox.addEventListener('change', () => {
    proyectoCampos.style.display = enProyectoCheckbox.checked ? 'block' : 'none';
});

// Obtener el id del usuario desde la URL (ejemplo: editar_usuario.html?id=3)
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id');

// Poner aquí el token JWT válido
const token = localStorage.getItem('token');

// Cargar datos del usuario para rellenar el formulario
async function cargarUsuario() {
    try {
        const res = await fetch(`http://localhost:5000/auth/usuarios/${userId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            const text = await res.text();
            console.error('Error en carga:', res.status, text);
            throw new Error('No se pudo cargar usuario');
        }
        const usuario = await res.json();


        if (!usuario) {
            alert('Usuario no encontrado');
            return;
        }
        document.getElementById('email').value = usuario.email || '';
        document.getElementById('rol').value = usuario.rol || 'cliente';
        document.getElementById('telefono').value = usuario.telefono || '';
        document.getElementById('empresa').value = usuario.empresa || '';
        document.getElementById('cargo').value = usuario.cargo || '';
        document.getElementById('jefe_inmediato').value = usuario.jefe_inmediato || '';
        document.getElementById('en_proyecto').checked = usuario.en_proyecto || false;

        if (usuario.en_proyecto) {
            proyectoCampos.style.display = 'block';
            document.getElementById('nombre_proyecto').value = usuario.nombre_proyecto || '';
            document.getElementById('lider_proyecto').value = usuario.lider_proyecto || '';
            document.getElementById('cargo_proyecto').value = usuario.cargo_proyecto || '';
        }
    } catch (error) {
        alert(error.message);
    }
}

// Enviar datos actualizados al hacer submit
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
        email: document.getElementById('email').value,
        rol: document.getElementById('rol').value,
        telefono: document.getElementById('telefono').value,
        empresa: document.getElementById('empresa').value,
        cargo: document.getElementById('cargo').value,
        jefe_inmediato: document.getElementById('jefe_inmediato').value,
        en_proyecto: document.getElementById('en_proyecto').checked,
    };

    if (data.en_proyecto) {
        data.nombre_proyecto = document.getElementById('nombre_proyecto').value;
        data.lider_proyecto = document.getElementById('lider_proyecto').value;
        data.cargo_proyecto = document.getElementById('cargo_proyecto').value;
    }

    try {
        const response = await fetch(`http://localhost:5000/auth/editar_usuario/${userId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });

        const result = await response.json();
        if (response.ok) {
            alert('Usuario actualizado exitosamente');
        } else {
            alert('Error: ' + result.mensaje);
        }
    } catch (error) {
        alert('Error de conexión: ' + error.message);
    }
});

// Cargar usuario al cargar la página
cargarUsuario();