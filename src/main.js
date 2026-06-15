// main.js
// Punto de entrada de la aplicación Registro de Solicitudes Académicas

import { inicializarFormulario } from './views/formView.js';
import { inicializarFiltros } from './components/solicitudTable.js';

// Función principal
function initApp() {
  console.log("Aplicación Registro de Solicitudes Académicas iniciada ✅");

  // Inicializar formulario
  inicializarFormulario();

  // Inicializar filtros y tabla
  inicializarFiltros();
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", initApp);
