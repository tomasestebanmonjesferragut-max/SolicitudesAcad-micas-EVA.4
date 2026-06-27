document.addEventListener('DOMContentLoaded', () => {
    const tablaSoporte = document.getElementById('tablaSoporte');
    if (!tablaSoporte) return;

    let db = null;
    const API_URL = 'http://localhost:3000/api';

    inicializarSistema();

    async function inicializarSistema() {
        try {
            const respuesta = await fetch(`${API_URL}/db`);
            db = await respuesta.json();
            new GestorSoporte(); 
        } catch (error) { tablaSoporte.innerHTML = `<tr><td colspan="5" class="text-danger text-center py-4">Error al conectar con MySQL.</td></tr>`; }
    }

    class GestorSoporte {
        constructor() {
            this.tabla = tablaSoporte;
            this.panelContenido = document.getElementById('panelContenido');
            this.initEvents();
            this.actualizarTabla();
        }

        actualizarTabla(filtroTexto = '', filtroPrioridad = 'Todas') {
            this.tabla.innerHTML = '';
            if (!db.solicitudes_profesores || db.solicitudes_profesores.length === 0) {
                this.tabla.innerHTML = `<tr><td colspan="5" class="text-center py-5 text-muted">No hay reportes técnicos en MySQL.</td></tr>`; return;
            }

            const textoFiltro = filtroTexto.toLowerCase();
            db.solicitudes_profesores.forEach((ticket) => {
                const { id, profesor, ubicacion, problema, prioridad, fecha } = ticket;
                if ((profesor.toLowerCase().includes(textoFiltro) || id.toLowerCase().includes(textoFiltro)) && (filtroPrioridad === 'Todas' || prioridad === filtroPrioridad)) {
                    let badgeClass = prioridad === 'Alta' ? 'text-bg-danger' : prioridad === 'Media' ? 'text-bg-warning' : 'text-bg-info text-white';
                    const fila = document.createElement('tr');
                    fila.className = 'fade-in'; fila.style.cursor = 'pointer'; 
                    fila.innerHTML = `<td><span class="badge badge-id">#${id}</span></td><td><strong class="d-block">${profesor}</strong><small class="text-muted"><i class="bi bi-geo-alt-fill me-1"></i>${ubicacion}</small></td><td style="max-width: 250px;"><span class="text-truncate d-block text-muted"><i class="bi bi-chat-right-dots me-2 text-primary"></i>${problema}</span></td><td><span class="badge rounded-pill ${badgeClass}">${prioridad}</span></td><td class="text-muted small">${fecha}</td>`;
                    fila.addEventListener('click', () => this.verDetalles(ticket, badgeClass));
                    this.tabla.appendChild(fila);
                }
            });
        }

        verDetalles(ticket, badgeClass) { /* Mismo código original de SweetAlert */ }

        mostrarFormularioRegistro() {
            let opcionesProf = '<option value="" disabled selected>Seleccione al Docente...</option>';
            if (db.profesores) db.profesores.forEach(p => opcionesProf += `<option value="${p.nombre}">${p.nombre}</option>`);

            this.panelContenido.innerHTML = `<div class="fade-in"><h5 class="mb-4 fw-bold text-primary">Reportar Incidencia</h5><form id="formRegistro"><div class="form-floating mb-3"><select id="prof" class="form-select" required>${opcionesProf}</select><label>Profesor</label></div><div class="form-floating mb-3"><input type="text" id="ubi" class="form-control" placeholder="Ubicación" required><label>Ubicación</label></div><div class="form-floating mb-3"><textarea id="prob" class="form-control" style="height: 100px" required></textarea><label>Problema</label></div><div class="form-floating mb-4"><select id="prio" class="form-select"><option value="Baja">Baja</option><option value="Media">Media</option><option value="Alta">Alta</option></select><label>Urgencia</label></div><button type="submit" class="btn btn-primary w-100 py-2">Enviar Reporte</button></form></div>`;

            document.getElementById('formRegistro').addEventListener('submit', async (e) => {
                e.preventDefault();
                const nuevoTicket = { id: 'SOP-' + Math.floor(Math.random() * 900 + 100), profesor: document.getElementById('prof').value, ubicacion: document.getElementById('ubi').value.trim(), problema: document.getElementById('prob').value.trim(), prioridad: document.getElementById('prio').value, fecha: new Intl.DateTimeFormat('es-CL', {day: '2-digit', month: '2-digit', year: 'numeric'}).format(new Date()) };
                try { await fetch(`${API_URL}/solicitudes_profesores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(nuevoTicket) }); await inicializarSistema(); this.panelContenido.innerHTML = ''; Swal.fire('Ticket Enviado', 'Guardado en MySQL.', 'success'); } catch (e) {}
            });
        }

        mostrarFormularioModificar() {
            this.panelContenido.innerHTML = `<div class="fade-in"><h5 class="mb-4 fw-bold text-warning">Ajustar Prioridad</h5><div class="form-floating mb-3"><input type="text" id="idMod" class="form-control" placeholder="ID"><label>Ticket ID (Ej: SOP-101)</label></div><div class="form-floating mb-4"><select id="nuevaPrio" class="form-select"><option value="Alta">Alta</option><option value="Media">Media</option><option value="Baja">Baja</option></select><label>Prioridad</label></div><button id="confirmarMod" class="btn btn-warning w-100 py-2 text-white">Actualizar</button></div>`;

            document.getElementById('confirmarMod').addEventListener('click', async () => {
                try { await fetch(`${API_URL}/solicitudes_profesores/${document.getElementById('idMod').value.trim().toUpperCase()}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prioridad: document.getElementById('nuevaPrio').value }) }); await inicializarSistema(); this.panelContenido.innerHTML = ''; Swal.fire('Actualizado', 'Modificado en MySQL.', 'success'); } catch (e) {}
            });
        }

        mostrarFormularioEliminar() {
            this.panelContenido.innerHTML = `<div class="fade-in"><h5 class="mb-4 fw-bold text-success">Marcar como Resuelto</h5><div class="form-floating mb-4"><input type="text" id="idEliminar" class="form-control" placeholder="ID"><label>Ticket ID (Ej: SOP-101)</label></div><button id="confirmarEliminar" class="btn btn-success w-100 py-2">Cerrar Ticket</button></div>`;

            document.getElementById('confirmarEliminar').addEventListener('click', () => {
                const idBuscado = document.getElementById('idEliminar').value.trim().toUpperCase();
                Swal.fire({title: '¿Resuelto?', text: "Se borrará de MySQL", icon: 'info', showCancelButton: true, confirmButtonColor: '#10b981', confirmButtonText: 'Sí, cerrar'}).then(async (result) => {
                    if (result.isConfirmed) { try { await fetch(`${API_URL}/solicitudes_profesores/${idBuscado}`, { method: 'DELETE' }); await inicializarSistema(); this.panelContenido.innerHTML = ''; Swal.fire('Excelente', 'Resuelto y borrado.', 'success'); } catch(e) {} }
                });
            });
        }

        initEvents() {
            document.getElementById('btnRegistrar')?.addEventListener('click', () => this.mostrarFormularioRegistro());
            document.getElementById('btnModificar')?.addEventListener('click', () => this.mostrarFormularioModificar());
            document.getElementById('btnEliminar')?.addEventListener('click', () => this.mostrarFormularioEliminar());
            document.getElementById('buscador')?.addEventListener('input', (e) => this.actualizarTabla(e.target.value, document.getElementById('filtroPrioridad')?.value || 'Todas'));
            document.getElementById('filtroPrioridad')?.addEventListener('change', (e) => this.actualizarTabla(document.getElementById('buscador')?.value || '', e.target.value));
        }
    }
});