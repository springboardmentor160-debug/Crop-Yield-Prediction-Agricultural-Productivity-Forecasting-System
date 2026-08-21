import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Link, router } from "expo-router";
import { LockKeyhole, Mail } from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AuthCard from "../../src/components/auth/AuthCard";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";

import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { validateLogin } from "../../src/utils/validation";
import { getErrorMessage } from "../../src/utils/errorMessage";
import { useAuth } from "../../src/hooks/useAuth";

export default function LoginScreen() {
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setFieldErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const handleLogin = async () => {
    const validationError = validateLogin(form);

    if (validationError) {
      Alert.alert("Check your details", validationError);
      return;
    }

    try {
      setLoading(true);

      await login({
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });

      router.replace("/(protected)/dashboard");
    } catch (error) {
      Alert.alert(
        "Login failed",
        getErrorMessage(error, "Unable to login with these details.")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={commonStyles.authScreen}>
      <AuthCard
        title="Welcome Back"
        subtitle="Sign in to continue to your YieldSense AI account."
      >
        <View style={commonStyles.form}>
          <AppInput
            label="Email address"
            placeholder="farmer@example.com"
            value={form.email}
            onChangeText={(value) => updateField("email", value)}
            keyboardType="email-address"
            autoComplete="email"
            error={fieldErrors.email}
            leftIcon={<Mail size={20} color={colors.textSecondary} />}
          />

          <AppInput
            label="Password"
            placeholder="Enter your password"
            value={form.password}
            onChangeText={(value) => updateField("password", value)}
            secureTextEntry
            autoComplete="password"
            error={fieldErrors.password}
            leftIcon={
              <LockKeyhole size={20} color={colors.textSecondary} />
            }
          />

          <View style={styles.forgotPasswordRow}>
            <Link href="/(auth)/forgot-password" asChild>
              <Pressable hitSlop={10}>
                <Text style={commonStyles.linkText}>
                  Forgot password?
                </Text>
              </Pressable>
            </Link>
          </View>

          <AppButton
            title="Login"
            onPress={handleLogin}
            loading={loading}
          />

          <View style={commonStyles.centeredRow}>
            <Text style={commonStyles.helperText}>
              {"Don't have an account? "}
            </Text>

            <Link href="/(auth)/register" asChild>
              <Pressable hitSlop={10}>
                <Text style={commonStyles.linkText}>
                  Create account
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
  forgotPasswordRow: {
    alignItems: "flex-end",
    marginTop: -4,
  },
});