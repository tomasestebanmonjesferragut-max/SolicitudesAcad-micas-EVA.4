// Proyecto: Registro de Solicitudes Académicas
// Autor: Zommy

// 1. Capturar elementos del DOM (Selección de nodos)
const formulario = document.getElementById('solicitudForm');
const mensajes = document.getElementById('mensajes');
const tablaBody = document.querySelector('#tablaSolicitudes tbody');
const filtroPrioridad = document.getElementById('filtroPrioridad');

// Arreglo para almacenar el estado de la aplicación
let solicitudes = [];

// 2. Eventos (Escucha de eventos de formulario)
formulario.addEventListener('submit', function(evento) {
    evento.preventDefault(); 

    // Captura de valores
    const nombre = document.getElementById('nombre').value.trim();
    const correo = document.getElementById('correo').value.trim();
    const asignatura = document.getElementById('asignatura').value.trim();
    const tipo = document.getElementById('tipo').value;
    const descripcion = document.getElementById('descripcion').value.trim();
    const prioridad = document.getElementById('prioridad').value;
    const fecha = document.getElementById('fecha').value;

    // 3. Validación de datos según rúbrica
    if (!nombre || !correo || !asignatura || !tipo || !descripcion || !prioridad || !fecha) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios.', 'error');
        return;
    }

    if (!correo.includes('@')) {
        mostrarMensaje('El correo debe tener un formato válido.', 'error');
        return;
    }

    // Creación del objeto
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
    actualizarTabla();
    
    mostrarMensaje('Solicitud registrada con éxito.', 'exito');
    formulario.reset();
});

// Función para manejar la inserción de mensajes en el DOM
function mostrarMensaje(texto, clase) {
    // Limpiamos el contenedor primero
    while (mensajes.firstChild) {
        mensajes.removeChild(mensajes.firstChild);
    }

    // Creación segura de elementos DOM
    const parrafo = document.createElement('p');
    parrafo.textContent = texto;
    parrafo.classList.add(clase);
    
    mensajes.appendChild(parrafo);

    setTimeout(() => {
        if (mensajes.contains(parrafo)) {
            mensajes.removeChild(parrafo);
        }
    }, 3000);
}

// 4. Manipulación del DOM (Creación de nodos dinámica)
function actualizarTabla(filtro = 'Todas') {
    // Limpiar tabla correctamente
    while (tablaBody.firstChild) {
        tablaBody.removeChild(tablaBody.firstChild);
    }

    const solicitudesFiltradas = solicitudes.filter(solicitud => {
        if (filtro === 'Todas') return true;
        return solicitud.prioridad === filtro;
    });

    solicitudesFiltradas.forEach(solicitud => {
        // Crear la fila (tr)
        const fila = document.createElement('tr');

        // Crear y agregar cada celda (td) de forma segura
        const tdNombre = document.createElement('td');
        tdNombre.textContent = solicitud.nombre;
        fila.appendChild(tdNombre);

        const tdCorreo = document.createElement('td');
        tdCorreo.textContent = solicitud.correo;
        fila.appendChild(tdCorreo);

        const tdAsignatura = document.createElement('td');
        tdAsignatura.textContent = solicitud.asignatura;
        fila.appendChild(tdAsignatura);

        const tdTipo = document.createElement('td');
        tdTipo.textContent = solicitud.tipo;
        fila.appendChild(tdTipo);

        const tdPrioridad = document.createElement('td');
        tdPrioridad.textContent = solicitud.prioridad;
        fila.appendChild(tdPrioridad);

        const tdFecha = document.createElement('td');
        tdFecha.textContent = solicitud.fecha;
        fila.appendChild(tdFecha);

        // Celda de acciones y botón eliminar
        const tdAcciones = document.createElement('td');
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('btn-eliminar');
        
        // Asignación de evento directamente al nodo creado
        btnEliminar.addEventListener('click', () => eliminarSolicitud(solicitud.id));
        
        tdAcciones.appendChild(btnEliminar);
        fila.appendChild(tdAcciones);

        // Agregar la fila completa al cuerpo de la tabla
        tablaBody.appendChild(fila);
    });
}

function eliminarSolicitud(id) {
    solicitudes = solicitudes.filter(solicitud => solicitud.id !== id);
    actualizarTabla(filtroPrioridad.value);
}

// Evento para el filtro
filtroPrioridad.addEventListener('change', function(evento) {
    actualizarTabla(evento.target.value);
});