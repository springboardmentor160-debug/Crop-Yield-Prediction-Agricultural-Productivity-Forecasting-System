import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useLocalSearchParams,
} from "expo-router";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarDays,
  CircleAlert,
  CloudRain,
  Droplets,
  FlaskConical,
  Leaf,
  MapPinned,
  Package,
  Sprout,
  ThermometerSun,
  Tractor,
  Wheat,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import LoadingScreen from "../../src/components/common/LoadingScreen";

import { predictionService } from "../../src/services/predictionService";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function PredictionDetailsScreen() {
  const { predictionId } = useLocalSearchParams();

  const [prediction, setPrediction] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const loadPrediction = useCallback(
    async ({ refresh = false } = {}) => {
      const numericId = Number(predictionId);

      if (
        !Number.isInteger(numericId) ||
        numericId <= 0
      ) {
        Alert.alert(
          "Invalid prediction",
          "The selected prediction ID is invalid.",
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
            },
          ]
        );

        setLoading(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result =
          await predictionService.getPrediction(
            numericId
          );

        setPrediction(result);
      } catch (error) {
        Alert.alert(
          "Unable to load prediction",
          getErrorMessage(
            error,
            "Prediction details could not be loaded."
          ),
          [
            {
              text: "Go Back",
              onPress: () => router.back(),
            },
            {
              text: "Retry",
              onPress: () =>
                loadPrediction(),
            },
          ]
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [predictionId]
  );

  useEffect(() => {
    loadPrediction();
  }, [loadPrediction]);

  if (loading && !prediction) {
    return (
      <LoadingScreen message="Loading prediction details..." />
    );
  }

  if (!prediction) {
    return null;
  }

  const generatedAt = prediction.created_at
    ? new Date(
        prediction.created_at
      ).toLocaleString()
    : "Recently";

  return (
    <ScreenContainer
      contentStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadPrediction({
              refresh: true,
            })
          }
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressed,
          ]}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Prediction Details
          </Text>

          <Text style={styles.subtitle}>
            Complete saved prediction information
          </Text>
        </View>
      </View>

      <View style={styles.hero}>
        <View style={styles.heroBadge}>
          <BrainCircuit
            size={17}
            color="#DCFCE7"
          />

          <Text style={styles.heroBadgeText}>
            AI Crop Forecast
          </Text>
        </View>

        <Text style={styles.heroTitle}>
          {prediction.crop}
        </Text>

        <Text style={styles.heroSubtitle}>
          {prediction.farm_name} ·{" "}
          {prediction.state}
        </Text>

        <View style={styles.heroMeta}>
          <Text style={styles.heroMetaText}>
            {prediction.season}
          </Text>

          <View style={styles.metaDot} />

          <Text style={styles.heroMetaText}>
            {prediction.crop_year}
          </Text>
        </View>
      </View>

      <View style={styles.metrics}>
        <MetricCard
          icon={Wheat}
          label="Predicted Yield"
          value={formatNumber(
            prediction.predicted_yield
          )}
          note={prediction.prediction_unit}
          variant="green"
        />

        <MetricCard
          icon={Package}
          label="Estimated Production"
          value={formatNumber(
            prediction.estimated_production
          )}
          note={`${prediction.production_unit || "metric tons"}
          Based on ${formatNumber(
            prediction.area_hectares
          )} hectares`}
          variant="amber"
        />
      </View>

      <SectionCard
        title="Yield Classification"
        icon={Wheat}
      >
        <DetailRow
          icon={Wheat}
          label="Category"
          value={
            prediction.yield_category_label
          }
        />

        <DetailRow
          label="Description"
          value={
            prediction.yield_category_description
          }
          last
        />
      </SectionCard>

      <SectionCard
        title="Farm and Crop"
        icon={Tractor}
      >
        <DetailRow
          icon={Tractor}
          label="Farm"
          value={prediction.farm_name}
        />

        <DetailRow
          icon={MapPinned}
          label="State"
          value={prediction.state}
        />

        <DetailRow
          icon={Sprout}
          label="Crop"
          value={prediction.crop}
        />

        <DetailRow
          icon={CalendarDays}
          label="Prediction Year"
          value={String(
            prediction.crop_year
          )}
        />

        <DetailRow
          icon={Sprout}
          label="Season"
          value={prediction.season}
        />

        <DetailRow
          icon={Tractor}
          label="Farm Area"
          value={`${formatNumber(
            prediction.area_hectares
          )} hectares`}
          last
        />
      </SectionCard>

      <SectionCard
        title="Agricultural Inputs"
        icon={FlaskConical}
      >
        <DetailRow
          icon={FlaskConical}
          label="Fertilizer"
          value={formatNumber(
            prediction.fertilizer
          )}
        />

        <DetailRow
          icon={Leaf}
          label="Pesticide"
          value={formatNumber(
            prediction.pesticide
          )}
        />

        <DetailRow
          icon={CloudRain}
          label="Annual Rainfall"
          value={formatNumber(
            prediction.annual_rainfall
          )}
          last
        />
      </SectionCard>

      <SectionCard
        title="Soil Reference"
        icon={Sprout}
      >
        <DetailRow
          label="Nitrogen (N)"
          value={formatNumber(
            prediction.nitrogen
          )}
        />

        <DetailRow
          label="Phosphorus (P)"
          value={formatNumber(
            prediction.phosphorus
          )}
        />

        <DetailRow
          label="Potassium (K)"
          value={formatNumber(
            prediction.potassium
          )}
        />

        <DetailRow
          label="Soil pH"
          value={formatNumber(
            prediction.ph
          )}
          last
        />
      </SectionCard>

      <SectionCard
        title="Weather Information"
        icon={ThermometerSun}
      >
        <DetailRow
          icon={ThermometerSun}
          label="Average Temperature"
          value={`${formatNumber(
            prediction.average_temperature_c
          )} °C`}
        />

        <DetailRow
          icon={CloudRain}
          label="Total Rainfall"
          value={`${formatNumber(
            prediction.total_rainfall_mm
          )} mm`}
        />

        <DetailRow
          icon={Droplets}
          label="Average Humidity"
          value={`${formatNumber(
            prediction.average_humidity_percent
          )}%`}
          last
        />
      </SectionCard>

      <SectionCard
        title="Model Information"
        icon={BrainCircuit}
      >
        <DetailRow
          icon={BrainCircuit}
          label="Model"
          value={prediction.model_name}
        />

        <DetailRow
          label="Model Version"
          value={prediction.model_version}
        />

        <DetailRow
          label="Generated"
          value={generatedAt}
          last
        />
      </SectionCard>

      {prediction.explanation ? (
        <View style={styles.explanationCard}>
          <View style={styles.explanationIcon}>
            <CircleAlert
              size={21}
              color="#1D4ED8"
            />
          </View>

          <View style={styles.explanationContent}>
            <Text style={styles.explanationTitle}>
              Prediction Information
            </Text>

            <Text style={styles.explanationText}>
              {prediction.explanation}
            </Text>
          </View>
        </View>
      ) : null}

      <Pressable
        onPress={() =>
          router.push(
            "/(protected)/prediction"
          )
        }
        style={({ pressed }) => [
          styles.newPredictionButton,
          pressed && styles.pressed,
        ]}
      >
        <BrainCircuit
          size={19}
          color={colors.surface}
        />

        <Text style={styles.newPredictionText}>
          Generate New Prediction
        </Text>
      </Pressable>
    </ScreenContainer>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  note,
  variant,
}) {
  const amber = variant === "amber";

  return (
    <View
      style={[
        styles.metricCard,
        amber
          ? styles.amberMetric
          : styles.greenMetric,
      ]}
    >
      <View
        style={[
          styles.metricIcon,
          amber
            ? styles.amberIcon
            : styles.greenIcon,
        ]}
      >
        <Icon
          size={24}
          color={
            amber
              ? "#B45309"
              : colors.primaryDark
          }
        />
      </View>

      <Text style={styles.metricLabel}>
        {label}
      </Text>

      <Text
        style={[
          styles.metricValue,
          amber
            ? styles.amberValue
            : styles.greenValue,
        ]}
      >
        {value}
      </Text>

      <Text style={styles.metricNote}>
        {note}
      </Text>
    </View>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Icon
            size={20}
            color={colors.primary}
          />
        </View>

        <Text style={styles.sectionTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.sectionRows}>
        {children}
      </View>
    </View>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  last = false,
}) {
  return (
    <View
      style={[
        styles.detailRow,
        last && styles.lastRow,
      ]}
    >
      <View style={styles.detailLabelGroup}>
        {Icon ? (
          <Icon
            size={17}
            color={colors.textSecondary}
          />
        ) : null}

        <Text style={styles.detailLabel}>
          {label}
        </Text>
      </View>

      <Text
        style={styles.detailValue}
        numberOfLines={3}
      >
        {value || "—"}
      </Text>
    </View>
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
  screenContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  hero: {
    borderRadius: 21,
    backgroundColor: colors.primaryDark,
    padding: 20,
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
    marginTop: 12,
    fontSize: 28,
    fontWeight: "900",
    color: colors.surface,
  },

  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    color: "#BBF7D0",
  },

  heroMeta: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  heroMetaText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#DCFCE7",
  },

  metaDot: {
    width: 4,
    height: 4,
    marginHorizontal: 9,
    borderRadius: 2,
    backgroundColor: "#86EFAC",
  },

  metrics: {
    gap: 12,
    marginTop: 15,
  },

  metricCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 18,
  },

  greenMetric: {
    borderColor: "#BBF7D0",
    backgroundColor: "#F0FDF4",
  },

  amberMetric: {
    borderColor: "#FDE68A",
    backgroundColor: "#FFFBEB",
  },

  metricIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  greenIcon: {
    backgroundColor: colors.surface,
  },

  amberIcon: {
    backgroundColor: colors.surface,
  },

  metricLabel: {
    marginTop: 14,
    fontSize: 13,
    fontWeight: "800",
    color: colors.textSecondary,
  },

  metricValue: {
    marginTop: 6,
    fontSize: 33,
    fontWeight: "900",
  },

  greenValue: {
    color: colors.primaryDark,
  },

  amberValue: {
    color: "#B45309",
  },

  metricNote: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  sectionCard: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 19,
    backgroundColor: colors.surface,
    padding: 16,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 13,
  },

  sectionIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },

  sectionTitle: {
    marginLeft: 10,
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  sectionRows: {
    marginTop: 3,
  },

  detailRow: {
    minHeight: 55,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 11,
  },

  lastRow: {
    borderBottomWidth: 0,
  },

  detailLabelGroup: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  detailLabel: {
    flex: 1,
    fontSize: 13,
    color: colors.textSecondary,
  },

  detailValue: {
    maxWidth: "52%",
    textAlign: "right",
    fontSize: 13,
    fontWeight: "800",
    lineHeight: 18,
    color: colors.text,
  },

  explanationCard: {
    flexDirection: "row",
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
    padding: 15,
  },

  explanationIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  explanationContent: {
    flex: 1,
    marginLeft: 11,
  },

  explanationTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E3A8A",
  },

  explanationText: {
    marginTop: 6,
    fontSize: 12,
    lineHeight: 19,
    color: "#1E40AF",
  },

  newPredictionButton: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    marginTop: 20,
    borderRadius: 15,
    backgroundColor: colors.primary,
  },

  newPredictionText: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.surface,
  },

  pressed: {
    opacity: 0.72,
  },
});