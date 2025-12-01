const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class CartService {
  async fetchData(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Cart API Error:', error);
      throw error;
    }
  }

  async addToCart(productId, quantity = 1, token) {
    return this.fetchData('/cart/add', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ productId, quantity })
    });
  }

  async getCart(token) {
    return this.fetchData('/cart', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateCartItem(productId, quantity, token) {
    return this.fetchData(`/cart/items/${productId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ quantity })
    });
  }

  async removeFromCart(productId, token) {
    return this.fetchData(`/cart/items/${productId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async clearCart(token) {
    return this.fetchData('/cart/clear', {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async syncCart(localCartItems, token) {
    return this.fetchData('/cart/sync', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ items: localCartItems })
    });
  }

  calculateCartTotals(items) {
    const subtotal = items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const discount = items.reduce((total, item) => {
      if (item.originalPrice && item.originalPrice > item.price) {
        return total + ((item.originalPrice - item.price) * item.quantity);
      }
      return total;
    }, 0);

    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 2000 ? 0 : 100; // Free shipping above ₹2000
    const grandTotal = subtotal + tax + shipping;

    return {
      subtotal: subtotal,
      discount: discount,
      tax: tax,
      shipping: shipping,
      grandTotal: grandTotal
    };
  }

  async validateCartItems(items) {
    return this.fetchData('/cart/validate', {
      method: 'POST',
      body: JSON.stringify({ items })
    });
  }
}

const cartService = new CartService();
export default cartService;
