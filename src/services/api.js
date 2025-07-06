const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('tempEmailSessionId');
    if (!sessionId) {
      sessionId = this.generateUUID();
      localStorage.setItem('tempEmailSessionId', sessionId);
    }
    return sessionId;
  }

  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async generateEmail() {
    try {
      const response = await this.request('/email/generate', {
        method: 'POST',
        body: {
          sessionId: this.sessionId
        }
      });

      return response.data;
    } catch (error) {
      console.error('Failed to generate email:', error);
      throw new Error('Failed to generate temporary email address');
    }
  }

  async getMessages(emailAddress) {
    try {
      const response = await this.request(
        `/email/${encodeURIComponent(emailAddress)}/messages?sessionId=${this.sessionId}`
      );

      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      throw new Error('Failed to retrieve messages');
    }
  }

  async markMessageAsRead(messageId) {
    try {
      await this.request(`/message/${messageId}/read`, {
        method: 'PATCH',
        body: {
          sessionId: this.sessionId
        }
      });
    } catch (error) {
      console.error('Failed to mark message as read:', error);
    }
  }

  async checkHealth() {
    try {
      const response = await this.request('/health');
      return response;
    } catch (error) {
      console.error('Health check failed:', error);
      return { status: 'unhealthy' };
    }
  }
}

export default new ApiService();