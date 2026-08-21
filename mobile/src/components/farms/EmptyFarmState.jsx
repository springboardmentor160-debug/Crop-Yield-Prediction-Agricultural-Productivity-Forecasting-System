import { StyleSheet, Text, View } from "react-native";
import { Tractor } from "lucide-react-native";

import { colors } from "../../constants/colors";
import AppButton from "../common/AppButton";

function EmptyFarmState({
  title = "No farms found",
  message = "Create your first farm to begin managing agricultural information.",
  showCreateButton = true,
  onCreate,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Tractor size={30} color={colors.primary} />
      </View>

      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>

      {showCreateButton ? (
        <AppButton
          title="Create Farm"
          onPress={onCreate}
          style={styles.button}
        />
      ) : null}
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

  button: {
    marginTop: 20,
  },
});

export default EmptyFarmState;