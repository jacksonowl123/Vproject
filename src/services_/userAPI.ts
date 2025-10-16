import axios from 'axios';

const API_URL = 'https://office.86now.online/api';
const BEARER_TOKEN = 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJEZXdhTWFsYXlhMzMiLCJhdWQiOiI0IiwiaXNzIjoiZGV3YW1hbGF5YTMzLmNvbSIsImV4cCI6MTkyNDk5MTk5OSwiaWF0IjoxNzA0MDY3MjAwLCJpcHMiOiIiLCJqdGkiOiI4OSJ9.CXeMZrA6KCCNHVzp0cGAhTIbEI8Zbd3bIVtVEPktoZfPJHCYQxWBPWn3XGwmIK9jXTEzNiazFQniTRHCUYnt_A';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${BEARER_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

interface LoginResponse {
  access_token: string;
  [key: string]: any;
}

export const userAPI = {
  async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const payload = btoa(JSON.stringify({
        username: username.trim(),
        password: password.trim()
      }));

      const response = await api.post('', {
        endpoint: 'members.signin',
        payload
      });

      if (response.data.access_token) {
        localStorage.setItem('user_token', response.data.access_token);
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
      }
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async createMember(
    firstname: string,
    lastname: string,
    phone: string,
    usr: string,
    pwd: string,
    email: string,
    status: string = '1'
  ) {
    try {
      const payload = btoa(JSON.stringify({ 
        firstname, lastname, phone, usr, pwd, email, status 
      }));

      const response = await api.post('', {
        endpoint: 'members.create',
        payload
      });
      return response.data;
    } catch (error) {
      console.error('Create member error:', error);
      throw error;
    }
  },

  async getMemberDetails() {
    try {
      const response = await api.post('', {
        endpoint: 'members.whoami',
        payload: ''
      });
      return response.data;
    } catch (error) {
      console.error('Get member details error:', error);
      throw error;
    }
  },

  async updatePassword(newPassword: string) {
    try {
      const payload = btoa(JSON.stringify({ pwd: newPassword }));
      const response = await api.post('', {
        endpoint: 'members.update',
        payload
      });
      return response.data;
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  }
}; 