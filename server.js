const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json()); 

// Servir frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', (req, res) => { res.redirect('/html/index.html'); });

const dbConfig = {
    host: 'localhost',
    user: 'root',      
    password: 'root', // Tu contraseña de MySQL
    database: 'instituto_watson'
};

// =======================================================================
// LECTURA GLOBAL DE LA BASE DE DATOS
// =======================================================================
app.get('/api/db', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [profesores] = await connection.query('SELECT * FROM profesores');
        const [asignaturas] = await connection.query('SELECT * FROM asignaturas');
        const [horarios] = await connection.query('SELECT * FROM horarios');
        const [solicitudes_estudiantes] = await connection.query('SELECT * FROM solicitudes_estudiantes');
        const [solicitudes_profesores] = await connection.query('SELECT * FROM solicitudes_profesores');
        
        // ESTA ES LA LÍNEA CLAVE PARA EL AULA VIRTUAL
        const [anuncios_aula] = await connection.query('SELECT * FROM anuncios_aula'); 
        
        const [notasRows] = await connection.query('SELECT * FROM notas');
        const notas = notasRows.map(n => n.descripcion);
        
        await connection.end();
        
        // Enviamos todo al frontend, incluyendo anuncios_aula
        res.json({ profesores, asignaturas, horarios, solicitudes_estudiantes, solicitudes_profesores, anuncios_aula, notas });
    } catch (error) { res.status(500).send("Error conectando a MySQL"); }
});

// =======================================================================
// ENDPOINTS CRUD EXISTENTES
// =======================================================================
app.post('/api/solicitudes_estudiantes', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('INSERT INTO solicitudes_estudiantes (id, nombre, fecha_nacimiento, correo, anio_postulacion, estado, fecha_inscripcion, motivacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [req.body.id, req.body.nombre, req.body.fecha_nacimiento, req.body.correo, req.body.anio_postulacion, req.body.estado, req.body.fecha, req.body.motivacion]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.put('/api/solicitudes_estudiantes/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('UPDATE solicitudes_estudiantes SET estado = ? WHERE id = ?', [req.body.estado, req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.delete('/api/solicitudes_estudiantes/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('DELETE FROM solicitudes_estudiantes WHERE id = ?', [req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });

app.post('/api/profesores', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('INSERT INTO profesores (id, nombre, departamento) VALUES (?, ?, ?)', [req.body.id, req.body.nombre, req.body.departamento]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.put('/api/profesores/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('UPDATE profesores SET nombre = ?, departamento = ? WHERE id = ?', [req.body.nombre, req.body.departamento, req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });

app.post('/api/asignaturas', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('INSERT INTO asignaturas (id, codigo, nombre, profesor_id, color) VALUES (?, ?, ?, ?, ?)', [req.body.id, req.body.codigo, req.body.nombre, req.body.profesor_id, req.body.color]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.put('/api/asignaturas/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('UPDATE asignaturas SET codigo = ?, nombre = ?, profesor_id = ?, color = ? WHERE id = ?', [req.body.codigo, req.body.nombre, req.body.profesor_id, req.body.color, req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });

app.post('/api/solicitudes_profesores', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('INSERT INTO solicitudes_profesores (id, profesor, ubicacion, problema, prioridad, fecha) VALUES (?, ?, ?, ?, ?, ?)', [req.body.id, req.body.profesor, req.body.ubicacion, req.body.problema, req.body.prioridad, req.body.fecha]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.put('/api/solicitudes_profesores/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('UPDATE solicitudes_profesores SET prioridad = ? WHERE id = ?', [req.body.prioridad, req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });
app.delete('/api/solicitudes_profesores/:id', async (req, res) => { try { const connection = await mysql.createConnection(dbConfig); await connection.query('DELETE FROM solicitudes_profesores WHERE id = ?', [req.params.id]); await connection.end(); res.json({ message: "OK" }); } catch (error) { res.status(500).json({ error: error.message }); } });

// =======================================================================
// ENDPOINTS AULA VIRTUAL
// =======================================================================
app.post('/api/anuncios_aula', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('INSERT INTO anuncios_aula (id, titulo, contenido, autor, fecha) VALUES (?, ?, ?, ?, ?)', [req.body.id, req.body.titulo, req.body.contenido, req.body.autor, req.body.fecha]);
        await connection.end(); res.json({ message: "OK" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/anuncios_aula/:id', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('DELETE FROM anuncios_aula WHERE id = ?', [req.params.id]);
        await connection.end(); res.json({ message: "OK" });
    } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(3000, () => {
    console.log('Servidor Backend corriendo en http://localhost:3000');
});