import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CalendarDays,
  ChevronRight,
  MapPinned,
  Package,
  Sprout,
  Wheat,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

export default function PredictionHistoryCard({
  prediction,
  onPress,
}) {
  const createdAt = prediction.created_at
    ? new Date(prediction.created_at).toLocaleString()
    : "Recently";

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.cropIcon}>
          <Sprout
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.headerText}>
          <Text
            style={styles.cropName}
            numberOfLines={1}
          >
            {prediction.crop}
          </Text>

          <Text
            style={styles.farmName}
            numberOfLines={1}
          >
            {prediction.farm_name}
          </Text>
        </View>

        <ChevronRight
          size={21}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.locationRow}>
        <MapPinned
          size={15}
          color={colors.textSecondary}
        />

        <Text style={styles.locationText}>
          {prediction.state} · {prediction.season} ·{" "}
          {prediction.crop_year}
        </Text>
      </View>

      <View style={styles.metrics}>
        <View style={styles.metric}>
          <Wheat
            size={18}
            color={colors.primaryDark}
          />

          <View style={styles.metricText}>
            <Text style={styles.metricLabel}>
              Predicted Yield
            </Text>

            <Text style={styles.yieldValue}>
              {formatNumber(
                prediction.predicted_yield
              )}
            </Text>

            <Text style={styles.metricUnit}>
              {prediction.prediction_unit ||
                "metric tons/hectare"}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.metric}>
          <Package
            size={18}
            color="#B45309"
          />

          <View style={styles.metricText}>
            <Text style={styles.metricLabel}>
              Production
            </Text>

            <Text style={styles.productionValue}>
              {formatNumber(
                prediction.estimated_production
              )}
            </Text>

            <Text style={styles.metricUnit}>
              {prediction.production_unit ||
                "metric tons"}
            </Text>
          </View>
        </View>
      </View>

      {prediction.yield_category_label ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {prediction.yield_category_label}
          </Text>
        </View>
      ) : null}

      <View style={styles.footer}>
        <CalendarDays
          size={14}
          color={colors.textSecondary}
        />

        <Text style={styles.createdAt}>
          {createdAt}
        </Text>
      </View>
    </Pressable>
  );
}

function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
    padding: 17,
  },

  pressed: {
    opacity: 0.72,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  cropIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  cropName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  farmName: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  locationText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 12,
    color: colors.textSecondary,
  },

  metrics: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 16,
    borderRadius: 14,
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
  },

  metric: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 13,
  },

  metricText: {
    flex: 1,
    marginLeft: 8,
  },

  metricLabel: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  yieldValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  productionValue: {
    marginTop: 3,
    fontSize: 15,
    fontWeight: "900",
    color: "#B45309",
  },

  metricUnit: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  divider: {
    width: 1,
    height: 38,
    backgroundColor: colors.border,
  },

  badge: {
    alignSelf: "flex-start",
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
  },

  createdAt: {
    marginLeft: 7,
    fontSize: 11,
    color: colors.textSecondary,
  },
});