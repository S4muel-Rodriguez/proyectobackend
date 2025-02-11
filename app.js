const express = require('express');
const app = express();

// Importar las rutas
const productsRouter = require('./routes/products.js');
const cartsRouter = require('./routes/carts.js');

// Middlewares
app.use(express.json());

// Rutas
app.use('/api/products', productsRouter);
app.use('/api/carts', cartsRouter);

// Middleware para manejo de errores 404
app.use((req, res, next) => {
  // Verificar si la ruta pertenece a los recursos 'products' o 'carts'
  if (req.originalUrl.startsWith('/api/products')) {
    return res.status(404).json({ error: 'Producto no encontrado. Verifica la ruta o el ID proporcionado.' });
  } else if (req.originalUrl.startsWith('/api/carts')) {
    return res.status(404).json({ error: 'Carrito no encontrado. Verifica la ruta o el ID proporcionado.' });
  }
  // Si no pertenece a 'products' ni 'carts', mensaje genérico
  res.status(404).json({ error: 'Ruta no encontrada. Verifica la URL proporcionada.' });
});

// Manejo de errores global (para errores internos del servidor)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor. Por favor, intente más tarde.' });
});

// Iniciar servidor
const PORT = process.env.PORT || 8080; // Usar puerto del entorno si está disponible
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});

