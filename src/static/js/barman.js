// --- NAVEGACIÓN SPA ---
function mostrarSeccion(idSeccion, elementoNav) {
    // Ocultar todas las secciones
    document.querySelectorAll('.seccion-barman').forEach(sec => sec.classList.remove('activa'));
    // Quitar la clase 'activa' de todos los links
    document.querySelectorAll('.nav-link').forEach(nav => nav.classList.remove('activa'));
    
    // Mostrar la sección seleccionada y marcar el link
    document.getElementById(idSeccion).classList.add('activa');
    elementoNav.classList.add('activa');

    // Si entramos a pedidos, los actualizamos automáticamente
    if(idSeccion === 'pedidos') cargarPedidos();
}

// --- LÓGICA DE API (Listos para conectar con FastAPI) ---

async function cargarPedidos() {
    // TODO: Conectar con FastAPI
    // const response = await fetch('/api/get_pedidos');
    // const pedidos = await response.json();
    console.log("Consultando pedidos pendientes...");
    
    // Simulación de actualización del contador de la barra lateral
    document.getElementById('badge-pedidos').innerText = Math.floor(Math.random() * 5); 
}

async function marcarEntregado(idPedido) {
    // TODO: Conectar con FastAPI
    // await fetch(`/api/completar_pedido/${idPedido}`, { method: 'POST' });
    alert(`Pedido ${idPedido} marcado como entregado.`);
    cargarPedidos(); // Refrescamos la lista después de entregar
}

async function crearNoche() {
    // TODO: Conectar con FastAPI
    // await fetch('/api/crear_noche', { method: 'POST' });
    document.getElementById('estado-noche').innerText = "Barra Abierta";
    document.getElementById('estado-noche').classList.replace('text-danger', 'text-success');
}

async function finalizarNoche() {
    // TODO: Conectar con FastAPI
    // await fetch('/api/finalizar_noche', { method: 'POST' });
    document.getElementById('estado-noche').innerText = "Barra Cerrada";
    document.getElementById('estado-noche').classList.replace('text-success', 'text-danger');
}

async function crearIngredienteMaster() {
    const nombre = document.getElementById('nuevo-ingrediente-nombre').value;
    // TODO: Validar y enviar por POST a FastAPI
    
    alert(`Ingrediente "${nombre}" agregado al maestro.`);
    document.getElementById('nuevo-ingrediente-nombre').value = ""; // Limpiar input
}

async function guardarTrago() {
    const nombre = document.getElementById('nombre-trago').value;
    const inst = document.getElementById('instrucciones-trago').value;
    // TODO: Recolectar ingredientes seleccionados y enviar por POST a FastAPI
    
    alert(`Trago "${nombre}" creado exitosamente.`);
}

async function agregarStockNoche() {
    const idIngrediente = document.getElementById('select-ingrediente-noche').value;
    const cantidad = document.getElementById('cantidad-noche').value;
    
    // TODO: Enviar por POST a FastAPI para actualizar el stock de la noche activa
    alert("Stock actualizado para esta noche.");
}