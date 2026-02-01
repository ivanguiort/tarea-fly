const express = require('express');
const mysql = require('mysql2');

const app = express();

// Middlewares
app.use(express.urlencoded({ extended: true }));

// Puerto dinámico para Railway
const PORT = process.env.PORT || 3000;

// Pool de conexión MySQL (Railway)
if (!process.env.MYSQL_URL) {
    console.error('❌ MYSQL_URL no está definida');
    process.exit(1);
}

const connection = mysql.createPool(process.env.MYSQL_URL);

// Ruta principal
app.get('/', (req, res) => {
    connection.query('SELECT * FROM usuarios', (err, results) => {
        if (err) {
            console.error(err);
            return res.send('<h2>Error al conectar con la base de datos</h2>');
        }

        let filas = '';
        if (results && results.length > 0) {
            results.forEach(u => {
                filas += `
          <tr>
            <td style="padding:10px;">${u.id}</td>
            <td style="padding:10px;">${u.nombre}</td>
            <td style="padding:10px;">${u.email}</td>
          </tr>
        `;
            });
        } else {
            filas = `<tr><td colspan="3">No hay datos</td></tr>`;
        }

        res.send(`
      <html>
        <body style="font-family:sans-serif; background:#0b0e14; color:white; padding:2rem;">
          <div style="max-width:600px; margin:auto; background:#151921; padding:2rem; border-radius:15px;">
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
              </tr>
              ${filas}
            </table>
          </div>
        </body>
      </html>
    `);
    });
});

// Insertar usuario
app.post('/add', (req, res) => {
    const { nombre, email } = req.body;

    connection.query(
        'INSERT INTO usuarios (nombre, email) VALUES (?, ?)',
        [nombre, email],
        (err) => {
            if (err) {
                console.error(err);
                return res.send('Error al guardar el usuario');
            }
            res.redirect('/');
        }
    );
});

// IMPORTANTE: escuchar en 0.0.0.0 para Railway
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
