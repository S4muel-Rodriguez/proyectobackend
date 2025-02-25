const express = require('express');
const fs = require('fs/promises');
const router = express.Router();
const filePath = './data/productos.json';

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
