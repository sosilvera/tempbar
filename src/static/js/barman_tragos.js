// Variable global temporal para guardar la receta antes de enviarla a la BD
let recetaActual = [];

// Cuando carga la página, buscamos los ingredientes del maestro
document.addEventListener("DOMContentLoaded", async () => {
    await cargarIngredientesMaster();
});

async function cargarIngredientesMaster() {
    const select = document.getElementById('select-ingrediente');
    
    try {
        // En producción descomentarás esto:
        // const response = await fetch('/api/get_master_ingredientes');
        // const ingredientes = await response.json();
        
        // --- DATOS SIMULADOS PARA QUE PRUEBES LA INTERFAZ ---
        const ingredientes = [
            { idIngrediente: 1, nombre: "Vodka" },
            { idIngrediente: 2, nombre: "Jugo de Naranja" },
            { idIngrediente: 3, nombre: "Hielo" },
            { idIngrediente: 4, nombre: "Granadina" }
        ];
        // ---------------------------------------------------

        select.innerHTML = '<option value="" disabled selected>Elegí uno...</option>';
        ingredientes.forEach(ing => {
            select.innerHTML += `<option value="${ing.idIngrediente}">${ing.nombre}</option>`;
        });
    } catch (error) {
        console.error("Error cargando ingredientes:", error);
        select.innerHTML = '<option value="" disabled>Error al cargar</option>';
    }
}

function agregarIngredienteReceta() {
    const select = document.getElementById('select-ingrediente');
    const idIngrediente = select.value;
    const nombreIngrediente = select.options[select.selectedIndex].text;
    const cantidad = document.getElementById('cantidad-ingrediente').value;
    const unidad = document.getElementById('unidad-ingrediente').value;

    if (!idIngrediente || !cantidad) return;

    // Verificar si el ingrediente ya fue agregado para no duplicarlo
    const existe = recetaActual.find(item => item.idIngrediente === idIngrediente);
    if (existe) {
        alert("Ese ingrediente ya está en la receta. Eliminalo si querés cambiar la cantidad.");
        return;
    }

    // Agregar al array temporal
    recetaActual.push({
        idIngrediente: parseInt(idIngrediente),
        nombre: nombreIngrediente,
        cantidad: parseFloat(cantidad),
        unidad_medida: unidad
    });

    actualizarTablaReceta();
    
    // Limpiar inputs
    document.getElementById('cantidad-ingrediente').value = '';
    select.value = '';
}

function eliminarIngrediente(idIngrediente) {
    recetaActual = recetaActual.filter(item => item.idIngrediente !== idIngrediente);
    actualizarTablaReceta();
}

function actualizarTablaReceta() {
    const tbody = document.getElementById('tabla-receta');
    const msjVacio = document.getElementById('mensaje-receta-vacia');
    
    tbody.innerHTML = '';

    if (recetaActual.length === 0) {
        msjVacio.style.display = 'block';
    } else {
        msjVacio.style.display = 'none';
        recetaActual.forEach(item => {
            tbody.innerHTML += `
                <tr>
                    <td>${item.nombre}</td>
                    <td>${item.cantidad}</td>
                    <td>${item.unidad_medida}</td>
                    <td>
                        <button class="btn btn-sm btn-danger py-0 px-2" onclick="eliminarIngrediente(${item.idIngrediente})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
    }
}

async function guardarTragoCompleto() {
    const nombre = document.getElementById('nombre-trago').value;
    const instrucciones = document.getElementById('instrucciones-trago').value;

    if (!nombre) {
        alert("Por favor, ponéle un nombre al trago.");
        return;
    }

    if (recetaActual.length === 0) {
        alert("El trago necesita al menos un ingrediente en su receta.");
        return;
    }

    // Estructura del JSON que espera FastAPI (usando schemas.py que armaremos luego)
    const payload = {
        nombre: nombre,
        instrucciones: instrucciones,
        ingredientes: recetaActual.map(item => ({
            idIngrediente: item.idIngrediente,
            cantidad: item.cantidad,
            unidad_medida: item.unidad_medida
        }))
    };

    console.log("Enviando a FastAPI:", payload);

    try {
        /* En producción:
        const response = await fetch('/api/crear_trago', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        if(response.ok) {
            alert(`¡Trago ${nombre} creado con éxito!`);
            // Limpiar formulario para el siguiente
            window.location.reload(); 
        } else {
            alert("Error al guardar el trago.");
        }
        */
        
        // Simulación para ahora:
        alert(`¡Trago "${nombre}" guardado con éxito! Mirá la consola para ver el JSON.`);
        window.location.reload(); 
        
    } catch (error) {
        console.error("Error guardando el trago:", error);
    }
}