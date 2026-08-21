import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/colors";

function DatasetSummaryCard({
  label,
  value,
  subtitle,
  icon,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>{icon}</View>

      <Text style={styles.label}>{label}</Text>

      <Text
        style={styles.value}
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value ?? "—"}
      </Text>

      {subtitle ? (
        <Text style={styles.subtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 145,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 17,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  iconContainer: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  label: {
    marginTop: 13,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  value: {
    marginTop: 4,
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 11,
    color: colors.textSecondary,
  },
});

export default DatasetSummaryCard;