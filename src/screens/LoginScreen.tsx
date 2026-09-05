import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { VasudhaLogo } from '../components/VasudhaLogo';
import { Colors } from '../constants/theme';

export const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const handleLogin = async () => {
    setEmailError('');
    setPasswordError('');
    setGeneralError('');

    let hasError = false;
    if (!email.trim()) {
      setEmailError('Admin email is required');
      hasError = true;
    }
    if (!password.trim()) {
      setPasswordError('Password is required');
      hasError = true;
    }

    if (hasError) return;

    try {
      await login(email.trim(), password);
    } catch (err: any) {
      setGeneralError(err.message || 'Invalid email or password. Please check your credentials and try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.card}>
        <VasudhaLogo size={70} showText={true} subtext="Vendor & Transaction Operations Hub" />

        {generalError ? <Text style={styles.generalError}>{generalError}</Text> : null}

        <View style={styles.field}>
          <Text style={styles.label}>ADMIN EMAIL ADDRESS</Text>
          <View style={[styles.inputIconGroup, emailError ? styles.inputError : null]}>
            <Ionicons name="mail-outline" size={18} color="#38bdf8" style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              placeholder="name@vasudhapolymer.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (emailError) setEmailError('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={[styles.inputIconGroup, passwordError ? styles.inputError : null]}>
            <Ionicons name="lock-closed-outline" size={18} color="#38bdf8" style={styles.fieldIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••••••"
              placeholderTextColor="#64748b"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(val) => {
                setPassword(val);
                if (passwordError) setPasswordError('');
              }}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.eyeBtn}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color="#64748b"
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}>
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.btnText}>Sign In to Admin Hub</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.white} style={{ marginLeft: 6 }} />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#070b14',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#0f172a',
    padding: 28,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.25)',
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 10,
  },
  field: { marginBottom: 18 },
  label: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputIconGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070b14',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
  },
  fieldIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    color: '#f8fafc',
    fontSize: 14,
  },
  eyeBtn: {
    padding: 4,
  },
  inputError: { borderColor: Colors.danger },
  errorText: { color: Colors.danger, fontSize: 12, marginTop: 4, fontWeight: '500' },
  generalError: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    color: Colors.danger,
    padding: 10,
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 16,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  btn: {
    backgroundColor: '#0284c7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#0284c7',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: Colors.white, fontSize: 15, fontWeight: '800' },
});
