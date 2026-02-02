const express = require('express');
const mysql = require('mysql2');

const app = express();

// ================= MIDDLEWARES =================
app.use(express.urlencoded({ extended: true }));

// ================= PUERTO =================
const PORT = process.env.PORT || 3000;

// ================= MYSQL =================
if (!process.env.MYSQL_URL) {
    console.error('❌ MYSQL_URL no está definida');
    process.exit(1);
}

const connection = mysql.createPool(process.env.MYSQL_URL);

// ================= RUTA PRINCIPAL (READ) =================
app.get('/', (req, res) => {
    connection.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.error(err);
            return res.send('<h2>Error al conectar con la base de datos</h2>');
        }

        let filas = '';
        if (results.length > 0) {
            results.forEach(u => {
                filas += `
                <tr>
                    <td style="padding:10px;">${u.id}</td>
                    <td style="padding:10px;">${u.nombre}</td>
                    <td style="padding:10px;">${u.email}</td>
                    <td style="padding:10px; display:flex; gap:5px;">
                        <form action="/edit/${u.id}" method="GET">
                            <button type="submit">✏️ Editar</button>
                        </form>
                        <form action="/delete/${u.id}" method="POST" onsubmit="return confirm('¿Eliminar usuario?');">
                            <button type="submit">🗑️ Eliminar</button>
                        </form>
                    </td>
                </tr>
                `;
            });
        } else {
            filas = `<tr><td colspan="4">No hay datos</td></tr>`;
        }

        res.send(`
        <html>
        <body style="font-family:sans-serif; background:#0b0e14; color:white; padding:2rem;">
            <div style="max-width:700px; margin:auto; background:#151921; padding:2rem; border-radius:15px;">
                
                <h2>➕ Nuevo Usuario</h2>
                <form action="/add" method="POST" style="display:flex; gap:10px; margin-bottom:2rem;">
                    <input name="nombre" placeholder="Nombre" required />
                    <input name="email" placeholder="Email" required />
                    <button type="submit">Guardar</button>
                </form>

                <h2>📋 Lista de Usuarios</h2>
                <table border="1" width="100%">
                    <tr>
                        <th>ID</th>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Acciones</th>
                    </tr>
                    ${filas}
                </table>
            </div>
        </body>
        </html>
        `);
    });
});

// ================= CREATE =================
app.post('/add', (req, res) => {
    const { nombre, email } = req.body;

    connection.query(
        'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
        [nombre, email],
        (err) => {
            if (err) {
                console.error(err);
                return res.send('Error al guardar usuario');
            }
            res.redirect('/');
        }
    );
});

// ================= EDIT (FORM) =================
app.get('/edit/:id', (req, res) => {
    const { id } = req.params;

    connection.query(
        'SELECT * FROM usuarios WHERE id = ?',
        [id],
        (err, results) => {
            if (err || results.length === 0) {
                return res.send('Usuario no encontrado');
            }

            const u = results[0];

            res.send(`
            <html>
            <body style="font-family:sans-serif; background:#0b0e14; color:white; padding:2rem;">
                <div style="max-width:400px; margin:auto; background:#151921; padding:2rem; border-radius:15px;">
                    <h2>✏️ Editar Usuario</h2>
                    <form action="/update/${u.id}" method="POST" style="display:flex; flex-direction:column; gap:10px;">
                        <input name="nombre" value="${u.nombre}" required />
                        <input name="email" value="${u.email}" required />
                        <button type="submit">Actualizar</button>
                    </form>
                    <br>
                    <a href="/" style="color:#6cf;">⬅ Volver</a>
                </div>
            </body>
            </html>
            `);
        }
    );
});

// ================= UPDATE =================
app.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, email } = req.body;

    connection.query(
        'UPDATE usuarios SET nombre = ?, email = ? WHERE id = ?',
        [nombre, email, id],
        (err) => {
            if (err) {
                console.error(err);
                return res.send('Error al actualizar');
            }
            res.redirect('/');
        }
    );
});

// ================= DELETE =================
app.post('/delete/:id', (req, res) => {
    const { id } = req.params;

    connection.query(
        'DELETE FROM usuarios WHERE id = ?',
        [id],
        (err) => {
            if (err) {
                console.error(err);
                return res.send('Error al eliminar');
            }
            res.redirect('/');
        }
    );
});

// ================= SERVER =================
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});
