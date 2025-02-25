const fs = require('fs');

class ProductManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getAllProducts() {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error al leer el archivo:', error);
      return [];
    }
  }

  async addProduct(product) {
    try {
      const products = await this.getAllProducts();
      const newProduct = { id: this.generateId(products), ...product };
      products.push(newProduct);
      await this.saveProducts(products);
      return newProduct;
    } catch (error) {
      console.error('Error al agregar producto:', error);
      throw error;
    }
  }

  async deleteProduct(id) {
    try {
      const products = await this.getAllProducts();
      const filteredProducts = products.filter((product) => product.id !== id);
      if (products.length === filteredProducts.length) {
        throw new Error('Producto no encontrado');
      }
      await this.saveProducts(filteredProducts);
      return true;
    } catch (error) {
      console.error('Error al eliminar producto:', error);
      throw error;
    }
  }

  async updateProduct(id, updatedData) {
    try {
      const products = await this.getAllProducts();
      const productIndex = products.findIndex((product) => product.id === id);
      if (productIndex === -1) {
        throw new Error('Producto no encontrado');
      }
      products[productIndex] = { ...products[productIndex], ...updatedData };
      await this.saveProducts(products);
      return products[productIndex];
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      throw error;
    }
  }

  async saveProducts(products) {
    try {
      await fs.promises.writeFile(this.filePath, JSON.stringify(products, null, 2));
    } catch (error) {
      console.error('Error al guardar productos:', error);
      throw error;
    }
  }

  generateId(products) {
    return products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
  }
}

module.exports = ProductManager;
