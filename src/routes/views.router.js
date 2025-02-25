const { Router } = require('express');
const path = require('path');

const router = Router();

// Ruta para la vista principal
router.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta para la vista de productos en tiempo real
router.get('/realtimeProducts', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/realtimeProducts.html'));
});

module.exports = router;
