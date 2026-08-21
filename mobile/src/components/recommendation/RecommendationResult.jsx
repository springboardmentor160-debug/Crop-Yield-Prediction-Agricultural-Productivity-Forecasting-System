import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Award,
  BarChart3,
  CheckCircle2,
  History,
  RotateCcw,
  Sprout,
  Tractor,
  TrendingUp,
  Wheat,
} from "lucide-react-native";

import { colors } from "../../constants/colors";
import RecommendationAlternatives from "./RecommendationAlternatives";

function formatNumber(value, digits = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "—";
  }

  return number.toFixed(digits);
}

function getScorePercentage(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score <= 1) {
    return Math.min(Math.max(score * 100, 0), 100);
  }

  return Math.min(Math.max(score, 0), 100);
}

function getReasons(recommendation) {
  if (Array.isArray(recommendation?.reasons)) {
    return recommendation.reasons;
  }

  if (Array.isArray(recommendation?.recommendation_reasons)) {
    return recommendation.recommendation_reasons;
  }

  return [];
}

export default function RecommendationResult({
  recommendation,
  onRecommendAgain,
  onViewHistory,
}) {
  if (!recommendation) {
    return null;
  }

  const score = getScorePercentage(
    recommendation.recommendation_score
  );

  const reasons = getReasons(recommendation);

  return (
    <View style={styles.container}>
      <View style={styles.heroCard}>
        <View style={styles.resultBadge}>
          <Award
            size={18}
            color={colors.primaryDark}
          />

          <Text style={styles.resultBadgeText}>
            Best Crop Selected
          </Text>
        </View>

        <View style={styles.cropIconContainer}>
          <Sprout
            size={42}
            color={colors.primaryDark}
          />
        </View>

        <Text style={styles.label}>
          Recommended Crop
        </Text>

        <Text style={styles.cropName}>
          {recommendation.recommended_crop ?? "—"}
        </Text>

        <View style={styles.strengthBadge}>
          <TrendingUp
            size={16}
            color={colors.primaryDark}
          />

          <Text style={styles.strengthText}>
            {recommendation.recommendation_strength ??
              "Recommended"}
          </Text>
        </View>

        <View style={styles.scoreSection}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>
              Recommendation Score
            </Text>

            <Text style={styles.scoreValue}>
              {formatNumber(score, 1)}%
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${score}%`,
                },
              ]}
            />
          </View>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Wheat
              size={22}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.metricLabel}>
            Predicted Yield
          </Text>

          <Text style={styles.metricValue}>
            {formatNumber(
              recommendation.predicted_yield
            )}
          </Text>

          <Text style={styles.metricUnit}>
            {recommendation.prediction_unit ??
              "metric tons per hectare"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <Tractor
              size={22}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.metricLabel}>
            Estimated Production
          </Text>

          <Text style={styles.metricValue}>
            {formatNumber(
              recommendation.estimated_production
            )}
          </Text>

          <Text style={styles.metricUnit}>
            {recommendation.production_unit ??
              "metric tons"}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <BarChart3
              size={22}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.metricLabel}>
            Historical Average
          </Text>

          <Text style={styles.metricValue}>
            {formatNumber(
              recommendation.historical_average_yield
            )}
          </Text>

          <Text style={styles.metricUnit}>
            Average yield
          </Text>
        </View>

        <View style={styles.metricCard}>
          <View style={styles.metricIcon}>
            <History
              size={22}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.metricLabel}>
            Historical Records
          </Text>

          <Text style={styles.metricValue}>
            {recommendation.historical_record_count ??
              recommendation.historical_records ??
              "—"}
          </Text>

          <Text style={styles.metricUnit}>
            Records analyzed
          </Text>
        </View>
      </View>

      {reasons.length > 0 && (
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>
            Why this crop?
          </Text>

          {reasons.map((reason, index) => (
            <View
              key={`${reason}-${index}`}
              style={styles.reasonRow}
            >
              <CheckCircle2
                size={19}
                color={colors.primaryDark}
              />

              <Text style={styles.reasonText}>
                {reason}
              </Text>
            </View>
          ))}
        </View>
      )}

      {recommendation.explanation ? (
        <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>
            AI Explanation
            </Text>

            <Text style={styles.explanationText}>
            {recommendation.explanation}
            </Text>
        </View>
        ) : null}

        <RecommendationAlternatives
        recommendation={recommendation}
        />

        <View style={styles.actions}>
        <Pressable
            style={styles.primaryButton}
            onPress={onRecommendAgain}
        >
            <RotateCcw size={19} color="#ffffff" />

            <Text style={styles.primaryButtonText}>
            Recommend Again
            </Text>
        </Pressable>

        <Pressable
            style={styles.secondaryButton}
            onPress={onViewHistory}
        >
            <History
            size={19}
            color={colors.primaryDark}
            />

            <Text style={styles.secondaryButtonText}>
            View History
            </Text>
        </Pressable>
        </View>
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 18,
  },

  heroCard: {
    padding: 22,
    alignItems: "center",
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  resultBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },

  resultBadgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  cropIconContainer: {
    width: 78,
    height: 78,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
  },

  label: {
    marginTop: 18,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textSecondary,
  },

  cropName: {
    marginTop: 7,
    textAlign: "center",
    fontSize: 30,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  strengthBadge: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },

  strengthText: {
    fontSize: 13,
    fontWeight: "800",
    textTransform: "capitalize",
    color: colors.primaryDark,
  },

  scoreSection: {
    width: "100%",
    marginTop: 24,
  },

  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  scoreValue: {
    fontSize: 17,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  progressTrack: {
    height: 10,
    marginTop: 10,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },

  metricsGrid: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  metricCard: {
    width: "48%",
    minHeight: 160,
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  metricIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  metricLabel: {
    marginTop: 14,
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  metricValue: {
    marginTop: 6,
    fontSize: 21,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  metricUnit: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: colors.textSecondary,
  },

  sectionCard: {
    marginTop: 4,
    padding: 19,
    borderRadius: 19,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  reasonRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-start",
  },

  reasonText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  explanationText: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  actions: {
    marginTop: 18,
    gap: 12,
  },

  primaryButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
  },

  primaryButtonText: {
    marginLeft: 9,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },

  secondaryButton: {
    minHeight: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    backgroundColor: colors.surface,
  },

  secondaryButtonText: {
    marginLeft: 9,
    fontSize: 15,
    fontWeight: "800",
    color: colors.primaryDark,
  },
});