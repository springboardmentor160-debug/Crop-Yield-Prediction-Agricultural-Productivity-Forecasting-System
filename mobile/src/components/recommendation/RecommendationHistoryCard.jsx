import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowRight,
  CalendarDays,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

function formatNumber(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RecommendationHistoryCard({
  recommendation,
  onPress,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.cropIcon}>
          <Sprout
            size={24}
            color={colors.primaryDark}
          />
        </View>

        <View style={styles.headerContent}>
          <Text style={styles.cropLabel}>
            Recommended Crop
          </Text>

          <Text style={styles.cropName}>
            {recommendation.recommended_crop ?? "—"}
          </Text>
        </View>

        <ArrowRight
          size={21}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.divider} />

      <View style={styles.infoRow}>
        <Tractor
          size={18}
          color={colors.textSecondary}
        />

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Farm</Text>

          <Text style={styles.infoValue}>
            {recommendation.farm_name ??
              `Farm #${recommendation.farm_id}`}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <CalendarDays
          size={18}
          color={colors.textSecondary}
        />

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>
            Crop Year and Season
          </Text>

          <Text style={styles.infoValue}>
            {recommendation.crop_year ?? "—"} ·{" "}
            {recommendation.season ?? "—"}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Wheat
          size={18}
          color={colors.textSecondary}
        />

        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>
            Predicted Yield
          </Text>

          <Text style={styles.infoValue}>
            {formatNumber(
              recommendation.predicted_yield
            )}{" "}
            {recommendation.prediction_unit ??
              "metric tons per hectare"}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreLabel}>Score</Text>

          <Text style={styles.scoreValue}>
            {formatNumber(
              recommendation.recommendation_score
            )}
          </Text>
        </View>

        <Text style={styles.dateText}>
          {formatDate(recommendation.created_at)}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 14,
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  cardPressed: {
    opacity: 0.75,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  cropIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
  },

  headerContent: {
    flex: 1,
    marginLeft: 12,
  },

  cropLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  cropName: {
    marginTop: 4,
    fontSize: 20,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: colors.border,
  },

  infoRow: {
    marginBottom: 13,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  infoContent: {
    flex: 1,
    marginLeft: 10,
  },

  infoLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  infoValue: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  footer: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },

  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  scoreValue: {
    marginLeft: 6,
    fontSize: 13,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});