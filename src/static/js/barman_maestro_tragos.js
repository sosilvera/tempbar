document.addEventListener("DOMContentLoaded", () => {
    cargarMaestroTragos();
    configurarBuscador();
});

async function cargarMaestroTragos() {
    const contenedor = document.getElementById('lista-tragos');

    try {
        const response = await fetch('/bar/get_all_tragos');
        const tragos = await response.json();

        contenedor.innerHTML = ''; // Limpiamos el spinner

        if (tragos.length === 0) {
            contenedor.innerHTML = '<div class="alert glass-alert text-center text-muted rounded-4 p-4">No hay tragos cargados en el sistema.</div>';
            return;
        }

        tragos.forEach(trago => {
            // 1. Armar las "pastillas" (badges) de los ingredientes
            let ingredientesHTML = '';
            trago.ingredientes.forEach(ing => {
                ingredientesHTML += `
                    <span class="badge badge-ingrediente text-white-50 border border-secondary mb-1 me-1 px-3 py-2">
                        <strong class="text-white">${ing.cantidad} ${ing.unidad_medida}</strong> de ${ing.nombreIngrediente}
                    </span>
                `;
            });

            // 2. Armar la tarjeta completa con el colapsable
            const cardHTML = `
                <div class="card glass-card border-0 shadow-sm trago-item">
                    <div class="card-body p-4">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h4 class="fw-bold text-info m-0 nombre-trago">${trago.nombre}</h4>
                        </div>
                        
                        <div class="d-flex flex-wrap mb-3 data-ingredientes">
                            ${ingredientesHTML}
                        </div>

                        <button class="btn btn-sm btn-outline-info rounded-pill w-100" type="button" data-bs-toggle="collapse" data-bs-target="#instrucciones-${trago.idTrago}" aria-expanded="false" aria-controls="instrucciones-${trago.idTrago}">
                            <i class="bi bi-chevron-down"></i> Ver preparación
                        </button>

                        <div class="collapse mt-3" id="instrucciones-${trago.idTrago}">
                            <div class="p-3 bg-dark rounded-3 border border-secondary text-white-50">
                                <span class="d-block small text-uppercase tracking-wider text-info mb-2">Instrucciones</span>
                                ${trago.instrucciones}
                            </div>
                        </div>
                    </div>
                </div>
            `;

            contenedor.insertAdjacentHTML('beforeend', cardHTML);
        });

        // Cambiar el ícono del botón "Ver más" al expandir/colapsar (Detalle UX)
        configurarIconosColapso();

    } catch (error) {
        console.error("Error al cargar maestro de tragos:", error);
        contenedor.innerHTML = '<div class="alert alert-danger text-center rounded-4">Error al conectar con la base de datos.</div>';
    }
}

// Búsqueda en tiempo real
function configurarBuscador() {
    const inputBuscador = document.getElementById('buscador-tragos');
    
    inputBuscador.addEventListener('input', (e) => {
        const texto = e.target.value.toLowerCase().trim();
        const tarjetas = document.querySelectorAll('.trago-item');

        tarjetas.forEach(card => {
            const nombre = card.querySelector('.nombre-trago').innerText.toLowerCase();
            const ingredientes = card.querySelector('.data-ingredientes').innerText.toLowerCase();
            
            // Si el texto está en el nombre o en los ingredientes, se muestra
            if (nombre.includes(texto) || ingredientes.includes(texto)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
}

function configurarIconosColapso() {
    const colapsables = document.querySelectorAll('.collapse');
    
    colapsables.forEach(col => {
        col.addEventListener('show.bs.collapse', function () {
            const btn = document.querySelector(`[data-bs-target="#${this.id}"]`);
            btn.innerHTML = '<i class="bi bi-chevron-up"></i> Ocultar preparación';
        });
        
        col.addEventListener('hide.bs.collapse', function () {
            const btn = document.querySelector(`[data-bs-target="#${this.id}"]`);
            btn.innerHTML = '<i class="bi bi-chevron-down"></i> Ver preparación';
        });
    });
}