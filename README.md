# 🎓 Portal Académico - Instituto John H. Watson

Un sistema web responsivo y moderno para la gestión de solicitudes académicas, plana docente, asignaturas y soporte técnico del instituto.

## 🚀 Características Principales

* **Gestión de Admisiones:** Sistema CRUD completo para ingresar y gestionar postulaciones de estudiantes nuevos.
* **Soporte Docente:** Plataforma para reportar tickets de problemas de infraestructura o tecnología en laboratorios y aulas.
* **Directorio Académico:** Módulo para la visualización y administración de las asignaturas y la plana docente.
* **Horarios Interactivos:** Agenda semanal dinámica con funcionalidad para modificar bloques, asignar clases y **exportar directamente a PDF**.
* **Control de Acceso (Simulación):** Por defecto, la plataforma funciona en modo lectura. Existe un botón de administrador protegido (Contraseña: `admin123`) que habilita los botones para añadir, editar o eliminar registros.
* **Experiencia de Usuario (UX/UI):** Diseño elegante con efecto *glassmorphism*, un *toggle* de Modo Claro/Oscuro y alertas interactivas a través de SweetAlert2.
* **Almacenamiento Local:** Persistencia de datos basada en `localStorage`. La información inicial se carga dinámicamente desde un archivo `db.json` para facilitar las pruebas.

## 🛠️ Tecnologías Utilizadas

* **Estructura y Estilo:** HTML5, CSS3.
* **Framework:** Bootstrap 5 y Bootstrap Icons.
* **Lógica de la Aplicación:** JavaScript (Vanilla JS, ES6+).
* **Librerías Externas:** * [SweetAlert2](https://sweetalert2.github.io/) (Para alertas y modales personalizados).
  * [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/) (Para generación de horarios en formato PDF).
* **Almacenamiento:** Formato JSON y LocalStorage del navegador.

## ⚙️ Instrucciones de Instalación y Uso

1. Descarga o clona el código fuente en tu entorno local.
2. Dado que la aplicación utiliza la función `fetch` de JavaScript para cargar los datos base desde el archivo `db.json`, **es necesario correr el proyecto en un servidor local**.
   * Se recomienda abrir la carpeta en **Visual Studio Code** y usar la extensión **Live Server**.
3. Ejecuta el archivo principal ubicado en `public/html/index.html`.
4. Para probar la persistencia de datos (operaciones CRUD), asegúrate de activar el modo administrador haciendo clic en el icono del candado rojo en la esquina superior derecha y digitando la clave `admin123`.

## 📁 Estructura del Proyecto

```
/
├── public/
│   ├── css/       # Estilos (styles.css)
│   ├── data/      # Base de datos simulada (db.json)
│   ├── html/      # Vistas principales (index, horarios, solicitudes, etc.)
│   ├── Image/     # Recursos gráficos y multimedia
│   └── js/        # Controladores específicos por página
├── src/           # Scripts principales y puntos de entrada
└── notas.txt      # Análisis, métricas y propuestas de mejoras estructurales
```
