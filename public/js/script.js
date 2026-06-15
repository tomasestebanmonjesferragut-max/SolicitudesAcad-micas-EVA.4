// Proyecto: Registro de Solicitudes Académicas
// Autor: Zommy y Equipo

document.addEventListener("DOMContentLoaded", () => {
    console.log("Aplicación Registro de Solicitudes Académicas iniciada ✅");
    
    const formulario = document.getElementById('solicitudForm');
    const mensajes = document.getElementById('mensajes');
    const tablaBody = document.querySelector('#tablaSolicitudes tbody');
    const filtroPrioridad = document.getElementById('filtroPrioridad');

    let solicitudes = [];

    formulario.addEventListener('submit', function(evento) {
        evento.preventDefault(); 

        const nombre = document.getElementById('nombre').value.trim();
        const correo = document.getElementById('correo').value.trim();
        const asignatura = document.getElementById('asignatura').value.trim();
        const tipo = document.getElementById('tipo').value;
        const descripcion = document.getElementById('descripcion').value.trim();
        const prioridad = document.getElementById('prioridad').value;
        const fecha = document.getElementById('fecha').value;

        // Validaciones requeridas por la rúbrica
        if (!nombre || !correo || !asignatura || !tipo || !descripcion || !prioridad || !fecha) {
            mostrarMensaje('Error: Por favor, complete todos los campos obligatorios.', 'error');
            return;
        }

        if (!correo.includes('@')) {
            mostrarMensaje('Error: El correo debe tener un formato válido.', 'error');
            return;
        }

        const nuevaSolicitud = {
            id: Date.now(), 
            nombre,
            correo,
            asignatura,
            tipo,
            descripcion,
            prioridad,
            fecha
        };

        solicitudes.push(nuevaSolicitud);
        actualizarTabla(filtroPrioridad.value);
        
        mostrarMensaje('Éxito: Solicitud registrada correctamente.', 'exito');
        formulario.reset();
    });

    function mostrarMensaje(texto, clase) {
        mensajes.innerHTML = ''; // Limpiar mensajes previos
        const parrafo = document.createElement('p');
        parrafo.textContent = texto;
        parrafo.className = clase;
        mensajes.appendChild(parrafo);

        setTimeout(() => {
            if (mensajes.contains(parrafo)) {
                mensajes.removeChild(parrafo);
            }
        }, 3000);
    }

    function actualizarTabla(filtro = 'Todas') {
        tablaBody.innerHTML = ''; // Limpiar tabla

        const solicitudesFiltradas = solicitudes.filter(solicitud => {
            if (filtro === 'Todas') return true;
            return solicitud.prioridad === filtro;
        });

        solicitudesFiltradas.forEach(solicitud => {
            const fila = document.createElement('tr');

            fila.innerHTML = `
                <td>${solicitud.nombre}</td>
                <td>${solicitud.correo}</td>
                <td>${solicitud.asignatura}</td>
                <td>${solicitud.tipo}</td>
                <td>${solicitud.prioridad}</td>
                <td>${solicitud.fecha}</td>
            `;

            const tdAcciones = document.createElement('td');
            const btnEliminar = document.createElement('button');
            btnEliminar.textContent = 'Eliminar';
            btnEliminar.classList.add('btn-eliminar');
            btnEliminar.addEventListener('click', () => eliminarSolicitud(solicitud.id));
            
            tdAcciones.appendChild(btnEliminar);
            fila.appendChild(tdAcciones);
            tablaBody.appendChild(fila);
        });
    }

    function eliminarSolicitud(id) {
        solicitudes = solicitudes.filter(solicitud => solicitud.id !== id);
        actualizarTabla(filtroPrioridad.value);
    }

    filtroPrioridad.addEventListener('change', function(evento) {
        actualizarTabla(evento.target.value);
    });
});