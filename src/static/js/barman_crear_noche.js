document.addEventListener("DOMContentLoaded", () => {
    cargarIngredientesMaestros();
});

async function cargarIngredientesMaestros() {
    const contenedor = document.getElementById('lista-ingredientes');

    try {
        const response = await fetch('/bar/get_ingredientes');
        const ingredientes = await response.json();

        contenedor.innerHTML = ''; // Limpiar spinner

        if (ingredientes.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center small my-3">El maestro de ingredientes está vacío.</p>';
            return;
        }

        // Ordenar alfabéticamente
        ingredientes.sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(ing => {
            inyectarFilaIngrediente(ing.idIngrediente, ing.nombre);
        });

    } catch (error) {
        console.error("Error al cargar ingredientes:", error);
        contenedor.innerHTML = '<p class="text-danger text-center">Error al cargar la lista.</p>';
    }
}

// Función reutilizable para dibujar la fila (se usa al cargar y al agregar uno nuevo)
function inyectarFilaIngrediente(id, nombre, marcado = false, cantidad = '') {
    const contenedor = document.getElementById('lista-ingredientes');
    const checkedAttr = marcado ? 'checked' : '';
    
    // Al hacer click en el div, se marca el checkbox, facilitando el uso en celular
    const fila = `
        <div class="ingrediente-row bg-dark border border-secondary rounded-3 p-2 d-flex align-items-center justify-content-between" id="row-${id}">
            <div class="form-check m-0 d-flex align-items-center flex-grow-1 ps-4 py-2 cursor-pointer" onclick="toggleCheckbox(${id})">
                <input class="form-check-input fs-5 chk-ingrediente mt-0 me-3" type="checkbox" value="${id}" id="chk-${id}" ${checkedAttr} onclick="event.stopPropagation();">
                <label class="form-check-label text-white fs-6 cursor-pointer" for="chk-${id}" onclick="event.stopPropagation();">
                    ${nombre}
                </label>
            </div>
            <div style="width: 100px;">
                <input type="number" step="0.01" class="form-control glass-input text-center py-1" id="qty-${id}" placeholder="Def: 1" value="${cantidad}">
            </div>
        </div>
    `;
    
    // Si viene marcado (es nuevo), lo ponemos arriba de todo. Si no, al final.
    if (marcado) {
        contenedor.insertAdjacentHTML('afterbegin', fila);
        // Hacemos scroll hacia arriba por si el usuario estaba abajo
        contenedor.scrollTop = 0; 
    } else {
        contenedor.insertAdjacentHTML('beforeend', fila);
    }
}

// Helper para marcar/desmarcar tocando cualquier parte de la fila
function toggleCheckbox(id) {
    const chk = document.getElementById(`chk-${id}`);
    chk.checked = !chk.checked;
}

// --- LOGICA: AGREGAR INGREDIENTE FUERA DEL MAESTRO ---

async function agregarIngredienteNuevo() {
    const inputNombre = document.getElementById('nuevo-nombre');
    const inputCantidad = document.getElementById('nuevo-cantidad');
    const btnAgregar = document.getElementById('btn-agregar-nuevo');

    const nombre = inputNombre.value.trim();
    
    // Si no pone cantidad, le mandamos string vacío para que la fila lo procese con el placeholder
    let cantidad = inputCantidad.value;
    if (!cantidad || cantidad <= 0) {
        cantidad = ''; // Se enviará vacío, y luego crearNoche() lo transformará en 1
    }

    if (!nombre) return; // El nombre sí es obligatorio

    btnAgregar.disabled = true;
    btnAgregar.innerHTML = '<span class="spinner-border spinner-border-sm" role="status"></span>';

    try {
        // 1. Llamar a la API para crear en el maestro
        const response = await fetch('/bar/crear_ingrediente', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: nombre })
        });

        if (response.ok) {
            const data = await response.json();
            const idNuevo = data.idIngrediente; // Asumiendo que devuelve { idIngrediente: X }
            
            // 2. Inyectarlo en la lista superior (marcado y con su cantidad)
            inyectarFilaIngrediente(idNuevo, nombre, true, cantidad);
            
            // 3. Limpiar formulario
            inputNombre.value = '';
            inputCantidad.value = '';
        } else {
            alert("Hubo un problema al crear el ingrediente.");
        }
    } catch (error) {
        console.error("Error agregando ingrediente:", error);
        alert("Error de conexión al crear ingrediente.");
    } finally {
        btnAgregar.disabled = false;
        btnAgregar.innerHTML = 'Agregar';
    }
}

// --- LOGICA: CREAR NOCHE ---

async function crearNoche() {
    const alerta = document.getElementById('alerta-noche');
    const btnCrear = document.getElementById('btn-crear-noche');
    const checkboxes = document.querySelectorAll('.chk-ingrediente:checked');

    if (checkboxes.length === 0) {
        mostrarAlerta(alerta, "Debes seleccionar al menos un ingrediente para abrir la barra.", "alert-warning");
        return;
    }

    const ingredientesPayload = [];
    let errorCantidad = false;

    // Recolectar datos
    checkboxes.forEach(chk => {
        const id = chk.value;
        const qtyInput = document.getElementById(`qty-${id}`).value;
        
        // Convertimos a número. Si está vacío, es inválido o menor/igual a cero, asignamos 1.
        let cantidadFinal = parseFloat(qtyInput);
        if (isNaN(cantidadFinal) || cantidadFinal <= 0) {
            cantidadFinal = 1;
        }

        // Ya no marcamos error, simplemente limpiamos por si había un borde rojo de antes
        document.getElementById(`row-${id}`).classList.remove('border-danger');
        
        ingredientesPayload.push({
            idIngrediente: parseInt(id),
            cantidad: cantidadFinal
        });
    });


    // Armar el Body exacto solicitado
    const payload = {
        ingredientes: ingredientesPayload,
        nuevos: [] // Array vacío por indicación tuya
    };

    btnCrear.disabled = true;
    btnCrear.innerText = "Abriendo Barra...";

    try {
        const response = await fetch('/bar/crear_noche', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            // Noche creada exitosamente, guardamos en caché (asumiendo que devuelve el ID)
            const data = await response.json();
            if (data.idNoche) sessionStorage.setItem('idNoche', data.idNoche);
            
            mostrarAlerta(alerta, "¡Noche creada! Redirigiendo al panel...", "alert-success text-dark fw-bold");
            setTimeout(() => {
                window.location.href = '/tempbar/barman';
            }, 1500);
        } else {
            mostrarAlerta(alerta, "Error al crear la noche en la base de datos.", "alert-danger");
            btnCrear.disabled = false;
            btnCrear.innerText = "Crear Noche";
        }
    } catch (error) {
        console.error("Error creando noche:", error);
        mostrarAlerta(alerta, "Error de conexión.", "alert-danger");
        btnCrear.disabled = false;
        btnCrear.innerText = "Crear Noche";
    }
}

function mostrarAlerta(elemento, mensaje, clases) {
    elemento.className = `alert d-block rounded-4 text-center glass-alert mb-4 ${clases}`;
    elemento.innerText = mensaje;
    setTimeout(() => elemento.classList.replace('d-block', 'd-none'), 5000);
}