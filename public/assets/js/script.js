document.addEventListener('DOMContentLoaded', () => {
    
    // Solo ejecutamos si estamos en la página de solicitudes
    if (!document.getElementById('tablaSolicitudes')) return;

    class GestorSolicitudes {
        constructor() {
            this.solicitudes = JSON.parse(localStorage.getItem('solicitudesDB')) || [];
            this.tabla = document.getElementById('tablaSolicitudes');
            this.panelContenido = document.getElementById('panelContenido');
            
            this.initEvents();
            this.actualizarTabla();
        }

        guardarDatos() {
            localStorage.setItem('solicitudesDB', JSON.stringify(this.solicitudes));
            this.actualizarTabla();
        }

        obtenerFechaActual() {
            // Método moderno para formatear fechas
            return new Intl.DateTimeFormat('es-CL', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            }).format(new Date());
        }

        actualizarTabla(filtro = '') {
            this.tabla.innerHTML = '';
            
            if (this.solicitudes.length === 0) {
                this.tabla.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-5">
                            <i class="bi bi-inbox text-muted fs-1 block mb-2"></i>
                            <p class="text-muted mb-0">No hay solicitudes registradas en este momento.</p>
                        </td>
                    </tr>`;
                return;
            }

            const textoFiltro = filtro.toLowerCase();

            this.solicitudes.forEach((solicitud) => {
                const { id, nombre, correo, asignatura, tipo, prioridad, fecha } = solicitud; // Desestructuración moderna

                if (nombre.toLowerCase().includes(textoFiltro) || id.toString().includes(textoFiltro)) {
                    
                    // Colores de Bootstrap más modernos para badges
                    const badgeClass = 
                        prioridad === 'Alta' ? 'text-bg-danger' : 
                        prioridad === 'Media' ? 'text-bg-warning' : 
                        'text-bg-info text-white';

                    const fila = document.createElement('tr');
                    fila.className = 'fade-in'; // Agregamos clase de animación
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
                            <input type="text" id="asig" class="form-control" placeholder="Asignatura" required>
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
                    id: crypto.randomUUID().slice(0, 5).toUpperCase(), // UUID más moderno y seguro que Date.now()
                    nombre: document.getElementById('nom').value.trim(),
                    correo: document.getElementById('corr').value.trim(),
                    asignatura: document.getElementById('asig').value.trim(),
                    tipo: document.getElementById('tip').value,
                    prioridad: document.getElementById('prio').value,
                    fecha: this.obtenerFechaActual()
                };
                
                this.solicitudes.push(nuevaSolicitud);
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
                const index = this.solicitudes.findIndex(s => s.id === idBuscado);

                if (index !== -1) {
                    this.solicitudes[index].prioridad = document.getElementById('nuevaPrio').value;
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
                const index = this.solicitudes.findIndex(s => s.id === idBuscado);

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
                            this.solicitudes.splice(index, 1);
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
            // Manejo seguro de eventos por si algún botón no existe en el DOM
            document.getElementById('btnRegistrar')?.addEventListener('click', () => this.mostrarFormularioRegistro());
            document.getElementById('btnModificar')?.addEventListener('click', () => this.mostrarFormularioModificar());
            document.getElementById('btnEliminar')?.addEventListener('click', () => this.mostrarFormularioEliminar());
            
            document.getElementById('buscador')?.addEventListener('input', (e) => {
                this.actualizarTabla(e.target.value);
            });
        }
    }

    new GestorSolicitudes();
});