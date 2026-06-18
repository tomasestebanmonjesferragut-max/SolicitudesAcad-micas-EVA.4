// ==========================================
    // EXPORTAR A PDF (Formato Clásico / Normal)
    // ==========================================
    const btnExportar = document.querySelector('.bi-printer')?.closest('button');
    if (btnExportar) {
        btnExportar.addEventListener('click', () => {
            // 1. Clonar la tabla para no romper el diseño oscuro de la página
            const tablaOriginal = document.querySelector('.table');
            const tablaClon = tablaOriginal.cloneNode(true);
            
            // 2. Crear un contenedor limpio ("hoja de papel en blanco")
            const contenedorPDF = document.createElement('div');
            contenedorPDF.style.padding = '20px';
            contenedorPDF.style.fontFamily = 'Arial, sans-serif';
            contenedorPDF.style.backgroundColor = '#ffffff';
            
            // 3. Añadir el membrete oficial del Liceo
            contenedorPDF.innerHTML = `
                <div style="text-align: center; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px;">
                    <h2 style="margin: 0; color: #000;">Instituto Técnico John H. Watson</h2>
                    <h4 style="margin: 5px 0 0 0; color: #444;">Horario Académico Semanal</h4>
                </div>
            `;
            
            // 4. Limpiar los estilos web de la tabla clonada
            tablaClon.classList.remove('table', 'align-middle'); 
            tablaClon.style.width = '100%';
            tablaClon.style.borderCollapse = 'collapse';
            
            // 5. Aplicar bordes negros clásicos y texto oscuro a TODAS las celdas
            const celdas = tablaClon.querySelectorAll('th, td');
            celdas.forEach(celda => {
                celda.style.border = '1px solid #000000';
                celda.style.padding = '12px 8px';
                celda.style.textAlign = 'center';
                celda.style.verticalAlign = 'middle';
                celda.style.color = '#000000'; // Forzar texto negro
                
                // Si hay textos secundarios (como el aula), ponerlos en gris oscuro
                const textosPequeños = celda.querySelectorAll('.text-muted, small');
                textosPequeños.forEach(txt => {
                    txt.style.color = '#333333';
                    txt.style.display = 'block';
                    txt.style.marginTop = '4px';
                });
            });

            // 6. Fondo gris claro para los encabezados (Días de la semana)
            const encabezados = tablaClon.querySelectorAll('th');
            encabezados.forEach(th => {
                th.style.backgroundColor = '#e2e8f0';
                th.style.fontWeight = 'bold';
                th.style.color = '#000000';
            });

            // 7. Ajustar las pastillas de colores para que destaquen en el papel
            const badges = tablaClon.querySelectorAll('.badge');
            badges.forEach(badge => {
                badge.style.display = 'inline-block';
                badge.style.padding = '6px 10px';
                badge.style.borderRadius = '4px';
                badge.style.fontSize = '13px';
                badge.style.fontWeight = 'bold';
            });

            // Agregamos la tabla limpia al contenedor
            contenedorPDF.appendChild(tablaClon);

            // Opciones de configuración de PDF
            const opciones = {
                margin:       0.4,
                filename:     'Horario_Clases_JHW.pdf',
                image:        { type: 'jpeg', quality: 1 },
                html2canvas:  { scale: 2 },
                jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
            };
            
            // Efecto de carga en el botón
            const textoOriginal = btnExportar.innerHTML;
            btnExportar.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Generando PDF...';
            
            // Generar y descargar el PDF desde el contenedor limpio, NO desde la pantalla
            html2pdf().set(opciones).from(contenedorPDF).save().then(() => {
                btnExportar.innerHTML = textoOriginal;
                Swal.fire({
                    title: '¡Descarga Completa!',
                    text: 'El horario ha sido guardado con formato de impresión clásico.',
                    icon: 'success',
                    confirmButtonColor: '#10b981'
                });
            });
        });
    }