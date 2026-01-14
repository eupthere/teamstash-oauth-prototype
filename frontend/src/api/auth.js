const API_BASE_URL = '';

/**
 * Signup a new user
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{message: string, user: {id: string, email: string, createdAt: string}}>}
 */
export async function signup(email, password) {
  const response = await fetch(`${API_BASE_URL}/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Signup failed');
  }

  return data;
}

/**
 * Login with email and password
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<{message: string, user: {id: string, email: string, createdAt: string}}>}
 */
export async function login(email, password) {
  const response = await fetch(`${API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Login failed');
  }

  return data;
}

/**
 * Logout current user
 * @returns {Promise<{message: string}>}
 */
export async function logout() {
  const response = await fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Logout failed');
  }

  return data;
}
