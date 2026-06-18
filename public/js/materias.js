document.addEventListener('DOMContentLoaded', () => {
    const contenedorMaterias = document.getElementById('contenedorMaterias');
    const btnAgregar = document.getElementById('btnAgregarMateria');
    const btnEditar = document.getElementById('btnEditarMateria');

    // Solo se ejecuta en la página de materias
    if (!contenedorMaterias) return;

    let db = null;

    inicializarMaterias();

    async function inicializarMaterias() {
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
            contenedorMaterias.innerHTML = `<p class="text-danger w-100 text-center">Error al cargar las materias.</p>`;
        }
    }

    function renderizarTarjetas() {
        contenedorMaterias.innerHTML = '';

        if (db.asignaturas.length === 0) {
            contenedorMaterias.innerHTML = `<p class="text-muted text-center w-100">No hay asignaturas registradas.</p>`;
            return;
        }

        db.asignaturas.forEach(asig => {
            // Buscamos el profesor enlazado a esta asignatura
            const profesor = db.profesores.find(p => p.id === asig.profesor_id);
            const nombreProf = profesor ? profesor.nombre : 'Sin asignar';
            
            // Iconos dinámicos según color
            let icon = 'journal-bookmark';
            if(asig.color === 'primary') icon = 'laptop';
            if(asig.color === 'success') icon = 'calculator';
            if(asig.color === 'info') icon = 'diagram-3';
            if(asig.color === 'warning') icon = 'shield-lock';
            if(asig.color === 'danger') icon = 'bug';

            // Como no tenemos el % en la BD, generamos uno aleatorio visual o estático
            const progreso = Math.floor(Math.random() * 60) + 20; 

            const htmlCard = `
                <div class="col-md-6 col-lg-4 fade-in">
                    <div class="card h-100 p-0 overflow-hidden" style="border-top: 4px solid var(--accent-${asig.color});">
                        <div class="p-4 border-bottom" style="border-color: var(--glass-border) !important;">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <span class="badge text-bg-secondary">Código: ${asig.codigo}</span>
                                <i class="bi bi-${icon} fs-3 text-${asig.color}"></i>
                            </div>
                            <h4 class="fw-bold mt-3 mb-1">${asig.nombre}</h4>
                            <p class="text-muted small mb-0"><i class="bi bi-person-circle me-1"></i> ${nombreProf}</p>
                        </div>
                        <div class="p-4 bg-transparent">
                            <div class="d-flex justify-content-between text-muted small mb-2">
                                <span>Progreso del Temario</span>
                                <span class="fw-bold text-${asig.color}">${progreso}%</span>
                            </div>
                            <div class="progress mb-4">
                                <div class="progress-bar bg-${asig.color}" role="progressbar" style="width: ${progreso}%"></div>
                            </div>
                            <button class="btn btn-secondary w-100">
                                <i class="bi bi-box-arrow-in-right me-2"></i>Aula Virtual
                            </button>
                        </div>
                    </div>
                </div>
            `;
            contenedorMaterias.innerHTML += htmlCard;
        });
    }


    // AGREGAR NUEVA MATERIA
    btnAgregar?.addEventListener('click', async () => {
        let opcionesProfesores = '';
        db.profesores.forEach(p => {
            opcionesProfesores += `<option value="${p.id}">${p.nombre}</option>`;
        });

        const { value: formValues } = await Swal.fire({
            title: 'Nueva Asignatura',
            html: `
                <div class="form-floating mb-3">
                    <input id="swal-cod" class="form-control" placeholder="Ej: MAT-101">
                    <label>Código de Asignatura</label>
                </div>
                <div class="form-floating mb-3">
                    <input id="swal-nom" class="form-control" placeholder="Nombre">
                    <label>Nombre de la Asignatura</label>
                </div>
                <div class="form-floating mb-3">
                    <select id="swal-prof" class="form-select">${opcionesProfesores}</select>
                    <label>Profesor Asignado</label>
                </div>
                <div class="form-floating">
                    <select id="swal-color" class="form-select">
                        <option value="primary">Azul (Primary)</option>
                        <option value="success">Verde (Success)</option>
                        <option value="info">Celeste (Info)</option>
                        <option value="warning">Amarillo (Warning)</option>
                        <option value="danger">Rojo (Danger)</option>
                    </select>
                    <label>Color de Etiqueta</label>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: 'Guardar',
            preConfirm: () => {
                return {
                    id: 'A' + Math.floor(Math.random() * 900 + 100),
                    codigo: document.getElementById('swal-cod').value,
                    nombre: document.getElementById('swal-nom').value,
                    profesor_id: document.getElementById('swal-prof').value,
                    color: document.getElementById('swal-color').value
                }
            }
        });

        if (formValues && formValues.nombre !== "") {
            db.asignaturas.push(formValues);
            localStorage.setItem('institutoDB', JSON.stringify(db));
            renderizarTarjetas();
            Swal.fire('¡Añadida!', 'La asignatura se guardó correctamente.', 'success');
        }
    });

    // MODIFICAR MATERIA EXISTENTE
    btnEditar?.addEventListener('click', async () => {
        let opcionesAsignaturas = '';
        db.asignaturas.forEach(a => {
            opcionesAsignaturas += `<option value="${a.id}">${a.codigo} - ${a.nombre}</option>`;
        });

        const { value: asigId } = await Swal.fire({
            title: 'Modificar Asignatura',
            html: `
                <p class="text-muted small">Selecciona la materia que deseas editar:</p>
                <select id="swal-edit-asig" class="form-select mb-3">${opcionesAsignaturas}</select>
            `,
            showCancelButton: true,
            confirmButtonText: 'Siguiente',
            preConfirm: () => document.getElementById('swal-edit-asig').value
        });

        if (asigId) {
            const materiaAEditar = db.asignaturas.find(a => a.id === asigId);
            const index = db.asignaturas.indexOf(materiaAEditar);
            
            let opcionesProfesores = '';
            db.profesores.forEach(p => {
                const selected = p.id === materiaAEditar.profesor_id ? 'selected' : '';
                opcionesProfesores += `<option value="${p.id}" ${selected}>${p.nombre}</option>`;
            });

            const { value: formEdit } = await Swal.fire({
                title: 'Editando: ' + materiaAEditar.codigo,
                html: `
                    <div class="form-floating mb-3">
                        <input id="edit-nom" class="form-control" value="${materiaAEditar.nombre}">
                        <label>Nombre de la Asignatura</label>
                    </div>
                    <div class="form-floating mb-3">
                        <select id="edit-prof" class="form-select">${opcionesProfesores}</select>
                        <label>Profesor Asignado</label>
                    </div>
                    <div class="form-floating">
                        <select id="edit-color" class="form-select">
                            <option value="primary" ${materiaAEditar.color === 'primary' ? 'selected' : ''}>Azul</option>
                            <option value="success" ${materiaAEditar.color === 'success' ? 'selected' : ''}>Verde</option>
                            <option value="warning" ${materiaAEditar.color === 'warning' ? 'selected' : ''}>Amarillo</option>
                            <option value="danger" ${materiaAEditar.color === 'danger' ? 'selected' : ''}>Rojo</option>
                        </select>
                        <label>Color</label>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Actualizar',
                preConfirm: () => {
                    return {
                        id: materiaAEditar.id,
                        codigo: materiaAEditar.codigo,
                        nombre: document.getElementById('edit-nom').value,
                        profesor_id: document.getElementById('edit-prof').value,
                        color: document.getElementById('edit-color').value
                    }
                }
            });

            if (formEdit) {
                db.asignaturas[index] = formEdit;
                localStorage.setItem('institutoDB', JSON.stringify(db));
                renderizarTarjetas();
                Swal.fire('¡Actualizado!', 'La materia ha sido modificada.', 'success');
            }
        }
    });
});