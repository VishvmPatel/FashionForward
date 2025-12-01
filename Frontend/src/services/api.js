const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  getAuthToken() {
    return localStorage.getItem('token') || localStorage.getItem('authToken') || sessionStorage.getItem('token') || sessionStorage.getItem('authToken');
  }

  async fetchData(endpoint, options = {}) {
    try {
      const token = this.getAuthToken();
      
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers
      };

      // Skip authentication for certain public endpoints
      const publicEndpoints = [
        '/auth/login',
        '/auth/signup',
        '/auth/forgot-password',
        '/auth/verify-otp',
        '/auth/reset-password',
        '/auth/google',
        '/auth/google/config',
        '/products',
        '/products/search',
        '/products/categories',
        '/products/featured/items',
        '/products/new/items',
        '/products/sale/items',
        '/products/filters/options'
      ];

      const isPublicEndpoint = publicEndpoints.some(publicEndpoint => 
        endpoint.startsWith(publicEndpoint)
      );

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      } else if (!isPublicEndpoint) {
        console.warn('No authentication token found for request to:', endpoint);
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers,
        ...options
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchData(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async getProduct(id) {
    return this.fetchData(`/products/${id}`);
  }

  async getProductsByCategory(category, limit = 8) {
    return this.fetchData(`/products/category/${category}?limit=${limit}`);
  }

  async getProductsByGender(gender, limit = 8) {
    return this.fetchData(`/products?gender=${gender}&limit=${limit}`);
  }

  async searchProducts(query, limit = 12) {
    return this.fetchData(`/products/search/${encodeURIComponent(query)}?limit=${limit}`);
  }

  async getSaleProducts(limit = 12) {
    return this.fetchData(`/products/sale/items?limit=${limit}`);
  }

  async getFeaturedProducts(limit = 8) {
    return this.fetchData(`/products/featured/items?limit=${limit}`);
  }

  async getNewProducts(limit = 8) {
    return this.fetchData(`/products/new/items?limit=${limit}`);
  }

  async getFilterOptions() {
    return this.fetchData('/products/filters/options');
  }

  async addProductReview(productId, reviewData) {
    return this.fetchData(`/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async registerUser(userData) {
    return this.fetchData('/users/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async loginUser(credentials) {
    return this.fetchData('/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  async getUserProfile(token) {
    return this.fetchData('/users/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  async updateUserProfile(profileData) {
    return this.fetchData('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async changePassword(passwordData) {
    return this.fetchData('/users/change-password', {
      method: 'PUT',
      body: JSON.stringify(passwordData)
    });
  }

  async getSystemStatus() {
    return this.fetchData('/admin/system-status');
  }

  async forgotPassword(email) {
    return this.fetchData('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  async verifyOTP(email, otp) {
    return this.fetchData('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp })
    });
  }

  async resetPassword(email, otp, password) {
    return this.fetchData('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email, otp, password })
    });
  }

  async addToWishlist(productId) {
    return this.fetchData(`/users/wishlist/${productId}`, {
      method: 'POST'
    });
  }

  async removeFromWishlist(productId) {
    return this.fetchData(`/users/wishlist/${productId}`, {
      method: 'DELETE'
    });
  }

  async getWishlist() {
    return this.fetchData('/users/wishlist');
  }

  async clearWishlist() {
    return this.fetchData('/users/wishlist', {
      method: 'DELETE'
    });
  }

  async createOrder(orderData) {
    return this.fetchData('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchData(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async getUserOrders() {
    return this.fetchData('/orders/my-orders');
  }

  async getOrder(orderId) {
    return this.fetchData(`/orders/${orderId}`);
  }

  async cancelOrder(orderId, reason) {
    return this.fetchData(`/orders/${orderId}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason })
    });
  }

  // Address Management
  async getAddresses() {
    return this.fetchData('/addresses');
  }

  async getUserAddresses() {
    return this.fetchData('/addresses');
  }

  async getDefaultAddress() {
    return this.fetchData('/addresses/default');
  }

  async addAddress(addressData) {
    return this.fetchData('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData)
    });
  }

  async updateAddress(addressId, addressData) {
    return this.fetchData(`/addresses/${addressId}`, {
      method: 'PUT',
      body: JSON.stringify(addressData)
    });
  }

  async deleteAddress(addressId) {
    return this.fetchData(`/addresses/${addressId}`, {
      method: 'DELETE'
    });
  }

  async setDefaultAddress(addressId) {
    return this.fetchData(`/addresses/${addressId}/default`, {
      method: 'PUT'
    });
  }

  // Order Management
  async getOrders(page = 1, limit = 10) {
    return this.fetchData(`/orders?page=${page}&limit=${limit}`);
  }

  async getOrder(orderId) {
    return this.fetchData(`/orders/${orderId}`);
  }

  async createOrder(orderData) {
    return this.fetchData('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  async updateOrderStatus(orderId, statusData) {
    return this.fetchData(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async cancelOrder(orderId) {
    return this.fetchData(`/orders/${orderId}`, {
      method: 'DELETE'
    });
  }

  async getOrderStats() {
    return this.fetchData('/orders/stats/summary');
  }

  async get(endpoint, options = {}) {
    return this.fetchData(endpoint, { method: 'GET', ...options });
  }

  async post(endpoint, data, options = {}) {
    return this.fetchData(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options
    });
  }

  async put(endpoint, data, options = {}) {
    return this.fetchData(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options
    });
  }

  async delete(endpoint, options = {}) {
    return this.fetchData(endpoint, { method: 'DELETE', ...options });
  }

  async healthCheck() {
    return this.fetchData('/health');
  }

  // Payment methods
  async createPaymentIntent(data) {
    return this.post('/payments/create-payment-intent', data);
  }

  async confirmPayment(data) {
    return this.post('/payments/confirm-payment', data);
  }

  async getMyPayments(page = 1, limit = 10) {
    return this.fetchData(`/payments/my-payments?page=${page}&limit=${limit}`);
  }

  async getPaymentDetails(paymentId) {
    return this.fetchData(`/payments/${paymentId}`);
  }

  // Review Management
  async submitReview(reviewData) {
    return this.fetchData('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData)
    });
  }

  async getProductReviews(productId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.fetchData(`/reviews/product/${productId}${queryString ? `?${queryString}` : ''}`);
  }

  async getUserReviews() {
    return this.fetchData('/reviews/my-reviews');
  }

  async markReviewHelpful(reviewId, isHelpful) {
    return this.fetchData(`/reviews/${reviewId}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ helpful: isHelpful })
    });
  }

  async deleteReview(reviewId) {
    return this.fetchData(`/reviews/${reviewId}`, {
      method: 'DELETE'
    });
  }

  async getReviewStats(productId) {
    return this.fetchData(`/reviews/product/${productId}/stats`);
  }
}

const apiService = new ApiService();
export default apiService;
