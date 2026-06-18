document.addEventListener('DOMContentLoaded', () => {
    const tablaHorarios = document.getElementById('tablaHorarios');
    const btnMover = document.getElementById('btnMoverHorario');
    
    // Solo se ejecuta si estamos en la página de horarios
    if (!tablaHorarios) return;

    let db = null; 
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    inicializarHorario();

    async function inicializarHorario() {
        try {
            const respuesta = await fetch('../data/db.json');
            const dbJson = await respuesta.json();
            let dbLocal = JSON.parse(localStorage.getItem('institutoDB'));

            if (!dbLocal) {
                dbLocal = dbJson; // Si es la primera vez, carga todo del JSON
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
                dbLocal.notas = dbJson.notas || []; // Las notas siempre se actualizan
            }
            
            localStorage.setItem('institutoDB', JSON.stringify(dbLocal));
            db = dbLocal;
            renderizarTabla();
        } catch (error) {
            console.error("Error al cargar los datos:", error);
            tablaHorarios.innerHTML = `<tr><td colspan="6" class="text-danger py-4">Error cargando el horario. Usa Live Server.</td></tr>`;
        }
    }

    function renderizarTabla() {
        tablaHorarios.innerHTML = ''; 

        // 1. Recorremos TODOS los bloques definidos en la base de datos
        // Si agregas más bloques en el JSON, aparecerán automáticamente hacia abajo.
        db.horarios.forEach((bloqueData, index) => {
            const fila = document.createElement('tr');
            fila.className = 'fade-in';
            let htmlFila = `<td><span class="badge badge-id">${bloqueData.bloque}</span></td>`;
            
            // Dibujamos los días de la semana para el bloque actual
            diasSemana.forEach(dia => {
                const claseDelDia = bloqueData[dia];
                
                if (claseDelDia && claseDelDia.asignatura_id) {
                    const asignatura = db.asignaturas.find(a => a.id === claseDelDia.asignatura_id);
                    if(asignatura) {
                        htmlFila += `
                            <td>
                                <span class="d-block fw-semibold text-${asignatura.color}">${asignatura.nombre}</span>
                                <small class="text-muted">${claseDelDia.aula}</small>
                            </td>
                        `;
                    } else {
                        htmlFila += `<td><span class="text-muted">-</span></td>`;
                    }
                } else {
                    htmlFila += `<td><span class="text-muted">-</span></td>`;
                }
            });

            fila.innerHTML = htmlFila;
            tablaHorarios.appendChild(fila);

            // 2. Insertar el Almuerzo fijo después del bloque 2 (índice 1)
            if (index === 1) {
                const filaAlmuerzo = document.createElement('tr');
                filaAlmuerzo.style.cssText = "background: rgba(255,255,255,0.05) !important;";
                filaAlmuerzo.innerHTML = `
                    <td><span class="badge bg-secondary">11:15 - 12:00</span></td>
                    <td colspan="5" class="text-muted fw-bold letter-spacing-1">
                        <i class="bi bi-cup-hot me-2"></i> A L M U E R Z O
                    </td>
                `;
                tablaHorarios.appendChild(filaAlmuerzo);
            }

            // 3. Insertar el Receso fijo después del bloque 4 (índice 3)
            if (index === 3) {
                const filaReceso = document.createElement('tr');
                filaReceso.style.cssText = "background: rgba(255,255,255,0.05) !important;";
                filaReceso.innerHTML = `
                    <td><span class="badge bg-secondary">15:15 - 15:45</span></td>
                    <td colspan="5" class="text-muted fw-bold letter-spacing-1">
                        <i class="bi bi-controller me-2"></i> R E C E S O
                    </td>
                `;
                tablaHorarios.appendChild(filaReceso);
            }
        });

        // 4. Lógica para mostrar NOTAS al final de la tabla (si existen en la BD)
        if (db.notas && db.notas.length > 0) {
            const filaNotas = document.createElement('tr');
            let contenidoNotas = db.notas.map(nota => `<li>${nota}</li>`).join('');
            
            filaNotas.innerHTML = `
                <td colspan="6" class="text-start p-4 bg-light bg-opacity-10 rounded-bottom">
                    <h6 class="fw-bold text-warning mb-2"><i class="bi bi-exclamation-triangle-fill me-2"></i>Avisos Importantes:</h6>
                    <ul class="mb-0 small text-muted text-start" style="list-style-type: square;">
                        ${contenidoNotas}
                    </ul>
                </td>
            `;
            tablaHorarios.appendChild(filaNotas);
        }
    }

    // ==========================================
    // LÓGICA DEL BOTÓN: MOVER / EDITAR HORARIO
    // ==========================================
    if(btnMover) {
        btnMover.addEventListener('click', async () => {
            
            let opcionesBloques = '';
            db.horarios.forEach((b, i) => {
                opcionesBloques += `<option value="${i}">${b.bloque}</option>`;
            });

            let opcionesAsignaturas = `<option value="">-- Dejar libre (Borrar clase) --</option>`;
            db.asignaturas.forEach(a => {
                opcionesAsignaturas += `<option value="${a.id}">${a.codigo} - ${a.nombre}</option>`;
            });

            const { value: formValues } = await Swal.fire({
                title: 'Editar Horario',
                html: `
                    <p class="text-muted small mb-3">Selecciona el bloque y día donde quieres asignar una clase.</p>
                    <div class="form-floating mb-3">
                        <select id="swal-bloque" class="form-select">${opcionesBloques}</select>
                        <label for="swal-bloque">1. Bloque de hora</label>
                    </div>
                    <div class="form-floating mb-3">
                        <select id="swal-dia" class="form-select">
                            <option value="lunes">Lunes</option>
                            <option value="martes">Martes</option>
                            <option value="miercoles">Miércoles</option>
                            <option value="jueves">Jueves</option>
                            <option value="viernes">Viernes</option>
                        </select>
                        <label for="swal-dia">2. Día de la semana</label>
                    </div>
                    <div class="form-floating mb-3">
                        <select id="swal-asig" class="form-select">${opcionesAsignaturas}</select>
                        <label for="swal-asig">3. Asignatura a colocar</label>
                    </div>
                    <div class="form-floating mb-1">
                        <input id="swal-aula" class="form-control" placeholder="Ej: Lab 1">
                        <label for="swal-aula">4. Sala / Aula (Opcional)</label>
                    </div>
                `,
                focusConfirm: false,
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#6c757d',
                confirmButtonText: 'Guardar Cambios',
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return {
                        bloqueIndex: document.getElementById('swal-bloque').value,
                        dia: document.getElementById('swal-dia').value,
                        asignatura_id: document.getElementById('swal-asig').value,
                        aula: document.getElementById('swal-aula').value
                    }
                }
            });

            if (formValues) {
                const { bloqueIndex, dia, asignatura_id, aula } = formValues;

                if (asignatura_id === "") {
                    // Si se elige "Dejar Libre", borramos ese campo
                    delete db.horarios[bloqueIndex][dia];
                } else {
                    db.horarios[bloqueIndex][dia] = {
                        asignatura_id: asignatura_id,
                        aula: aula || 'Por definir'
                    };
                }

                localStorage.setItem('institutoDB', JSON.stringify(db));
                renderizarTabla();
                
                Swal.fire({
                    title: '¡Actualizado!',
                    text: 'El horario ha sido modificado con éxito.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            }
        });
    }

    
}); 