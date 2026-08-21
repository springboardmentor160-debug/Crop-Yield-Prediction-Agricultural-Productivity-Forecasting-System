import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  BrainCircuit,
  CalendarDays,
  CircleAlert,
  Clock3,
  Eye,
  MapPinned,
  Package,
  RotateCcw,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

export default function PredictionResultCard({
  prediction,
  onPredictAgain,
}) {
  if (!prediction) {
    return null;
  }

  const createdAt = prediction.created_at
    ? new Date(
        prediction.created_at
      ).toLocaleString()
    : "Recently";

  const categoryStyle = getCategoryStyle(
    prediction.yield_category
  );

  const handleViewDetails = () => {
    if (!prediction.id) {
      return;
    }

    router.push({
      pathname:
        "/(protected)/prediction-details",
      params: {
        predictionId: String(prediction.id),
      },
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <BrainCircuit
            size={17}
            color="#DCFCE7"
          />

          <Text style={styles.heroBadgeText}>
            AI Prediction Completed
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          {prediction.crop} Yield Forecast
        </Text>

        <Text style={styles.heroSubtitle}>
          {prediction.farm_name} ·{" "}
          {prediction.state}
        </Text>
      </View>

      <View style={styles.content}>
        <View style={styles.metricCard}>
          <View style={styles.metricHeader}>
            <View style={styles.greenIcon}>
              <Wheat
                size={23}
                color={colors.primaryDark}
              />
            </View>

            <Text style={styles.metricLabel}>
              Predicted Yield
            </Text>
          </View>

          <Text style={styles.yieldValue}>
            {formatNumber(
              prediction.predicted_yield
            )}
          </Text>

          <Text style={styles.metricUnit}>
            {prediction.prediction_unit ||
              "metric tons per hectare"}
          </Text>
        </View>

        <View
          style={[
            styles.metricCard,
            styles.productionCard,
          ]}
        >
          <View style={styles.metricHeader}>
            <View style={styles.amberIcon}>
              <Package
                size={23}
                color="#B45309"
              />
            </View>

            <Text style={styles.metricLabel}>
              Estimated Production
            </Text>
          </View>

          <Text style={styles.productionValue}>
            {formatNumber(
              prediction.estimated_production
            )}
          </Text>

          <Text style={styles.productionUnit}>
            {prediction.production_unit ||
              "metric tons"}
          </Text>

          <Text style={styles.metricNote}>
            Based on{" "}
            {formatNumber(
              prediction.area_hectares
            )}{" "}
            hectares
          </Text>
        </View>

        {prediction.yield_category_label ||
        prediction.yield_category ? (
          <View style={styles.classificationCard}>
            <View
              style={[
                styles.classificationIcon,
                {
                  backgroundColor:
                    categoryStyle.iconBackground,
                },
              ]}
            >
              <Wheat
                size={22}
                color={categoryStyle.text}
              />
            </View>

            <View style={styles.classificationContent}>
              <Text
                style={styles.classificationTitle}
              >
                Yield Classification
              </Text>

              <View
                style={[
                  styles.categoryBadge,
                  {
                    backgroundColor:
                      categoryStyle.background,
                    borderColor:
                      categoryStyle.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    {
                      color: categoryStyle.text,
                    },
                  ]}
                >
                  {prediction.yield_category_label ||
                    formatCategory(
                      prediction.yield_category
                    )}
                </Text>
              </View>

              {prediction.yield_category_description ? (
                <Text
                  style={
                    styles.classificationDescription
                  }
                >
                  {
                    prediction.yield_category_description
                  }
                </Text>
              ) : null}
            </View>
          </View>
        ) : null}

        <Text style={styles.sectionTitle}>
          Prediction Details
        </Text>

        <View style={styles.detailGrid}>
          <DetailItem
            icon={Tractor}
            label="Farm"
            value={prediction.farm_name}
          />

          <DetailItem
            icon={Sprout}
            label="Crop"
            value={prediction.crop}
          />

          <DetailItem
            icon={CalendarDays}
            label="Year"
            value={String(
              prediction.crop_year
            )}
          />

          <DetailItem
            icon={MapPinned}
            label="State"
            value={prediction.state}
          />

          <DetailItem
            icon={Sprout}
            label="Season"
            value={prediction.season}
          />

          <DetailItem
            icon={BrainCircuit}
            label="Model"
            value={
              prediction.model_name
                ? `${prediction.model_name}${
                    prediction.model_version
                      ? ` v${prediction.model_version}`
                      : ""
                  }`
                : "Random Forest"
            }
          />

          <DetailItem
            icon={Clock3}
            label="Generated"
            value={createdAt}
            fullWidth
          />
        </View>

        {prediction.explanation ? (
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <CircleAlert
                size={20}
                color="#1D4ED8"
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                Prediction Information
              </Text>

              <Text style={styles.infoText}>
                {prediction.explanation}
              </Text>
            </View>
          </View>
        ) : null}

        {prediction.id ? (
          <Pressable
            onPress={handleViewDetails}
            style={({ pressed }) => [
              styles.detailsButton,
              pressed && styles.pressed,
            ]}
          >
            <Eye
              size={19}
              color={colors.primary}
            />

            <Text style={styles.detailsButtonText}>
              View Full Details
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          onPress={onPredictAgain}
          style={({ pressed }) => [
            styles.predictAgainButton,
            pressed && styles.pressed,
          ]}
        >
          <RotateCcw
            size={19}
            color={colors.surface}
          />

          <Text style={styles.predictAgainText}>
            Predict Again
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailItem({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) {
  return (
    <View
      style={[
        styles.detailItem,
        fullWidth && styles.fullWidth,
      ]}
    >
      <Icon
        size={18}
        color={colors.primary}
      />

      <Text style={styles.detailLabel}>
        {label}
      </Text>

      <Text
        style={styles.detailValue}
        numberOfLines={3}
      >
        {value || "—"}
      </Text>
    </View>
  );
}

function getCategoryStyle(category) {
  const normalizedCategory = String(
    category || ""
  )
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const stylesByCategory = {
    low: {
      background: "#FEF2F2",
      border: "#FECACA",
      text: "#B91C1C",
      iconBackground: "#FEE2E2",
    },

    moderate: {
      background: "#FFFBEB",
      border: "#FDE68A",
      text: "#B45309",
      iconBackground: "#FEF3C7",
    },

    medium: {
      background: "#FFFBEB",
      border: "#FDE68A",
      text: "#B45309",
      iconBackground: "#FEF3C7",
    },

    high: {
      background: "#F0FDF4",
      border: "#BBF7D0",
      text: "#15803D",
      iconBackground: "#DCFCE7",
    },

    very_high: {
      background: "#EFF6FF",
      border: "#BFDBFE",
      text: "#1D4ED8",
      iconBackground: "#DBEAFE",
    },
  };

  return (
    stylesByCategory[normalizedCategory] || {
      background: "#F9FAFB",
      border: colors.border,
      text: colors.text,
      iconBackground: "#F3F4F6",
    }
  );
}

function formatCategory(category) {
  if (!category) {
    return "Not Available";
  }

  return String(category)
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
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
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 22,
    backgroundColor: colors.surface,
  },

  hero: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },

  heroBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  heroBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: "#DCFCE7",
  },

  heroTitle: {
    marginTop: 10,
    fontSize: 25,
    fontWeight: "900",
    color: colors.surface,
  },

  heroSubtitle: {
    marginTop: 7,
    fontSize: 13,
    color: "#BBF7D0",
  },

  content: {
    padding: 18,
  },

  metricCard: {
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 18,
    backgroundColor: "#F0FDF4",
    padding: 18,
  },

  productionCard: {
    marginTop: 14,
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },

  metricHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  greenIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  amberIcon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  metricLabel: {
    marginLeft: 11,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  yieldValue: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  productionValue: {
    marginTop: 16,
    fontSize: 34,
    fontWeight: "900",
    color: "#B45309",
  },

  metricUnit: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primaryDark,
  },

  productionUnit: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: "#B45309",
  },

  metricNote: {
    marginTop: 8,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  classificationCard: {
    flexDirection: "row",
    marginTop: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    padding: 15,
  },

  classificationIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  classificationContent: {
    flex: 1,
    marginLeft: 12,
  },

  classificationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  categoryBadge: {
    alignSelf: "flex-start",
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },

  categoryBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },

  classificationDescription: {
    marginTop: 9,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 12,
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },

  detailItem: {
    width: "48%",
    minHeight: 118,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 15,
    backgroundColor: "#F9FAFB",
    padding: 13,
  },

  fullWidth: {
    width: "100%",
    minHeight: 98,
  },

  detailLabel: {
    marginTop: 8,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
    color: colors.textSecondary,
  },

  detailValue: {
    marginTop: 5,
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    color: colors.text,
  },

  infoCard: {
    flexDirection: "row",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 17,
    backgroundColor: "#EFF6FF",
    padding: 15,
  },

  infoIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
  },

  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  infoText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#1E40AF",
  },

  detailsButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 15,
    backgroundColor: colors.surface,
  },

  detailsButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.primary,
  },

  predictAgainButton: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 12,
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  predictAgainText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.surface,
  },

  pressed: {
    opacity: 0.72,
  },
});