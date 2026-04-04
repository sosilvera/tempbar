async function cargarPedidos() {
    // const response = await fetch('/api/get_pedidos');
    console.log("Actualizando pedidos...");
    // Renderizar tarjetas...
}

async function entregarPedido(id) {
    // await fetch(`/api/completar_pedido/${id}`, { method: 'POST' });
    alert(`Pedido ${id} entregado`);
    cargarPedidos();
}