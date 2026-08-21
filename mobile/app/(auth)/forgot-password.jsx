import { useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { Mail } from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AuthCard from "../../src/components/auth/AuthCard";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";

import { authService } from "../../src/services/authService";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { isValidEmail } from "../../src/utils/validation";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    const normalizedEmail =
      email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        "Invalid email",
        "Enter a valid registered email address."
      );
      return;
    }

    try {
      setLoading(true);

      const result =
        await authService.forgotPassword(
          normalizedEmail
        );

      Alert.alert(
        "Reset OTP sent",
        result.message ||
          "A password-reset OTP was sent to your email.",
        [
          {
            text: "Continue",
            onPress: () =>
              router.replace({
                pathname: "/(auth)/reset-password",
                params: {
                  email: normalizedEmail,
                  startTimer: "true",
                },
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Request failed",
        getErrorMessage(
          error,
          "Unable to send the password-reset OTP."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={commonStyles.authScreen}>
      <AuthCard
        title="Forgot Password"
        subtitle="Receive a secure password-reset OTP by email."
      >
        <View style={commonStyles.form}>
          <AppInput
            label="Registered email"
            placeholder="farmer@example.com"
            value={email}
            onChangeText={setEmail}
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

          <Text style={commonStyles.helperText}>
            The six-digit reset code remains valid for 10 minutes.
          </Text>

          <AppButton
            title="Send Reset OTP"
            onPress={handleForgotPassword}
            loading={loading}
          />

          <View style={commonStyles.centeredRow}>
            <Text style={commonStyles.helperText}>
              Remember your password?{" "}
            </Text>

            <Link href="/(auth)/login" asChild>
              <Pressable hitSlop={10}>
                <Text style={commonStyles.linkText}>
                  Back to login
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>
      </AuthCard>
    </ScreenContainer>
  );
}