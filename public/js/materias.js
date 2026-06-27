document.addEventListener('DOMContentLoaded', () => {
    const contenedorMaterias = document.getElementById('contenedorMaterias');
    if (!contenedorMaterias) return;

    let db = null;
    const API_URL = 'http://localhost:3000/api';

    inicializarMaterias();

    async function inicializarMaterias() {
        try { const respuesta = await fetch(`${API_URL}/db`); db = await respuesta.json(); renderizarTarjetas(); } 
        catch (error) { contenedorMaterias.innerHTML = `<p class="text-danger w-100 text-center">Error al conectar con MySQL.</p>`; }
    }

    function renderizarTarjetas() {
        contenedorMaterias.innerHTML = '';
        if (db.asignaturas.length === 0) { contenedorMaterias.innerHTML = `<p class="text-muted text-center w-100">No hay asignaturas.</p>`; return; }

        db.asignaturas.forEach(asig => {
            const profesor = db.profesores.find(p => p.id === asig.profesor_id);
            const nombreProf = profesor ? profesor.nombre : 'Sin asignar';
            let icon = 'journal-bookmark'; if(asig.color === 'primary') icon = 'laptop'; if(asig.color === 'success') icon = 'calculator'; if(asig.color === 'info') icon = 'diagram-3'; if(asig.color === 'warning') icon = 'shield-lock'; if(asig.color === 'danger') icon = 'bug';
            const progreso = Math.floor(Math.random() * 60) + 20; 

            // BOTÓN DE AULA VIRTUAL ELIMINADO
            contenedorMaterias.innerHTML += `<div class="col-md-6 col-lg-4 fade-in"><div class="card h-100 p-0 overflow-hidden" style="border-top: 4px solid var(--accent-${asig.color});"><div class="p-4 border-bottom" style="border-color: var(--glass-border) !important;"><div class="d-flex justify-content-between align-items-start mb-2"><span class="badge text-bg-secondary">Código: ${asig.codigo}</span><i class="bi bi-${icon} fs-3 text-${asig.color}"></i></div><h4 class="fw-bold mt-3 mb-1">${asig.nombre}</h4><p class="text-muted small mb-0"><i class="bi bi-person-circle me-1"></i> ${nombreProf}</p></div><div class="p-4 bg-transparent"><div class="d-flex justify-content-between text-muted small mb-2"><span>Progreso</span><span class="fw-bold text-${asig.color}">${progreso}%</span></div><div class="progress mb-2"><div class="progress-bar bg-${asig.color}" role="progressbar" style="width: ${progreso}%"></div></div></div></div></div>`;
        });
    }

    document.getElementById('btnAgregarMateria')?.addEventListener('click', async () => {
        let opcionesProfesores = ''; db.profesores.forEach(p => opcionesProfesores += `<option value="${p.id}">${p.nombre}</option>`);
        const { value: formValues } = await Swal.fire({ title: 'Nueva Asignatura', html: `<div class="form-floating mb-3"><input id="swal-cod" class="form-control" placeholder="Código"><label>Código</label></div><div class="form-floating mb-3"><input id="swal-nom" class="form-control" placeholder="Nombre"><label>Nombre</label></div><div class="form-floating mb-3"><select id="swal-prof" class="form-select">${opcionesProfesores}</select><label>Profesor</label></div><div class="form-floating"><select id="swal-color" class="form-select"><option value="primary">Azul</option><option value="success">Verde</option><option value="warning">Amarillo</option><option value="danger">Rojo</option></select><label>Color</label></div>`, focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar', preConfirm: () => { return { id: 'A' + Math.floor(Math.random() * 900 + 100), codigo: document.getElementById('swal-cod').value, nombre: document.getElementById('swal-nom').value, profesor_id: document.getElementById('swal-prof').value, color: document.getElementById('swal-color').value } }});
        if (formValues) { try { await fetch(`${API_URL}/asignaturas`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formValues) }); await inicializarMaterias(); Swal.fire('¡Añadida!', 'Guardada en MySQL.', 'success'); } catch (e) {} }
    });

    document.getElementById('btnEditarMateria')?.addEventListener('click', async () => {
        let opciones = ''; db.asignaturas.forEach(a => opciones += `<option value="${a.id}">${a.codigo} - ${a.nombre}</option>`);
        const { value: asigId } = await Swal.fire({ title: 'Modificar Asignatura', html: `<select id="swal-edit-asig" class="form-select mb-3">${opciones}</select>`, showCancelButton: true, confirmButtonText: 'Siguiente', preConfirm: () => document.getElementById('swal-edit-asig').value });
        if (asigId) {
            const materia = db.asignaturas.find(a => a.id === asigId);
            let opcProf = ''; db.profesores.forEach(p => opcProf += `<option value="${p.id}" ${p.id === materia.profesor_id ? 'selected' : ''}>${p.nombre}</option>`);
            const { value: formEdit } = await Swal.fire({ title: 'Editando: ' + materia.codigo, html: `<div class="form-floating mb-3"><input id="edit-nom" class="form-control" value="${materia.nombre}"><label>Nombre</label></div><div class="form-floating mb-3"><select id="edit-prof" class="form-select">${opcProf}</select><label>Profesor</label></div><div class="form-floating"><select id="edit-color" class="form-select"><option value="primary" ${materia.color==='primary'?'selected':''}>Azul</option><option value="success" ${materia.color==='success'?'selected':''}>Verde</option><option value="warning" ${materia.color==='warning'?'selected':''}>Amarillo</option><option value="danger" ${materia.color==='danger'?'selected':''}>Rojo</option></select><label>Color</label></div>`, showCancelButton: true, confirmButtonText: 'Actualizar', preConfirm: () => { return { codigo: materia.codigo, nombre: document.getElementById('edit-nom').value, profesor_id: document.getElementById('edit-prof').value, color: document.getElementById('edit-color').value } }});
            if (formEdit) { try { await fetch(`${API_URL}/asignaturas/${materia.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formEdit) }); await inicializarMaterias(); Swal.fire('¡Actualizado!', 'Modificada en MySQL.', 'success'); } catch (e) {} }
        }
    });
});