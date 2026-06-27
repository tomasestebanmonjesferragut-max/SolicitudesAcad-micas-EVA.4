document.addEventListener('DOMContentLoaded', () => {
    const contenedorProfesores = document.getElementById('contenedorProfesores');
    if (!contenedorProfesores) return;

    let db = null;
    const paletaColores = ['primary', 'success', 'info', 'warning', 'danger', 'secondary'];
    const API_URL = 'http://localhost:3000/api';

    inicializarProfesores();

    async function inicializarProfesores() {
        try { const respuesta = await fetch(`${API_URL}/db`); db = await respuesta.json(); renderizarTarjetas(); } 
        catch (error) { contenedorProfesores.innerHTML = `<p class="text-danger w-100 text-center">Error al conectar con MySQL.</p>`; }
    }

    function renderizarTarjetas(filtro = '') {
        contenedorProfesores.innerHTML = '';
        const textoFiltro = filtro.toLowerCase();
        const profesoresFiltrados = db.profesores.filter(p => p.nombre.toLowerCase().includes(textoFiltro) || p.departamento.toLowerCase().includes(textoFiltro));
        if (profesoresFiltrados.length === 0) { contenedorProfesores.innerHTML = `<p class="text-muted w-100 text-center py-5">No se encontraron docentes.</p>`; return; }

        profesoresFiltrados.forEach((prof, index) => {
            const color = paletaColores[index % paletaColores.length];
            // BOTÓN DE CONTACTAR ELIMINADO
            contenedorProfesores.innerHTML += `<div class="col-md-6 col-lg-4 fade-in"><div class="p-4 h-100 text-center d-flex flex-column justify-content-center" style="background: var(--glass-panel); border: 1px solid var(--glass-border); border-radius: var(--radius-lg);"><div class="mb-3"><div class="bg-white rounded-circle d-inline-flex justify-content-center align-items-center shadow-sm" style="width: 80px; height: 80px;"><i class="bi bi-person-fill fs-1 text-${color}"></i></div></div><h5 class="fw-bold text-dark mb-1">${prof.nombre}</h5><p class="text-muted small mb-2">Dpto. de ${prof.departamento}</p><div class="mb-2"><span class="badge text-bg-${color} rounded-pill">Académico</span> <span class="badge text-bg-dark rounded-pill">ID: ${prof.id}</span></div></div></div>`;
        });
    }

    document.getElementById('buscadorDocentes')?.addEventListener('input', (e) => renderizarTarjetas(e.target.value));

    document.getElementById('btnAgregarProf')?.addEventListener('click', async () => {
        const { value: formValues } = await Swal.fire({ title: 'Nuevo Docente', html: `<div class="form-floating mb-3"><input id="swal-nombre" class="form-control" placeholder="Ej: Dr. Juan Pérez"><label>Nombre y Título</label></div><div class="form-floating"><input id="swal-dpto" class="form-control" placeholder="Ej: Ciencias Exactas"><label>Departamento Académico</label></div>`, focusConfirm: false, showCancelButton: true, confirmButtonText: 'Guardar Docente', preConfirm: () => { return { id: 'P' + Math.floor(Math.random() * 900 + 100), nombre: document.getElementById('swal-nombre').value, departamento: document.getElementById('swal-dpto').value } }});
        if (formValues) { try { await fetch(`${API_URL}/profesores`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formValues) }); await inicializarProfesores(); Swal.fire('¡Añadido!', 'Guardado en MySQL.', 'success'); } catch (e) {} }
    });

    document.getElementById('btnEditarProf')?.addEventListener('click', async () => {
        let opciones = ''; db.profesores.forEach(p => opciones += `<option value="${p.id}">${p.nombre}</option>`);
        const { value: profId } = await Swal.fire({ title: 'Modificar Docente', html: `<select id="swal-edit-prof" class="form-select mb-3">${opciones}</select>`, showCancelButton: true, confirmButtonText: 'Siguiente', preConfirm: () => document.getElementById('swal-edit-prof').value });
        if (profId) {
            const prof = db.profesores.find(p => p.id === profId);
            const { value: formEdit } = await Swal.fire({ title: 'Editando Perfil', html: `<div class="form-floating mb-3"><input id="edit-nombre" class="form-control" value="${prof.nombre}"><label>Nombre</label></div><div class="form-floating"><input id="edit-dpto" class="form-control" value="${prof.departamento}"><label>Departamento</label></div>`, showCancelButton: true, confirmButtonText: 'Actualizar', preConfirm: () => { return { nombre: document.getElementById('edit-nombre').value, departamento: document.getElementById('edit-dpto').value } }});
            if (formEdit) { try { await fetch(`${API_URL}/profesores/${prof.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(formEdit) }); await inicializarProfesores(); Swal.fire('¡Actualizado!', 'Guardado en MySQL.', 'success'); } catch (e) {} }
        }
    });
});