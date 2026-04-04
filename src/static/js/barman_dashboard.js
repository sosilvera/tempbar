document.addEventListener("DOMContentLoaded", async () => {
    await inicializarDashboard();
});

async function inicializarDashboard() {
    // Revisar si ya tenemos la noche en la caché (sessionStorage)
    const nocheCacheada = sessionStorage.getItem('idNoche');

    if (nocheCacheada && parseInt(nocheCacheada) > 0) {
        console.log("Noche activa encontrada en caché.");
        aplicarEstadoNocheActiva(true);
    } else {
        // Si no está en caché, le pegamos a la API
        try {
            console.log("Consultando estado de la noche a la API...");
            const response = await fetch('/bar/noche_activa'); 
            const data = await response.json();

            if (data.value && data.value > 0) {
                // Hay noche activa: Guardamos en caché y habilitamos botones
                sessionStorage.setItem('idNoche', data.value);
                aplicarEstadoNocheActiva(true);
            } else {
                // No hay noche activa: Limpiamos caché (por si acaso) y bloqueamos botones
                sessionStorage.removeItem('idNoche');
                aplicarEstadoNocheActiva(false);
            }
        } catch (error) {
            console.error("Error al consultar /noche_activa:", error);
            document.getElementById('badge-estado').innerText = "Error de Conexión";
            document.getElementById('badge-estado').className = "badge bg-danger p-2";
        }
    }
}

function aplicarEstadoNocheActiva(activa) {
    // Referencias a los botones que cambian de estado según la noche
    const btnPedidos = document.getElementById('btn-pedidos');
    const btnCrearNoche = document.getElementById('btn-crear-noche');
    const btnModificarNoche = document.getElementById('btn-modificar-noche');
    const btnFinalizarNoche = document.getElementById('btn-finalizar-noche');
    const badgeEstado = document.getElementById('badge-estado');

    if (activa) {
        // Lógica: HAY noche activa
        btnPedidos.disabled = false;
        btnModificarNoche.disabled = false;
        btnFinalizarNoche.disabled = false;
        
        btnCrearNoche.disabled = true; // No se puede crear si ya hay una abierta

        badgeEstado.innerText = "Barra Abierta";
        badgeEstado.className = "badge bg-success p-2 text-white shadow-sm";
    } else {
        // Lógica: NO hay noche activa
        btnPedidos.disabled = true;
        btnModificarNoche.disabled = true;
        btnFinalizarNoche.disabled = true;
        
        btnCrearNoche.disabled = false; // Se habilita para poder abrir la barra

        badgeEstado.innerText = "Barra Cerrada";
        badgeEstado.className = "badge bg-danger p-2 text-white shadow-sm";
    }
    
    // Nota: "Crear Trago" y "ABM Ingredientes" siempre están habilitados, 
    // porque podés cargar stock maestro o recetas nuevas aunque la barra esté cerrada.
}

async function finalizarNoche() {
    if (!confirm("¿Estás seguro de que querés finalizar la noche? Ya no se recibirán más pedidos.")) {
        return;
    }

    const btnFinalizar = document.getElementById('btn-finalizar-noche');
    btnFinalizar.innerText = "Cerrando...";
    btnFinalizar.disabled = true;

    try {
        // Llamada a la API para cerrar la noche (Asumo POST por ser una acción de escritura)
        const response = await fetch('/bar/finalizar_noche', {
            method: 'POST'
        });

        if (response.ok) {
            // 1. Limpiar caché
            sessionStorage.removeItem('idNoche');
            
            // 2. Recargar a la ruta indicada
            window.location.href = '/tempbar/barman';
        } else {
            alert("Hubo un error al intentar finalizar la noche.");
            btnFinalizar.innerText = "Finalizar Noche";
            btnFinalizar.disabled = false;
        }
    } catch (error) {
        console.error("Error al finalizar la noche:", error);
        alert("Problemas de conexión al cerrar la barra.");
        btnFinalizar.innerText = "Finalizar Noche";
        btnFinalizar.disabled = false;
    }
}