document.addEventListener('DOMContentLoaded', () => {
    const tablaSolicitudes = document.getElementById('tablaSolicitudes');
    if (!tablaSolicitudes) return;

    let db = null;
    inicializarSistema();

    async function inicializarSistema() {
        try {
            const respuesta = await fetch('../data/db.json');
            const dbJson = await respuesta.json();
            let dbLocal = JSON.parse(localStorage.getItem('institutoDB'));

            // 🌟 TRUCO MÁGICO PARA LIMPIAR EL CACHÉ AUTOMÁTICAMENTE 🌟
            // Si detecta que hay datos viejos (usando "especialidad"), fuerza el reseteo
            if (dbLocal && dbLocal.solicitudes_estudiantes && dbLocal.solicitudes_estudiantes.length > 0) {
                if (dbLocal.solicitudes_estudiantes[0].especialidad !== undefined) {
                    console.log("Base de datos antigua detectada. Limpiando y actualizando...");
                    dbLocal = null; // Esto obliga a cargar el JSON fresco
                }
            }

            if (!dbLocal) { 
                dbLocal = dbJson; 
            } 
            else {
                if (!dbLocal.solicitudes_estudiantes) dbLocal.solicitudes_estudiantes = [];
                if (dbJson.solicitudes_estudiantes) {
                    dbJson.solicitudes_estudiantes.forEach(sj => {
                        if (!dbLocal.solicitudes_estudiantes.find(sl => sl.id === sj.id)) {
                            dbLocal.solicitudes_estudiantes.push(sj);
                        }
                    });
                }
            }
            
            localStorage.setItem('institutoDB', JSON.stringify(dbLocal));
            db = dbLocal;
            new GestorPostulaciones(); 
        } catch (error) {
            console.error("Error cargando BD:", error);
            tablaSolicitudes.innerHTML = `<tr><td colspan="5" class="text-danger text-center py-4">Error al cargar la base de datos. Usa Live Server.</td></tr>`;
        }
    }

    class GestorPostulaciones {
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

        actualizarTabla(filtro = '') {
            this.tabla.innerHTML = '';
            if (!db.solicitudes_estudiantes || db.solicitudes_estudiantes.length === 0) {
                this.tabla.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No hay postulaciones registradas.</td></tr>`;
                return;
            }

            const textoFiltro = filtro.toLowerCase();
            db.solicitudes_estudiantes.forEach((solicitud) => {
                const { id, nombre, correo, fecha_nacimiento, anio_postulacion, motivacion, estado, fecha } = solicitud;
                const comentario = motivacion || "Sin comentarios adicionales.";

                if (nombre.toLowerCase().includes(textoFiltro) || id.toLowerCase().includes(textoFiltro)) {
                    const badgeClass = estado === 'Aceptado' ? 'text-bg-success' : estado === 'Rechazado' ? 'text-bg-danger' : 'text-bg-warning';
                    
                    const fila = document.createElement('tr');
                    fila.className = 'fade-in';
                    fila.style.cursor = 'pointer'; 
                    fila.title = 'Haz clic para ver detalles';
                    
                    fila.innerHTML = `
                        <td><span class="badge badge-id">#${id}</span></td>
                        <td>
                            <strong class="d-block">${nombre}</strong>
                            <small class="text-muted">${correo}</small>
                        </td>
                        <td>
                            <span class="fw-medium d-block">${anio_postulacion}</span>
                            <small class="text-muted text-truncate d-block" style="max-width: 200px;">
                                <i class="bi bi-chat-left-text me-1"></i>${comentario}
                            </small>
                        </td>
                        <td><span class="badge rounded-pill ${badgeClass}">${estado}</span></td>
                        <td class="text-muted small">${fecha}</td>
                    `;
                    
                    fila.addEventListener('click', () => this.verDetalles(solicitud, badgeClass));
                    
                    this.tabla.appendChild(fila);
                }
            });
        }

        verDetalles(solicitud, badgeClass) {
            const comentario = solicitud.motivacion || "Sin comentarios adicionales.";
            const fechaNac = solicitud.fecha_nacimiento || "No registrada";
            
            Swal.fire({
                title: `<i class="bi bi-person-vcard text-primary me-2"></i>Detalle de Postulación`,
                html: `
                    <div class="text-start mt-3 px-2">
                        <div class="d-flex justify-content-between border-bottom pb-2 mb-3">
                            <h5 class="fw-bold m-0 text-white">${solicitud.nombre}</h5>
                            <span class="badge badge-id fs-6">#${solicitud.id}</span>
                        </div>
                        <p class="mb-2"><strong class="text-primary"><i class="bi bi-envelope me-2"></i>Correo:</strong> <span class="text-muted">${solicitud.correo}</span></p>
                        <p class="mb-2"><strong class="text-primary"><i class="bi bi-calendar-date me-2"></i>Fecha Nacimiento:</strong> <span class="text-muted">${fechaNac}</span></p>
                        <p class="mb-2"><strong class="text-primary"><i class="bi bi-award me-2"></i>Año al que postula:</strong> <span class="text-muted">${solicitud.anio_postulacion}</span></p>
                        <p class="mb-2"><strong class="text-primary"><i class="bi bi-calendar-check me-2"></i>Fecha Inscripción:</strong> <span class="text-muted">${solicitud.fecha}</span></p>
                        <p class="mb-3"><strong class="text-primary"><i class="bi bi-info-circle me-2"></i>Estado:</strong> <span class="badge ${badgeClass}">${solicitud.estado}</span></p>
                        
                        <div class="mt-4 p-3 rounded" style="background: rgba(255,255,255,0.05); border: 1px solid var(--glass-border);">
                            <strong class="text-primary d-block mb-2"><i class="bi bi-chat-quote me-2"></i>Motivación del postulante:</strong>
                            <p class="fst-italic text-muted m-0">"${comentario}"</p>
                        </div>
                    </div>
                `,
                width: '600px',
                confirmButtonText: 'Cerrar',
                confirmButtonColor: '#3b82f6',
                background: 'var(--bg-secondary)',
                color: 'var(--text-secondary)'
            });
        }

        mostrarFormularioRegistro() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-primary">Ingresar Postulante</h5>
                    <form id="formRegistro">
                        <div class="form-floating mb-3">
                            <input type="text" id="nom" class="form-control" placeholder="Nombre" required>
                            <label>Nombre completo</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="date" id="fechaNac" class="form-control" required>
                            <label>Fecha de Nacimiento</label>
                        </div>
                        <div class="form-floating mb-3">
                            <input type="email" id="corr" class="form-control" placeholder="Correo" required>
                            <label>Correo de contacto</label>
                        </div>
                        <div class="form-floating mb-3">
                            <select id="anio" class="form-select" required>
                                <option value="" disabled selected>Selecciona el año...</option>
                                <option value="1° Medio">1° Medio</option>
                                <option value="2° Medio">2° Medio</option>
                                <option value="3° Medio">3° Medio</option>
                                <option value="4° Medio">4° Medio</option>
                            </select>
                            <label>Año al que postula</label>
                        </div>
                        <div class="form-floating mb-4">
                            <textarea id="motivo" class="form-control" placeholder="Motivación" style="height: 100px" required></textarea>
                            <label>¿Por qué quieres estudiar en este liceo?</label>
                        </div>
                        <button type="submit" class="btn btn-primary w-100 py-2"><i class="bi bi-save me-2"></i>Registrar Postulación</button>
                    </form>
                </div>`;

            document.getElementById('formRegistro').addEventListener('submit', (e) => {
                e.preventDefault();

                // VALIDACIÓN DE FECHA
                const fechaNacString = document.getElementById('fechaNac').value;
                const anioNacimiento = new Date(fechaNacString).getFullYear();
                
                // Si el estudiante nació después de 2013 o antes de 2005 (rango irreal para el liceo)
                if (anioNacimiento > 2013 || anioNacimiento < 2005) {
                    Swal.fire('Fecha Inválida', 'La edad no corresponde a un estudiante de enseñanza media.', 'error');
                    return; // Detiene el guardado
                }
                db.solicitudes_estudiantes.push({
                    id: 'ADM-' + Math.floor(Math.random() * 900 + 100),
                    nombre: document.getElementById('nom').value.trim(),
                    fecha_nacimiento: document.getElementById('fechaNac').value,
                    correo: document.getElementById('corr').value.trim(),
                    anio_postulacion: document.getElementById('anio').value,
                    motivacion: document.getElementById('motivo').value.trim(),
                    estado: 'En Revisión',
                    fecha: new Intl.DateTimeFormat('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date())
                });
                this.guardarDatos();
                this.panelContenido.innerHTML = '';
                Swal.fire('Registrado', 'La postulación ha sido guardada.', 'success');
            });
        }

        mostrarFormularioModificar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-warning">Actualizar Estado</h5>
                    <div class="form-floating mb-3"><input type="text" id="idMod" class="form-control" placeholder="ID"><label>Folio (Ej: ADM-123)</label></div>
                    <div class="form-floating mb-4">
                        <select id="nuevoEstado" class="form-select">
                            <option value="En Revisión">En Revisión</option>
                            <option value="Aceptado">Aceptado</option>
                            <option value="Lista de Espera">Lista de Espera</option>
                            <option value="Rechazado">Rechazado</option>
                        </select>
                        <label>Nuevo Estado</label>
                    </div>
                    <button id="confirmarMod" class="btn btn-warning w-100 py-2 text-white"><i class="bi bi-arrow-clockwise me-2"></i>Actualizar</button>
                </div>`;

            document.getElementById('confirmarMod').addEventListener('click', () => {
                const idBuscado = document.getElementById('idMod').value.trim().toUpperCase();
                const index = db.solicitudes_estudiantes.findIndex(s => s.id === idBuscado);
                if (index !== -1) {
                    db.solicitudes_estudiantes[index].estado = document.getElementById('nuevoEstado').value;
                    this.guardarDatos();
                    this.panelContenido.innerHTML = '';
                    Swal.fire('Actualizado', 'El estado ha sido modificado.', 'success');
                } else {
                    Swal.fire('Error', 'No se encontró el Folio.', 'error');
                }
            });
        }

        mostrarFormularioEliminar() {
            this.panelContenido.innerHTML = `
                <div class="fade-in">
                    <h5 class="mb-4 fw-bold text-danger">Anular Postulación</h5>
                    <div class="form-floating mb-4"><input type="text" id="idEliminar" class="form-control" placeholder="Folio"><label>Folio (Ej: ADM-123)</label></div>
                    <button id="confirmarEliminar" class="btn btn-danger w-100 py-2"><i class="bi bi-trash me-2"></i>Anular Definitivamente</button>
                </div>`;

            document.getElementById('confirmarEliminar').addEventListener('click', () => {
                const idBuscado = document.getElementById('idEliminar').value.trim().toUpperCase();
                const index = db.solicitudes_estudiantes.findIndex(s => s.id === idBuscado);
                if (index !== -1) {
                    Swal.fire({title: '¿Anular postulación?', text: "Acción irreversible", icon: 'warning', showCancelButton: true, confirmButtonText: 'Sí, anular', cancelButtonText: 'Cancelar'}).then((result) => {
                        if (result.isConfirmed) {
                            db.solicitudes_estudiantes.splice(index, 1);
                            this.guardarDatos();
                            this.panelContenido.innerHTML = '';
                            Swal.fire('Eliminada', 'Postulación anulada.', 'success');
                        }
                    });
                } else {
                    Swal.fire('Error', 'Folio no encontrado.', 'error');
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