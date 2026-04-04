const modal = new bootstrap.Modal(document.getElementById('pedidoModal'));
function abrirModalPedido(idTrago, nombreTrago) {
    document.getElementById('modalTragoNombre').innerText = `Pedir: ${nombreTrago}`;
    document.getElementById('inputIdTrago').value = idTrago;
    modal.show();
}

async function enviarPedido() {
    const idTrago = document.getElementById('inputIdTrago').value;
    const nombre = document.getElementById('inputNombreCliente').value;
    
    if(!nombre) { alert("¡Poné tu nombre para que sepa de quién es!"); return; }
    // Llamada al servicio que armamos en api.py
    const response = await fetch(`/api/crear_pedido?idTrago=${idTrago}&nombre=${nombre}`, { method: 'POST' });
    if(response.ok) {
        alert("¡Pedido enviado! Preparando...");
        modal.hide();
    } else {
        alert("Uy, hubo un problema. ¿La barra está abierta?");
    }
}