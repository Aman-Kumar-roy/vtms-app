import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createSellerApi, updateSellerApi } from '../api/seller';
import { NavbarHeader } from '../components/NavbarHeader';
import { useTheme } from '../context/ThemeContext';
import { AnimatedScreenWrapper } from '../components/AnimatedScreenWrapper';

export const AddSellerScreen = ({ route, navigation }: any) => {
  const { colors } = useTheme();
  const editSeller = route?.params?.editSeller;
  const isEditing = !!editSeller;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [requireAdditional, setRequireAdditional] = useState(true);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editSeller) {
      setName(editSeller.name || '');
      setEmail(editSeller.email || '');
      setPhone(editSeller.phone || '');
      setAddress(editSeller.address || '');
      setGstNumber(editSeller.gstNumber || '');
      if (editSeller.phone || editSeller.address || editSeller.gstNumber) {
        setRequireAdditional(true);
      }
    }
  }, [editSeller]);

  const handleSubmit = async () => {
    const errs: { [key: string]: string } = {};

    if (!name.trim()) {
      errs.name = 'Seller / Business name is required';
    }

    if (requireAdditional) {
      if (!email.trim()) {
        errs.email = 'Email address is required when additional fields are enabled';
      } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }

      if (!gstNumber.trim()) {
        errs.gstNumber = 'GST number is required when additional fields are enabled';
      }
    } else {
      if (email.trim() && !/\S+@\S+\.\S+/.test(email.trim())) {
        errs.email = 'Please enter a valid email address';
      }
    }

    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      if (isEditing) {
        await updateSellerApi(editSeller._id || editSeller.id, {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          gstNumber: gstNumber.trim().toUpperCase() || undefined,
        });
      } else {
        await createSellerApi({
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: address.trim() || undefined,
          gstNumber: gstNumber.trim().toUpperCase() || undefined,
          requireAdditional,
        });
      }
      const msg = isEditing ? 'Vendor updated successfully!' : 'Seller created successfully.';
      navigation.navigate('Sellers', { successMsg: msg });
    } catch (e: any) {
      setErrors({ form: e.message || 'Failed to save vendor details' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedScreenWrapper style={[styles.container, { backgroundColor: colors.bgPrimary }]}>
      <NavbarHeader
        currentScreenTitle={isEditing ? 'Edit Vendor' : 'New Vendor'}
        onOpenDrawer={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Sellers')}
        navigation={navigation}
      />

      <ScrollView style={styles.scrollForm} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={[styles.card, { backgroundColor: colors.bgCard, borderColor: colors.borderSubtle }]}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>
            {isEditing ? 'Update Vendor Account' : 'Register New Vendor'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>
            Maintain full business profile, GST credentials, and ledger tracking.
          </Text>

          {errors.form && (
            <View style={styles.formErrorBox}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" style={{ marginRight: 6 }} />
              <Text style={styles.formErrorText}>{errors.form}</Text>
            </View>
          )}

          {/* Required Fields Toggle (Exact Web Feature) */}
          <TouchableOpacity
            style={[styles.toggleContainer, { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle }]}
            onPress={() => setRequireAdditional(!requireAdditional)}
            activeOpacity={0.8}
          >
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleTitle, { color: colors.textPrimary }]}>
                Require additional fields
              </Text>
              <Text style={[styles.toggleSub, { color: colors.textMuted }]}>
                {requireAdditional
                  ? 'Email address & GST number are required'
                  : 'Only vendor name is required'}
              </Text>
            </View>
            <View style={[styles.switchTrack, requireAdditional ? styles.switchTrackActive : null]}>
              <View style={[styles.switchThumb, requireAdditional ? styles.switchThumbActive : null]} />
            </View>
          </TouchableOpacity>

          {/* Vendor Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              BUSINESS / VENDOR NAME <Text style={styles.reqStar}>*</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.name ? styles.inputError : null,
              ]}
              placeholder="e.g. Apex Polymer Solutions"
              placeholderTextColor={colors.textMuted}
              value={name}
              onChangeText={(val) => {
                setName(val);
                if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
              }}
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Email Address */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              EMAIL ADDRESS {requireAdditional ? <Text style={styles.reqStar}>*</Text> : <Text style={styles.optText}>(Optional)</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.email ? styles.inputError : null,
              ]}
              placeholder="vendor@example.com"
              placeholderTextColor={colors.textMuted}
              value={email}
              onChangeText={(val) => {
                setEmail(val);
                if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Phone Number (Optional) */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              PHONE NUMBER <Text style={styles.optText}>(Optional)</Text>
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.phone ? styles.inputError : null,
              ]}
              placeholder="+91 98765 43210"
              placeholderTextColor={colors.textMuted}
              value={phone}
              onChangeText={(val) => {
                setPhone(val);
                if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }));
              }}
              keyboardType="phone-pad"
            />
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* GST Number */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              GSTIN / REGISTRATION NO {requireAdditional ? <Text style={styles.reqStar}>*</Text> : <Text style={styles.optText}>(Optional)</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.gstNumber ? styles.inputError : null,
              ]}
              placeholder="07AAAAA0000A1Z5"
              placeholderTextColor={colors.textMuted}
              value={gstNumber}
              onChangeText={(val) => {
                setGstNumber(val.toUpperCase());
                if (errors.gstNumber) setErrors((prev) => ({ ...prev, gstNumber: '' }));
              }}
              autoCapitalize="characters"
            />
            {errors.gstNumber ? <Text style={styles.errorText}>{errors.gstNumber}</Text> : null}
          </View>

          {/* Business Address */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.textMuted }]}>
              BUSINESS ADDRESS {requireAdditional ? <Text style={styles.reqStar}>*</Text> : <Text style={styles.optText}>(Optional)</Text>}
            </Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                { backgroundColor: colors.bgSecondary, borderColor: colors.borderSubtle, color: colors.textPrimary },
                errors.address ? styles.inputError : null,
              ]}
              placeholder="Industrial Area, Sector 58, New Delhi"
              placeholderTextColor={colors.textMuted}
              value={address}
              onChangeText={(val) => {
                setAddress(val);
                if (errors.address) setErrors((prev) => ({ ...prev, address: '' }));
              }}
              multiline
              numberOfLines={3}
            />
            {errors.address ? <Text style={styles.errorText}>{errors.address}</Text> : null}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.accentHover }]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitBtnText}>
                {isEditing ? 'Save Changes' : 'Register Vendor →'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </AnimatedScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  scrollForm: {
    flex: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    marginTop: 6,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
    marginBottom: 16,
    lineHeight: 18,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ef4444',
    marginBottom: 16,
  },
  formErrorText: {
    color: '#ef4444',
    fontSize: 12,
    fontWeight: '600',
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  reqStar: {
    color: '#ef4444',
    fontWeight: '800',
  },
  optText: {
    fontSize: 10,
    fontWeight: '500',
    textTransform: 'none',
    opacity: 0.7,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  toggleTextCol: {
    flex: 1,
    paddingRight: 10,
  },
  toggleTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  toggleSub: {
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(100, 116, 139, 0.4)',
    padding: 2,
    justifyContent: 'center',
  },
  switchTrackActive: {
    backgroundColor: '#0ea5e9',
  },
  switchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    fontSize: 13,
  },
  textArea: {
    height: 75,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
});
