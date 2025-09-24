import { useColorScheme } from '@/hooks/useColorScheme';
import { useNavigation } from '@react-navigation/native';
import { Image } from 'expo-image';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  ActivityIndicator, Alert,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
import { auth } from '../../config/firebase';

export default function AuthPage() {
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';
  const { width, height } = Dimensions.get('window');
  const isWeb = Platform.OS === 'web';

  const [user, loading, error] = useAuthState(auth);

  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState('login');

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState({});

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerErrors, setRegisterErrors] = useState({});

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateName = (name) => {
    return name.trim().length >= 2;
  };

  const validateLoginForm = () => {
    const errors = {};
    
    if (!loginEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(loginEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!loginPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(loginPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegisterForm = () => {
    const errors = {};
    
    if (!registerName.trim()) {
      errors.name = 'Full name is required';
    } else if (!validateName(registerName)) {
      errors.name = 'Name must be at least 2 characters';
    }
    
    if (!registerEmail.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(registerEmail)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!registerPassword) {
      errors.password = 'Password is required';
    } else if (!validatePassword(registerPassword)) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  useEffect(() => {
    if (user) {
      navigation.replace('Drawer');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }
    
    setIsLoading(true);
    setLoginErrors({});
    
    try {
      await signInWithEmailAndPassword(auth, loginEmail.trim(), loginPassword);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Login failed. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Login Failed', errorMessage);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }
    
    setIsLoading(true);
    setRegisterErrors({});
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, registerEmail.trim(), registerPassword);
      await updateProfile(userCredential.user, {
        displayName: registerName.trim(),
      });
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      let errorMessage = 'Registration failed. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'An account with this email already exists.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password is too weak. Please choose a stronger password.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection.';
          break;
        default:
          errorMessage = error.message;
      }
      
      Alert.alert('Registration Failed', errorMessage);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        isDarkMode && { backgroundColor: '#121212' },
        isWeb && styles.webContainer,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.contentWrapper, isWeb && styles.webContentWrapper]}>
      <View style={styles.iconContainer}>
          <View style={[styles.iconCircle, isDarkMode && styles.iconCircleDark]}>
            <Image
              source={require('../../assets/images/Logo.png')}
              style={styles.logo}
              contentFit="contain"
            />
        </View>
      </View>
      <Text style={[styles.title, isDarkMode && { color: '#fff' }]}>
        Welcome to Diabetopedia
      </Text>
        <Text style={[styles.subtitle, isDarkMode && { color: '#ccc' }]}>
          Your trusted diabetes management companion
      </Text>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setMode('login')}
          style={[styles.tab, mode === 'login' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.activeTabText]}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setMode('register')}
          style={[styles.tab, mode === 'register' && styles.activeTabBackground]}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.activeTabText]}>Register</Text>
        </TouchableOpacity>
      </View>

      {/* Forms */}
      {mode === 'login' ? (
        <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Email</Text>
          <TextInput
            placeholder="name@example.com"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                  loginErrors.email && styles.inputError
                ]}
            value={loginEmail}
                onChangeText={(text) => {
                  setLoginEmail(text);
                  if (loginErrors.email) {
                    setLoginErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
            keyboardType="email-address"
            autoCapitalize="none"
                autoComplete="email"
              />
              {loginErrors.email && <Text style={styles.errorText}>{loginErrors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Password</Text>
          <TextInput
            placeholder="••••••••"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
            secureTextEntry
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                  loginErrors.password && styles.inputError
                ]}
            value={loginPassword}
                onChangeText={(text) => {
                  setLoginPassword(text);
                  if (loginErrors.password) {
                    setLoginErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                autoComplete="current-password"
              />
              {loginErrors.password && <Text style={styles.errorText}>{loginErrors.password}</Text>}
            </View>

          <TouchableOpacity style={styles.forgotPassword}>
              <Text style={[styles.forgotPasswordText, isDarkMode && { color: '#4A9EFF' }]}>
                Forgot password?
              </Text>
          </TouchableOpacity>

            <TouchableOpacity 
              onPress={handleLogin} 
              style={[styles.button, isDarkMode && styles.buttonDark]} 
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign in</Text>
              )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Full Name</Text>
          <TextInput
            placeholder="John Doe"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                  registerErrors.name && styles.inputError
                ]}
            value={registerName}
                onChangeText={(text) => {
                  setRegisterName(text);
                  if (registerErrors.name) {
                    setRegisterErrors(prev => ({ ...prev, name: '' }));
                  }
                }}
                autoComplete="name"
              />
              {registerErrors.name && <Text style={styles.errorText}>{registerErrors.name}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Email</Text>
          <TextInput
            placeholder="name@example.com"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                  registerErrors.email && styles.inputError
                ]}
            value={registerEmail}
                onChangeText={(text) => {
                  setRegisterEmail(text);
                  if (registerErrors.email) {
                    setRegisterErrors(prev => ({ ...prev, email: '' }));
                  }
                }}
            keyboardType="email-address"
            autoCapitalize="none"
                autoComplete="email"
              />
              {registerErrors.email && <Text style={styles.errorText}>{registerErrors.email}</Text>}
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, isDarkMode && { color: '#fff' }]}>Password</Text>
          <TextInput
            placeholder="••••••••"
                placeholderTextColor={isDarkMode ? '#888' : '#999'}
            secureTextEntry
                style={[
                  styles.input,
                  isDarkMode && styles.inputDark,
                  registerErrors.password && styles.inputError
                ]}
            value={registerPassword}
                onChangeText={(text) => {
                  setRegisterPassword(text);
                  if (registerErrors.password) {
                    setRegisterErrors(prev => ({ ...prev, password: '' }));
                  }
                }}
                autoComplete="new-password"
              />
              {registerErrors.password && <Text style={styles.errorText}>{registerErrors.password}</Text>}
            </View>

            <TouchableOpacity 
              onPress={handleRegister} 
              style={[styles.button, isDarkMode && styles.buttonDark]} 
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create account</Text>
              )}
          </TouchableOpacity>
        </View>
      )}

        <TouchableOpacity>
          <Text style={[styles.privacyPolicy, isDarkMode && { color: '#4A9EFF' }]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    minHeight: '100%',
  },
  webContainer: {
    minHeight: '100vh',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 360,
    padding: 20,
    paddingTop: 40,
  },
  webContentWrapper: {
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    paddingTop: 24,
    paddingBottom: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  iconCircle: {
    backgroundColor: 'transparent',
    padding: 0,
    borderRadius: 0,
  },
  iconCircleDark: {
    backgroundColor: 'transparent',
  },
  logo: {
    width: 48,
    height: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 6,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
    color: '#666',
    lineHeight: 20,
  },
  tabContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 7,
  },
  activeTabBackground: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    color: '#6c757d',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#007bff',
  },
  form: {
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '600',
    color: '#1a1a1a',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e1e5e9',
    fontSize: 15,
    color: '#1a1a1a',
  },
  inputDark: {
    backgroundColor: '#2a2a2a',
    borderColor: '#404040',
    color: '#fff',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#007bff',
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDark: {
    backgroundColor: '#4A9EFF',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  privacyPolicy: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#007bff',
    textDecorationLine: 'underline',
  },
});
