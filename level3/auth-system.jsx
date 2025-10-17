import React, { useState, useEffect } from 'react';
import { Lock, Mail, User, Eye, EyeOff, LogIn, LogOut, Shield, CheckCircle, XCircle } from 'lucide-react';

// Simulated Authentication API with JWT-like tokens
class AuthAPI {
  constructor() {
    this.users = [
      { 
        id: 1, 
        name: 'Anish Das', 
        email: 'dasanish239@gmail.com', 
        password: 'password123',
        role: 'admin',
        createdAt: '2024-01-15'
      },
      { 
        id: 2, 
        name: 'John Doe', 
        email: 'john@example.com', 
        password: 'demo123',
        role: 'user',
        createdAt: '2024-02-20'
      }
    ];
    this.currentUser = null;
    this.sessionToken = null;
  }

  delay() {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  // Simulate password hashing
  hashPassword(password) {
    return btoa(password);
  }

  // Generate session token (simulated JWT)
  generateToken(user) {
    const payload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      exp: Date.now() + 3600000
    };
    return btoa(JSON.stringify(payload));
  }

  // Validate token
  validateToken(token) {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) {
        return { valid: false, error: 'Token expired' };
      }
      return { valid: true, payload };
    } catch {
      return { valid: false, error: 'Invalid token' };
    }
  }

  // Register new user
  async register(name, email, password) {
    await this.delay();
    
    if (this.users.find(u => u.email === email)) {
      return { success: false, error: 'Email already exists' };
    }

    if (password.length < 6) {
      return { success: false, error: 'Password must be at least 6 characters' };
    }

    const newUser = {
      id: this.users.length + 1,
      name,
      email,
      password: this.hashPassword(password),
      role: 'user',
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.users.push(newUser);
    this.currentUser = newUser;
    this.sessionToken = this.generateToken(newUser);

    return {
      success: true,
      user: { ...newUser, password: undefined },
      token: this.sessionToken
    };
  }

  // Login user
  async login(email, password) {
    await this.delay();
    
    const user = this.users.find(u => u.email === email);
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (user.password !== this.hashPassword(password)) {
      return { success: false, error: 'Invalid email or password' };
    }

    this.currentUser = user;
    this.sessionToken = this.generateToken(user);

    return {
      success: true,
      user: { ...user, password: undefined },
      token: this.sessionToken
    };
  }

  // Logout user
  async logout() {
    await this.delay();
    this.currentUser = null;
    this.sessionToken = null;
    return { success: true };
  }

  // Get current user
  async getCurrentUser(token) {
    await this.delay();
    
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const user = this.users.find(u => u.id === validation.payload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    return {
      success: true,
      user: { ...user, password: undefined }
    };
  }

  // Update profile
  async updateProfile(token, updates) {
    await this.delay();
    
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const user = this.users.find(u => u.id === validation.payload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    Object.assign(user, updates);
    this.currentUser = user;

    return {
      success: true,
      user: { ...user, password: undefined }
    };
  }

  // Change password
  async changePassword(token, oldPassword, newPassword) {
    await this.delay();
    
    const validation = this.validateToken(token);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const user = this.users.find(u => u.id === validation.payload.userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (user.password !== this.hashPassword(oldPassword)) {
      return { success: false, error: 'Current password is incorrect' };
    }

    if (newPassword.length < 6) {
      return { success: false, error: 'New password must be at least 6 characters' };
    }

    user.password = this.hashPassword(newPassword);

    return { success: true, message: 'Password updated successfully' };
  }
}

const api = new AuthAPI();

export default function AuthSystem() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [profileData, setProfileData] = useState({ name: '', email: '' });
  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = token;
    if (savedToken) {
      validateSession(savedToken);
    }
  }, []);

  const validateSession = async (sessionToken) => {
    setLoading(true);
    const response = await api.getCurrentUser(sessionToken);
    if (response.success) {
      setUser(response.user);
      setProfileData({ name: response.user.name, email: response.user.email });
    } else {
      setToken(null);
      setUser(null);
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    setError('');
    setSuccess('');
    
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const response = await api.login(loginData.email, loginData.password);
    setLoading(false);

    if (response.success) {
      setToken(response.token);
      setUser(response.user);
      setProfileData({ name: response.user.name, email: response.user.email });
      setSuccess('Login successful!');
      setLoginData({ email: '', password: '' });
    } else {
      setError(response.error);
    }
  };

  const handleRegister = async () => {
    setError('');
    setSuccess('');
    
    if (!registerData.name || !registerData.email || !registerData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    const response = await api.register(registerData.name, registerData.email, registerData.password);
    setLoading(false);

    if (response.success) {
      setToken(response.token);
      setUser(response.user);
      setProfileData({ name: response.user.name, email: response.user.email });
      setSuccess('Registration successful!');
      setRegisterData({ name: '', email: '', password: '', confirmPassword: '' });
    } else {
      setError(response.error);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await api.logout();
    setLoading(false);
    setToken(null);
    setUser(null);
    setView('login');
    setSuccess('Logged out successfully');
  };

  const handleUpdateProfile = async () => {
    setError('');
    setSuccess('');
    
    if (!profileData.name || !profileData.email) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    const response = await api.updateProfile(token, profileData);
    setLoading(false);

    if (response.success) {
      setUser(response.user);
      setSuccess('Profile updated successfully!');
    } else {
      setError(response.error);
    }
  };

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    
    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    setLoading(true);
    const response = await api.changePassword(token, passwordData.oldPassword, passwordData.newPassword);
    setLoading(false);

    if (response.success) {
      setSuccess(response.message);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setError(response.error);
    }
  };

  if (user) {
    return <Dashboard 
      user={user} 
      onLogout={handleLogout}
      profileData={profileData}
      setProfileData={setProfileData}
      passwordData={passwordData}
      setPasswordData={setPasswordData}
      onUpdateProfile={handleUpdateProfile}
      onChangePassword={handleChangePassword}
      loading={loading}
      error={error}
      success={success}
      setError={setError}
      setSuccess={setSuccess}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-block p-4 bg-white rounded-full shadow-lg mb-4">
            <Shield className="w-12 h-12 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Secure Auth System</h1>
          <p className="text-white text-lg opacity-90">JWT Authentication & Session Management</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setView('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                view === 'login'
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
