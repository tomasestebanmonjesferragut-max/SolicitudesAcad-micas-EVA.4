document.addEventListener('DOMContentLoaded', () => {
    const contenedorAnuncios = document.getElementById('contenedorAnuncios');
    const btnPublicar = document.getElementById('btnPublicarAnuncio');
    if (!contenedorAnuncios) return;

    const API_URL = 'http://localhost:3000/api';
    let db = null;

    // Verificar si es admin para mostrar el botón
    const checkAdmin = () => {
        if (localStorage.getItem('adminJHW') === 'true') {
            btnPublicar.style.display = 'block';
        } else {
            btnPublicar.style.display = 'none';
        }
    };
    
    // Escuchar cambios de admin desde script.js
    setInterval(checkAdmin, 1000); 

    inicializarAula();

    async function inicializarAula() {
        try {
            const respuesta = await fetch(`${API_URL}/db`);
            db = await respuesta.json();
            renderizarAnuncios();
        } catch (error) {
            contenedorAnuncios.innerHTML = `<p class="text-danger w-100 text-center">Error al conectar con MySQL.</p>`;
        }
    }

    function renderizarAnuncios() {
        contenedorAnuncios.innerHTML = '';
        
        if (!db.anuncios_aula || db.anuncios_aula.length === 0) {
            contenedorAnuncios.innerHTML = `<div class="text-center w-100 py-5"><i class="bi bi-inbox fs-1 text-muted d-block mb-3"></i><p class="text-muted">No hay anuncios publicados en el Aula Virtual.</p></div>`;
            return;
        }

        // Mostrar del más nuevo al más viejo
        const anunciosInvertidos = [...db.anuncios_aula].reverse();

        anunciosInvertidos.forEach(anuncio => {
            const btnEliminarHtml = localStorage.getItem('adminJHW') === 'true' 
                ? `<button class="btn btn-sm btn-outline-danger ms-3" onclick="eliminarAnuncio('${anuncio.id}')"><i class="bi bi-trash"></i> Borrar</button>` 
                : '';

            contenedorAnuncios.innerHTML += `
                <div class="col-12 mb-4 fade-in">
                    <div class="card p-4" style="border-left: 4px solid var(--accent-primary);">
                        <div class="d-flex justify-content-between align-items-start">
                            <div>
                                <span class="badge text-bg-primary mb-2">${anuncio.autor}</span>
                                <h4 class="fw-bold text-white mb-3">${anuncio.titulo}</h4>
                            </div>
                            <div class="d-flex align-items-center">
                                <small class="text-muted"><i class="bi bi-clock me-1"></i>${anuncio.fecha}</small>
                                ${btnEliminarHtml}
                            </div>
                        </div>
                        <p class="text-muted mb-0" style="white-space: pre-line;">${anuncio.contenido}</p>
                    </div>
                </div>
            `;
        });
    }

    // Lógica para el botón de "Borrar" (Inyectada globalmente para el onclick)
    window.eliminarAnuncio = async (idBuscado) => {
        Swal.fire({title: '¿Borrar anuncio?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, borrar'}).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await fetch(`${API_URL}/anuncios_aula/${idBuscado}`, { method: 'DELETE' });
                    await inicializarAula();
                    Swal.fire('Eliminado', 'Anuncio borrado de MySQL.', 'success');
                } catch(error) { Swal.fire('Error', 'Problema al borrar.', 'error'); }
            }
        });
    };

    btnPublicar?.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Anuncio',
            html: `
                <div class="form-floating mb-3"><input id="swal-titulo" class="form-control" placeholder="Título"><label>Título del Anuncio</label></div>
                <div class="form-floating mb-3"><input id="swal-autor" class="form-control" placeholder="Autor"><label>Autor (Ej: Dirección)</label></div>
                <div class="form-floating"><textarea id="swal-cont" class="form-control" style="height: 150px" placeholder="Mensaje"></textarea><label>Contenido del Mensaje</label></div>
            `,
            focusConfirm: false, showCancelButton: true, confirmButtonText: 'Publicar',
            preConfirm: () => {
                const titulo = document.getElementById('swal-titulo').value.trim();
                const autor = document.getElementById('swal-autor').value.trim();
                const cont = document.getElementById('swal-cont').value.trim();
                if (!titulo || !autor || !cont) { Swal.showValidationMessage('Completa todos los campos'); return false; }
                return { id: 'AV-' + Math.floor(Math.random() * 900 + 100), titulo: titulo, autor: autor, contenido: cont, fecha: new Intl.DateTimeFormat('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date()) }
            }
        });

        if (formValues) {
            try {
                await fetch(`${API_URL}/anuncios_aula`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formValues) });
                await inicializarAula();
                Swal.fire('¡Publicado!', 'Guardado en MySQL.', 'success');
            } catch (e) { Swal.fire('Error', 'No se pudo guardar', 'error'); }
        }
    });
});