import { useState } from "react";
import {
  Alert,
  Pressable,
  Text,
  View,
} from "react-native";
import {
  Link,
  router,
  useLocalSearchParams,
} from "expo-router";
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

export default function SendOtpScreen() {
  const params = useLocalSearchParams();

  const initialEmail =
    typeof params.email === "string" ? params.email : "";

  const [email, setEmail] = useState(initialEmail);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        "Invalid email",
        "Enter a valid registered email address."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await authService.sendOtp(
        normalizedEmail
      );

      Alert.alert(
        "OTP sent",
        result.message ||
          "A verification code was sent to your email.",
        [
          {
            text: "Enter OTP",
            onPress: () =>
              router.replace({
                pathname: "/(auth)/verify-otp",
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
        "Unable to send OTP",
        getErrorMessage(
          error,
          "The verification OTP could not be sent."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={commonStyles.authScreen}>
      <AuthCard
        title="Verify Your Email"
        subtitle="Send a new six-digit verification code to your email."
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
            The verification code remains valid for 10 minutes.
          </Text>

          <AppButton
            title="Send OTP"
            onPress={handleSendOtp}
            loading={loading}
          />

          <View style={commonStyles.centeredRow}>
            <Text style={commonStyles.helperText}>
              Already verified?{" "}
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