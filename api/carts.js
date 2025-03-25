const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Rutas a los archivos de datos
const cartsFilePath = path.join(__dirname, '../data/cid.json');
const productsFilePath = path.join(__dirname, '../data/productos.json');

// Leer archivo JSON
const readFile = (filePath) => {
  try {
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Guardar archivo JSON
const writeFile = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Crear un nuevo carrito
router.post('/', (req, res) => {
  const carts = readFile(cartsFilePath);

  const newCart = {
    id: carts.length > 0 ? carts[carts.length - 1].id + 1 : 1,
    products: []
  };

  carts.push(newCart);
  writeFile(cartsFilePath, carts);

  res.status(201).json({ message: 'Carrito creado', cart: newCart });
});

// Obtener productos de un carrito
router.get('/:cid', (req, res) => {
  const carts = readFile(cartsFilePath);
  const { cid } = req.params;

  const cart = carts.find((c) => c.id === parseInt(cid));
  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  res.json(cart.products);
});

// Agregar un producto al carrito
router.post('/:cid/product/:pid', (req, res) => {
  const carts = readFile(cartsFilePath);
  const products = readFile(productsFilePath);
  const { cid, pid } = req.params;

  const cart = carts.find((c) => c.id === parseInt(cid));
  if (!cart) {
    return res.status(404).json({ error: 'Carrito no encontrado' });
  }

  const product = products.find((p) => p.id === parseInt(pid));
  if (!product) {
    return res.status(404).json({ error: 'Producto no encontrado' });
  }

  const existingProduct = cart.products.find((p) => p.product === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    cart.products.push({ product: product.id, quantity: 1 });
  }

  writeFile(cartsFilePath, carts);

  res.status(200).json({ message: 'Producto agregado al carrito', cart });
});

module.exports = router;


router.post('/:cartId/products', async (req, res) => {
  try {
      const { cartId } = req.params;
      const { productId, quantity } = req.body;

      const product = await Product.findById(productId);
      if (!product || product.stock < quantity) {
          return res.status(400).json({ error: 'Producto no disponible o stock insuficiente' });
      }

      const cart = await Cart.findById(cartId);

      // Buscar si el producto ya está en el carrito
      const existingProduct = cart.products.find((p) => p.productId.toString() === productId);

      if (existingProduct) {
          existingProduct.quantity += quantity;
      } else {
          cart.products.push({ productId, quantity });
      }

      // Guardar el carrito y actualizar stock
      await cart.save();
      product.stock -= quantity;
      await product.save();

      res.json(cart);
  } catch (error) {
      res.status(500).json({ error: 'Error al agregar producto al carrito' });
  }
});




router.delete('/:cartId', async (req, res) => {
  try {
      const { cartId } = req.params;

      const cart = await Cart.findById(cartId);
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

      // Restaurar el stock de los productos
      for (const item of cart.products) {
          const product = await Product.findById(item.productId);
          if (product) {
              product.stock += item.quantity;
              await product.save();
          }
      }

      // Vaciar productos en el carrito
      cart.products = [];
      await cart.save();

      res.json({ success: true, message: 'Carrito vaciado correctamente' });
  } catch (error) {
      res.status(500).json({ error: 'Error al vaciar el carrito' });
  }
});




router.get('/:cartId/total', async (req, res) => {
  try {
      const { cartId } = req.params;

      const cart = await Cart.findById(cartId).populate('products.productId');
      if (!cart) return res.status(404).json({ error: 'Carrito no encontrado' });

      // Calcular el precio total
      const total = cart.products.reduce((sum, item) => {
          return sum + item.productId.price * item.quantity;
      }, 0);

      res.json({ success: true, total });
  } catch (error) {
      res.status(500).json({ error: 'Error al calcular el total del carrito' });
  }
});



