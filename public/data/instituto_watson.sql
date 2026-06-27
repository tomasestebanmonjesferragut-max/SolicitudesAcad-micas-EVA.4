-- 1. CREAR LA BASE DE DATOS Y USARLA
CREATE DATABASE IF NOT EXISTS instituto_watson;
USE instituto_watson;

-- =======================================================
-- LIMPIEZA PREVIA (Borra las tablas si ya existen para evitar errores)
-- Se borran en orden inverso a sus relaciones para evitar conflictos
-- =======================================================
DROP TABLE IF EXISTS horarios;
DROP TABLE IF EXISTS asignaturas;
DROP TABLE IF EXISTS profesores;
DROP TABLE IF EXISTS solicitudes_estudiantes;
DROP TABLE IF EXISTS solicitudes_profesores;
DROP TABLE IF EXISTS notas;
DROP TABLE IF EXISTS anuncios_aula; 

-- =======================================================
-- 2. CREACIÓN DE TABLAS
-- =======================================================

-- Tabla de Profesores
CREATE TABLE profesores (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento VARCHAR(100) NOT NULL
);

-- Tabla de Asignaturas (Se relaciona con profesores)
CREATE TABLE asignaturas (
    id VARCHAR(20) PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    profesor_id VARCHAR(20),
    color VARCHAR(20),
    FOREIGN KEY (profesor_id) REFERENCES profesores(id)
);

-- Tabla de Horarios 
CREATE TABLE horarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bloque VARCHAR(20) NOT NULL,
    dia VARCHAR(15) NOT NULL,
    asignatura_id VARCHAR(20),
    aula VARCHAR(50),
    FOREIGN KEY (asignatura_id) REFERENCES asignaturas(id)
);

-- Tabla de Solicitudes de Estudiantes
CREATE TABLE solicitudes_estudiantes (
    id VARCHAR(20) PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    fecha_nacimiento DATE NOT NULL,
    correo VARCHAR(100) NOT NULL,
    anio_postulacion VARCHAR(20) NOT NULL,
    estado VARCHAR(50) DEFAULT 'En Revisión',
    fecha_inscripcion VARCHAR(20),
    motivacion TEXT
);

-- Tabla de Solicitudes (Soporte Técnico) de Profesores
CREATE TABLE solicitudes_profesores (
    id VARCHAR(20) PRIMARY KEY,
    profesor VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100) NOT NULL,
    problema TEXT NOT NULL,
    prioridad VARCHAR(20) DEFAULT 'Media',
    fecha VARCHAR(20)
);

-- Tabla de Notas o Avisos
CREATE TABLE notas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descripcion TEXT NOT NULL
);

CREATE TABLE anuncios_aula (
    id VARCHAR(20) PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    contenido TEXT NOT NULL,
    autor VARCHAR(100) NOT NULL,
    fecha VARCHAR(20)
);

-- =======================================================
-- 3. INSERCIÓN DE DATOS (POBLAR LA BASE DE DATOS)
-- =======================================================

-- Insertar Profesores
INSERT INTO profesores (id, nombre, departamento) VALUES
('P001', 'Dr. Roberto Salazar', 'Soporte Computacional'),
('P002', 'MSc. Elena Valdés', 'Matemática y Ciencias'),
('P003', 'Ing. Marcos Rivas', 'Conectividad y Redes'),
('P004', 'Lic. Carmen Rojas', 'Lenguaje y Comunicación'),
('P005', 'Lic. Andrés Bello', 'Historia y Educación Ciudadana'),
('P006', 'Prof. Jorge Silva', 'Educación Física'),
('P007', 'Ing. Daniela Torres', 'Desarrollo de Software'),
('P008', 'Mg. Carlos Mendoza', 'Programación y Bases de Datos'),
('P009', 'Teacher Sarah Connor', 'Inglés');

-- Insertar Asignaturas
INSERT INTO asignaturas (id, codigo, nombre, profesor_id, color) VALUES
('A101', 'PLC-101', 'Lenguaje y Literatura', 'P004', 'primary'),
('A102', 'PLC-201', 'Matemática', 'P002', 'success'),
('A103', 'PLC-301', 'Historia y Geografía', 'P005', 'warning'),
('A104', 'PLC-401', 'Inglés Común', 'P009', 'info'),
('A105', 'PLC-501', 'Ciencias para la Ciudadanía', 'P002', 'success'),
('A106', 'PLC-601', 'Educación Física y Salud', 'P006', 'danger'),
('A107', 'MOD-001', 'Módulo: Programación y BBDD', 'P008', 'dark'),
('A108', 'MOD-002', 'Módulo: Desarrollo Aplicaciones Web', 'P007', 'info'),
('A109', 'MOD-003', 'Módulo: Prog. Orientada a Objetos (Java)', 'P007', 'danger'),
('A110', 'MOD-004', 'Módulo: Armado y Mantención de Equipos', 'P001', 'secondary'),
('A111', 'MOD-005', 'Módulo: Sistemas Operativos (Linux/Win)', 'P001', 'primary'),
('A112', 'MOD-006', 'Módulo: Instalación de Redes (Cisco)', 'P003', 'warning'),
('A113', 'MOD-007', 'Módulo: Ciberseguridad Básica', 'P003', 'dark'),
('A114', 'MOD-008', 'Módulo: Emprendimiento y Empleabilidad', 'P005', 'success');

