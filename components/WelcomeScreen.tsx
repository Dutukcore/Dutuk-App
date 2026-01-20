import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Dimensions,
  ImageBackground,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { height: screenHeight, width: screenWidth } = Dimensions.get('window');
const { height: screenHeight, width: screenWidth } = Dimensions.get('window');

const WelcomeScreen = () => {
  const [loginPressed, setLoginPressed] = React.useState(false);
  const [signupPressed, setSignupPressed] = React.useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />

      {/* Top Image Section - 45% height */}
      <View style={styles.heroSection}>
        <ImageBackground
          source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXiiQTy-Udnk6uk-3Rs4s5ERD5QOTbDhilzeupSN3BYy-eOgn1Oil9j2NCtVXa-SbmI3nrQMf-0m1JGaMofH7WWdbfCNUMchJgry05B2v7BK5saJkOAh-XcZjfedqbIQgjTZ0-RXmB1ZhQUu5Afeuy5cdrUdswaH9ev-e0gTgU4d5o_Q-fS_emz7sY_LRbKXWAzp3NNg6boF9pMrHSjSJ3AjPsxmJvCaR6VOPhapy7QJIJQrlF7IZ8TydPDp5p04HrKWwmaIOigfXM' }}
          style={styles.heroImage}
          resizeMode="cover"
        >
          {/* Dark overlay gradient */}
          <LinearGradient
            colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)', 'transparent']}
            style={styles.darkOverlay}
          />

          {/* Bottom fade to white */}
          <LinearGradient
            colors={['transparent', 'transparent', 'rgba(255,255,255,0.8)', '#ffffff']}
            locations={[0, 0.4, 0.8, 1]}
            style={styles.fadeToWhite}
          />

          {/* Logo Content */}
          <View style={styles.logoContent}>
            {/* Sparkle Icon */}
            <View style={styles.sparkleContainer}>
              <Ionicons name="sparkles" size={32} color="white" />
            </View>

            {/* DUTUK Logo */}
            <Text style={styles.logoText}>DUTUK</Text>

            {/* Vendor Portal Badge */}
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>VENDOR PORTAL</Text>
            </View>
          </View>
        </ImageBackground>
      </View>

      {/* Bottom Content Section */}
      <View style={styles.contentSection}>
        {/* Welcome Text */}
        <View style={styles.welcomeContent}>
          <Text style={styles.welcomeText}>Welcome</Text>

          <Text style={styles.subtitleText}>
            Elevate your event business.
          </Text>

          <Text style={styles.taglineText}>
            MANAGE • TRACK • SCALE
          </Text>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          {/* Log In Button */}
          <Pressable
            style={({ pressed }) => [
              styles.loginButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => router.push('/auth/UserLogin')}
          >
            <Text style={styles.loginButtonText}>Log In</Text>
            <Ionicons name="arrow-forward" size={20} color="rgba(255,255,255,0.5)" style={styles.buttonIcon} />
          </Pressable>

          {/* Sign Up Button */}
          <Pressable
            style={({ pressed }) => [
              styles.signupButton,
              pressed && styles.buttonPressed
            ]}
            onPress={() => router.push('/auth/register')}
          >
            <Text style={styles.signupButtonText}>Sign up</Text>
            <Ionicons name="arrow-forward" size={20} color="#d1d5db" style={styles.buttonIcon} />
          </Pressable>

          {/* Support Link */}
          <View style={styles.supportContainer}>
            <Text style={styles.supportText}>HAVING TROUBLE? </Text>
            <Pressable>
              <Text style={styles.supportLink}>GET SUPPORT</Text>
            </Pressable>
          </View>
        </View>

        {/* Bottom Home Indicator */}
        <View style={styles.homeIndicator} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  heroSection: {
    height: '45%',
    overflow: 'hidden',
  },
  heroImage: {
    flex: 1,
    width: '100%',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  fadeToWhite: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  sparkleContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Backdrop blur effect approximation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 8,
    textTransform: 'uppercase',
  },
  portalBadge: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  portalBadgeText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  contentSection: {
    flex: 1,
    paddingHorizontal: 40,
    // Soft mesh background approximation
    backgroundColor: '#fffcfa',
  },
  welcomeContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 48,
    fontWeight: '400',
    fontStyle: 'italic',
    color: '#1c1917',
    letterSpacing: -1,
    marginBottom: 24,
    // Serif font - will use system serif
    fontFamily: undefined, // React Native will use default
  },
  subtitleText: {
    fontSize: 17,
    fontWeight: '500',
    color: '#57534e',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 12,
  },
  taglineText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#a8a29e',
    textAlign: 'center',
    letterSpacing: 4,
    textTransform: 'uppercase',
  },
  buttonContainer: {
    paddingBottom: 64,
    gap: 16,
  },
  loginButton: {
    width: '100%',
    height: 60,
    backgroundColor: '#800000',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // Shadow
    shadowColor: '#800000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
  },
  signupButton: {
    width: '100%',
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#e7e5e4',
  },
  signupButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#292524',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  buttonPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  supportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 32,
  },
  supportText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#a8a29e',
    letterSpacing: 1,
  },
  supportLink: {
    fontSize: 11,
    fontWeight: '700',
    color: '#800000',
    letterSpacing: 1,
    textDecorationLine: 'underline',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -64,
    width: 128,
    height: 6,
    backgroundColor: '#e7e5e4',
    borderRadius: 3,
  },
});

export default WelcomeScreen;