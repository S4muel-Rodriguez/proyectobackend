const express = require('express');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const newCart = new Cart({ products: [] });
        await newCart.save();
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear el carrito' });
    }
});

// Agregar producto al carrito
router.post('/:cartId/products', async (req, res) => {
    try {
        const { cartId } = req.params;
        const { productId, quantity } = req.body;

        const product = await Product.findById(productId);
        if (!product || product.stock < quantity) {
            return res.status(400).json({ error: 'Producto no disponible o stock insuficiente' });
        }

        const cart = await Cart.findById(cartId);
        cart.products.push({ productId, quantity });
        await cart.save();

        // Reducir stock del producto
        product.stock -= quantity;
        await product.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al agregar producto al carrito' });
    }
});

// Obtener un carrito
router.get('/:cartId', async (req, res) => {
    try {
        const { cartId } = req.params;
        const cart = await Cart.findById(cartId).populate('products.productId');
        res.json(cart);
    } catch (error) {
        res.status(404).json({ error: 'Carrito no encontrado' });
    }
});

// Eliminar un producto del carrito
router.delete('/:cartId/products/:productId', async (req, res) => {
    try {
        const { cartId, productId } = req.params;
        const cart = await Cart.findById(cartId);

        cart.products = cart.products.filter((item) => item.productId.toString() !== productId);
        await cart.save();

        res.json(cart);
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar producto del carrito' });
    }
});

module.exports = router;
