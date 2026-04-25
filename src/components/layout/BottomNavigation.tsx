import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

interface BottomNavigationProps {
  activeTab: 'home' | 'orders' | 'chat' | 'profile' | 'calendar' | 'quotations';
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeTab }) => {
  const [showPlusMenu, setShowPlusMenu] = useState(false);

  const navigateToTab = (tabName: string) => {
    if (activeTab !== tabName) {
      router.navigate(`/(tabs)/${tabName}` as any);
    }
  };

  const handleCreateEvent = () => {
    setShowPlusMenu(false);
    router.push('/event/manage/createStepOne' as any);
  };

  const handleUploadPortfolio = () => {
    setShowPlusMenu(false);
    // Use the correct path for the portfolio page
    router.push('/profilePages/portfolio?action=upload' as any);
  };

  // Theme Colors
  const PRIMARY_MAROON = "#800000"; // Deep Maroon
  const ACCENT_GOLD = "#D4AF37"; // Metallic Gold
  const MUTED_MAROON = "#80000008";
  const TEXT_DARK = "#1C1917";
  const TEXT_MUTED = "#8C8C8C";

  return (
    <>
      <View style={styles.bottomNavbar}>
        {/* Home */}
        <Pressable style={styles.navItem} onPress={() => navigateToTab('home')}>
          <Feather
            name="home"
            size={24}
            color={activeTab === 'home' ? PRIMARY_MAROON : "#a8a29e"}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'home' ? PRIMARY_MAROON : '#a8a29e' }]}>
            Home
          </Text>
        </Pressable>

        {/* Chat */}
        <Pressable style={styles.navItem} onPress={() => navigateToTab('chat')}>
          <Feather
            name="message-square"
            size={24}
            color={activeTab === 'chat' ? PRIMARY_MAROON : "#a8a29e"}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'chat' ? PRIMARY_MAROON : '#a8a29e' }]}>
            Chat
          </Text>
        </Pressable>

        {/* CENTER PLUS BUTTON */}
        <View style={styles.plusContainer}>
          <Pressable
            style={styles.centerPlusButton}
            onPress={() => setShowPlusMenu(true)}
            data-testid="create-event-plus-button"
          >
            <View style={styles.plusIconContainer}>
              <Feather name="plus" size={28} color="#FFFFFF" />
            </View>
          </Pressable>
        </View>

        {/* Quotations */}
        <Pressable style={styles.navItem} onPress={() => navigateToTab('quotations')}>
          <Feather
            name="package"
            size={24}
            color={activeTab === 'quotations' ? PRIMARY_MAROON : '#a8a29e'}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'quotations' ? PRIMARY_MAROON : '#a8a29e' }]}>
            Quotes
          </Text>
        </Pressable>

        {/* Profile */}
        <Pressable style={styles.navItem} onPress={() => navigateToTab('profile')}>
          <Feather
            name="user"
            size={24}
            color={activeTab === 'profile' ? PRIMARY_MAROON : "#a8a29e"}
          />
          <Text style={[styles.navLabel, { color: activeTab === 'profile' ? PRIMARY_MAROON : '#a8a29e' }]}>
            Profile
          </Text>
        </Pressable>
      </View>

      {/* Plus Options Modal */}
      <Modal
        visible={showPlusMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPlusMenu(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowPlusMenu(false)}
        >
          <View style={styles.menuContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.menuHeader}>What would you like to do?</Text>
              <Pressable style={styles.closeBtn} onPress={() => setShowPlusMenu(false)}>
                <Ionicons name="close" size={24} color={PRIMARY_MAROON} />
              </Pressable>
            </View>

            <View style={styles.optionsRow}>
              <Pressable style={styles.menuOption} onPress={handleCreateEvent}>
                <View style={[styles.iconCircle, { backgroundColor: MUTED_MAROON, borderColor: PRIMARY_MAROON }]}>
                  <Ionicons name="calendar-outline" size={28} color={PRIMARY_MAROON} />
                </View>
                <Text style={styles.optionLabel}>Create Event</Text>
                <Text style={styles.optionSub}>Setup pricing & timeline</Text>
              </Pressable>

              <Pressable style={styles.menuOption} onPress={handleUploadPortfolio}>
                <View style={[styles.iconCircle, { backgroundColor: MUTED_MAROON, borderColor: PRIMARY_MAROON }]}>
                  <Ionicons name="images-outline" size={28} color={PRIMARY_MAROON} />
                </View>
                <Text style={styles.optionLabel}>Upload Portfolio</Text>
                <Text style={styles.optionSub}>Add photos & videos</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  bottomNavbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 16,
    paddingHorizontal: 8,
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
    minHeight: 80,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 8,
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#a8a29e',
    marginTop: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  plusContainer: {
    width: 72,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerPlusButton: {
    marginTop: -52,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 999,
  },
  plusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#800000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(128, 0, 0, 0.4)', // Muted emerald overlay
    justifyContent: 'flex-end',
    padding: 20,
  },
  menuContent: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 32,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 20,
    marginBottom: 80, // Space above the bottom nav
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuHeader: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: -0.5,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  menuOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: '#FAF8F5',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F0EBE9',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1C1917',
    textAlign: 'center',
    marginBottom: 4,
  },
  optionSub: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8C8C8C',
    textAlign: 'center',
    lineHeight: 14,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F4',
    alignItems: 'center',
    justifyContent: 'center',
  }
});

export default BottomNavigation;