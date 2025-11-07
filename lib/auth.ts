/**
 * Authentication utility for Stay Fresh mobile app
 * Handles persistent login with JWT tokens
 */

interface AuthData {
  token: string;
  farmerId: string;
  userEmail: string;
  isAdmin?: boolean;
  expiresAt: number;
}

const AUTH_KEY = 'stayfresh_auth';
const TOKEN_EXPIRY_DAYS = 7;

/**
 * Save authentication data to localStorage
 */
export const saveAuth = (token: string, farmerId: string, userEmail: string, isAdmin: boolean = false) => {
  const expiresAt = Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000); // 7 days
  
  const authData: AuthData = {
    token,
    farmerId,
    userEmail,
    isAdmin,
    expiresAt
  };

  localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
  
  // Also save individual items for backward compatibility
  localStorage.setItem('token', token);
  localStorage.setItem('farmerId', farmerId);
  localStorage.setItem('userEmail', userEmail);
  if (isAdmin) {
    localStorage.setItem('isAdmin', 'true');
  }

  console.log('✅ Auth saved, expires at:', new Date(expiresAt).toLocaleString());
};

/**
 * Get authentication data from localStorage
 */
export const getAuth = (): AuthData | null => {
  try {
    const authStr = localStorage.getItem(AUTH_KEY);
    if (!authStr) {
      // Try to get from individual items (backward compatibility)
      const token = localStorage.getItem('token');
      const farmerId = localStorage.getItem('farmerId');
      const userEmail = localStorage.getItem('userEmail');
      
      if (token && farmerId) {
        // Migrate to new format
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        const expiresAt = Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
        const authData: AuthData = { token, farmerId, userEmail: userEmail || '', isAdmin, expiresAt };
        localStorage.setItem(AUTH_KEY, JSON.stringify(authData));
        return authData;
      }
      
      return null;
    }

    const authData: AuthData = JSON.parse(authStr);
    
    // Check if token is expired
    if (Date.now() > authData.expiresAt) {
      console.log('⚠️ Token expired');
      clearAuth();
      return null;
    }

    return authData;
  } catch (error) {
    console.error('Error getting auth:', error);
    return null;
  }
};

/**
 * Get current token
 */
export const getToken = (): string | null => {
  const auth = getAuth();
  return auth?.token || null;
};

/**
 * Get current farmer ID
 */
export const getFarmerId = (): string | null => {
  const auth = getAuth();
  return auth?.farmerId || null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAuth() !== null;
};

/**
 * Check if user is admin
 */
export const isAdmin = (): boolean => {
  const auth = getAuth();
  return auth?.isAdmin || false;
};

/**
 * Clear authentication data
 */
export const clearAuth = () => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem('token');
  localStorage.removeItem('farmerId');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
  console.log('✅ Auth cleared');
};

/**
 * Logout user and redirect to home
 */
export const logout = (router?: any) => {
  clearAuth();
  if (router) {
    router.push('/');
  } else if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
};

/**
 * Refresh token expiry (extend session)
 */
export const refreshSession = () => {
  const auth = getAuth();
  if (auth) {
    const newExpiresAt = Date.now() + (TOKEN_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    auth.expiresAt = newExpiresAt;
    localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
    console.log('✅ Session refreshed, new expiry:', new Date(newExpiresAt).toLocaleString());
  }
};

/**
 * Get time until token expires (in milliseconds)
 */
export const getTimeUntilExpiry = (): number | null => {
  const auth = getAuth();
  if (!auth) return null;
  return auth.expiresAt - Date.now();
};

/**
 * Get formatted expiry time
 */
export const getExpiryDate = (): Date | null => {
  const auth = getAuth();
  if (!auth) return null;
  return new Date(auth.expiresAt);
};
