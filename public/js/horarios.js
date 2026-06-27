document.addEventListener('DOMContentLoaded', () => {
    const tablaHorarios = document.getElementById('tablaHorarios');
    if (!tablaHorarios) return;

    let db = null; 
    const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const API_URL = 'http://localhost:3000/api';

    inicializarHorario();

    async function inicializarHorario() {
        try {
            const respuesta = await fetch(`${API_URL}/db`);
            const dbJson = await respuesta.json();
            
            // Transformar filas SQL a la tabla HTML
            const horariosAgrupados = [];
            const bloquesUnicos = [...new Set(dbJson.horarios.map(h => h.bloque))];
            
            bloquesUnicos.forEach(bloqueHora => {
                let bloqueEstructura = { bloque: bloqueHora };
                let filasDelBloque = dbJson.horarios.filter(h => h.bloque === bloqueHora);
                filasDelBloque.forEach(fila => { bloqueEstructura[fila.dia] = { asignatura_id: fila.asignatura_id, aula: fila.aula }; });
                horariosAgrupados.push(bloqueEstructura);
            });
            
            dbJson.horarios = horariosAgrupados;
            db = dbJson;
            renderizarTabla();
        } catch (error) { tablaHorarios.innerHTML = `<tr><td colspan="6" class="text-danger py-4">Error conectando con MySQL.</td></tr>`; }
    }

    function renderizarTabla() {
        tablaHorarios.innerHTML = ''; 
        db.horarios.forEach((bloqueData, index) => {
            const fila = document.createElement('tr');
            fila.className = 'fade-in';
            let htmlFila = `<td><span class="badge badge-id">${bloqueData.bloque}</span></td>`;
            diasSemana.forEach(dia => {
                const claseDelDia = bloqueData[dia];
                if (claseDelDia && claseDelDia.asignatura_id) {
                    const asignatura = db.asignaturas.find(a => a.id === claseDelDia.asignatura_id);
                    if(asignatura) { htmlFila += `<td><span class="d-block fw-semibold text-${asignatura.color}">${asignatura.nombre}</span><small class="text-muted">${claseDelDia.aula}</small></td>`; } else { htmlFila += `<td><span class="text-muted">-</span></td>`; }
                } else { htmlFila += `<td><span class="text-muted">-</span></td>`; }
            });
            fila.innerHTML = htmlFila;
            tablaHorarios.appendChild(fila);
            if (index === 1) tablaHorarios.innerHTML += `<tr style="background: rgba(255,255,255,0.05);"><td colspan="6" class="text-muted fw-bold letter-spacing-1 text-center"><i class="bi bi-cup-hot me-2"></i> A L M U E R Z O</td></tr>`;
            if (index === 3) tablaHorarios.innerHTML += `<tr style="background: rgba(255,255,255,0.05);"><td colspan="6" class="text-muted fw-bold letter-spacing-1 text-center"><i class="bi bi-controller me-2"></i> R E C E S O</td></tr>`;
        });

        if (db.notas && db.notas.length > 0) {
            let contenidoNotas = db.notas.map(nota => `<li>${nota}</li>`).join('');
            tablaHorarios.innerHTML += `<tr><td colspan="6" class="text-start p-4 bg-light bg-opacity-10 rounded-bottom"><h6 class="fw-bold text-warning mb-2"><i class="bi bi-exclamation-triangle-fill me-2"></i>Avisos Importantes:</h6><ul class="mb-0 small text-muted text-start" style="list-style-type: square;">${contenidoNotas}</ul></td></tr>`;
        }
    }

    // PDF 
    const btnExportar = document.querySelector('.bi-printer')?.closest('button');
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            const elementoTabla = document.querySelector('.table-responsive');
            const opciones = { margin: 0.3, filename: 'Horario.pdf', image: { type: 'jpeg', quality: 1 }, html2canvas: { scale: 2, backgroundColor: '#ffffff', windowWidth: 1200 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'landscape' } };
            const textoOriginal = btnExportar.innerHTML;
            btnExportar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
            html2pdf().set(opciones).from(elementoTabla).save().then(() => { btnExportar.innerHTML = textoOriginal; Swal.fire('¡Completo!', 'Guardado.', 'success'); });
        });
    }
});