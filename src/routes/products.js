const express = require('express');
const fs = require('fs/promises');
const router = express.Router();
const filePath = './data/productos.json';
const Product = require('../models/Product');

// Helper para leer/escribir datos
async function getProducts() {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
}

async function saveProducts(products) {
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
}

// GET / - Listar todos los productos
router.get('/', async (req, res) => {
    const products = await getProducts();
    const limit = parseInt(req.query.limit);
    res.json(limit ? products.slice(0, limit) : products);
});

// GET /:pid - Traer producto por ID
router.get('/:pid', async (req, res) => {
    const products = await getProducts();
    const product = products.find(p => p.id === req.params.pid);
    product ? res.json(product) : res.status(404).json({ error: 'Producto no encontrado' });
});

// POST / - Agregar nuevo producto
router.post('/', async (req, res) => {
    const { title, description, code, price, stock, category, thumbnails } = req.body;
    if (!title || !description || !code || !price || !stock || !category) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios excepto thumbnails' });
    }
    const products = await getProducts();
    const newProduct = {
        id: (products.length + 1).toString(),
        title,
        description,
        code,
        price,
        status: true,
        stock,
        category,
        thumbnails: thumbnails || []
    };
    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json(newProduct);
});

// PUT /:pid - Actualizar producto
router.put('/:pid', async (req, res) => {
    const updates = req.body;
    const products = await getProducts();
    const productIndex = products.findIndex(p => p.id === req.params.pid);
    if (productIndex === -1) return res.status(404).json({ error: 'Producto no encontrado' });
    products[productIndex] = { ...products[productIndex], ...updates, id: products[productIndex].id };
    await saveProducts(products);
    res.json(products[productIndex]);
});

// DELETE /:pid - Eliminar producto
router.delete('/:pid', async (req, res) => {
    const products = await getProducts();
    const newProducts = products.filter(p => p.id !== req.params.pid);
    if (products.length === newProducts.length) return res.status(404).json({ error: 'Producto no encontrado' });
    await saveProducts(newProducts);
    res.status(204).send();
});

module.exports = router;



// Obtener todos los productos
router.get('/', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener los productos' });
    }
});

// Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { name, price, stock, description } = req.body;
        const newProduct = new Product({ name, price, stock, description });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ error: 'Error al crear el producto' });
    }
});

// Actualizar un producto
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

// Eliminar un producto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Product.findByIdAndDelete(id);
        res.status(204).send();
    } catch (error) {
        res.status(404).json({ error: 'Producto no encontrado' });
    }
});

module.exports = router;