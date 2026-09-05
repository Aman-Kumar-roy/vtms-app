import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../constants/theme';

interface DrawerSidebarProps {
  visible: boolean;
  onClose: () => void;
  navigation: any;
  activeScreen: string;
}

export const DrawerSidebar: React.FC<DrawerSidebarProps> = ({
  visible,
  onClose,
  navigation,
  activeScreen,
}) => {
  const { user, logout } = useAuth();
  const ROOT_SCREENS = ['Dashboard', 'Sellers', 'Reports', 'Transactions', 'Orders', 'Receipts'];

  const navigateTo = (screenName: string) => {
    onClose();
    if (activeScreen === screenName) return;
    navigation.navigate(screenName);
  };

  if (!visible) return null;

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={onClose}>
        <SafeAreaView style={styles.drawerContainer}>
          <TouchableOpacity activeOpacity={1} style={styles.drawerContent}>
            {/* Header / Logo */}
            <View style={styles.drawerHeader}>
              <View style={styles.logoGroup}>
                <View style={styles.logoBadge}>
                  <Image
                    source={require('../../assets/logo.jpg')}
                    style={styles.logoImg}
                    resizeMode="cover"
                  />
                </View>
                <View>
                  <Text style={styles.brandTitle}>VASUDHA</Text>
                  <Text style={styles.brandSub}>POLYMER ADMIN</Text>
                </View>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            <Text style={styles.menuLabel}>MAIN MENU</Text>

            {/* Menu Items */}
            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Dashboard' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Dashboard')}
            >
              <Ionicons
                name="grid-outline"
                size={18}
                color={activeScreen === 'Dashboard' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Dashboard' ? styles.itemTextActive : null]}>
                Dashboard
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Sellers' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Sellers')}
            >
              <Ionicons
                name="people-outline"
                size={18}
                color={activeScreen === 'Sellers' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Sellers' ? styles.itemTextActive : null]}>
                Sellers
              </Text>
              <View style={styles.badgeCore}>
                <Text style={styles.badgeCoreText}>CORE</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Transactions' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Transactions')}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={18}
                color={activeScreen === 'Transactions' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Transactions' ? styles.itemTextActive : null]}>
                Transactions
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Reports' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Reports')}
            >
              <Ionicons
                name="bar-chart-outline"
                size={18}
                color={activeScreen === 'Reports' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Reports' ? styles.itemTextActive : null]}>
                Reports
              </Text>
              <View style={styles.badgeNew}>
                <Text style={styles.badgeNewText}>NEW</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Orders' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Orders')}
            >
              <Ionicons
                name="cube-outline"
                size={18}
                color={activeScreen === 'Orders' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Orders' ? styles.itemTextActive : null]}>
                Orders
              </Text>
              <View style={styles.badgeSoon}>
                <Text style={styles.badgeSoonText}>Soon</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, activeScreen === 'Receipts' ? styles.menuItemActive : null]}
              onPress={() => navigateTo('Receipts')}
            >
              <Ionicons
                name="receipt-outline"
                size={18}
                color={activeScreen === 'Receipts' ? '#38bdf8' : '#94a3b8'}
                style={{ marginRight: 12 }}
              />
              <Text style={[styles.itemText, activeScreen === 'Receipts' ? styles.itemTextActive : null]}>
                Receipts
              </Text>
            </TouchableOpacity>

            {/* Bottom Nav Column: Profile & Sign Out */}
            <View style={styles.footerNavGroup}>
              <View style={styles.divider} />

              {/* Current Admin Account Profile Name & Role Row */}
              <View style={styles.userSection}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>
                    {(user?.name || 'A')[0].toUpperCase()}
                  </Text>
                </View>
                <View style={styles.userInfo}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {user?.name || 'Admin User'}
                  </Text>
                  <Text style={styles.userRole}>
                    {user?.role ? user.role.toUpperCase() : 'ADMIN'}
                  </Text>
                </View>
              </View>

              {/* Sign Out / Logout Action Row */}
              <TouchableOpacity
                style={styles.logoutBtn}
                onPress={() => {
                  Alert.alert(
                    'Sign Out',
                    'Are you sure you want to log out of Vasudha Polymer VTMS Admin?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Sign Out',
                        style: 'destructive',
                        onPress: () => {
                          onClose();
                          logout();
                        },
                      },
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Ionicons name="log-out-outline" size={18} color="#ef4444" style={{ marginRight: 10 }} />
                <Text style={styles.logoutText}>Sign Out / Logout</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </SafeAreaView>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 10, 20, 0.75)',
    flexDirection: 'row',
  },
  drawerContainer: {
    width: 280,
    height: '100%',
    backgroundColor: '#070f22',
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  drawerContent: {
    flex: 1,
    padding: 20,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
    overflow: 'hidden',
  },
  logoImg: {
    width: 36,
    height: 36,
    borderRadius: 8,
  },
  logoIcon: {
    fontSize: 18,
  },
  brandTitle: {
    color: '#f8fafc',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  brandSub: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  closeText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
  },
  menuLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 6,
  },
  menuItemActive: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.4)',
  },
  itemIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  itemText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  itemTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  badgeCore: {
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  badgeCoreText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '800',
  },
  badgeNew: {
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
  },
  badgeNewText: {
    color: '#10b981',
    fontSize: 9,
    fontWeight: '800',
  },
  badgeSoon: {
    backgroundColor: 'rgba(100, 116, 139, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeSoonText: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#1e293b',
    marginVertical: 16,
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#0c162d',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 10,
    gap: 10,
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(2, 132, 199, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  userAvatarText: {
    color: '#38bdf8',
    fontSize: 15,
    fontWeight: '800',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '800',
  },
  userRole: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    marginBottom: 8,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 13,
    fontWeight: '800',
  },
  footerNavGroup: {
    marginTop: 'auto',
    paddingTop: 10,
  },
});
