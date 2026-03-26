// Base API configuration and service
const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: { ...this.defaultHeaders, ...options.headers },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // HTTP methods
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url);
  }

  async post(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch(endpoint, data = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // Utility methods
  async upload(endpoint, formData, onProgress) {
    const url = `${this.baseURL}${endpoint}`;
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('POST', url);
      xhr.setRequestHeader('Authorization', `Bearer ${this.getToken()}`);
      
      xhr.upload.onprogress = (event) => {
        if (onProgress && event.lengthComputable) {
          const percentComplete = (event.loaded / event.total) * 100;
          onProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText));
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Upload failed'));
      xhr.send(formData);
    });
  }

  // Authentication helpers
  setToken(token) {
    localStorage.setItem('authToken', token);
    this.defaultHeaders.Authorization = `Bearer ${token}`;
  }

  getToken() {
    return localStorage.getItem('authToken');
  }

  removeToken() {
    localStorage.removeItem('authToken');
    delete this.defaultHeaders.Authorization;
  }

  // Pagination helper
  async getPaginated(endpoint, page = 1, limit = 50, filters = {}) {
    const params = { page, limit, ...filters };
    return this.get(endpoint, params);
  }

  // Search helper
  async search(endpoint, searchTerm, filters = {}) {
    const params = { search: searchTerm, ...filters };
    return this.get(endpoint, params);
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
export { ApiService };