import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSellerApi } from '../api/seller';
import { Seller } from '../types';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/theme';

interface AddSellerModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (seller: Seller) => void;
}

export const AddSellerModal: React.FC<AddSellerModalProps> = ({
  visible,
  onClose,
  onSuccess,
}) => {
  const { colors } = useTheme();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  // Toggle is ON by default
  const [requireAdditional, setRequireAdditional] = useState(true);

  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      setName('');
      setEmail('');
      setPhone('');
      setAddress('');
      setGstNumber('');
      setRequireAdditional(true);
      setFieldErrors({});
      setServerError(null);
      setLoading(false);
    }
  }, [visible]);

  const handleClose = () => {
    if (loading) return;
    setFieldErrors({});
    setServerError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (loading) return;

    setServerError(null);
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = 'Seller name is required';
    }

    if (requireAdditional) {
      if (!email.trim()) {
        errs.email = 'Email address is required when additional fields are enabled';
      } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }

      if (!gstNumber.trim()) {
        errs.gstNumber = 'GST Number is required when additional fields are enabled';
      }
    } else {
      if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    setFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      const created = await createSellerApi({
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        gstNumber: gstNumber.trim().toUpperCase() || undefined,
        requireAdditional,
      });

      onSuccess(created);
      onClose();
    } catch (e: any) {
      setServerError(e.message || 'Failed to create seller');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleClose}
        />
        <KeyboardAvoidingView
          behavior="padding"
          style={styles.keyboardContainer}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
            <View style={styles.titleGroup}>
              <View style={styles.iconCircle}>
                <Ionicons name="person-add" size={18} color="#0284c7" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Add New Vendor</Text>
                <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                  Register vendor partner for unit sales & settlements
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={handleClose} disabled={loading} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} contentContainerStyle={{ paddingBottom: 24 }} keyboardShouldPersistTaps="handled">
            {serverError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
                <Text style={styles.errorBannerText}>{serverError}</Text>
              </View>
            ) : null}

            {/* Toggle Switch */}
            <View style={[styles.toggleRow, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={[styles.toggleLabel, { color: colors.textPrimary }]}>Require additional fields</Text>
                <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                  {requireAdditional
                    ? 'Email address & GST number are required'
                    : 'Only seller name is required'}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.switchTrack,
                  requireAdditional ? { backgroundColor: '#0284c7' } : { backgroundColor: '#334155' },
                ]}
                onPress={() => setRequireAdditional((prev) => !prev)}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.switchThumb,
                    requireAdditional ? { transform: [{ translateX: 20 }] } : { transform: [{ translateX: 2 }] },
                  ]}
                />
              </TouchableOpacity>
            </View>

            {/* Vendor Name (Always Required) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                VENDOR / BUSINESS NAME <Text style={{ color: '#ef4444' }}>*</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: fieldErrors.name ? '#ef4444' : colors.borderSubtle },
                ]}
                placeholder="e.g. Apex Hardware Supplies"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={(val) => {
                  setName(val);
                  if (fieldErrors.name) setFieldErrors((p) => ({ ...p, name: '' }));
                }}
              />
              {fieldErrors.name ? <Text style={styles.fieldError}>{fieldErrors.name}</Text> : null}
            </View>

            {/* Email Address */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                EMAIL ADDRESS {requireAdditional ? <Text style={{ color: '#ef4444' }}>*</Text> : <Text style={styles.optionalText}>(Optional)</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: fieldErrors.email ? '#ef4444' : colors.borderSubtle },
                ]}
                placeholder="vendor@company.com"
                placeholderTextColor={colors.textMuted}
                value={email}
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(val) => {
                  setEmail(val);
                  if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
                }}
              />
              {fieldErrors.email ? <Text style={styles.fieldError}>{fieldErrors.email}</Text> : null}
            </View>

            {/* GST Number */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                GST NUMBER {requireAdditional ? <Text style={{ color: '#ef4444' }}>*</Text> : <Text style={styles.optionalText}>(Optional)</Text>}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: fieldErrors.gstNumber ? '#ef4444' : colors.borderSubtle },
                ]}
                placeholder="e.g. 27AAPFU0939F1ZV"
                placeholderTextColor={colors.textMuted}
                value={gstNumber}
                maxLength={15}
                autoCapitalize="characters"
                onChangeText={(val) => {
                  setGstNumber(val.toUpperCase());
                  if (fieldErrors.gstNumber) setFieldErrors((p) => ({ ...p, gstNumber: '' }));
                }}
              />
              {fieldErrors.gstNumber ? <Text style={styles.fieldError}>{fieldErrors.gstNumber}</Text> : null}
            </View>

            {/* Phone Number (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                PHONE NUMBER <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: fieldErrors.phone ? '#ef4444' : colors.borderSubtle },
                ]}
                placeholder="+91 98765 43210"
                placeholderTextColor={colors.textMuted}
                value={phone}
                keyboardType="phone-pad"
                onChangeText={(val) => {
                  setPhone(val);
                  if (fieldErrors.phone) setFieldErrors((p) => ({ ...p, phone: '' }));
                }}
              />
              {fieldErrors.phone ? <Text style={styles.fieldError}>{fieldErrors.phone}</Text> : null}
            </View>

            {/* Address (Optional) */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textMuted }]}>
                DISPATCH / BUSINESS ADDRESS <Text style={styles.optionalText}>(Optional)</Text>
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { backgroundColor: colors.bgCard, color: colors.textPrimary, borderColor: colors.borderSubtle },
                ]}
                placeholder="Warehouse / Office address"
                placeholderTextColor={colors.textMuted}
                value={address}
                multiline
                numberOfLines={2}
                onChangeText={setAddress}
              />
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View style={[styles.modalFooter, { borderTopColor: colors.borderSubtle }]}>
            <TouchableOpacity
              style={[styles.cancelBtn, { borderColor: colors.borderSubtle }]}
              onPress={handleClose}
              disabled={loading}
            >
              <Text style={[styles.cancelBtnText, { color: colors.textMuted }]}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.submitBtn, loading ? { opacity: 0.6 } : null]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={16} color="#ffffff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>Save Vendor</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  keyboardContainer: {
    width: '100%',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(2, 132, 199, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
  },
  switchTrack: {
    width: 46,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
  },
  switchThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  optionalText: {
    fontWeight: '400',
    fontSize: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    height: 64,
    textAlignVertical: 'top',
  },
  fieldError: {
    color: '#ef4444',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelBtn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    borderWidth: 1,
  },
  cancelBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 12,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
});
