import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import {
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AuthCard from "../../src/components/auth/AuthCard";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";

import { authService } from "../../src/services/authService";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { validateRegistration } from "../../src/utils/validation";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function RegisterScreen() {
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleRegister = async () => {
    const validationError = validateRegistration({
      ...form,
      role: "farmer",
    });

    if (validationError) {
      Alert.alert("Check your details", validationError);
      return;
    }

    const normalizedEmail = form.email.trim().toLowerCase();

    try {
      setLoading(true);

      const result = await authService.register({
        full_name: form.full_name.trim(),
        email: normalizedEmail,
        phone: form.phone.trim() || null,
        password: form.password,
      });

      Alert.alert(
        "Account created",
        result.message ||
          "A verification OTP was sent to your email.",
        [
          {
            text: "Verify Email",
            onPress: () =>
              router.replace({
                pathname: "/(auth)/verify-otp",
                params: {
                  email: result.email || normalizedEmail,
                  startTimer: "true",
                },
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Registration failed",
        getErrorMessage(
          error,
          "Unable to create your account."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.screenContent}>
      <AuthCard
        title="Create Account"
        subtitle="Create your farmer account and verify your email."
      >
        <View style={commonStyles.form}>
          <AppInput
            label="Full name"
            placeholder="Enter your full name"
            value={form.full_name}
            onChangeText={(value) =>
              updateField("full_name", value)
            }
            autoCapitalize="words"
            autoComplete="name"
            leftIcon={
              <UserRound
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Email address"
            placeholder="farmer@example.com"
            value={form.email}
            onChangeText={(value) =>
              updateField("email", value)
            }
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon={
              <Mail
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Phone number"
            placeholder="Enter phone number"
            value={form.phone}
            onChangeText={(value) =>
              updateField("phone", value)
            }
            keyboardType="phone-pad"
            autoComplete="tel"
            maxLength={15}
            leftIcon={
              <Phone
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Password"
            placeholder="Minimum 8 characters"
            value={form.password}
            onChangeText={(value) =>
              updateField("password", value)
            }
            secureTextEntry
            autoComplete="new-password"
            leftIcon={
              <LockKeyhole
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              Public registration creates a farmer account. A
              six-digit verification code will be sent to your email.
            </Text>
          </View>

          <AppButton
            title="Create Account"
            onPress={handleRegister}
            loading={loading}
          />

          <View style={commonStyles.centeredRow}>
            <Text style={commonStyles.helperText}>
              Already have an account?{" "}
            </Text>

            <Link href="/(auth)/login" asChild>
              <Pressable hitSlop={10}>
                <Text style={commonStyles.linkText}>
                  Login
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </AuthCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 30,
  },

  infoBox: {
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    padding: 14,
  },

  infoText: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.primaryDark,
  },
});