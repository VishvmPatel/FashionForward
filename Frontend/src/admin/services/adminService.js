class AdminService {
  constructor() {
    const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    this.baseURL = `${apiBaseUrl}/admin`;
  }

  getAuthToken() {
    return localStorage.getItem('token');
  }

  async makeRequest(endpoint, options = {}) {
    const token = this.getAuthToken();
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/admin/login';
          throw new Error('Authentication required');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Admin API request failed:', error);
      throw error;
    }
  }

  async getDashboardData() {
    return this.makeRequest('/dashboard');
  }

  async getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/products${queryString ? `?${queryString}` : ''}`);
  }

  async createProduct(productData) {
    return this.makeRequest('/products', {
      method: 'POST',
      body: JSON.stringify(productData)
    });
  }

  async updateProduct(productId, updateData) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    });
  }

  async deleteProduct(productId) {
    return this.makeRequest(`/products/${productId}`, {
      method: 'DELETE'
    });
  }

  async getOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  }

  async updateOrderStatus(orderId, statusData) {
    return this.makeRequest(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify(statusData)
    });
  }

  async getUsers(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/users${queryString ? `?${queryString}` : ''}`);
  }

  async getLogs(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/logs${queryString ? `?${queryString}` : ''}`);
  }

  async getAnalytics(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.makeRequest(`/analytics${queryString ? `?${queryString}` : ''}`);
  }
}

export default new AdminService();
