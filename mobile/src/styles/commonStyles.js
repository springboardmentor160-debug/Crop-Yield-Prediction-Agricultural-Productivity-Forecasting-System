import { StyleSheet } from "react-native";

import { colors } from "../constants/colors";

export const commonStyles = StyleSheet.create({
  authScreen: {
    flex: 1,
    justifyContent: "center",
    paddingVertical: 24,
  },

  form: {
    gap: 16,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  centeredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  linkText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  helperText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  card: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 20,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
});