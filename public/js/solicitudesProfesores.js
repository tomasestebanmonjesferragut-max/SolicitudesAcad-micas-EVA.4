document.addEventListener('DOMContentLoaded', () => {
    const tablaSoporte = document.getElementById('tablaSoporte');
    if (!tablaSoporte) return;

    let db = null;
    inicializarSistema();

    async function inicializarSistema() {
        try {
            const respuesta = await fetch('../data/db.json');
            const dbJson = await respuesta.json();
            let dbLocal = JSON.parse(localStorage.getItem('institutoDB'));

            if (!dbLocal) { dbLocal = dbJson; } 
            else {
                if (!dbLocal.solicitudes_profesores) dbLocal.solicitudes_profesores = [];
                if (dbJson.solicitudes_profesores) {
                    dbJson.solicitudes_profesores.forEach(sj => {
                        if (!dbLocal.solicitudes_profesores.find(sl => sl.id === sj.id)) {
                            dbLocal.solicitudes_profesores.push(sj);
                        }
                    });
                }
            }
            
            localStorage.setItem('institutoDB', JSON.stringify(dbLocal));
            db = dbLocal;
            new GestorSoporte(); 
        } catch (error) {
            tablaSoporte.innerHTML = `<tr><td colspan="5" class="text-danger text-center py-4">Error al cargar la base de datos. Usa Live Server.</td></tr>`;
        }
    }

    class GestorSoporte {
        constructor() {
            this.tabla = tablaSoporte;
            this.panelContenido = document.getElementById('panelContenido');
            this.initEvents();
            this.actualizarTabla();
        }

        guardarDatos() {
            localStorage.setItem('institutoDB', JSON.stringify(db));
            this.actualizarTabla();
        }

        actualizarTabla(filtro = '') {
            this.tabla.innerHTML = '';
            
            if (!db.solicitudes_profesores || db.solicitudes_profesores.length === 0) {
                this.tabla.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No hay reportes técnicos activos.</td></tr>`;
                return;
            }

            const textoFiltro = filtro.toLowerCase();
            
            db.solicitudes_profesores.forEach((ticket) => {
                const { id, profesor, ubicacion, problema, prioridad, fecha } = ticket;

                if (profesor.toLowerCase().includes(textoFiltro) || id.toLowerCase().includes(textoFiltro)) {
                    let badgeClass = 'text-bg-info text-white';
                    if(prioridad === 'Alta') badgeClass = 'text-bg-danger';
                    if(prioridad === 'Media') badgeClass = 'text-bg-warning';
                    
                    const fila = document.createElement('tr');
                    fila.className = 'fade-in';
                    fila.style.cursor = 'pointer'; // Cambia el cursor a una mano
                    fila.title = 'Haz clic para leer el reporte completo';
                    
                    fila.innerHTML = `
                        <td><span class="badge badge-id">#${id}</span></td>
                        <td><strong class="d-block">${profesor}</strong><small class="text-muted"><i class="bi bi-geo-alt-fill me-1"></i>${ubicacion}</small></td>
                        <td style="max-width: 250px;">
                            <span class="text-truncate d-block text-muted">
                                <i class="bi bi-chat-right-dots me-2 text-primary"></i>${problema}
                            </span>
                        </td>
                        <td><span class="badge rounded-pill ${badgeClass}">${prioridad}</span></td>
                        <td class="text-muted small">${fecha}</td>
                    `;
                    
                    // Evento CLIC para ver los detalles en grande
                    fila.addEventListener('click', () => this.verDetalles(ticket, badgeClass));
                    
                    this.tabla.appendChild(fila);
                }
            });
        }

        // NUEVA FUNCIÓN: Muestra la información en grande
        verDetalles(ticket, badgeClass) {
            Swal.fire({
                title: `<i class="bi bi-pc-display-horizontal text-danger me-2"></i>Detalles del Reporte`,
                html: `
                    <div class="text-start mt-3 px-2">
                        <div class="d-flex justify-content-between border-bottom pb-2 mb-3">
                            <h5 class="fw-bold m-0 text-white">${ticket.profesor}</h5>
                            <span class="badge badge-id fs-6">#${ticket.id}</span>
                        </div>
                        <p class="mb-2"><strong class="text-danger"><i class="bi bi-geo-alt-fill me-2"></i>Ubicación:</strong> <span class="text-muted">${ticket.ubicacion}</span></p>
                        <p class="mb-2"><strong class="text-danger"><i class="bi bi-calendar-event me-2"></i>Fecha del Reporte:</strong> <span class="text-muted">${ticket.fecha}</span></p>
                        <p class="mb-3"><strong class="text-danger"><i class="bi bi-exclamation-triangle-fill me-2"></i>Prioridad:</strong> <span class="badge ${badgeClass}">${ticket.prioridad}</span></p>
                        
                        <div class="mt-4 p-3 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);">
                            <strong class="text-danger d-block mb-2"><i class="bi bi-chat-quote me-2"></i>Descripción del Problema:</strong>
                            <p class="fst-italic text-muted m-0">"${ticket.problema}"</p>
                        </div>
                    </div>
                `,
                width: '600px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#ef4444', // Botón rojo a juego con el soporte técnico
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
            });
        }

        mostrarFormularioRegistro() {
            let opcionesProf = '<option value="" disabled selected>Seleccione al Docente...</option>';
            if (db.profesores && db.profesores.length > 0) {
                db.profesores.forEach(p => {
                    opcionesProf += `<option value="${p.nombre}">${p.nombre} (${p.departamento})</option>`;
                });
            }

            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-primary">Reportar Incidencia</h5>
                    <form id="formRegistro">
                        <div class="form-floating mb-3">
                            <select id="prof" class="form-select" required>${opcionesProf}</select>
                            <label>Profesor Solicitante</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="text" id="ubi" class="form-control" placeholder="Ubicación" required>
                            <label>Aula o Laboratorio (Ej: Lab Redes)</label>
                        </div>
                        <div class="form-floating mb-3">
                            <textarea id="prob" class="form-control" placeholder="Problema" style="height: 100px" required></textarea>
                            <label>Descripción detallada del Problema</label>
                        </div>
                        <div class="form-floating mb-4">
                            <select id="prio" class="form-select">
                                <option value="Baja">Prioridad Baja (Mantenimiento)</option>
                                <option value="Media">Prioridad Media (Molestia Menor)</option>
                                <option value="Alta">Prioridad Alta (Impide dar clases)</option>
                            </select>
                            <label>Nivel de Urgencia</label>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2"><i class="bi bi-send-fill me-2"></i>Enviar Reporte</button>
                    </form>
                </div>`;

            document.getElementById('formRegistro').addEventListener('submit', (e) => {
                e.preventDefault();
                db.solicitudes_profesores.push({
                    id: 'SOP-' + Math.floor(Math.random() * 900 + 100),
                    profesor: document.getElementById('prof').value,
                    ubicacion: document.getElementById('ubi').value.trim(),
                    problema: document.getElementById('prob').value.trim(),
                    prioridad: document.getElementById('prio').value,
                    fecha: new Intl.DateTimeFormat('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date())
                });
                this.guardarDatos();
                this.panelContenido.innerHTML = '';
                Swal.fire('Ticket Enviado', 'Soporte técnico ha sido notificado.', 'success');
            });
        }

        mostrarFormularioModificar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-warning">Ajustar Prioridad</h5>
                    <div class="form-floating mb-3">
                        <input type="text" id="idMod" class="form-control" placeholder="ID">
                        <label>Ticket ID (Ej: SOP-101)</label>
                    </div>
                    <div class="form-floating mb-4">
                        <select id="nuevaPrio" class="form-select">
                            <option value="Alta">Alta</option>
                            <option value="Media">Media</option>
                            <option value="Baja">Baja</option>
                        </select>
                        <label>Nueva Prioridad</label>
                    </div>
                    <button id="confirmarMod" class="btn btn-warning w-100 py-2 text-white"><i class="bi bi-arrow-clockwise me-2"></i>Actualizar</button>
                </div>`;

            document.getElementById('confirmarMod').addEventListener('click', () => {
                const idBuscado = document.getElementById('idMod').value.trim().toUpperCase();
                const index = db.solicitudes_profesores.findIndex(s => s.id === idBuscado);
                
                if (index !== -1) {
                    db.solicitudes_profesores[index].prioridad = document.getElementById('nuevaPrio').value;
                    this.guardarDatos();
                    this.panelContenido.innerHTML = '';
                    Swal.fire('Actualizado', 'Prioridad de soporte modificada.', 'success');
                } else {
                    Swal.fire('Error', 'No se encontró el Ticket.', 'error');
                }
            });
        }

        mostrarFormularioEliminar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-success">Marcar como Resuelto</h5>
                    <div class="form-floating mb-4">
                        <input type="text" id="idEliminar" class="form-control" placeholder="ID">
                        <label>Ticket ID (Ej: SOP-101)</label>
                    </div>
                    <button id="confirmarEliminar" class="btn btn-success w-100 py-2"><i class="bi bi-check-circle-fill me-2"></i>Cerrar Ticket</button>
                </div>`;

            document.getElementById('confirmarEliminar').addEventListener('click', () => {
                const idBuscado = document.getElementById('idEliminar').value.trim().toUpperCase();
                const index = db.solicitudes_profesores.findIndex(s => s.id === idBuscado);
                
                if (index !== -1) {
                    Swal.fire({
                        title: '¿Problema resuelto?', 
                        text: "Esto cerrará y borrará el ticket.", 
                        icon: 'info', 
                        showCancelButton: true, 
                        confirmButtonColor: '#10b981', 
                        confirmButtonText: 'Sí, cerrar', 
                        cancelButtonText: 'Cancelar'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            db.solicitudes_profesores.splice(index, 1);
                            this.guardarDatos();
                            this.panelContenido.innerHTML = '';
                            Swal.fire('Excelente', 'Incidencia técnica resuelta.', 'success');
                        }
                    });
                } else {
                    Swal.fire('Error', 'Ticket no encontrado.', 'error');
                }
            });
        }

        initEvents() {
            document.getElementById('btnRegistrar')?.addEventListener('click', () => this.mostrarFormularioRegistro());
            document.getElementById('btnModificar')?.addEventListener('click', () => this.mostrarFormularioModificar());
            document.getElementById('btnEliminar')?.addEventListener('click', () => this.mostrarFormularioEliminar());
            document.getElementById('buscador')?.addEventListener('input', (e) => this.actualizarTabla(e.target.value));
        }
    }
});