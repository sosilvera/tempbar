// Sets globales para gestionar el estado de los cambios
let idsParaSacar = new Set();
let listaParaAgregar = []; // Array del maestro original para filtrar

document.addEventListener("DOMContentLoaded", () => {
    cargarIngredientesNoche();
    configurarBuscadorAgregar();
});

async function cargarIngredientesNoche() {
    const contActivos = document.getElementById('lista-activos');
    const contAgregar = document.getElementById('lista-agregar');

    try {
        const response = await fetch('/bar/get_ingredientes_noche');
        const data = await response.json();

        // Limpiar spinners
        document.getElementById('spinner-activos')?.remove();
        document.getElementById('spinner-agregar')?.remove();

        // 1. RENDERIZAR ACTIVOS
        if (data.activos && data.activos.length > 0) {
            data.activos.forEach(ing => {
                const fila = `
                    <div class="bg-dark border border-secondary rounded-3 p-3 d-flex align-items-center justify-content-between row-activo" id="activo-${ing.idIngrediente}">
                        <span class="text-white fs-6 fw-bold nombre-ing">${ing.nombre}</span>
                        <button class="btn btn-sm btn-outline-danger px-3 rounded-pill" id="btn-quitar-${ing.idIngrediente}" onclick="toggleQuitarActivo(${ing.idIngrediente})">
                            Quitar
                        </button>
                    </div>
                `;
                contActivos.insertAdjacentHTML('beforeend', fila);
            });
        } else {
            contActivos.innerHTML = '<p class="text-muted text-center small my-2">No hay ingredientes activos en este momento.</p>';
        }

        // 2. RENDERIZAR DISPONIBLES (Para agregar)
        if (data.para_agregar && data.para_agregar.length > 0) {
            listaParaAgregar = data.para_agregar; // Guardamos para el buscador
            data.para_agregar.forEach(ing => {
                const fila = `
                    <div class="row-agregar bg-dark border border-secondary rounded-3 p-2 d-flex align-items-center justify-content-between" id="disp-${ing.idIngrediente}">
                        <div class="form-check m-0 d-flex align-items-center flex-grow-1 ps-4 py-2 cursor-pointer" onclick="toggleCheckboxDisp(${ing.idIngrediente})">
                            <input class="form-check-input fs-5 chk-agregar mt-0 me-3" type="checkbox" value="${ing.idIngrediente}" id="chk-disp-${ing.idIngrediente}" onchange="manejarEstadoInputCant(${ing.idIngrediente})">
                            <label class="form-check-label text-white fs-6 cursor-pointer nombre-ing" for="chk-disp-${ing.idIngrediente}" onclick="event.stopPropagation();">
                                ${ing.nombre}
                            </label>
                        </div>
                        <div style="width: 100px;">
                            <input type="number" step="0.01" class="form-control glass-input text-center py-1 input-cant-agregar" id="qty-disp-${ing.idIngrediente}" placeholder="Cant." disabled>
                        </div>
                    </div>
                `;
                contAgregar.insertAdjacentHTML('beforeend', fila);
            });
        } else {
            contAgregar.innerHTML = '<p class="text-muted text-center small my-2">No hay más ingredientes en el maestro para agregar.</p>';
        }

    } catch (error) {
        console.error("Error al cargar ingredientes de la noche:", error);
        mostrarAlerta("Error al conectar con la base de datos.", "alert-danger");
    }
}

// --- LOGICA: ACTIVOS (SACAR) ---

function toggleQuitarActivo(id) {
    const fila = document.getElementById(`activo-${id}`);
    const btn = document.getElementById(`btn-quitar-${id}`);
    const spanNombre = fila.querySelector('.nombre-ing');

    if (idsParaSacar.has(id)) {
        // Deshacer: Volver a dejarlo en la noche
        idsParaSacar.delete(id);
        fila.classList.remove('marcado-para-sacar', 'border-danger');
        spanNombre.classList.remove('text-decoration-line-through', 'text-danger');
        btn.classList.replace('btn-danger', 'btn-outline-danger');
        btn.innerText = "Quitar";
    } else {
        // Marcar para sacar
        idsParaSacar.add(id);
        fila.classList.add('marcado-para-sacar', 'border-danger');
        spanNombre.classList.add('text-decoration-line-through', 'text-danger');
        btn.classList.replace('btn-outline-danger', 'btn-danger');
        btn.innerText = "Deshacer";
    }
}

