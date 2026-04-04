document.addEventListener("DOMContentLoaded", () => {
    cargarIngredientes();
});

// --- LÓGICA DE BÚSQUEDA EN TIEMPO REAL ---
document.getElementById('nuevo-ingrediente').addEventListener('input', function(e) {
    // Convertimos lo que escribe el usuario a minúsculas para que la búsqueda no sea sensible a mayúsculas
    const textoBusqueda = e.target.value.toLowerCase();
    
    // Agarramos todas las tarjetas de ingredientes renderizadas
    const itemsIngredientes = document.querySelectorAll('.ingrediente-item');

    itemsIngredientes.forEach(item => {
        // El nombre del ingrediente está en el span dentro de la tarjeta
        const nombreItem = item.querySelector('span').innerText.toLowerCase();
        
        // Si el nombre incluye lo que estamos escribiendo, lo mostramos. Si no, lo ocultamos.
        if (nombreItem.includes(textoBusqueda)) {
            item.style.display = 'flex'; // 'flex' es el display original que le dimos en el CSS
        } else {
            item.style.display = 'none';
        }
    });
});

async function cargarIngredientes() {
    const contenedor = document.getElementById('lista-ingredientes');

    try {
        // Reutilizamos la API que trae todos los ingredientes
        const response = await fetch('/bar/get_ingredientes');
        const ingredientes = await response.json();

        contenedor.innerHTML = ''; // Limpiar el spinner

        if (ingredientes.length === 0) {
            contenedor.innerHTML = '<p class="text-center text-white-50 mt-4">No hay ingredientes cargados aún.</p>';
            return;
        }

        // Renderizar cada ingrediente. 
        // Nota: Los ordenamos alfabéticamente para que te sea más fácil encontrarlos
        ingredientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(ing => {
            const itemHTML = `
                <div class="ingrediente-item shadow-sm">
                    <span class="fs-5 text-white">${ing.nombre}</span>
                    <button class="btn-delete" onclick="eliminarIngrediente(${ing.idIngrediente}, '${ing.nombre}')" title="Eliminar">
                        <i class="bi bi-trash fs-5"></i>
                    </button>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', itemHTML);
        });

    } catch (error) {
        console.error("Error al cargar ingredientes:", error);
        contenedor.innerHTML = '<p class="text-danger text-center">Error al conectar con la base de datos.</p>';
    }
}

async function crearIngrediente() {
    const inputNuevo = document.getElementById('nuevo-ingrediente');
    const nombre = inputNuevo.value.trim();
    const btnAgregar = document.getElementById('btn-agregar');

    if (!nombre) return;

    // Deshabilitamos el input y botón mientras carga
    inputNuevo.disabled = true;
    btnAgregar.disabled = true;
    btnAgregar.innerHTML = '<div class="spinner-border spinner-border-sm" role="status"></div>';

    try {
        const response = await fetch('/bar/crear_ingrediente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });

        if (response.ok) {
            inputNuevo.value = ''; // Limpiamos el campo
            mostrarAlerta(`¡"${nombre}" agregado con éxito!`, 'alert-success text-dark fw-bold');
            await cargarIngredientes(); // Recargamos la lista
        } else {
            // Manejar si el ingrediente ya existe (ej: la API tira error por UNIQUE de MySQL)
            mostrarAlerta("Error: Es posible que ese ingrediente ya exista.", 'alert-warning');
        }
    } catch (error) {
        console.error("Error al crear:", error);
        mostrarAlerta("Error de conexión.", 'alert-danger');
    } finally {
        // Restauramos los controles
        inputNuevo.disabled = false;
        btnAgregar.disabled = false;
        btnAgregar.innerHTML = '<i class="bi bi-plus-lg fs-4"></i>';
        inputNuevo.focus(); // Volvemos a hacer foco por si querés cargar varios seguidos
    }
}

async function eliminarIngrediente(idIngrediente, nombre) {
    // Mini confirmación nativa para evitar "dedazos" accidentales
    if (!confirm(`¿Estás seguro que querés eliminar "${nombre}" del sistema?`)) {
        return;
    }

    try {
        const response = await fetch(`/bar/eliminar_ingrediente/${idIngrediente}`, {
            method: 'POST' // Asumo método DELETE por buena práctica REST
        });

        if (response.ok) {
            mostrarAlerta(`"${nombre}" eliminado.`, 'alert-info text-dark');
            await cargarIngredientes(); // Recargamos la lista
        } else {
            mostrarAlerta(`No se pudo eliminar "${nombre}". Quizás está en uso en algún trago.`, 'alert-danger');
        }
    } catch (error) {
        console.error("Error al eliminar:", error);
        mostrarAlerta("Fallo de conexión al intentar eliminar.", 'alert-danger');
    }
}

function mostrarAlerta(mensaje, clases) {
    const alerta = document.getElementById('alerta-ingredientes');
    alerta.className = `alert d-block rounded-4 text-center glass-alert mb-4 ${clases}`;
    alerta.innerText = mensaje;
    
    // Ocultar sola después de 3 segundos
    setTimeout(() => {
        alerta.classList.replace('d-block', 'd-none');
    }, 3000);
}