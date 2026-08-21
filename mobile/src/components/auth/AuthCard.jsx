import { StyleSheet, Text, View } from "react-native";
import { Leaf } from "lucide-react-native";

import { colors } from "../../constants/colors";

function AuthCard({
  title,
  subtitle,
  children,
  showLogo = true,
}) {
  return (
    <View style={styles.container}>
      {showLogo ? (
        <View style={styles.brandSection}>
          <View style={styles.logoContainer}>
            <Leaf size={30} color={colors.surface} />
          </View>

          <Text style={styles.brandName}>YieldSense AI</Text>
        </View>
      ) : null}

      <Text style={styles.title}>{title}</Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}

      <View style={styles.formContent}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    maxWidth: 500,
    alignSelf: "center",
    borderRadius: 22,
    backgroundColor: colors.surface,
    padding: 24,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },

  brandSection: {
    alignItems: "center",
    marginBottom: 22,
  },

  logoContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },

  brandName: {
    marginTop: 10,
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  title: {
    textAlign: "center",
    fontSize: 27,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  formContent: {
    marginTop: 24,
  },
});

export default AuthCard;