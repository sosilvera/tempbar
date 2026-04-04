let modalInstancia;
let ingredientesCache = []; // Master list de ingredientes
let recetaActual = []; // [{idIngrediente, nombre, cantidad, unidad_medida}]

document.addEventListener("DOMContentLoaded", () => {
    modalInstancia = new bootstrap.Modal(document.getElementById('modalIngrediente'));
    configurarBuscadorModal();
});

// --- LÓGICA DEL MODAL E INGREDIENTES ---

async function abrirModalIngrediente() {
    // 1. Limpiar campos del modal
    document.getElementById('modal-nombre-ing').value = '';
    document.getElementById('modal-cantidad').value = '';
    document.getElementById('modal-unidad').value = '';
    document.getElementById('sugerencias-ingredientes').classList.add('d-none');

    // 2. Cargar caché si está vacío
    if (ingredientesCache.length === 0) {
        try {
            // Revisar sessionStorage primero
            const guardado = sessionStorage.getItem('masterIngredientes');
            if (guardado) {
                ingredientesCache = JSON.parse(guardado);
            } else {
                // Si no hay caché, pedir a la API
                const response = await fetch('/bar/get_ingredientes');
                ingredientesCache = await response.json();
                sessionStorage.setItem('masterIngredientes', JSON.stringify(ingredientesCache));
            }
        } catch (error) {
            console.error("Error cargando maestro de ingredientes:", error);
        }
    }

    modalInstancia.show();
}

function configurarBuscadorModal() {
    const inputBuscador = document.getElementById('modal-nombre-ing');
    const cajaSugerencias = document.getElementById('sugerencias-ingredientes');

    inputBuscador.addEventListener('input', function(e) {
        const texto = e.target.value.toLowerCase().trim();
        cajaSugerencias.innerHTML = '';

        if (texto.length === 0) {
            cajaSugerencias.classList.add('d-none');
            return;
        }

        // Filtrar coincidencias
        const coincidencias = ingredientesCache.filter(ing => ing.nombre.toLowerCase().includes(texto));

        if (coincidencias.length > 0) {
            cajaSugerencias.classList.remove('d-none');
            coincidencias.forEach(ing => {
                const li = document.createElement('li');
                li.className = 'list-group-item list-group-item-action bg-dark text-white border-secondary cursor-pointer';
                li.innerText = ing.nombre;
                li.onclick = () => {
                    inputBuscador.value = ing.nombre;
                    cajaSugerencias.classList.add('d-none'); // Ocultar al seleccionar
                };
                cajaSugerencias.appendChild(li);
            });
        } else {
            cajaSugerencias.classList.add('d-none');
        }
    });
}

async function confirmarIngrediente() {
    const btn = document.getElementById('btn-confirmar-ing');
    const nombreInput = document.getElementById('modal-nombre-ing').value.trim();
    const cantidad = parseFloat(document.getElementById('modal-cantidad').value);
    const unidad = document.getElementById('modal-unidad').value.trim();

    if (!nombreInput || isNaN(cantidad) || !unidad) return;

    btn.disabled = true;
    btn.innerText = "Procesando...";

    try {
        // Buscar si el ingrediente ya existe (coincidencia exacta)
        let ingredienteEncontrado = ingredientesCache.find(ing => ing.nombre.toLowerCase() === nombreInput.toLowerCase());
        let idAsignado = null;

        if (ingredienteEncontrado) {
            // Existe -> Tomamos el ID
            idAsignado = ingredienteEncontrado.idIngrediente;
        } else {
            // No existe -> Lo creamos llamando a la API
            const response = await fetch('/bar/crear_ingrediente', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre: nombreInput })
            });
            
            if (response.ok) {
                const data = await response.json();
                idAsignado = data.idIngrediente;
                
                // Agregarlo a nuestro caché local y actualizar sessionStorage
                const nuevoIng = { idIngrediente: idAsignado, nombre: nombreInput };
                ingredientesCache.push(nuevoIng);
                sessionStorage.setItem('masterIngredientes', JSON.stringify(ingredientesCache));
            } else {
                alert("Error al crear el nuevo ingrediente en la base de datos.");
                return; // Cortamos la ejecución
            }
        }

        // Evitar duplicados en la receta actual
        if (recetaActual.find(item => item.idIngrediente === idAsignado)) {
            alert("Este ingrediente ya está en la receta.");
            return;
        }

        // Agregar al array de la receta del trago
        recetaActual.push({
            idIngrediente: idAsignado,
            nombre: nombreInput,
            cantidad: cantidad,
            unidad_medida: unidad
        });

        renderizarRecetaUI();
        modalInstancia.hide();

    } catch (error) {
        console.error("Error confirmando ingrediente:", error);
        alert("Error de conexión.");
    } finally {
        btn.disabled = false;
        btn.innerText = "Agregar a la lista";
    }
}

