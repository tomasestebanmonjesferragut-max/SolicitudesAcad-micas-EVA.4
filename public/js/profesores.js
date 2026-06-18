document.addEventListener('DOMContentLoaded', () => {
    const contenedorProfesores = document.getElementById('contenedorProfesores');
    const btnAgregar = document.getElementById('btnAgregarProf');
    const btnEditar = document.getElementById('btnEditarProf');
    const buscador = document.getElementById('buscadorDocentes');

    // Solo se ejecuta en la página de profesores
    if (!contenedorProfesores) return;

    let db = null;
    
    // Lista de colores para darle variedad visual a las tarjetas dinámicamente
    const paletaColores = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];

    inicializarProfesores();

    async function inicializarProfesores() {
        try {
            const respuesta = await fetch('../data/db.json');
            const dbJson = await respuesta.json();
            let dbLocal = JSON.parse(localStorage.getItem('institutoDB'));

            if (!dbLocal) {
                dbLocal = dbJson;
            } else {
                dbJson.profesores.forEach(pj => {
                    if (!dbLocal.profesores.find(pl => pl.id === pj.id)) dbLocal.profesores.push(pj);
                });
                dbJson.asignaturas.forEach(aj => {
                    if (!dbLocal.asignaturas.find(al => al.id === aj.id)) dbLocal.asignaturas.push(aj);
                });
                dbJson.horarios.forEach(hj => {
                    if (!dbLocal.horarios.find(hl => hl.bloque === hj.bloque)) dbLocal.horarios.push(hj);
                });
                dbLocal.notas = dbJson.notas || [];
            }
            
            localStorage.setItem('institutoDB', JSON.stringify(dbLocal));
            db = dbLocal;
            renderizarTarjetas();
        } catch (error) {
            console.error("Error al cargar la BD:", error);
            contenedorProfesores.innerHTML = `<p class="text-danger w-100 text-center">Error al cargar la plana docente.</p>`;
        }
    }

    // Función para pintar las tarjetas. Acepta un filtro de texto para el buscador.
    function renderizarTarjetas(filtro = '') {
        contenedorProfesores.innerHTML = '';
        const textoFiltro = filtro.toLowerCase();

        // Filtramos la lista de profesores
        const profesoresFiltrados = db.profesores.filter(p => 
            p.nombre.toLowerCase().includes(textoFiltro) || 
            p.departamento.toLowerCase().includes(textoFiltro)
        );

        if (profesoresFiltrados.length === 0) {
            contenedorProfesores.innerHTML = `
                <div class="text-center py-5 w-100 fade-in">
                    <i class="bi bi-search fs-1 text-muted mb-3 d-block"></i>
                    <p class="text-muted">No se encontraron docentes que coincidan con la búsqueda.</p>
                </div>`;
            return;
        }

        profesoresFiltrados.forEach((prof, index) => {
            // Asignamos un color estético basado en su posición
            const color = paletaColores[index % paletaColores.length];

            const htmlCard = `
                <div class="col-md-6 col-lg-4 fade-in">
                    <div class="p-4 h-100 text-center d-flex flex-column" style="background: var(--glass-panel); border: 1px solid var(--glass-border); border-radius: var(--radius-lg); box-shadow: inset 0 2px 4px rgba(255,255,255,0.05);">
                        <div class="mb-3">
                            <div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm" style="width: 80px; height: 80px;">
                                <i class="bi bi-person-fill fs-1 text-${color}"></i>
                            </div>
                        </div>
                        <h5 class="fw-bold text-dark mb-1">${prof.nombre}</h5>
                        <p class="text-muted small mb-2">Dpto. de ${prof.departamento}</p>
                        <div class="mb-3">
                            <span class="badge text-bg-${color} rounded-pill">Académico</span>
                            <span class="badge text-bg-dark rounded-pill">ID: ${prof.id}</span>
                        </div>
                        <button class="btn btn-primary btn-sm mt-auto fw-bold py-2 w-100" style="border-radius: var(--radius-md);">
                            <i class="bi bi-envelope-fill me-2"></i>Contactar
                        </button>
                    </div>
                </div>
            `;
            contenedorProfesores.innerHTML += htmlCard;
        });
    }

    // ==========================================
    // BUSCADOR EN TIEMPO REAL
    // ==========================================
    buscador?.addEventListener('input', (e) => {
        renderizarTarjetas(e.target.value);
    });

    // ==========================================
    // AGREGAR NUEVO DOCENTE
    // ==========================================
    btnAgregar?.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({
            title: 'Nuevo Docente',
            html: `
                <div class="form-floating mb-3">
                    <input id="swal-nombre" class="form-control" placeholder="Ej: Dr. Juan Pérez">
                    <label>Nombre y Título</label>
                </div>
                <div class="form-floating">
                    <input id="swal-dpto" class="form-control" placeholder="Ej: Ciencias Exactas">
                    <label>Departamento Académico</label>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar Docente',
            preConfirm: () => {
                const nombre = document.getElementById('swal-nombre').value.trim();
                const dpto = document.getElementById('swal-dpto').value.trim();
                
                if (!nombre || !dpto) {
                    Swal.showValidationMessage('Por favor completa ambos campos');
                    return false;
                }
                
                return {
                    id: 'P' + Math.floor(Math.random() * 900 + 100), // Genera ID como P123
                    nombre: nombre,
                    departamento: dpto
                }
            }
        });

        if (formValues) {
            db.profesores.push(formValues);
            localStorage.setItem('institutoDB', JSON.stringify(db)); // Guardamos en la misma BD global
            renderizarTarjetas();
            Swal.fire('¡Añadido!', 'El docente se ha registrado en el sistema.', 'success');
        }
    });

    // ==========================================
    // MODIFICAR DOCENTE EXISTENTE
    // ==========================================
    btnEditar?.addEventListener('click', async () => {
        let opcionesProfesores = '';
        db.profesores.forEach(p => {
            opcionesProfesores += `<option value="${p.id}">${p.nombre}</option>`;
        });

        const { value: profId } = await Swal.fire({
            title: 'Modificar Docente',
            html: `
                <p class="text-muted small">Selecciona al docente que deseas editar:</p>
                <select id="swal-edit-prof" class="form-select mb-3">${opcionesProfesores}</select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Siguiente',
            preConfirm: () => document.getElementById('swal-edit-prof').value
        });

        if (profId) {
            const profesorAEditar = db.profesores.find(p => p.id === profId);
            const index = db.profesores.indexOf(profesorAEditar);

            const { value: formEdit } = await Swal.fire({
                title: 'Editando Perfil',
                html: `
                    <div class="form-floating mb-3">
                        <input id="edit-nombre" class="form-control" value="${profesorAEditar.nombre}">
                        <label>Nombre y Título</label>
                    </div>
                    <div class="form-floating">
                        <input id="edit-dpto" class="form-control" value="${profesorAEditar.departamento}">
                        <label>Departamento Académico</label>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                preConfirm: () => {
                    const nombre = document.getElementById('edit-nombre').value.trim();
                    const dpto = document.getElementById('edit-dpto').value.trim();
                    
                    if (!nombre || !dpto) {
                        Swal.showValidationMessage('Los campos no pueden estar vacíos');
                        return false;
                    }

                    return {
                        id: profesorAEditar.id, // Mantenemos su ID original
                        nombre: nombre,
                        departamento: dpto
                    }
                }
            });

            if (formEdit) {
                db.profesores[index] = formEdit;
                localStorage.setItem('institutoDB', JSON.stringify(db));
                
                // Si el buscador tenía algo escrito, lo mantenemos en cuenta al repintar
                renderizarTarjetas(buscador.value); 
                
                Swal.fire('¡Actualizado!', 'La información del docente ha sido modificada.', 'success');
            }
        }
    });
});