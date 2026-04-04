let modalInstancia;
let tragoEnPreparacionId = null;

document.addEventListener("DOMContentLoaded", () => {
    modalInstancia = new bootstrap.Modal(document.getElementById('modalDetallePedido'));
    cargarPedidos();
});

async function cargarPedidos() {
    const contenedor = document.getElementById('lista-pedidos');
    contenedor.innerHTML = '<div class="text-center mt-5"><div class="spinner-border text-info" role="status"></div></div>';

    try {
        const response = await fetch('/bar/get_pedidos');
        let pedidos = await response.json();

        if (pedidos.length === 0) {
            contenedor.innerHTML = `
                <div class="alert alert-glass text-center p-5 rounded-4">
                    <i class="bi bi-cup-straw fs-1 text-muted d-block mb-3"></i>
                    <h5 class="text-muted">No hay pedidos pendientes</h5>
                </div>`;
            return;
        }

        // Ordenar por idPedido ascendente (Menor a mayor: el primero en pedir, primero en la lista)
        pedidos.sort((a, b) => a.idPedido - b.idPedido);

        contenedor.innerHTML = ''; // Limpiar spinner

        // Renderizar lista
        pedidos.forEach(pedido => {
            const card = `
                <div class="card card-pedido-glass mb-3 cursor-pointer" onclick="abrirDetallePedido(${pedido.idPedido})">
                    <div class="card-body d-flex justify-content-between align-items-center p-4">
                        <div>
                            <h5 class="mb-1 text-white fw-bold">${pedido.nombreCliente}</h5>
                            <span class="badge bg-info text-dark">${pedido.nombreTrago}</span>
                        </div>
                        <i class="bi bi-chevron-right text-white-50"></i>
                    </div>
                </div>
            `;
            contenedor.insertAdjacentHTML('beforeend', card);
        });

    } catch (error) {
        console.error("Error al cargar pedidos:", error);
        contenedor.innerHTML = '<div class="alert alert-danger">Error al cargar la lista de pedidos.</div>';
    }
}

async function abrirDetallePedido(idPedido) {
    // Resetear contenido del modal mientras carga
    document.getElementById('modal-titulo').innerText = "Cargando...";
    document.getElementById('modal-ingredientes').innerHTML = '';
    document.getElementById('modal-instrucciones').value = '';
    document.getElementById('btn-completar').disabled = true;
    
    // Mostrar el modal
    modalInstancia.show();

    try {
        const response = await fetch(`/bar/get_pedido/${idPedido}`);
        const data = await response.json();

        // Guardamos el idTrago en una variable global para usarla al clickear "Completar"
        tragoEnPreparacionId = idPedido;

        // 1. Título
        document.getElementById('modal-titulo').innerText = `${data.nombreCliente} - ${data.trago.nombre}`;

        // 2. Ingredientes
        const listaIngredientes = document.getElementById('modal-ingredientes');
        data.trago.ingredientes.forEach(ing => {
            const li = `
                <li class="list-group-item bg-dark text-white border-secondary d-flex justify-content-between align-items-center">
                    ${ing.nombreIngrediente}
                    <span class="badge bg-secondary rounded-pill">${ing.cantidad} ${ing.unidad_medida}</span>
                </li>`;
            listaIngredientes.insertAdjacentHTML('beforeend', li);
        });

        // 3. Instrucciones
        document.getElementById('modal-instrucciones').value = data.trago.instrucciones;

        // Habilitar botón
        document.getElementById('btn-completar').disabled = false;

    } catch (error) {
        console.error("Error al obtener detalle del pedido:", error);
        document.getElementById('modal-titulo').innerText = "Error al cargar receta";
    }
}

async function completarTragoActual() {
    if (!tragoEnPreparacionId) return;

    const btn = document.getElementById('btn-completar');
    btn.disabled = true;
    btn.innerText = "Completando...";

    try {
        // Llamado a la API especificada en el prompt
        const response = await fetch(`/bar/completar_pedido/${tragoEnPreparacionId}`, {
            method: 'POST'
        });

        if (response.ok) {
            modalInstancia.hide();
            await cargarPedidos(); // Recargar la lista para que desaparezca el completado
        } else {
            alert("Error al marcar el trago como completado.");
        }
    } catch (error) {
        console.error("Error completando trago:", error);
        alert("Fallo de conexión al completar el pedido.");
    } finally {
        btn.innerText = "Completar Trago";
        btn.disabled = false;
    }
}