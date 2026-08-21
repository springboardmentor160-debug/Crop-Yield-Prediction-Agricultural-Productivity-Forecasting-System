import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";

function AppButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = "primary",
  icon,
  style,
}) {
  const isDisabled = disabled || loading;

  const buttonVariantStyle =
    variant === "outline"
      ? styles.outlineButton
      : variant === "danger"
        ? styles.dangerButton
        : styles.primaryButton;

  const textVariantStyle =
    variant === "outline"
      ? styles.outlineText
      : styles.filledText;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        buttonVariantStyle,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "outline" ? colors.primary : colors.surface}
        />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, textVariantStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 50,
    width: "100%",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },

  primaryButton: {
    backgroundColor: colors.primary,
  },

  dangerButton: {
    backgroundColor: colors.danger,
  },

  outlineButton: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },

  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  text: {
    fontSize: 16,
    fontWeight: "700",
  },

  filledText: {
    color: colors.surface,
  },

  outlineText: {
    color: colors.primary,
  },

  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },

  disabled: {
    opacity: 0.55,
  },
});

export default AppButton;