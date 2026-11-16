/**
 * Safe Auth Storage Helper
 * Tránh crash ứng dụng khi localStorage rỗng hoặc dữ liệu JSON bị hỏng
 */

export const authStorage = {
  getToken: () => {
    try {
      return localStorage.getItem('token') || null;
    } catch {
      return null;
    }
  },

  setToken: (token) => {
    try {
      if (token) {
        localStorage.setItem('token', token);
      } else {
        localStorage.removeItem('token');
      }
    } catch (e) {
      console.warn('Could not save token to localStorage', e);
    }
  },

  getUser: () => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  setUser: (user) => {
    try {
      if (user) {
        localStorage.setItem('user', typeof user === 'string' ? user : JSON.stringify(user));
      } else {
        localStorage.removeItem('user');
      }
    } catch (e) {
      console.warn('Could not save user to localStorage', e);
    }
  },

  clearSession: () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (e) {
      console.warn('Could not clear auth session', e);
    }
  },

  isAuthenticated: () => {
    return Boolean(authStorage.getToken());
  }
};
