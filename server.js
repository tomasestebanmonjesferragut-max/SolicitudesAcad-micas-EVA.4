/**
 * Servidor Backend - Aula Virtual
 * Archivo: server.js
 * Descripción: API REST para gestión de anuncios, asignaturas, profesores y solicitudes
 * Versión: 1.0.0
 * Autor: Instituto John H. Watson
 * Fecha: 2026
 */

'use strict';

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

// =============================================
// INICIALIZACIÓN DE EXPRESS
// =============================================
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// =============================================
// CONFIGURACIÓN DE BASE DE DATOS
// =============================================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'instituto_watson',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Middleware para manejo de errores de conexión
app.use((req, res, next) => {
    req.db = pool;
    next();
});

// =============================================
// RUTAS GENERALES
// =============================================
app.get('/', (req, res) => {
    res.redirect('/html/index.html');
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// =============================================
// API: LECTURA GLOBAL DE BASE DE DATOS
// =============================================
/**
 * GET /api/db - Obtiene todos los datos de la base de datos
 * Retorna: profesores, asignaturas, horarios, solicitudes, anuncios y notas
 */
app.get('/api/db', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        
        // Queries paralelas para mejor rendimiento
        const [profesores] = await connection.query('SELECT id, nombre, departamento FROM profesores');
        const [asignaturas] = await connection.query('SELECT id, codigo, nombre, profesor_id, color FROM asignaturas');
        const [horarios] = await connection.query('SELECT * FROM horarios');
        const [solicitudes_estudiantes] = await connection.query('SELECT * FROM solicitudes_estudiantes');
        const [solicitudes_profesores] = await connection.query('SELECT * FROM solicitudes_profesores');
        const [anuncios_aula] = await connection.query('SELECT * FROM anuncios_aula ORDER BY fecha DESC');
        const [notasRows] = await connection.query('SELECT descripcion FROM notas');
        
        const notas = notasRows.map(n => n.descripcion);
        
        res.json({
            profesores,
            asignaturas,
            horarios,
            solicitudes_estudiantes,
            solicitudes_profesores,
            anuncios_aula,
            notas,
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Error en /api/db:', error.message);
        res.status(500).json({ 
            error: 'Error al conectar con MySQL',
            message: error.message 
        });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// CRUD: SOLICITUDES ESTUDIANTES
// =============================================
/**
 * POST /api/solicitudes_estudiantes - Crear nueva solicitud
 */
app.post('/api/solicitudes_estudiantes', async (req, res) => {
    const { id, nombre, fecha_nacimiento, correo, anio_postulacion, estado, fecha, motivacion } = req.body;
    
    // Validación básica
    if (!id || !nombre || !correo) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO solicitudes_estudiantes (id, nombre, fecha_nacimiento, correo, anio_postulacion, estado, fecha_inscripcion, motivacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [id, nombre, fecha_nacimiento, correo, anio_postulacion, estado || 'pendiente', fecha, motivacion]
        );
        
        res.status(201).json({ 
            message: 'Solicitud creada correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en POST /api/solicitudes_estudiantes:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * PUT /api/solicitudes_estudiantes/:id - Actualizar solicitud
 */
app.put('/api/solicitudes_estudiantes/:id', async (req, res) => {
    const { estado } = req.body;
    const { id } = req.params;
    
    if (!estado) {
        return res.status(400).json({ error: 'El estado es requerido' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'UPDATE solicitudes_estudiantes SET estado = ? WHERE id = ?',
            [estado, id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json({ 
            message: 'Solicitud actualizada correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en PUT /api/solicitudes_estudiantes:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * DELETE /api/solicitudes_estudiantes/:id - Eliminar solicitud
 */
app.delete('/api/solicitudes_estudiantes/:id', async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'DELETE FROM solicitudes_estudiantes WHERE id = ?',
            [id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json({ message: 'Solicitud eliminada correctamente' });
    } catch (error) {
        console.error('❌ Error en DELETE /api/solicitudes_estudiantes:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// CRUD: PROFESORES
// =============================================
/**
 * POST /api/profesores - Crear nuevo profesor
 */
app.post('/api/profesores', async (req, res) => {
    const { id, nombre, departamento } = req.body;
    
    if (!id || !nombre || !departamento) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO profesores (id, nombre, departamento) VALUES (?, ?, ?)',
            [id, nombre, departamento]
        );
        
        res.status(201).json({ 
            message: 'Profesor creado correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en POST /api/profesores:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * PUT /api/profesores/:id - Actualizar profesor
 */
app.put('/api/profesores/:id', async (req, res) => {
    const { nombre, departamento } = req.body;
    const { id } = req.params;
    
    if (!nombre || !departamento) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'UPDATE profesores SET nombre = ?, departamento = ? WHERE id = ?',
            [nombre, departamento, id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Profesor no encontrado' });
        }
        
        res.json({ message: 'Profesor actualizado correctamente' });
    } catch (error) {
        console.error('❌ Error en PUT /api/profesores:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// CRUD: ASIGNATURAS
// =============================================
/**
 * POST /api/asignaturas - Crear nueva asignatura
 */
app.post('/api/asignaturas', async (req, res) => {
    const { id, codigo, nombre, profesor_id, color } = req.body;
    
    if (!id || !codigo || !nombre || !profesor_id) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO asignaturas (id, codigo, nombre, profesor_id, color) VALUES (?, ?, ?, ?, ?)',
            [id, codigo, nombre, profesor_id, color || 'primary']
        );
        
        res.status(201).json({ 
            message: 'Asignatura creada correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en POST /api/asignaturas:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * PUT /api/asignaturas/:id - Actualizar asignatura
 */
app.put('/api/asignaturas/:id', async (req, res) => {
    const { codigo, nombre, profesor_id, color } = req.body;
    const { id } = req.params;
    
    if (!codigo || !nombre || !profesor_id) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'UPDATE asignaturas SET codigo = ?, nombre = ?, profesor_id = ?, color = ? WHERE id = ?',
            [codigo, nombre, profesor_id, color || 'primary', id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Asignatura no encontrada' });
        }
        
        res.json({ message: 'Asignatura actualizada correctamente' });
    } catch (error) {
        console.error('❌ Error en PUT /api/asignaturas:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// CRUD: SOLICITUDES PROFESORES
// =============================================
/**
 * POST /api/solicitudes_profesores - Crear solicitud de soporte
 */
app.post('/api/solicitudes_profesores', async (req, res) => {
    const { id, profesor, ubicacion, problema, prioridad, fecha } = req.body;
    
    if (!id || !profesor || !ubicacion || !problema) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO solicitudes_profesores (id, profesor, ubicacion, problema, prioridad, fecha) VALUES (?, ?, ?, ?, ?, ?)',
            [id, profesor, ubicacion, problema, prioridad || 'media', fecha]
        );
        
        res.status(201).json({ 
            message: 'Solicitud de soporte creada correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en POST /api/solicitudes_profesores:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * PUT /api/solicitudes_profesores/:id - Actualizar prioridad
 */
app.put('/api/solicitudes_profesores/:id', async (req, res) => {
    const { prioridad } = req.body;
    const { id } = req.params;
    
    if (!prioridad) {
        return res.status(400).json({ error: 'La prioridad es requerida' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'UPDATE solicitudes_profesores SET prioridad = ? WHERE id = ?',
            [prioridad, id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json({ message: 'Solicitud actualizada correctamente' });
    } catch (error) {
        console.error('❌ Error en PUT /api/solicitudes_profesores:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * DELETE /api/solicitudes_profesores/:id - Eliminar solicitud
 */
app.delete('/api/solicitudes_profesores/:id', async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'DELETE FROM solicitudes_profesores WHERE id = ?',
            [id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Solicitud no encontrada' });
        }
        
        res.json({ message: 'Solicitud eliminada correctamente' });
    } catch (error) {
        console.error('❌ Error en DELETE /api/solicitudes_profesores:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// CRUD: ANUNCIOS AULA VIRTUAL
// =============================================
/**
 * GET /api/anuncios_aula - Obtener todos los anuncios
 */
app.get('/api/anuncios_aula', async (req, res) => {
    let connection;
    try {
        connection = await pool.getConnection();
        const [anuncios] = await connection.query(
            'SELECT * FROM anuncios_aula ORDER BY fecha DESC'
        );
        
        res.json(anuncios);
    } catch (error) {
        console.error('❌ Error en GET /api/anuncios_aula:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * POST /api/anuncios_aula - Crear nuevo anuncio
 */
app.post('/api/anuncios_aula', async (req, res) => {
    const { id, titulo, contenido, autor, fecha } = req.body;
    
    if (!id || !titulo || !contenido || !autor) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
    }
    
    let connection;
    try {
        connection = await pool.getConnection();
        await connection.query(
            'INSERT INTO anuncios_aula (id, titulo, contenido, autor, fecha) VALUES (?, ?, ?, ?, ?)',
            [id, titulo, contenido, autor, fecha || new Date().toISOString()]
        );
        
        res.status(201).json({ 
            message: 'Anuncio publicado correctamente',
            id: id
        });
    } catch (error) {
        console.error('❌ Error en POST /api/anuncios_aula:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

/**
 * DELETE /api/anuncios_aula/:id - Eliminar anuncio
 */
app.delete('/api/anuncios_aula/:id', async (req, res) => {
    const { id } = req.params;
    
    let connection;
    try {
        connection = await pool.getConnection();
        const result = await connection.query(
            'DELETE FROM anuncios_aula WHERE id = ?',
            [id]
        );
        
        if (result[0].affectedRows === 0) {
            return res.status(404).json({ error: 'Anuncio no encontrado' });
        }
        
        res.json({ message: 'Anuncio eliminado correctamente' });
    } catch (error) {
        console.error('❌ Error en DELETE /api/anuncios_aula:', error.message);
        res.status(500).json({ error: error.message });
    } finally {
        if (connection) connection.release();
    }
});

// =============================================
// MANEJO DE ERRORES GLOBAL
// =============================================
app.use((err, req, res, next) => {
    console.error('❌ Error no capturado:', err.message);
    res.status(err.status || 500).json({
        error: 'Error interno del servidor',
        message: err.message
    });
});

// Ruta 404
app.use((req, res) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.path
    });
});

// =============================================
// INICIAR SERVIDOR
// =============================================
app.listen(PORT, () => {
    console.log(`✅ Servidor Backend corriendo en http://localhost:${PORT}`);
    console.log(`📁 Base de datos: ${dbConfig.database}`);
    console.log(`📊 Host: ${dbConfig.host}`);
    console.log(`👤 Usuario: ${dbConfig.user}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
    console.log('📍 Señal SIGTERM recibida. Cerrando servidor...');
    pool.end();
    process.exit(0);
});