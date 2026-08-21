import { StyleSheet, Text, View } from "react-native";

import { colors } from "../../constants/colors";

function FarmStatusBadge({ isActive }) {
  return (
    <View
      style={[
        styles.badge,
        isActive ? styles.activeBadge : styles.inactiveBadge,
      ]}
    >
      <Text
        style={[
          styles.text,
          isActive ? styles.activeText : styles.inactiveText,
        ]}
      >
        {isActive ? "Active" : "Inactive"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  activeBadge: {
    backgroundColor: colors.primaryLight,
  },

  inactiveBadge: {
    backgroundColor: "#E5E7EB",
  },

  text: {
    fontSize: 11,
    fontWeight: "800",
  },

  activeText: {
    color: colors.primaryDark,
  },

  inactiveText: {
    color: colors.textSecondary,
  },
});

export default FarmStatusBadge;