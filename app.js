const express = require('express');
const { Server } = require('socket.io');
const path = require('path');
const http = require('http');
const viewsRouter = require('./src/routes/views.router');
const app = express();
const ProductManager = require('./src/ProductManager');

// Importar las rutas
const productsRouter = require('./src/routes/products.js');
const cartsRouter = require('./src/routes/carts.js');
app.use('/', viewsRouter);

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Sirve archivos estáticos

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

// Iniciar servidor HTTP
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

// Configuración de WebSocket
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado');

  // Manejar eventos de creación de productos
  socket.on('product:create', async (productData) => {
    const ProductManager = require('./ProductManager'); // Clase para manejar productos
    const productManager = new ProductManager('./products.json');

    await productManager.addProduct(productData);
    socket.broadcast.emit('products:update'); // Notifica a otros clientes
  });

  // Manejar eventos de eliminación de productos
  socket.on('product:delete', async (productId) => {
    const ProductManager = require('./ProductManager');
    const productManager = new ProductManager('./products.json');

    await productManager.deleteProduct(productId);
    socket.broadcast.emit('products:update');
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});