// --- LÓGICA DE LA INTERFAZ DE RECETA ---

function renderizarRecetaUI() {
    const contenedor = document.getElementById('lista-receta');
    const msjVacio = document.getElementById('mensaje-vacio');
    
    // Limpiar elementos actuales (excepto el mensaje vacío)
    Array.from(contenedor.children).forEach(child => {
        if (child.id !== 'mensaje-vacio') child.remove();
    });

    if (recetaActual.length === 0) {
        msjVacio.classList.remove('d-none');
    } else {
        msjVacio.classList.add('d-none');
        
        recetaActual.forEach(item => {
            const row = `
                <div class="d-flex justify-content-between align-items-center bg-dark p-2 rounded border border-secondary">
                    <div>
                        <span class="text-white fw-bold d-block">${item.nombre}</span>
                        <span class="text-white-50 small">${item.cantidad} ${item.unidad_medida}</span>
                    </div>
                    <button class="btn btn-sm btn-outline-danger" onclick="quitarDeReceta(${item.idIngrediente})">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', row);
        });
    }
}

function quitarDeReceta(idIngrediente) {
    recetaActual = recetaActual.filter(item => item.idIngrediente !== idIngrediente);
    renderizarRecetaUI();
}

// --- CREACIÓN DEL TRAGO FINAL ---

async function crearTrago() {
    const nombreTrago = document.getElementById('nombre-trago').value.trim();
    const instrucciones = document.getElementById('instrucciones-trago').value.trim();
    const btn = document.getElementById('btn-crear-trago');
    const alerta = document.getElementById('alerta-trago');

    if (!nombreTrago || !instrucciones || recetaActual.length === 0) {
        mostrarAlerta(alerta, "Completá el nombre, instrucciones y al menos un ingrediente.", "alert-warning");
        return;
    }

    // Armar el Body según la estructura pedida
    const payload = {
        nombre: nombreTrago,
        instrucciones: instrucciones,
        ingredientes: recetaActual.map(item => ({
            idIngrediente: item.idIngrediente,
            cantidad: item.cantidad,
            unidad_medida: item.unidad_medida
        }))
    };

    btn.disabled = true;
    btn.innerText = "Guardando...";

    try {
        const response = await fetch('/bar/crear_trago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarAlerta(alerta, `¡Trago "${nombreTrago}" creado exitosamente!`, "alert-success text-dark fw-bold");
            
            // Limpiar formulario para el próximo trago
            document.getElementById('nombre-trago').value = '';
            document.getElementById('instrucciones-trago').value = '';
            recetaActual = [];
            renderizarRecetaUI();
        } else {
            mostrarAlerta(alerta, "Ocurrió un error al guardar el trago.", "alert-danger");
        }
    } catch (error) {
        console.error("Error creando trago:", error);
        mostrarAlerta(alerta, "Problemas de conexión.", "alert-danger");
    } finally {
        btn.disabled = false;
        btn.innerText = "Crear Trago";
    }
}

function mostrarAlerta(elemento, mensaje, clases) {
    elemento.className = `alert d-block rounded-4 text-center glass-alert mb-4 ${clases}`;
    elemento.innerText = mensaje;
    setTimeout(() => elemento.classList.replace('d-block', 'd-none'), 4000);
}