// --- LOGICA: DISPONIBLES (AGREGAR) ---

function toggleCheckboxDisp(id) {
    const chk = document.getElementById(`chk-disp-${id}`);
    chk.checked = !chk.checked;
    manejarEstadoInputCant(id);
}

function manejarEstadoInputCant(id) {
    const chk = document.getElementById(`chk-disp-${id}`);
    const inputQty = document.getElementById(`qty-disp-${id}`);
    const fila = document.getElementById(`disp-${id}`);

    if (chk.checked) {
        inputQty.disabled = false;
        inputQty.focus();
        fila.classList.add('border-info');
    } else {
        inputQty.disabled = true;
        inputQty.value = ''; // Limpiamos cantidad
        fila.classList.remove('border-info', 'border-danger');
    }
}

function configurarBuscadorAgregar() {
    const input = document.getElementById('buscador-agregar');
    input.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase();
        const filas = document.querySelectorAll('.row-agregar');
        
        filas.forEach(fila => {
            const nombre = fila.querySelector('.nombre-ing').innerText.toLowerCase();
            fila.style.display = nombre.includes(texto) ? 'flex' : 'none';
        });
    });
}

// --- LOGICA: ENVIAR A LA API ---

async function guardarCambiosNoche() {
    const alerta = document.getElementById('alerta-modificar');
    const btnGuardar = document.getElementById('btn-guardar-cambios');
    
    // 1. Armar array "sacar"
    const payloadSacar = Array.from(idsParaSacar).map(id => ({ idIngrediente: id }));

    // 2. Armar array "agregar" y validar cantidades
    const payloadAgregar = [];
    let errorCantidades = false;
    
    const checkboxesAgregar = document.querySelectorAll('.chk-agregar:checked');
    checkboxesAgregar.forEach(chk => {
        const id = chk.value;
        const qty = document.getElementById(`qty-disp-${id}`).value;
        const fila = document.getElementById(`disp-${id}`);

        if (!qty || qty <= 0) {
            errorCantidades = true;
            fila.classList.replace('border-info', 'border-danger');
        } else {
            fila.classList.replace('border-danger', 'border-info');
            payloadAgregar.push({
                idIngrediente: parseInt(id),
                cantidad: parseFloat(qty)
            });
        }
    });

    if (errorCantidades) {
        mostrarAlerta("Falta ingresar la cantidad en los ingredientes seleccionados para agregar.", "alert-danger");
        return;
    }

    // Validación: No hacer llamada si no hay nada que cambiar
    if (payloadSacar.length === 0 && payloadAgregar.length === 0) {
        mostrarAlerta("No hiciste ninguna modificación.", "alert-warning");
        return;
    }

    // Armar JSON Final
    const payload = {
        sacar: payloadSacar,
        agregar: payloadAgregar
    };

    btnGuardar.disabled = true;
    btnGuardar.innerText = "Guardando...";

    try {
        const response = await fetch('/bar/modificar_noche', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarAlerta("¡Stock de la noche actualizado con éxito!", "alert-success text-dark fw-bold");
            setTimeout(() => {
                window.location.href = '/tempbar/barman';
            }, 1500);
        } else {
            mostrarAlerta("Ocurrió un error al intentar modificar la noche.", "alert-danger");
            btnGuardar.disabled = false;
            btnGuardar.innerText = "Guardar Cambios";
        }
    } catch (error) {
        console.error("Error guardando cambios:", error);
        mostrarAlerta("Problemas de conexión con el servidor.", "alert-danger");
        btnGuardar.disabled = false;
        btnGuardar.innerText = "Guardar Cambios";
    }
}

function mostrarAlerta(mensaje, clases) {
    const alerta = document.getElementById('alerta-modificar');
    alerta.className = `alert d-block rounded-4 text-center glass-alert mb-4 ${clases}`;
    alerta.innerText = mensaje;
    setTimeout(() => alerta.classList.replace('d-block', 'd-none'), 4000);
}