-- Insertar Horarios
INSERT INTO horarios (bloque, dia, asignatura_id, aula) VALUES
('08:00 - 09:30', 'lunes', 'A101', 'Sala 3B'),
('08:00 - 09:30', 'martes', 'A102', 'Sala 3B'),
('08:00 - 09:30', 'miercoles', 'A102', 'Sala 3B'),
('08:00 - 09:30', 'jueves', 'A104', 'Sala 3B'),
('08:00 - 09:30', 'viernes', 'A103', 'Sala 3B'),
('09:45 - 11:15', 'lunes', 'A101', 'Sala 3B'),
('09:45 - 11:15', 'martes', 'A107', 'Lab Computación 1'),
('09:45 - 11:15', 'miercoles', 'A109', 'Lab Computación 2'),
('09:45 - 11:15', 'jueves', 'A103', 'Sala 3B'),
('09:45 - 11:15', 'viernes', 'A107', 'Lab Computación 1'),
('12:00 - 13:30', 'lunes', 'A108', 'Lab Computación 2'),
('12:00 - 13:30', 'martes', 'A111', 'Lab Redes y SO'),
('12:00 - 13:30', 'miercoles', 'A105', 'Lab Ciencias'),
('12:00 - 13:30', 'jueves', 'A105', 'Lab Ciencias'),
('12:00 - 13:30', 'viernes', 'A104', 'Sala 3B'),
('13:45 - 15:15', 'lunes', 'A108', 'Lab Computación 2'),
('13:45 - 15:15', 'martes', 'A111', 'Lab Redes y SO'),
('13:45 - 15:15', 'miercoles', 'A112', 'Lab Redes y SO'),
('13:45 - 15:15', 'jueves', 'A112', 'Lab Redes y SO'),
('13:45 - 15:15', 'viernes', 'A114', 'Sala 3B'),
('15:45 - 17:15', 'lunes', 'A106', 'Gimnasio'),
('15:45 - 17:15', 'martes', 'A110', 'Taller Hardware'),
('15:45 - 17:15', 'miercoles', 'A106', 'Multicancha'),
('15:45 - 17:15', 'jueves', 'A113', 'Lab Redes y SO'),
('15:45 - 17:15', 'viernes', 'A110', 'Taller Hardware');

-- Insertar Solicitudes Estudiantes
INSERT INTO solicitudes_estudiantes (id, nombre, fecha_nacimiento, correo, anio_postulacion, estado, fecha_inscripcion, motivacion) VALUES
('ADM-792', 'Lucas San Martín', '2012-05-14', 'lucas.sm@gmail.com', '1° Medio', 'En Revisión', '10/03/2026', 'He escuchado que tienen muy buenos laboratorios y me gustaría aprender a programar.'),
('ADM-415', 'Valentina Rojas', '2010-11-22', 'vale.rojas22@yahoo.com', '3° Medio', 'Aceptado', '12/03/2026', 'Vengo de otro colegio y quiero especializarme en redes y telecomunicaciones.');

-- Insertar Solicitudes de Profesores (Soporte Técnico)
INSERT INTO solicitudes_profesores (id, profesor, ubicacion, problema, prioridad, fecha) VALUES
('SOP-101', 'Dr. Roberto Salazar', 'Taller Hardware', 'El proyector principal no enciende, luz parpadea en rojo.', 'Alta', '15/03/2026'),
('SOP-102', 'Lic. Carmen Rojas', 'Sala 3B', 'No hay conexión a internet en el equipo del docente.', 'Media', '16/03/2026');

-- Insertar Notas (Avisos Importantes)
INSERT INTO notas (descripcion) VALUES
('Uso obligatorio de cotona/delantal en los Módulos de Hardware e Instalación de Redes.'),
('El Módulo de Emprendimiento y Empleabilidad se evaluará con un proyecto final en noviembre.'),
('Para Educación Física (Lunes y Miércoles, último bloque) deben traer sus útiles de aseo personal.');

INSERT INTO anuncios_aula (id, titulo, contenido, autor, fecha) VALUES 
('AV-101', '¡Bienvenidos al semestre!', 'Ya está disponible el material de estudio de la primera unidad. Por favor, revisen sus correos.', 'Administración', '20/06/2026');


select * from notas;