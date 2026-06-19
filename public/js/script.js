/* =========================================
   SCRIPT GLOBAL - Instituto John H. Watson
========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // 1. ILUMINAR MENÚ ACTIVO
    const currentUrl = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link, .dropdown-item').forEach(link => {
        if (link.getAttribute('href') === currentUrl) {
            link.classList.add('active');
            if (link.classList.contains('dropdown-item')) {
                link.closest('.dropdown')?.querySelector('.dropdown-toggle').classList.add('active');
            }
        }
    });

    // 2. MODO CLARO / OSCURO
    const btnTheme = document.getElementById('btnTheme');
    const themeIcon = btnTheme?.querySelector('i');
    
    // Revisar si ya había elegido modo claro antes
    if (localStorage.getItem('temaJHW') === 'light') {
        document.body.classList.add('light-mode');
        if(themeIcon) themeIcon.className = 'bi bi-moon-stars-fill';
    }

    btnTheme?.addEventListener('click', () => {
        document.body.classList.toggle('light-mode');
        if (document.body.classList.contains('light-mode')) {
            localStorage.setItem('temaJHW', 'light');
            themeIcon.className = 'bi bi-moon-stars-fill';
        } else {
            localStorage.setItem('temaJHW', 'dark');
            themeIcon.className = 'bi bi-sun-fill';
        }
    });

    // 3. SIMULADOR DE LOGIN (ADMIN)
    const btnAdmin = document.getElementById('btnAdmin');
    let isAdmin = localStorage.getItem('adminJHW') === 'true';

    // Función para mostrar/ocultar botones de edición
    const actualizarPermisos = () => {
        const botonesCRUD = document.querySelectorAll('#btnModificar, #btnEliminar, #btnEditarMateria, #btnEditarProf, #btnMoverHorario, #btnAgregarMateria, #btnAgregarProf');
        botonesCRUD.forEach(btn => {
            btn.style.display = isAdmin ? 'block' : 'none';
        });
        if(btnAdmin) {
            btnAdmin.innerHTML = isAdmin ? '<i class="bi bi-unlock-fill"></i> Admin' : '<i class="bi bi-lock-fill"></i>';
            btnAdmin.className = isAdmin ? 'btn btn-danger btn-sm rounded-pill' : 'btn btn-outline-danger btn-sm rounded-pill';
        }
    };

    actualizarPermisos(); // Ejecutar al cargar

    btnAdmin?.addEventListener('click', async () => {
        if (isAdmin) {
            localStorage.setItem('adminJHW', 'false');
            isAdmin = false;
            actualizarPermisos();
            Swal.fire('Sesión Cerrada', 'Modo lectura activado.', 'info');
        } else {
            const { value: password } = await Swal.fire({
                title: 'Acceso Administrativo',
                input: 'password',
                inputPlaceholder: 'Ingresa la clave (es: admin123)',
                inputAttributes: { autocapitalize: 'off', autocorrect: 'off' }
            });

            if (password === 'admin123') {
                localStorage.setItem('adminJHW', 'true');
                isAdmin = true;
                actualizarPermisos();
                Swal.fire('Acceso Concedido', 'Tienes permisos de edición.', 'success');
            } else if (password) {
                Swal.fire('Error', 'Contraseña incorrecta.', 'error');
            }
        }
    });

    // 4. ANIMACIONES Y CARRUSEL
    document.querySelectorAll('.card, .col-md-6 > a > .p-4').forEach((tarjeta, index) => {
        tarjeta.style.animationDelay = `${index * 0.1}s`;
    });

    const carouselElement = document.getElementById('carouselExamples');
    if (carouselElement && window.bootstrap) {
        new bootstrap.Carousel(carouselElement, { interval: 5000, ride: 'carousel' });
    }

    // ==========================================
    // 5. EXPORTAR A PDF (Protegido)
    // ==========================================
    // Usamos ?. para que no dé error si el botón no existe en la página actual
    const btnExportar = document.querySelector('.bi-printer')?.closest('button');
    
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            const elementoTabla = document.querySelector('.table-responsive');
            
            if (!elementoTabla) return; // Si no hay tabla, no hace nada

            const opciones = {
                margin:       1,
                filename:     'Horario_Academico_JHW.pdf',
                image:        { type: 'jpeg', quality: 0.98 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
            };
            
            // Animación de carga mientras genera
            const textoOriginal = btnExportar.innerHTML;
            btnExportar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando...';
            
            // Asegurarnos de que la librería HTML2PDF exista antes de llamarla
            if (typeof html2pdf !== 'undefined') {
                html2pdf().set(opciones).from(elementoTabla).save().then(() => {
                    btnExportar.innerHTML = textoOriginal;
                    Swal.fire('¡Éxito!', 'El horario se ha descargado en tu equipo.', 'success');
                });
            } else {
                btnExportar.innerHTML = textoOriginal;
                Swal.fire('Error', 'No se ha cargado la librería de PDF.', 'error');
            }
        });
    }
});