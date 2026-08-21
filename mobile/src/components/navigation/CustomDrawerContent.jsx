import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import { router } from "expo-router";
import {
  Leaf,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../constants/colors";
import { getErrorMessage } from "../../utils/errorMessage";

export default function CustomDrawerContent(props) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await logout();

              props.navigation.closeDrawer();
              router.replace("/(auth)/login");
            } catch (error) {
              Alert.alert(
                "Logout failed",
                getErrorMessage(
                  error,
                  "Unable to log out."
                )
              );
            }
          },
        },
      ]
    );
  };

  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "farmer"
        ? "Farmer"
        : "User";

  return (
    <View style={styles.container}>
      <DrawerContentScrollView
        {...props}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Leaf size={25} color={colors.surface} />
          </View>

          <View style={styles.brandText}>
            <Text style={styles.brandName}>
              YieldSense AI
            </Text>

            <Text style={styles.brandSubtitle}>
              Agricultural Intelligence
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.userCard}>
            <View style={styles.avatar}>
              <UserRound
                size={25}
                color={colors.primary}
              />
            </View>

            <View style={styles.userDetails}>
              <Text
                style={styles.userName}
                numberOfLines={1}
              >
                {user?.full_name || "YieldSense User"}
              </Text>

              <Text
                style={styles.userEmail}
                numberOfLines={1}
              >
                {user?.email || ""}
              </Text>

              <View style={styles.roleBadge}>
                <ShieldCheck
                  size={13}
                  color={colors.primaryDark}
                />

                <Text style={styles.roleText}>
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.menuLabel}>Navigation</Text>

          <View style={styles.drawerItems}>
            <DrawerItemList {...props} />
          </View>
        </View>
      </DrawerContentScrollView>

      <View style={styles.footer}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.pressed,
          ]}
        >
          <View style={styles.logoutIcon}>
            <LogOut
              size={20}
              color={colors.danger}
            />
          </View>

          <Text style={styles.logoutText}>
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 0,
  },

  brandSection: {
    minHeight: 116,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 20,
  },

  logoContainer: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  brandText: {
    flex: 1,
    marginLeft: 13,
  },

  brandName: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.surface,
  },

  brandSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: "#BBF7D0",
  },

  content: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },

  userCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 17,
    backgroundColor: "#F0FDF4",
    padding: 14,
  },

  avatar: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  userDetails: {
    flex: 1,
    marginLeft: 12,
  },

  userName: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  userEmail: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },

  roleBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 7,
    borderRadius: 999,
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 9,
    paddingVertical: 4,
  },

  roleText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  menuLabel: {
    marginTop: 24,
    marginBottom: 8,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colors.textSecondary,
  },

  drawerItems: {
    marginHorizontal: -4,
  },

  footer: {
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
  },

  logoutButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 14,
    backgroundColor: "#FFF7F7",
    paddingHorizontal: 14,
  },

  logoutIcon: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#FEE2E2",
  },

  logoutText: {
    marginLeft: 12,
    fontSize: 15,
    fontWeight: "800",
    color: colors.danger,
  },

  pressed: {
    opacity: 0.72,
  },
});