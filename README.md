# 🎓 Portal Académico - Instituto John H. Watson

Sistema web "Full-Stack" diseñado para la gestión integral de un centro educativo. El portal permite la administración de admisiones, horarios, plana docente, soporte técnico y una plataforma de aula virtual para anuncios.

## 🚀 Arquitectura del Sistema
Esta versión del proyecto ha sido migrada a una arquitectura profesional **Cliente-Servidor**:
- **Backend:** Node.js con Express para gestionar la API REST.
- **Base de Datos:** MySQL para persistencia de datos relacional.
- **Frontend:** HTML5, CSS3 (Glassmorphism), Bootstrap 5 y JavaScript.

## 🛠️ Características Principales

* **Gestión de Admisiones:** Sistema CRUD completo para el registro y seguimiento de postulaciones de estudiantes.
* **Aula Virtual:** Módulo dinámico para la publicación de anuncios y material de estudio.
* **Soporte Docente:** Plataforma para reportar incidencias en aulas y laboratorios, con sistema de prioridades y cierre de tickets.
* **Directorio Académico:** Gestión centralizada de docentes y asignaturas.
* **Horarios Interactivos:** Agenda semanal dinámica con edición y exportación directa a **PDF**.
* **Seguridad:** Acceso protegido por administrador (Clave: `admin123`) para operaciones de edición y eliminación.
* **UX/UI Profesional:** Diseño basado en *glassmorphism*, modo claro/oscuro y notificaciones con SweetAlert2.

## 🛠️ Tecnologías Utilizadas

* **Frontend:** HTML5, CSS3, Bootstrap 5, Bootstrap Icons.
* **Backend:** Node.js, Express.
* **Base de Datos:** MySQL (driver `mysql2`).
* **Lógica:** JavaScript (ES6+).
* **Librerías Externas:**
    * [SweetAlert2](https://sweetalert2.github.io/): Notificaciones y modales.
    * [html2pdf.js](https://ekoopmans.github.io/html2pdf.js/): Generación de reportes PDF.

## ⚙️ Instrucciones de Instalación

### 1. Requisitos Previos
* Tener instalado [Node.js](https://nodejs.org/).
* Tener un servidor MySQL (XAMPP, WAMP, MySQL Workbench, etc.).

### 2. Configuración de Base de Datos
1. Abre tu gestor de base de datos (ej. phpMyAdmin).
2. Crea una base de datos nueva llamada `instituto_watson`.
3. Importa el archivo `public/data/instituto_watson.sql` incluido en este repositorio.

### 3. Configuración del Proyecto
1. Abre una terminal en la raíz del proyecto.
2. Instala las dependencias necesarias:
   ```bash
  npm install express mysql2 cors

-----------------------------------------------------------------------------------

1.- Inicia el servidor backend:
   ```bash
  node server.js

2.- Abre tu navegador y dirígete a: http://localhost:3000

  /
  ├── public/
  │   ├── css/          # Estilos profesionales (styles.css)
  │   ├── data/         # Script de respaldo SQL (instituto_watson.sql)
  │   ├── html/         # Vistas (index, horarios, solicitudes, etc.)
  │   ├── Image/        # Recursos gráficos
  │   └── js/           # Lógica del frontend (conectada a la API)
  ├── server.js         # Servidor Backend (API y conexión a MySQL)
  ├── package.json      # Dependencias del proyecto
  └── README.md         # Documentación oficial


3.- Modo Administrador
  Clave: admin123