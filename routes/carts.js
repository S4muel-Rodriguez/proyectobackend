const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Ruta del archivo de datos
const cartsFilePath = path.join(__dirname, '../data/carrito.json');
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Leer archivo JSON
const readFile = (filePath) => {
    try {
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (error) {
        return [];
    }
};

// Escribir archivo JSON
const writeFile = (filePath, data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
};

// Crear un nuevo carrito
router.post('/', (req, res) => {
    const carts = readFile(cartsFilePath);
    const newCart = {
        id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
        products: [],
    };
    carts.push(newCart);
    writeFile(cartsFilePath, carts);
    res.status(201).json(newCart);
});

// Obtener los productos de un carrito por ID
router.get('/:cid', (req, res) => {
    const { cid } = req.params;
    const carts = readFile(cartsFilePath);
    const cart = carts.find((c) => c.id === parseInt(cid));

    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    res.json(cart.products);
});

// Agregar un producto a un carrito
router.post('/:cid/product/:pid', (req, res) => {
    const { cid, pid } = req.params;
    const carts = readFile(cartsFilePath);
    const products = readFile(productsFilePath);

    // Buscar el carrito por ID
    const cart = carts.find((c) => c.id === parseInt(cid));
    if (!cart) {
        return res.status(404).json({ error: 'Carrito no encontrado' });
    }

    // Buscar el producto por ID
    const product = products.find((p) => p.id === parseInt(pid));
    if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
    }

    // Buscar si el producto ya está en el carrito
    const productInCart = cart.products.find((p) => p.product === parseInt(pid));
    if (productInCart) {
        productInCart.quantity += 1; // Incrementar la cantidad si ya existe
    } else {
        cart.products.push({ product: parseInt(pid), quantity: 1 }); // Agregar nuevo producto
    }

    writeFile(cartsFilePath, carts);
    res.status(200).json(cart);
});

module.exports = router;
