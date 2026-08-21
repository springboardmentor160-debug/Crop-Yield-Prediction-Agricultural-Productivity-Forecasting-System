import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Award,
  BarChart3,
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

function getScorePercentage(value) {
  const score = Number(value);

  if (!Number.isFinite(score)) {
    return 0;
  }

  if (score <= 1) {
    return Math.min(
      Math.max(score * 100, 0),
      100
    );
  }

  return Math.min(
    Math.max(score, 0),
    100
  );
}

function extractAlternatives(recommendation) {
  if (Array.isArray(recommendation?.alternatives)) {
    return recommendation.alternatives;
  }

  if (
    Array.isArray(
      recommendation?.alternative_crops
    )
  ) {
    return recommendation.alternative_crops;
  }

  if (
    Array.isArray(
      recommendation?.recommendation_alternatives
    )
  ) {
    return recommendation.recommendation_alternatives;
  }

  return [];
}

export default function RecommendationAlternatives({
  recommendation,
}) {
  const alternatives =
    extractAlternatives(recommendation);

  if (alternatives.length === 0) {
    return null;
  }

  return (
    <View style={styles.sectionCard}>
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Award
            size={22}
            color={colors.primaryDark}
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Alternative Crops
          </Text>

          <Text style={styles.description}>
            Other suitable crops ranked by the AI model.
          </Text>
        </View>
      </View>

      <View style={styles.list}>
        {alternatives.map((item, index) => {
          const cropName =
            item.crop ??
            item.crop_name ??
            item.recommended_crop ??
            "Alternative crop";

          const score = getScorePercentage(
            item.recommendation_score ??
              item.score
          );

          return (
            <View
              key={`${cropName}-${index}`}
              style={styles.alternativeCard}
            >
              <View style={styles.rankRow}>
                <View style={styles.rankBadge}>
                  <Text style={styles.rankText}>
                    #{index + 2}
                  </Text>
                </View>

                <View style={styles.cropIcon}>
                  <Sprout
                    size={21}
                    color={colors.primaryDark}
                  />
                </View>

                <View style={styles.cropContent}>
                  <Text style={styles.cropLabel}>
                    Alternative Crop
                  </Text>

                  <Text style={styles.cropName}>
                    {cropName}
                  </Text>
                </View>
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

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Wheat
                    size={18}
                    color={colors.primaryDark}
                  />

                  <View style={styles.metricContent}>
                    <Text style={styles.metricLabel}>
                      Predicted Yield
                    </Text>

                    <Text style={styles.metricValue}>
                      {formatNumber(
                        item.predicted_yield
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.metric}>
                  <Tractor
                    size={18}
                    color={colors.primaryDark}
                  />

                  <View style={styles.metricContent}>
                    <Text style={styles.metricLabel}>
                      Production
                    </Text>

                    <Text style={styles.metricValue}>
                      {formatNumber(
                        item.estimated_production
                      )}
                    </Text>
                  </View>
                </View>

                <View style={styles.metric}>
                  <BarChart3
                    size={18}
                    color={colors.primaryDark}
                  />

                  <View style={styles.metricContent}>
                    <Text style={styles.metricLabel}>
                      Historical Average
                    </Text>

                    <Text style={styles.metricValue}>
                      {formatNumber(
                        item.historical_average_yield
                      )}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.recordsRow}>
                <Text style={styles.recordsLabel}>
                  Historical records analyzed
                </Text>

                <Text style={styles.recordsValue}>
                  {item.historical_record_count ??
                    item.historical_records ??
                    "—"}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    marginTop: 14,
    padding: 19,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
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
  },

  title: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  description: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  list: {
    marginTop: 18,
  },

  alternativeCard: {
    marginBottom: 14,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },

  rankRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  rankBadge: {
    minWidth: 38,
    height: 32,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: colors.primaryDark,
  },

  rankText: {
    fontSize: 13,
    fontWeight: "900",
    color: "#ffffff",
  },

  cropIcon: {
    width: 42,
    height: 42,
    marginLeft: 10,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  cropContent: {
    flex: 1,
    marginLeft: 11,
  },

  cropLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.textSecondary,
  },

  cropName: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  scoreSection: {
    marginTop: 17,
  },

  scoreHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  scoreValue: {
    fontSize: 14,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  progressTrack: {
    height: 8,
    marginTop: 8,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: colors.border,
  },

  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primaryDark,
  },

  metrics: {
    marginTop: 17,
    gap: 11,
  },

  metric: {
    flexDirection: "row",
    alignItems: "center",
  },

  metricContent: {
    flex: 1,
    marginLeft: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  metricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  recordsRow: {
    marginTop: 16,
    paddingTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },

  recordsLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  recordsValue: {
    fontSize: 13,
    fontWeight: "900",
    color: colors.textPrimary,
  },
});