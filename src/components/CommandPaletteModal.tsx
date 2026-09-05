import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/theme';
import { getSellersApi } from '../api/seller';
import { Seller } from '../types';

interface CommandPaletteModalProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'NAVIGATION' | 'SELLER' | 'ACTION';
  icon: string;
  targetScreen?: string;
  sellerId?: string;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  visible,
  onClose,
  navigation,
}) => {
  const [query, setQuery] = useState('');
  const [sellers, setSellers] = useState<Seller[]>([]);

  useEffect(() => {
    if (visible) {
      setQuery('');
      getSellersApi().then((res) => {
        setSellers(res.sellers || []);
      }).catch(() => {});
    }
  }, [visible]);

  const navigationCommands: CommandItem[] = [
    { id: 'cmd_dash', title: 'Go to Dashboard', category: 'NAVIGATION', icon: '📊', targetScreen: 'Dashboard' },
    { id: 'cmd_sellers', title: 'Go to Vendors Directory', category: 'NAVIGATION', icon: '👥', targetScreen: 'Sellers' },
    { id: 'cmd_reports', title: 'Go to Business Growth & Reports', category: 'NAVIGATION', icon: '📈', targetScreen: 'Reports' },
    { id: 'cmd_orders', title: 'Go to Orders Queue', category: 'NAVIGATION', icon: '📦', targetScreen: 'Orders' },
    { id: 'cmd_receipts', title: 'Go to Receipts Ledger', category: 'NAVIGATION', icon: '🧾', targetScreen: 'Receipts' },
    { id: 'cmd_add_del', title: 'Record New Tank Delivery', category: 'ACTION', icon: '🚚', targetScreen: 'DeliveryForm' },
    { id: 'cmd_add_pay', title: 'Record New Vendor Payment', category: 'ACTION', icon: '💰', targetScreen: 'PaymentForm' },
  ];

  const sellerCommands: CommandItem[] = sellers.map((s: Seller) => ({
    id: `cmd_seller_${s._id || s.id}`,
    title: `Vendor: ${s.name}${s.phone ? ` (${s.phone})` : ''}`,
    category: 'SELLER',
    icon: '🏢',
    targetScreen: 'SellerDetail',
    sellerId: s._id || s.id,
  }));

  const allCommands = [...navigationCommands, ...sellerCommands];

  const filtered = allCommands.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const ROOT_SCREENS = ['Dashboard', 'Sellers', 'Reports', 'Transactions', 'Orders', 'Receipts'];

  const handleSelect = (item: CommandItem) => {
    onClose();
    if (item.targetScreen) {
      if (item.sellerId) {
        navigation.navigate(item.targetScreen, { sellerId: item.sellerId });
      } else {
        navigation.navigate(item.targetScreen);
      }
    }
  };

  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalCard}>
          {/* Search Header Bar */}
          <View style={styles.searchHeader}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search command palette... (Sellers, Reports, Actions)"
              placeholderTextColor={Colors.textMuted}
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <View style={styles.kbdBadge}>
              <Text style={styles.kbdText}>ESC</Text>
            </View>
          </View>

          {/* Results List */}
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            style={styles.list}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.itemRow} onPress={() => handleSelect(item)}>
                <Text style={styles.itemIcon}>{item.icon}</Text>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No commands or vendors found</Text>
            }
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 15, 0.85)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 600,
    maxHeight: 450,
    backgroundColor: Colors.bgSecondary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 24,
    elevation: 12,
    overflow: 'hidden',
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderSubtle,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
  kbdBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.borderSubtle,
  },
  kbdText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  list: {
    padding: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 4,
  },
  itemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  itemTitle: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.3)',
  },
  categoryText: {
    color: Colors.accent,
    fontSize: 9,
    fontWeight: '800',
  },
  emptyText: {
    color: Colors.textMuted,
    textAlign: 'center',
    paddingVertical: 30,
    fontSize: 13,
  },
});
