import { createContext, useState, useContext } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Simple mock auth state for frontend UI demonstration
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    // Mock login logic - in a real app this makes an API call
    setUser({ id: '1', name: 'John Doe', email });
  };

  const register = (name, email, password) => {
    // Mock register logic
    setUser({ id: '1', name, email });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
