import { useState } from "react";
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  BarChart3,
  BrainCircuit,
  CloudSun,
  Database,
  FileText,
  FlaskConical,
  Leaf,
  Mail,
  Sprout,
  Tractor,
} from "lucide-react-native";
import {
  Redirect,
  router,
} from "expo-router";

import LoadingScreen from "../src/components/common/LoadingScreen";
import { useAuth } from "../src/hooks/useAuth";
import { colors } from "../src/constants/colors";

const FEATURES = [
  {
    title: "Farm Management",
    shortTitle: "Farms",
    description:
      "Manage farm locations, crops, soil, and irrigation.",
    icon: Tractor,
  },
  {
    title: "AI Yield Prediction",
    shortTitle: "Prediction",
    description:
      "Estimate crop yield and total production using ML.",
    icon: BrainCircuit,
  },
  {
    title: "Crop Recommendation",
    shortTitle: "Crops",
    description:
      "Receive intelligent crop planning recommendations.",
    icon: Sprout,
  },
  {
    title: "Weather Analysis",
    shortTitle: "Weather",
    description:
      "Analyze rainfall, temperature, and humidity trends.",
    icon: CloudSun,
  },
  {
    title: "Soil Analysis",
    shortTitle: "Soil",
    description:
      "Evaluate nutrients, pH, fertility, and suitability.",
    icon: FlaskConical,
  },
  {
    title: "Analytics & Reports",
    shortTitle: "Reports",
    description:
      "View dashboards, histories, charts, and reports.",
    icon: BarChart3,
  },
];

function NavigationButton({
  label,
  active,
  onPress,
  compact,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        compact && styles.compactNavigationButton,
        active && styles.activeNavigationButton,
        pressed && styles.pressedButton,
      ]}
    >
      <Text
        style={[
          styles.navigationButtonText,
          compact && styles.compactNavigationText,
          active && styles.activeNavigationButtonText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function FeatureCard({
  feature,
  compact,
}) {
  const Icon = feature.icon;

  return (
    <View
      style={[
        styles.featureCard,
        compact && styles.compactFeatureCard,
      ]}
    >
      <View
        style={[
          styles.featureIcon,
          compact && styles.compactFeatureIcon,
        ]}
      >
        <Icon
          size={compact ? 20 : 23}
          color={colors.primary}
        />
      </View>

      <Text
        numberOfLines={1}
        style={[
          styles.featureTitle,
          compact && styles.compactFeatureTitle,
        ]}
      >
        {compact
          ? feature.shortTitle
          : feature.title}
      </Text>

      <Text
        numberOfLines={compact ? 2 : 3}
        style={[
          styles.featureDescription,
          compact && styles.compactFeatureDescription,
        ]}
      >
        {feature.description}
      </Text>
    </View>
  );
}

function ContactCard({
  icon,
  title,
  value,
  onPress,
  compact,
}) {
  const cardContent = (
    <>
      <View
        style={[
          styles.contactIcon,
          compact && styles.compactContactIcon,
        ]}
      >
        {icon}
      </View>

      <View style={styles.contactTextContainer}>
        <Text
          numberOfLines={1}
          style={[
            styles.contactTitle,
            compact && styles.compactContactTitle,
          ]}
        >
          {title}
        </Text>

        <Text
          numberOfLines={2}
          style={[
            styles.contactValue,
            compact && styles.compactContactValue,
          ]}
        >
          {value}
        </Text>
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.contactCard,
          compact && styles.compactContactCard,
          pressed && styles.pressedButton,
        ]}
      >
        {cardContent}
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.contactCard,
        compact && styles.compactContactCard,
      ]}
    >
      {cardContent}
    </View>
  );
}

