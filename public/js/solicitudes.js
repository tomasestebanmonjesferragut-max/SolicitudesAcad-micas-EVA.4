document.addEventListener('DOMContentLoaded', () => {
    const tablaSolicitudes = document.getElementById('tablaSolicitudes');
    if (!tablaSolicitudes) return;

    let db = null;

    // Inicializamos cargando la base de datos global unificada
    inicializarSistema();

    async function inicializarSistema() {
        try {
            const respuesta = await fetch('../data/db.json');
            const dbJson = await respuesta.json();
            let dbLocal = JSON.parse(localStorage.getItem('institutoDB'));

            if (!dbLocal) {
                dbLocal = dbJson; 
            } else {
                // Sincronización Automática Inteligente
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
                
                // NUEVO: Sincronizar las solicitudes de prueba del db.json
                if (!dbLocal.solicitudes) dbLocal.solicitudes = [];
                if (dbJson.solicitudes) {
                    dbJson.solicitudes.forEach(sj => {
                        // Si el ticket del JSON no existe en la memoria, lo agrega
                        if (!dbLocal.solicitudes.find(sl => sl.id === sj.id)) {
                            dbLocal.solicitudes.push(sj);
                        }
                    });
                }
            }
            
            // Guardar y arrancar
            localStorage.setItem('institutoDB', JSON.stringify(dbLocal));
            db = dbLocal;
            
            // Iniciar el gestor (esto dibuja la tabla en pantalla)
            new GestorSolicitudes(); 
            
        } catch (error) {
            console.error("Error al cargar la BD:", error);
            tablaSolicitudes.innerHTML = `<tr><td colspan="6" class="text-danger text-center py-4">Error al cargar la base de datos. Recuerda usar Live Server.</td></tr>`;
        }
    }

    class GestorSolicitudes {
        constructor() {
            this.tabla = tablaSolicitudes;
            this.panelContenido = document.getElementById('panelContenido');
            this.initEvents();
            this.actualizarTabla();
        }

        guardarDatos() {
            localStorage.setItem('institutoDB', JSON.stringify(db));
            this.actualizarTabla();
        }

        obtenerFechaActual() {
            return new Intl.DateTimeFormat('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date());
        }

        actualizarTabla(filtro = '') {
            this.tabla.innerHTML = '';
            
            if (!db.solicitudes || db.solicitudes.length === 0) {
                this.tabla.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <i class="bi bi-inbox text-muted fs-1 d-block mb-2"></i>
                            <p class="text-muted mb-0">No hay solicitudes registradas en este momento.</p>
                        </td>
                    </tr>`;
                return;
            }

            const textoFiltro = filtro.toLowerCase();

            db.solicitudes.forEach((solicitud) => {
                const { id, nombre, correo, asignatura, tipo, prioridad, fecha } = solicitud;

                if (nombre.toLowerCase().includes(textoFiltro) || id.toString().includes(textoFiltro)) {
                    const badgeClass = 
                        prioridad === 'Alta' ? 'text-bg-danger' : 
                        prioridad === 'Media' ? 'text-bg-warning' : 
                        'text-bg-info text-white';

                    const fila = document.createElement('tr');
                    fila.className = 'fade-in';
                    fila.innerHTML = `
                        <td><span class="badge badge-id">#${id}</span></td>
                        <td>
                            <strong class="d-block text-truncate" style="max-width: 200px;">${nombre}</strong>
                            <small class="text-muted">${correo}</small>
                        </td>
                        <td><span class="fw-medium">${asignatura}</span></td>
                        <td>${tipo}</td>
                        <td><span class="badge rounded-pill ${badgeClass}">${prioridad}</span></td>
                        <td class="text-muted small">${fecha}</td>
                    `;
                    this.tabla.appendChild(fila);
                }
            });
        }

        mostrarFormularioRegistro() {
            let opcionesAsig = '<option value="" disabled selected>Selecciona la asignatura...</option>';
            if (db.asignaturas && db.asignaturas.length > 0) {
                db.asignaturas.forEach(a => {
                    opcionesAsig += `<option value="${a.nombre}">${a.codigo} - ${a.nombre}</option>`;
                });
            } else {
                opcionesAsig += `<option value="General">Asunto General</option>`;
            }

            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-primary">Nueva Solicitud</h5>
                    <form id="formRegistro" class="needs-validation">
                        <div class="form-floating mb-3">
                            <input type="text" id="nom" class="form-control" placeholder="Nombre" required>
                            <label for="nom">Nombre completo</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="email" id="corr" class="form-control" placeholder="Correo" required>
                            <label for="corr">Correo institucional</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select id="asig" class="form-select" required>
                                ${opcionesAsig}
                            </select>
                            <label for="asig">Asignatura</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select id="tip" class="form-select" required>
                                <option value="" disabled selected>Selecciona una opción...</option>
                                <option value="Revisión de nota">Revisión de nota</option>
                                <option value="Justificación">Justificación</option>
                                <option value="Certificado">Certificado</option>
                                <option value="Otro">Otro</option>
                            </select>
                            <label for="tip">Tipo de solicitud</label>
                        </div>
                        <div class="form-floating mb-4">
                            <select id="prio" class="form-select">
                                <option value="Baja">Prioridad Baja</option>
                                <option value="Media">Prioridad Media</option>
                                <option value="Alta">Prioridad Alta</option>
                            </select>
                            <label for="prio">Nivel de prioridad</label>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2 fw-semibold shadow-sm">
                            <i class="bi bi-save me-2"></i>Registrar Solicitud
                        </button>
                    </form>
                </div>
            `;

            document.getElementById('formRegistro').addEventListener('submit', (e) => {
                e.preventDefault();
                
                const nuevaSolicitud = {
                    id: crypto.randomUUID().slice(0, 5).toUpperCase(),
                    nombre: document.getElementById('nom').value.trim(),
                    correo: document.getElementById('corr').value.trim(),
                    asignatura: document.getElementById('asig').value,
                    tipo: document.getElementById('tip').value,
                    prioridad: document.getElementById('prio').value,
                    fecha: this.obtenerFechaActual()
                };
                
                db.solicitudes.push(nuevaSolicitud);
                this.guardarDatos();
                this.panelContenido.innerHTML = '';
                
                Swal.fire({
                    title: '¡Registrado!',
                    text: 'La solicitud ha sido guardada con éxito.',
                    icon: 'success',
                    confirmButtonColor: '#4f46e5'
                });
            });
        }

        mostrarFormularioModificar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-warning">Modificar Prioridad</h5>
                    <div class="form-floating mb-3">
                        <input type="text" id="idMod" class="form-control" placeholder="ID">
                        <label for="idMod">ID de la solicitud (Ej: 1A2B3)</label>
                    </div>
                    <div class="form-floating mb-4">
                        <select id="nuevaPrio" class="form-select">
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                        </select>
                        <label for="nuevaPrio">Nueva Prioridad</label>
                    </div>
                    <button id="confirmarMod" class="btn btn-warning w-100 py-2 fw-semibold shadow-sm">
                        <i class="bi bi-arrow-clockwise me-2"></i>Actualizar Estado
                    </button>
                </div>
            `;

            document.getElementById('confirmarMod').addEventListener('click', () => {
                const idBuscado = document.getElementById('idMod').value.trim().toUpperCase();
                const index = db.solicitudes.findIndex(s => s.id === idBuscado);

                if (index !== -1) {
                    db.solicitudes[index].prioridad = document.getElementById('nuevaPrio').value;
                    this.guardarDatos();
                    this.panelContenido.innerHTML = '';
                    Swal.fire({
                        title: 'Actualizado', 
                        text: 'La prioridad ha sido modificada.', 
                        icon: 'info',
                        confirmButtonColor: '#4f46e5'
                    });
                } else {
                    Swal.fire('Error', 'No se encontró ninguna solicitud con ese ID.', 'error');
                }
            });
        }

        mostrarFormularioEliminar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-danger">Eliminar Solicitud</h5>
                    <div class="form-floating mb-4">
                        <input type="text" id="idEliminar" class="form-control" placeholder="ID a eliminar">
                        <label for="idEliminar">ID de la solicitud</label>
                    </div>
                    <button id="confirmarEliminar" class="btn btn-danger w-100 py-2 fw-semibold shadow-sm">
                        <i class="bi bi-trash me-2"></i>Eliminar Definitivamente
                    </button>
                </div>
            `;

            document.getElementById('confirmarEliminar').addEventListener('click', () => {
                const idBuscado = document.getElementById('idEliminar').value.trim().toUpperCase();
                const index = db.solicitudes.findIndex(s => s.id === idBuscado);

                if (index !== -1) {
                    Swal.fire({
                        title: '¿Estás seguro?',
                        text: "Esta acción no se puede deshacer",
                        icon: 'warning',
                        showCancelButton: true,
                        confirmButtonColor: '#dc3545',
                        cancelButtonColor: '#6c757d',
                        confirmButtonText: 'Sí, eliminar',
                        cancelButtonText: 'Cancelar',
                        reverseButtons: true
                    }).then((result) => {
                        if (result.isConfirmed) {
                            db.solicitudes.splice(index, 1);
                            this.guardarDatos();
                            this.panelContenido.innerHTML = '';
                            Swal.fire('Eliminada', 'La solicitud ha sido borrada.', 'success');
                        }
                    });
                } else {
                    Swal.fire('Error', 'No se encontró ninguna solicitud con ese ID.', 'error');
                }
            });
        }

        initEvents() {
            document.getElementById('btnRegistrar')?.addEventListener('click', () => this.mostrarFormularioRegistro());
            document.getElementById('btnModificar')?.addEventListener('click', () => this.mostrarFormularioModificar());
            document.getElementById('btnEliminar')?.addEventListener('click', () => this.mostrarFormularioEliminar());
            
            document.getElementById('buscador')?.addEventListener('input', (e) => {
                this.actualizarTabla(e.target.value);
            });
        }
    }
});