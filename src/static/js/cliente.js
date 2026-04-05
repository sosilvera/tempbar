document.addEventListener("DOMContentLoaded", async () => {
    await inicializarPantalla();
});

async function inicializarPantalla() {
    const formPedido = document.getElementById('form-pedido');

    try {
        const responseNoche = await fetch('/bar/noche_activa');
        const dataNoche = await responseNoche.json();

        if (dataNoche.value && dataNoche.value > 0) {
            sessionStorage.setItem('idNoche', dataNoche.value);
            await cargarTragos();
            formPedido.classList.remove('d-none');
        } else {
            mostrarMensaje("La barra está cerrada en este momento.", "alert-warning");
        }
    } catch (error) {
        console.error("Error consultando estado:", error);
        mostrarMensaje("Problema conectando con el servidor.", "alert-danger");
    }
}

async function cargarTragos() {
    const listaTragos = document.getElementById('lista-tragos');
    listaTragos.innerHTML = '<div class="text-center text-info spinner-border" role="status"></div>';

    try {
        const response = await fetch('/bar/get_tragos');
        const tragos = await response.json();
        
        listaTragos.innerHTML = ''; 

        if (tragos.length === 0) {
            listaTragos.innerHTML = '<p class="text-muted text-center">Todavía no hay tragos disponibles.</p>';
            return;
        }

        tragos.forEach((trago, index) => {
            // El primer trago de la lista viene seleccionado por defecto
            const checked = index === 0 ? 'checked' : ''; 
            
            // Si por algún motivo un trago viene sin descripción, le ponemos un texto genérico
            const descripcion = trago.descripcion ? trago.descripcion : "¡Un clásico infaltable para disfrutar!";
            
            // Estructura actualizada: Título en grande y descripción en pequeño debajo
            const html = `
                <div>
                    <input type="radio" class="btn-check" name="tragoSeleccionado" id="trago-${trago.idTrago}" value="${trago.idTrago}" ${checked}>
                    <label class="btn custom-radio-label w-100 text-start p-3 rounded-4" for="trago-${trago.idTrago}">
                        <div class="ms-1">
                            <span class="fs-5 fw-semibold d-block mb-1">${trago.nombre}</span>
                            <small class="text-white-50 d-block text-wrap lh-sm" style="font-size: 0.85rem;">
                                ${descripcion}
                            </small>
                        </div>
                    </label>
                </div>
            `;
            listaTragos.insertAdjacentHTML('beforeend', html);
        });

    } catch (error) {
        console.error("Error al obtener los tragos:", error);
        listaTragos.innerHTML = '<p class="text-danger">Error al cargar la carta.</p>';
    }
}

async function enviarPedido() {
    const nombreCliente = document.getElementById('nombre-cliente').value.trim();
    const idNoche = sessionStorage.getItem('idNoche');
    const tragoSeleccionado = document.querySelector('input[name="tragoSeleccionado"]:checked');

    if (!nombreCliente) { alert("¡No te olvides de poner tu nombre!"); return; }
    if (!tragoSeleccionado) { alert("Por favor elegí un trago."); return; }
    if (!idNoche) { alert("No hay una noche activa."); return; }

    const payload = {
        idTrago: parseInt(tragoSeleccionado.value),
        idNoche: parseInt(idNoche),
        nombre_cliente: nombreCliente
    };

    const btnEnviar = document.getElementById('btn-enviar');
    btnEnviar.disabled = true;
    btnEnviar.innerText = "Enviando...";

    try {
        const response = await fetch('/bar/crear_pedido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            mostrarMensaje(`¡Pedido anotado, ${nombreCliente}! A esperar tu trago.`, "alert-success text-dark fw-bold");
            document.getElementById('form-pedido').reset();
            document.getElementById('form-pedido').classList.add('d-none');
        } else {
            mostrarMensaje("Ocurrió un error. Probá de nuevo.", "alert-danger");
        }
    } catch (error) {
        mostrarMensaje("Problemas de conexión con la barra.", "alert-danger");
    } finally {
        btnEnviar.disabled = false;
        btnEnviar.innerText = "Preparar Pedido";
    }
}

function mostrarMensaje(texto, claseAlerta) {
    const mensajeEstado = document.getElementById('mensaje-estado');
    mensajeEstado.className = `alert text-center rounded-4 ${claseAlerta}`;
    mensajeEstado.innerText = texto;
    mensajeEstado.classList.remove('d-none');
}