import { StyleSheet, Text, View } from "react-native";
import { Database } from "lucide-react-native";

import { colors } from "../../constants/colors";

function EmptyState({
  title = "No records found",
  message = "Try changing the filters and loading the data again.",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Database size={30} color={colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 38,
  },

  iconContainer: {
    width: 62,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
  },

  title: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  message: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },
});

export default EmptyState;