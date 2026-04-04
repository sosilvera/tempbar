// Acá irá la lógica para fetchear a /api/noche_activa, etc.
async function abrirNoche() {
    // await fetch('/api/crear_noche', { method: 'POST' });
    document.getElementById('estado-noche').innerText = "Abierto";
    document.getElementById('estado-noche').className = "text-success";
}

async function cerrarNoche() {
    // await fetch('/api/finalizar_noche', { method: 'POST' });
    document.getElementById('estado-noche').innerText = "Cerrado";
    document.getElementById('estado-noche').className = "text-danger";
}

async function agregarStock() {
    const ingrediente = document.getElementById('select-ingrediente').value;
    const cantidad = document.getElementById('cantidad-stock').value;
    // Post a FastAPI...
    alert("Stock agregado a la noche activa");
}