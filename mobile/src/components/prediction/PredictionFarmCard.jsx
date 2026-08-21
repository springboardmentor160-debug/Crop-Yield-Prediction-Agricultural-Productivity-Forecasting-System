import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  MapPinned,
  Sprout,
  Tractor,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

export default function PredictionFarmCard({
  farm,
}) {
  if (!farm) {
    return (
      <View style={styles.emptyCard}>
        <Tractor
          size={34}
          color={colors.primary}
        />

        <Text style={styles.emptyTitle}>
          No Farm Selected
        </Text>

        <Text style={styles.emptyText}>
          Select an active farm to preview the
          information used for prediction.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Tractor
          size={22}
          color={colors.surface}
        />

        <Text style={styles.headerTitle}>
          Selected Farm
        </Text>
      </View>

      <Text style={styles.farmName}>
        {farm.farm_name}
      </Text>

      <View style={styles.row}>
        <MapPinned
          size={16}
          color={colors.primary}
        />

        <Text style={styles.value}>
          {farm.state}
        </Text>
      </View>

      <View style={styles.row}>
        <Sprout
          size={16}
          color={colors.primary}
        />

        <Text style={styles.value}>
          {farm.primary_crop || "Not specified"}
        </Text>
      </View>

      <Text style={styles.info}>
        Soil nutrients and weather values will
        automatically be obtained from the
        reference datasets.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 12,
    padding: 12,
  },

  headerTitle: {
    color: colors.surface,
    marginLeft: 10,
    fontWeight: "800",
    fontSize: 16,
  },

  farmName: {
    marginTop: 16,
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  value: {
    marginLeft: 10,
    color: colors.text,
    fontSize: 15,
  },

  info: {
    marginTop: 18,
    color: colors.textSecondary,
    lineHeight: 22,
    fontSize: 13,
  },

  emptyCard: {
    padding: 26,
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 18,
  },

  emptyTitle: {
    marginTop: 14,
    fontWeight: "800",
    fontSize: 18,
    color: colors.text,
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    color: colors.textSecondary,
    lineHeight: 22,
  },
});