import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";
import LoadingScreen from "../../src/components/common/LoadingScreen";

import { authService } from "../../src/services/authService";
import { useAuth } from "../../src/hooks/useAuth";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { getErrorMessage } from "../../src/utils/errorMessage";
import {
  isValidPassword,
  isValidPhone,
} from "../../src/utils/validation";

export default function ProfileScreen() {
  const {
    user,
    refreshUser,
    updateUserProfile,
  } = useAuth();

  const [profileForm, setProfileForm] = useState({
    full_name: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [screenLoading, setScreenLoading] =
    useState(!user);

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [passwordLoading, setPasswordLoading] =
    useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const currentUser =
          user || (await refreshUser());

        setProfileForm({
          full_name: currentUser?.full_name || "",
          phone: currentUser?.phone || "",
        });
      } catch (error) {
        Alert.alert(
          "Profile unavailable",
          getErrorMessage(
            error,
            "Unable to load your profile."
          )
        );
      } finally {
        setScreenLoading(false);
      }
    };

    loadProfile();
  }, [user, refreshUser]);

  const updateProfileField = (field, value) => {
    setProfileForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updatePasswordField = (field, value) => {
    setPasswordForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleUpdateProfile = async () => {
    const fullName =
      profileForm.full_name.trim();

    const phone =
      profileForm.phone.trim();

    if (!fullName) {
      Alert.alert(
        "Missing name",
        "Full name is required."
      );
      return;
    }

    if (!isValidPhone(phone)) {
      Alert.alert(
        "Invalid phone",
        "Enter a valid phone number."
      );
      return;
    }

    try {
      setProfileLoading(true);

      await updateUserProfile({
        full_name: fullName,
        phone: phone || null,
      });

      Alert.alert(
        "Profile updated",
        "Your profile was updated successfully."
      );
    } catch (error) {
      Alert.alert(
        "Update failed",
        getErrorMessage(
          error,
          "Unable to update your profile."
        )
      );
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.old_password) {
      Alert.alert(
        "Missing password",
        "Enter your current password."
      );
      return;
    }

    if (!isValidPassword(
      passwordForm.new_password
    )) {
      Alert.alert(
        "Weak password",
        "The new password must contain at least eight characters."
      );
      return;
    }

    if (
      passwordForm.new_password !==
      passwordForm.confirm_password
    ) {
      Alert.alert(
        "Passwords do not match",
        "New password and confirmation must be identical."
      );
      return;
    }

    if (
      passwordForm.old_password ===
      passwordForm.new_password
    ) {
      Alert.alert(
        "Choose a different password",
        "The new password must be different from the current password."
      );
      return;
    }

    try {
      setPasswordLoading(true);

      await authService.changePassword({
        old_password:
          passwordForm.old_password,

        new_password:
          passwordForm.new_password,
      });

      setPasswordForm({
        old_password: "",
        new_password: "",
        confirm_password: "",
      });

      Alert.alert(
        "Password updated",
        "Your password was changed successfully."
      );
    } catch (error) {
      Alert.alert(
        "Password change failed",
        getErrorMessage(
          error,
          "Unable to change your password."
        )
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  if (screenLoading) {
    return (
      <LoadingScreen message="Loading profile..." />
    );
  }

  return (
    <ScreenContainer>
      {/* Profile summary */}
      <View style={styles.profileSummary}>
        <View style={styles.avatar}>
          <UserRound
            size={36}
            color={colors.surface}
          />
        </View>

        <Text style={styles.summaryName}>
          {user?.full_name || "YieldSense User"}
        </Text>

        <Text style={styles.summaryEmail}>
          {user?.email || ""}
        </Text>

        <View style={styles.statusBadge}>
          <ShieldCheck
            size={15}
            color={colors.primaryDark}
          />

          <Text style={styles.statusText}>
            {user?.is_verified
              ? "Verified"
              : "Not verified"}
            {" · "}
            {user?.role || "User"}
          </Text>
        </View>
      </View>

      {/* Account details */}
      <View
        style={[
          commonStyles.card,
          styles.section,
        ]}
      >
        <Text style={commonStyles.sectionTitle}>
          Account Details
        </Text>

        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Mail
              size={20}
              color={colors.primary}
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Email
              </Text>

              <Text style={styles.infoValue}>
                {user?.email}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <ShieldCheck
              size={20}
              color={colors.primary}
            />

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Role
              </Text>

              <Text style={styles.infoValue}>
                {user?.role || "Unknown"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Edit profile */}
      <View
        style={[
          commonStyles.card,
          styles.section,
        ]}
      >
        <View style={styles.sectionHeading}>
          <UserRound
            size={23}
            color={colors.primary}
          />

          <Text style={commonStyles.sectionTitle}>
            Edit Profile
          </Text>
        </View>

        <View style={commonStyles.form}>
          <AppInput
            label="Full name"
            placeholder="Enter your full name"
            value={profileForm.full_name}
            onChangeText={(value) =>
              updateProfileField(
                "full_name",
                value
              )
            }
            autoCapitalize="words"
            leftIcon={
              <UserRound
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Phone number"
            placeholder="Enter phone number"
            value={profileForm.phone}
            onChangeText={(value) =>
              updateProfileField(
                "phone",
                value
              )
            }
            keyboardType="phone-pad"
            maxLength={15}
            leftIcon={
              <Phone
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppButton
            title="Save Profile"
            onPress={handleUpdateProfile}
            loading={profileLoading}
          />
        </View>
      </View>

      {/* Change password */}
      <View
        style={[
          commonStyles.card,
          styles.section,
          styles.lastSection,
        ]}
      >
        <View style={styles.sectionHeading}>
          <LockKeyhole
            size={23}
            color={colors.primary}
          />

          <Text style={commonStyles.sectionTitle}>
            Change Password
          </Text>
        </View>

        <Text style={styles.securityDescription}>
          Use a secure password containing at least
          eight characters.
        </Text>

        <View
          style={[
            commonStyles.form,
            styles.passwordForm,
          ]}
        >
          <AppInput
            label="Current password"
            placeholder="Enter current password"
            value={passwordForm.old_password}
            onChangeText={(value) =>
              updatePasswordField(
                "old_password",
                value
              )
            }
            secureTextEntry
            leftIcon={
              <LockKeyhole
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="New password"
            placeholder="Minimum 8 characters"
            value={passwordForm.new_password}
            onChangeText={(value) =>
              updatePasswordField(
                "new_password",
                value
              )
            }
            secureTextEntry
            leftIcon={
              <LockKeyhole
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Confirm new password"
            placeholder="Re-enter new password"
            value={passwordForm.confirm_password}
            onChangeText={(value) =>
              updatePasswordField(
                "confirm_password",
                value
              )
            }
            secureTextEntry
            leftIcon={
              <LockKeyhole
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppButton
            title="Update Password"
            onPress={handleChangePassword}
            loading={passwordLoading}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  profileSummary: {
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 27,
  },

  avatar: {
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: colors.primaryDark,
  },

  summaryName: {
    marginTop: 14,
    fontSize: 23,
    fontWeight: "800",
    color: colors.surface,
  },

  summaryEmail: {
    marginTop: 4,
    fontSize: 13,
    color: "#DCFCE7",
  },

  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 13,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 13,
    paddingVertical: 7,
    gap: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "capitalize",
    color: colors.primaryDark,
  },

  section: {
    marginTop: 18,
  },

  lastSection: {
    marginBottom: 12,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 18,
  },

  infoList: {
    marginTop: 18,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoContent: {
    flex: 1,
    marginLeft: 13,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "700",
    textTransform: "capitalize",
    color: colors.text,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#E5E7EB",
  },

  securityDescription: {
    marginTop: -8,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  passwordForm: {
    marginTop: 18,
  },
});