export default function Index() {
  const {
    initializing,
    isAuthenticated,
  } = useAuth();

  const { height, width } =
    useWindowDimensions();

  const [activePage, setActivePage] =
    useState("home");

  const compact = height < 760;
  const veryCompact = height < 680;
  const narrow = width < 370;

  if (initializing) {
    return (
      <LoadingScreen message="Preparing YieldSense AI..." />
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/dashboard" />;
  }

  function openEmail() {
    Linking.openURL(
      "mailto:support@yieldsense.ai"
    ).catch(() => {});
  }

  function openGitHub() {
    Linking.openURL(
      "https://github.com/kalavalashivaharikowshik"
    ).catch(() => {});
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View
        style={[
          styles.content,
          compact && styles.compactContent,
          veryCompact && styles.veryCompactContent,
        ]}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => setActivePage("home")}
            style={({ pressed }) => [
              styles.brandContainer,
              pressed && styles.pressedButton,
            ]}
          >
            <View
              style={[
                styles.brandIcon,
                compact && styles.compactBrandIcon,
              ]}
            >
              <Leaf
                size={compact ? 21 : 24}
                color="#FFFFFF"
              />
            </View>

            <View>
              <Text
                style={[
                  styles.brand,
                  compact && styles.compactBrand,
                ]}
              >
                YieldSense AI
              </Text>

              {!veryCompact && (
                <Text style={styles.brandSubtitle}>
                  Smart Agricultural Intelligence
                </Text>
              )}
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/login")}
            style={({ pressed }) => [
              styles.headerLoginButton,
              compact &&
                styles.compactHeaderLoginButton,
              pressed && styles.pressedButton,
            ]}
          >
            <Text style={styles.headerLoginText}>
              Login
            </Text>
          </Pressable>
        </View>

        {/* Page navigation */}
        <View
          style={[
            styles.navigation,
            compact && styles.compactNavigation,
          ]}
        >
          <NavigationButton
            label="Home"
            active={activePage === "home"}
            onPress={() => setActivePage("home")}
            compact={compact}
          />

          <NavigationButton
            label="Features"
            active={activePage === "features"}
            onPress={() =>
              setActivePage("features")
            }
            compact={compact}
          />

          <NavigationButton
            label="Contact"
            active={activePage === "contact"}
            onPress={() =>
              setActivePage("contact")
            }
            compact={compact}
          />
        </View>

        {/* Home */}
        {activePage === "home" && (
          <View style={styles.page}>
            <View
              style={[
                styles.heroSection,
                compact && styles.compactHeroSection,
              ]}
            >
              <View
                style={[
                  styles.heroIcon,
                  compact && styles.compactHeroIcon,
                ]}
              >
                <Leaf
                  size={compact ? 28 : 36}
                  color={colors.primary}
                />
              </View>

              <View style={styles.platformBadge}>
                <Leaf
                  size={13}
                  color={colors.primary}
                />

                <Text style={styles.platformBadgeText}>
                  AI-powered smart farming
                </Text>
              </View>

              <Text
                style={[
                  styles.heroTitle,
                  compact && styles.compactHeroTitle,
                  veryCompact &&
                    styles.veryCompactHeroTitle,
                  narrow && styles.narrowHeroTitle,
                ]}
              >
                AI-Powered Crop Yield Prediction and
                Agricultural Forecasting
              </Text>

              <Text
                numberOfLines={veryCompact ? 3 : 5}
                style={[
                  styles.heroDescription,
                  compact &&
                    styles.compactHeroDescription,
                ]}
              >
                Empower farmers with intelligent yield
                predictions, crop recommendations, weather
                and soil analysis, farm management,
                analytics, and agricultural reports.
              </Text>

              <View
                style={[
                  styles.heroVisual,
                  compact &&
                    styles.compactHeroVisual,
                ]}
              >
                <View style={styles.heroVisualHeader}>
                  <View style={styles.heroVisualText}>
                    <Text style={styles.heroVisualLabel}>
                      YieldSense AI
                    </Text>

                    <Text
                      numberOfLines={2}
                      style={[
                        styles.heroVisualTitle,
                        compact &&
                          styles.compactHeroVisualTitle,
                      ]}
                    >
                      Smarter farming starts with better
                      data
                    </Text>
                  </View>

                  <Leaf
                    size={compact ? 25 : 30}
                    color="#FFFFFF"
                  />
                </View>

                <View style={styles.heroModules}>
                  <View style={styles.heroModule}>
                    <BrainCircuit
                      size={compact ? 17 : 20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroModuleText}>
                      ML Predictions
                    </Text>
                  </View>

                  <View style={styles.heroModule}>
                    <Sprout
                      size={compact ? 17 : 20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroModuleText}>
                      Crop Planning
                    </Text>
                  </View>

                  <View style={styles.heroModule}>
                    <CloudSun
                      size={compact ? 17 : 20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroModuleText}>
                      Climate
                    </Text>
                  </View>

                  <View style={styles.heroModule}>
                    <FileText
                      size={compact ? 17 : 20}
                      color="#FFFFFF"
                    />
                    <Text style={styles.heroModuleText}>
                      Reports
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <View
              style={[
                styles.actionContainer,
                compact &&
                  styles.compactActionContainer,
              ]}
            >
              <Pressable
                onPress={() =>
                  router.push("/register")
                }
                style={({ pressed }) => [
                  styles.primaryButton,
                  compact &&
                    styles.compactActionButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Get Started
                </Text>
              </Pressable>

              <Pressable
                onPress={() =>
                  setActivePage("features")
                }
                style={({ pressed }) => [
                  styles.secondaryButton,
                  compact &&
                    styles.compactActionButton,
                  pressed && styles.pressedButton,
                ]}
              >
                <Text
                  style={styles.secondaryButtonText}
                >
                  Features
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Features */}
        {activePage === "features" && (
          <View style={styles.page}>
            <View
              style={[
                styles.pageHeading,
                compact &&
                  styles.compactPageHeading,
              ]}
            >
              <Text style={styles.pageLabel}>
                PLATFORM FEATURES
              </Text>

              <Text
                style={[
                  styles.pageTitle,
                  compact &&
                    styles.compactPageTitle,
                ]}
              >
                Complete agricultural intelligence
              </Text>

              {!veryCompact && (
                <Text style={styles.pageDescription}>
                  Six integrated modules supporting
                  smarter agricultural planning.
                </Text>
              )}
            </View>

            <View
              style={[
                styles.featuresGrid,
                compact &&
                  styles.compactFeaturesGrid,
              ]}
            >
              {FEATURES.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  feature={feature}
                  compact={compact}
                />
              ))}
            </View>

            <Pressable
              onPress={() =>
                router.push("/register")
              }
              style={({ pressed }) => [
                styles.bottomActionButton,
                compact &&
                  styles.compactBottomActionButton,
                pressed && styles.pressedButton,
              ]}
            >
              <Text
                style={styles.bottomActionButtonText}
              >
                Create Account
              </Text>
            </Pressable>
          </View>
        )}

        {/* Contact */}
        {activePage === "contact" && (
          <View style={styles.page}>
            <View
              style={[
                styles.pageHeading,
                compact &&
                  styles.compactPageHeading,
              ]}
            >
              <Text style={styles.pageLabel}>
                CONTACT INFORMATION
              </Text>

              <Text
                style={[
                  styles.pageTitle,
                  compact &&
                    styles.compactPageTitle,
                ]}
              >
                Learn more about YieldSense AI
              </Text>

              {!veryCompact && (
                <Text style={styles.pageDescription}>
                  Project details, technology information,
                  and support contacts.
                </Text>
              )}
            </View>

            <View
              style={[
                styles.contactGrid,
                compact &&
                  styles.compactContactGrid,
              ]}
            >
              <ContactCard
                title="Email"
                value="support@yieldsense.ai"
                compact={compact}
                onPress={openEmail}
                icon={
                  <Mail
                    size={compact ? 20 : 23}
                    color={colors.primary}
                  />
                }
              />

              <ContactCard
                title="Project"
                value="AI Crop Yield Prediction System · 2026"
                compact={compact}
                icon={
                  <Leaf
                    size={compact ? 20 : 23}
                    color={colors.primary}
                  />
                }
              />

              <ContactCard
                title="Technology"
                value="React Native · FastAPI · PostgreSQL · ML"
                compact={compact}
                icon={
                  <Database
                    size={compact ? 20 : 23}
                    color={colors.primary}
                  />
                }
              />

              <ContactCard
                title="Source Code"
                value="View the YieldSense AI repository"
                compact={compact}
                onPress={openGitHub}
                icon={
                  <Database
                    size={compact ? 20 : 23}
                    color={colors.primary}
                  />
                }
              />
            </View>

            <View
              style={[
                styles.contactFooter,
                compact &&
                  styles.compactContactFooter,
              ]}
            >
              <Leaf
                size={compact ? 22 : 27}
                color={colors.primary}
              />

              <View style={styles.contactFooterText}>
                <Text
                  style={styles.contactFooterTitle}
                >
                  YieldSense AI
                </Text>

                <Text
                  numberOfLines={1}
                  style={styles.contactFooterDescription}
                >
                  Smart farming through AI and data
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0FDF4",
  },

  content: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 0,
    paddingBottom: 14,
  },

  compactContent: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 8,
  },

  veryCompactContent: {
    paddingHorizontal: 12,
    paddingBottom: 6,
  },

  header: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  brandContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  brandIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  compactBrandIcon: {
    width: 37,
    height: 37,
    borderRadius: 12,
  },

  brand: {
    fontSize: 19,
    fontWeight: "800",
    color: "#166534",
  },

  compactBrand: {
    fontSize: 17,
  },

  brandSubtitle: {
    marginTop: 2,
    fontSize: 9,
    fontWeight: "600",
    color: "#16A34A",
  },

  headerLoginButton: {
    minHeight: 39,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 11,
    paddingHorizontal: 17,
    backgroundColor: "#FFFFFF",
  },

  compactHeaderLoginButton: {
    minHeight: 35,
    paddingHorizontal: 14,
  },

  headerLoginText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  navigation: {
    flexDirection: "row",
    marginTop: 0,
    borderRadius: 13,
    backgroundColor: "#E2F8E9",
    padding: 4,
  },

  compactNavigation: {
    marginTop: 18,
    padding: 3,
  },

  navigationButton: {
    flex: 1,
    minHeight: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  compactNavigationButton: {
    minHeight: 32,
  },

  activeNavigationButton: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 1,
  },

  navigationButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  compactNavigationText: {
    fontSize: 12,
  },

  activeNavigationButtonText: {
    color: colors.primary,
  },

  page: {
    flex: 1,
  },

  heroSection: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 20,
  },
  compactHeroSection: {
    paddingTop: 3,
  },

  heroIcon: {
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
  },

  compactHeroIcon: {
    width: 47,
    height: 47,
    borderRadius: 15,
  },

  platformBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 11,
    paddingVertical: 5,
  },

  platformBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  heroTitle: {
    marginTop: 14,
    maxWidth: 440,
    textAlign: "center",
    fontSize: 28,
    lineHeight: 35,
    fontWeight: "900",
    color: "#0F172A",
  },

  compactHeroTitle: {
    marginTop: 10,
    fontSize: 23,
    lineHeight: 29,
  },

  veryCompactHeroTitle: {
    fontSize: 20,
    lineHeight: 25,
  },

  narrowHeroTitle: {
    fontSize: 21,
    lineHeight: 27,
  },

  heroDescription: {
    marginTop: 11,
    maxWidth: 440,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  compactHeroDescription: {
    marginTop: 7,
    fontSize: 11,
    lineHeight: 16,
  },

  heroVisual: {
    width: "100%",
    maxWidth: 430,
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: colors.primary,
    paddingVertical: 24,
    paddingHorizontal: 18,
  },

  compactHeroVisual: {
    marginTop: 10,
    borderRadius: 17,
    padding: 12,
  },

  heroVisualHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroVisualText: {
    flex: 1,
    paddingRight: 12,
  },

  heroVisualLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: "#BBF7D0",
  },

  heroVisualTitle: {
    marginTop: 3,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  compactHeroVisualTitle: {
    fontSize: 14,
    lineHeight: 18,
  },

  heroModules: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },

  heroModule: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 11,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  heroModuleText: {
    flex: 1,
    fontSize: 10,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  actionContainer: {
    flexDirection: "row",
    gap: 10,
    paddingTop: 10,
  },

  compactActionContainer: {
    paddingTop: 5,
    gap: 8,
  },

  primaryButton: {
    flex: 1,
    minHeight: 47,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primary,
  },

  secondaryButton: {
    flex: 1,
    minHeight: 47,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 13,
    backgroundColor: "#FFFFFF",
  },

  compactActionButton: {
    minHeight: 40,
  },

  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  secondaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
  },

  pressedButton: {
    opacity: 0.72,
  },

  pageHeading: {
    alignItems: "center",
    paddingTop: 18,
    paddingBottom: 15,
  },

  compactPageHeading: {
    paddingTop: 9,
    paddingBottom: 8,
  },

  pageLabel: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1.1,
    color: colors.primary,
  },

  pageTitle: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 23,
    lineHeight: 29,
    fontWeight: "900",
    color: "#0F172A",
  },

  compactPageTitle: {
    fontSize: 18,
    lineHeight: 23,
  },

  pageDescription: {
    marginTop: 6,
    maxWidth: 390,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },

  featuresGrid: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    alignContent: "center",
    gap: 10,
  },

  compactFeaturesGrid: {
    gap: 7,
  },

  featureCard: {
    width: "48.5%",
    minHeight: 138,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 9,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  compactFeatureCard: {
    minHeight: 105,
    borderRadius: 13,
    paddingHorizontal: 7,
    paddingVertical: 7,
  },

  featureIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#DCFCE7",
  },

  compactFeatureIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
  },

  featureTitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  compactFeatureTitle: {
    marginTop: 5,
    fontSize: 11,
  },

  featureDescription: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 10,
    lineHeight: 14,
    color: "#64748B",
  },

  compactFeatureDescription: {
    marginTop: 3,
    fontSize: 8.5,
    lineHeight: 11,
  },

  bottomActionButton: {
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    borderRadius: 13,
    backgroundColor: colors.primary,
  },

  compactBottomActionButton: {
    minHeight: 37,
    marginTop: 6,
  },

  bottomActionButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  contactGrid: {
    flex: 1,
    justifyContent: "center",
    gap: 12,
  },

  compactContactGrid: {
    gap: 7,
  },

  contactCard: {
    minHeight: 86,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 17,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    paddingVertical: 11,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },

  compactContactCard: {
    minHeight: 65,
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },

  contactIcon: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: "#DCFCE7",
  },

  compactContactIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
  },

  contactTextContainer: {
    flex: 1,
    marginLeft: 12,
  },

  contactTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  compactContactTitle: {
    fontSize: 12,
  },

  contactValue: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  compactContactValue: {
    marginTop: 2,
    fontSize: 9,
    lineHeight: 12,
  },

  contactFooter: {
    minHeight: 68,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 16,
  },

  compactContactFooter: {
    minHeight: 50,
    marginTop: 6,
    borderRadius: 13,
    paddingHorizontal: 12,
  },

  contactFooterText: {
    flex: 1,
    marginLeft: 11,
  },

  contactFooterTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#166534",
  },

  contactFooterDescription: {
    marginTop: 2,
    fontSize: 10,
    color: "#16A34A",
  },
});