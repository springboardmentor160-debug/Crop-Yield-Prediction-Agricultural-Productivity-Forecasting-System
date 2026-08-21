import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Link,
  router,
  useLocalSearchParams,
} from "expo-router";
import { KeyRound, Mail } from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AuthCard from "../../src/components/auth/AuthCard";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";

import { authService } from "../../src/services/authService";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { isValidEmail } from "../../src/utils/validation";
import { getErrorMessage } from "../../src/utils/errorMessage";

const DEFAULT_COOLDOWN_SECONDS = 30;

function getRetryAfterSeconds(error) {
  const headerValue =
    error?.response?.headers?.["retry-after"] ??
    error?.response?.headers?.["Retry-After"];

  const retryAfter = Number(headerValue);

  if (Number.isFinite(retryAfter) && retryAfter > 0) {
    return Math.ceil(retryAfter);
  }

  const detail = error?.response?.data?.detail;

  if (typeof detail === "string") {
    const match = detail.match(
      /wait\s+(\d+)\s+seconds?/i
    );

    if (match) {
      return Number(match[1]);
    }
  }

  return DEFAULT_COOLDOWN_SECONDS;
}

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams();

  const initialEmail =
    typeof params.email === "string" ? params.email : "";

  const shouldStartTimer =
    params.startTimer === "true";

  const [form, setForm] = useState({
    email: initialEmail,
    otp_code: "",
  });

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [secondsRemaining, setSecondsRemaining] =
    useState(
      shouldStartTimer ? DEFAULT_COOLDOWN_SECONDS : 0
    );

  useEffect(() => {
    if (secondsRemaining <= 0) {
      return undefined;
    }

    const timerId = setInterval(() => {
      setSecondsRemaining((current) =>
        current > 0 ? current - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timerId);
  }, [secondsRemaining]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail =
      form.email.trim().toLowerCase();

    const normalizedOtp = form.otp_code.trim();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        "Invalid email",
        "Enter a valid email address."
      );
      return;
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      Alert.alert(
        "Invalid OTP",
        "Enter the complete six-digit OTP."
      );
      return;
    }

    try {
      setLoading(true);

      const result = await authService.verifyOtp({
        email: normalizedEmail,
        otp_code: normalizedOtp,
      });

      Alert.alert(
        "Email verified",
        result.message ||
          "Your account was verified successfully.",
        [
          {
            text: "Continue to Login",
            onPress: () =>
              router.replace("/(auth)/login"),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Verification failed",
        getErrorMessage(
          error,
          "Unable to verify this OTP."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (secondsRemaining > 0 || resending) {
      return;
    }

    const normalizedEmail =
      form.email.trim().toLowerCase();

    if (!isValidEmail(normalizedEmail)) {
      Alert.alert(
        "Invalid email",
        "Enter a valid registered email address."
      );
      return;
    }

    try {
      setResending(true);

      const result = await authService.sendOtp(
        normalizedEmail
      );

      setSecondsRemaining(DEFAULT_COOLDOWN_SECONDS);

      Alert.alert(
        "OTP sent",
        result.message ||
          "A new verification OTP was sent to your email."
      );
    } catch (error) {
      if (error?.response?.status === 429) {
        setSecondsRemaining(
          getRetryAfterSeconds(error)
        );
      }

      Alert.alert(
        "Unable to resend OTP",
        getErrorMessage(
          error,
          "A new verification OTP could not be sent."
        )
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <ScreenContainer contentStyle={commonStyles.authScreen}>
      <AuthCard
        title="Enter Verification Code"
        subtitle="Use the six-digit OTP sent to your registered email."
      >
        <View style={commonStyles.form}>
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
            label="OTP code"
            placeholder="Enter six-digit OTP"
            value={form.otp_code}
            onChangeText={(value) =>
              updateField(
                "otp_code",
                value.replace(/\D/g, "").slice(0, 6)
              )
            }
            keyboardType="number-pad"
            maxLength={6}
            autoComplete="one-time-code"
            leftIcon={
              <KeyRound
                size={20}
                color={colors.textSecondary}
              />
            }
          />

          <AppButton
            title="Verify Email"
            onPress={handleVerifyOtp}
            loading={loading}
          />

          <View style={styles.resendContainer}>
            {secondsRemaining > 0 ? (
              <Text style={styles.timerText}>
                Resend OTP in{" "}
                <Text style={styles.timerValue}>
                  {secondsRemaining}s
                </Text>
              </Text>
            ) : (
              <Pressable
                onPress={handleResendOtp}
                disabled={resending}
                hitSlop={10}
              >
                <Text
                  style={[
                    commonStyles.linkText,
                    resending && styles.disabledText,
                  ]}
                >
                  {resending
                    ? "Sending new OTP..."
                    : "Didn't receive it? Resend OTP"}
                </Text>
              </Pressable>
            )}
          </View>

          <View style={commonStyles.centeredRow}>
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

const styles = StyleSheet.create({
  resendContainer: {
    alignItems: "center",
    paddingVertical: 4,
  },

  timerText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  timerValue: {
    fontWeight: "800",
    color: colors.primary,
  },

  disabledText: {
    opacity: 0.5,
  },
});