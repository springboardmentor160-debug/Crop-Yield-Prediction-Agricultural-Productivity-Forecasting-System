import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  AlertTriangle,
  Check,
  ChevronDown,
  CircleGauge,
  Droplets,
  FlaskConical,
  Leaf,
  MapPinned,
  Search,
  ShieldCheck,
  Sprout,
  TestTube2,
  X,
} from "lucide-react-native";

import {
  getSoilAnalysis,
  getSoilAnalysisOptions,
} from "../../src/services/soilAnalysisService";
import { colors } from "../../src/constants/colors";


export default function SoilAnalysisScreen() {
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] =
    useState("");

  const [analysis, setAnalysis] =
    useState(null);

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");


  useEffect(() => {
    loadOptions();
  }, []);


  async function loadOptions({
    showRefresh = false,
  } = {}) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setOptionsLoading(true);
      }

      const data =
        await getSoilAnalysisOptions();

      const availableStates =
        data.states || [];

      setStates(availableStates);

      setSelectedState(
        (currentState) =>
          currentState ||
          availableStates[0] ||
          ""
      );
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load soil analysis options."
        )
      );
    } finally {
      setOptionsLoading(false);
      setRefreshing(false);
    }
  }


  async function handleAnalyzeSoil() {
    if (!selectedState) {
      setError(
        "Please select a state."
      );

      return;
    }

    try {
      setError("");
      setAnalysisLoading(true);

      const data =
        await getSoilAnalysis(
          selectedState
        );

      setAnalysis(data);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to generate soil analysis."
        )
      );
    } finally {
      setAnalysisLoading(false);
    }
  }


  function handleRefresh() {
    loadOptions({
      showRefresh: true,
    });
  }


  if (optionsLoading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingText}>
          Loading soil analysis...
        </Text>
      </View>
    );
  }


  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.contentContainer
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      <SoilHeader />

      <SoilFilterCard
        states={states}
        selectedState={selectedState}
        setSelectedState={
          setSelectedState
        }
        loading={analysisLoading}
        onAnalyze={handleAnalyzeSoil}
      />

      {error ? (
        <ErrorCard message={error} />
      ) : null}

      {!analysis &&
      !analysisLoading ? (
        <EmptyAnalysisCard />
      ) : null}

      {analysisLoading ? (
        <AnalysisLoadingCard />
      ) : null}

      {analysis &&
      !analysisLoading ? (
        <>
          <AnalysisInformation
            analysis={analysis}
          />

          <SoilSummarySection
            summary={analysis.summary}
          />

          <NutrientVisualization
            summary={analysis.summary}
          />

          <OverallHealthCard
            health={
              analysis.overall_health
            }
          />

          <RecommendationsSection
            recommendations={
              analysis.recommendations ||
              []
            }
          />
        </>
      ) : null}
    </ScrollView>
  );
}


function SoilHeader() {
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerContent}>
        <View style={styles.headerBadge}>
          <Sprout
            size={16}
            color={colors.primary}
          />

          <Text style={styles.headerBadgeText}>
            Agricultural Soil Intelligence
          </Text>
        </View>

        <Text style={styles.headerTitle}>
          Soil Analysis
        </Text>

        <Text style={styles.headerDescription}>
          Examine state-level nitrogen,
          phosphorus, potassium and pH
          conditions and receive practical
          soil recommendations.
        </Text>
      </View>

      <View style={styles.headerIcon}>
        <Sprout
          size={38}
          color={colors.primary}
        />
      </View>
    </View>
  );
}


function SoilFilterCard({
  states,
  selectedState,
  setSelectedState,
  loading,
  onAnalyze,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Select State
      </Text>

      <Text style={styles.sectionDescription}>
        Choose a state to inspect its soil
        reference values.
      </Text>

      <View style={styles.filterField}>
        <StateSelect
          states={states}
          value={selectedState}
          onSelect={setSelectedState}
        />
      </View>

      <Pressable
        disabled={loading}
        onPress={onAnalyze}
        style={({ pressed }) => [
          styles.analyzeButton,
          pressed &&
            !loading &&
            styles.buttonPressed,
          loading &&
            styles.disabledButton,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            size="small"
            color="#FFFFFF"
          />
        ) : (
          <Search
            size={18}
            color="#FFFFFF"
          />
        )}

        <Text style={styles.analyzeButtonText}>
          {loading
            ? "Analyzing..."
            : "Analyze Soil"}
        </Text>
      </Pressable>
    </View>
  );
}


function StateSelect({
  states,
  value,
  onSelect,
}) {
  const [visible, setVisible] =
    useState(false);

  const sortedStates = useMemo(
    () =>
      [...states].sort((a, b) =>
        a.localeCompare(b)
      ),
    [states]
  );

  return (
    <View>
      <Text style={styles.fieldLabel}>
        State
      </Text>

      <Pressable
        onPress={() => setVisible(true)}
        style={({ pressed }) => [
          styles.selectButton,
          pressed &&
            styles.selectButtonPressed,
        ]}
      >
        <View style={styles.selectValueArea}>
          <MapPinned
            size={18}
            color={colors.primary}
          />

          <Text
            numberOfLines={1}
            style={[
              styles.selectValueText,
              !value &&
                styles.placeholderText,
            ]}
          >
            {value || "Select state"}
          </Text>
        </View>

        <ChevronDown
          size={18}
          color="#64748B"
        />
      </Pressable>

      <Modal
        visible={visible}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setVisible(false)
        }
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() =>
            setVisible(false)
          }
        >
          <Pressable
            style={styles.modalContent}
            onPress={() => {}}
          >
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>
                  Select State
                </Text>

                <Text style={styles.modalSubtitle}>
                  Choose one available state
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  setVisible(false)
                }
                style={styles.closeButton}
              >
                <X
                  size={20}
                  color="#475569"
                />
              </Pressable>
            </View>

            <FlatList
              data={sortedStates}
              keyExtractor={(item) =>
                item
              }
              style={styles.optionList}
              showsVerticalScrollIndicator={
                false
              }
              renderItem={({ item }) => {
                const selected =
                  item === value;

                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item);
                      setVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.optionItem,
                      selected &&
                        styles.selectedOption,
                      pressed &&
                        styles.optionPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        selected &&
                          styles.selectedOptionText,
                      ]}
                    >
                      {item}
                    </Text>

                    {selected ? (
                      <Check
                        size={18}
                        color={
                          colors.primary
                        }
                      />
                    ) : null}
                  </Pressable>
                );
              }}
              ListEmptyComponent={
                <Text
                  style={
                    styles.emptyOptionsText
                  }
                >
                  No states available.
                </Text>
              }
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}


function AnalysisInformation({
  analysis,
}) {
  return (
    <View style={styles.analysisInfoCard}>
      <View>
        <Text style={styles.analysisLabel}>
          SELECTED REGION
        </Text>

        <Text style={styles.analysisState}>
          {analysis.state}
        </Text>

        <Text style={styles.analysisType}>
          State-level soil reference
          assessment
        </Text>
      </View>

      <HealthBadge
        health={
          analysis.overall_health
        }
      />
    </View>
  );
}


function SoilSummarySection({
  summary,
}) {
  if (!summary) {
    return null;
  }

  const metrics = [
    {
      title: "Nitrogen",
      symbol: "N",
      value:
        summary.nitrogen?.average,
      status:
        summary.nitrogen?.status,
      description:
        "Supports leaf growth and plant development.",
      icon: Leaf,
    },
    {
      title: "Phosphorus",
      symbol: "P",
      value:
        summary.phosphorus?.average,
      status:
        summary.phosphorus?.status,
      description:
        "Supports root growth, flowering and crop maturity.",
      icon: FlaskConical,
    },
    {
      title: "Potassium",
      symbol: "K",
      value:
        summary.potassium?.average,
      status:
        summary.potassium?.status,
      description:
        "Improves crop strength and resistance.",
      icon: Droplets,
    },
    {
      title: "Soil pH",
      symbol: "pH",
      value:
        summary.ph?.average,
      status:
        summary.ph?.status,
      description:
        "Controls nutrient availability in the soil.",
      icon: TestTube2,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Soil Nutrient Overview
      </Text>

      <Text style={styles.sectionDescription}>
        Nutrient values and their detected
        condition.
      </Text>

      <View style={styles.summaryGrid}>
        {metrics.map((metric) => (
          <SoilMetricCard
            key={metric.title}
            {...metric}
          />
        ))}
      </View>
    </View>
  );
}


function SoilMetricCard({
  title,
  symbol,
  value,
  status,
  description,
  icon: Icon,
}) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricTopRow}>
        <View style={styles.metricIcon}>
          <Icon
            size={21}
            color={colors.primary}
          />
        </View>

        <StatusBadge status={status} />
      </View>

      <Text style={styles.metricTitle}>
        {title}
      </Text>

      <Text style={styles.metricValue}>
        {formatNumber(value)}
      </Text>

      <Text style={styles.metricSymbol}>
        {symbol}
      </Text>

      <Text style={styles.metricDescription}>
        {description}
      </Text>
    </View>
  );
}


function NutrientVisualization({
  summary,
}) {
  if (!summary) {
    return null;
  }

  const nutrients = [
    {
      label: "Nitrogen",
      value:
        summary.nitrogen?.average,
      maximum: 500,
      status:
        summary.nitrogen?.status,
    },
    {
      label: "Phosphorus",
      value:
        summary.phosphorus?.average,
      maximum: 60,
      status:
        summary.phosphorus?.status,
    },
    {
      label: "Potassium",
      value:
        summary.potassium?.average,
      maximum: 400,
      status:
        summary.potassium?.status,
    },
    {
      label: "Soil pH",
      value:
        summary.ph?.average,
      maximum: 14,
      status:
        summary.ph?.status,
    },
  ];

  return (
    <View style={styles.card}>
      <View style={styles.visualHeader}>
        <View style={styles.visualIcon}>
          <CircleGauge
            size={22}
            color={colors.primary}
          />
        </View>

        <View style={styles.visualHeaderText}>
          <Text style={styles.sectionTitle}>
            Nutrient Visualization
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Relative levels based on
            practical reference ranges.
          </Text>
        </View>
      </View>

      <View style={styles.progressList}>
        {nutrients.map((nutrient) => (
          <NutrientProgress
            key={nutrient.label}
            {...nutrient}
          />
        ))}
      </View>
    </View>
  );
}


function NutrientProgress({
  label,
  value,
  maximum,
  status,
}) {
  const numericValue = Number(value);

  const percentage =
    Number.isFinite(numericValue)
      ? Math.min(
          100,
          Math.max(
            0,
            (numericValue / maximum) * 100
          )
        )
      : 0;

  return (
    <View>
      <View style={styles.progressHeader}>
        <View>
          <Text style={styles.progressLabel}>
            {label}
          </Text>

          <Text style={styles.progressStatus}>
            {status || "Unknown"}
          </Text>
        </View>

        <Text style={styles.progressValue}>
          {formatNumber(value)}
        </Text>
      </View>

      <View style={styles.progressTrack}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${percentage}%`,
            },
          ]}
        />
      </View>
    </View>
  );
}


function OverallHealthCard({
  health,
}) {
  return (
    <View style={styles.overallCard}>
      <View style={styles.overallIcon}>
        <ShieldCheck
          size={28}
          color={colors.primary}
        />
      </View>

      <View style={styles.overallContent}>
        <Text style={styles.overallLabel}>
          OVERALL SOIL HEALTH
        </Text>

        <Text style={styles.overallHealth}>
          {health || "Unknown"}
        </Text>

        <Text style={styles.overallDescription}>
          This result summarizes the balance
          of nitrogen, phosphorus, potassium
          and soil pH.
        </Text>
      </View>

      <HealthBadge health={health} />
    </View>
  );
}


function RecommendationsSection({
  recommendations,
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Soil Recommendations
      </Text>

      <Text style={styles.sectionDescription}>
        Practical actions based on the
        detected soil condition.
      </Text>

      {recommendations.length ? (
        <View
          style={
            styles.recommendationList
          }
        >
          {recommendations.map(
            (recommendation, index) => (
              <RecommendationCard
                key={`${recommendation.title}-${index}`}
                recommendation={
                  recommendation
                }
              />
            )
          )}
        </View>
      ) : (
        <View style={styles.noActionCard}>
          <ShieldCheck
            size={30}
            color={colors.primary}
          />

          <Text style={styles.noActionTitle}>
            No corrective action required
          </Text>

          <Text
            style={
              styles.noActionDescription
            }
          >
            The current soil values are
            within suitable reference
            ranges.
          </Text>
        </View>
      )}
    </View>
  );
}


function RecommendationCard({
  recommendation,
}) {
  return (
    <View
      style={styles.recommendationCard}
    >
      <View
        style={
          styles.recommendationIcon
        }
      >
        <Leaf
          size={20}
          color="#D97706"
        />
      </View>

      <View
        style={
          styles.recommendationContent
        }
      >
        <Text
          style={
            styles.recommendationTitle
          }
        >
          {recommendation.title}
        </Text>

        <Text
          style={
            styles.recommendationMessage
          }
        >
          {recommendation.message}
        </Text>
      </View>
    </View>
  );
}


function StatusBadge({
  status,
}) {
  const normalized = String(
    status || ""
  )
    .trim()
    .toLowerCase();

  let badgeStyle =
    styles.defaultStatusBadge;

  let textStyle =
    styles.defaultStatusText;

  if (
    normalized === "optimal" ||
    normalized === "neutral"
  ) {
    badgeStyle =
      styles.goodStatusBadge;
    textStyle =
      styles.goodStatusText;
  } else if (
    normalized === "low" ||
    normalized === "acidic"
  ) {
    badgeStyle =
      styles.warningStatusBadge;
    textStyle =
      styles.warningStatusText;
  } else if (
    normalized === "high" ||
    normalized === "alkaline"
  ) {
    badgeStyle =
      styles.dangerStatusBadge;
    textStyle =
      styles.dangerStatusText;
  }

  return (
    <View
      style={[
        styles.statusBadge,
        badgeStyle,
      ]}
    >
      <Text
        style={[
          styles.statusBadgeText,
          textStyle,
        ]}
      >
        {status || "Unknown"}
      </Text>
    </View>
  );
}


function HealthBadge({
  health,
}) {
  const normalized = String(
    health || ""
  )
    .trim()
    .toLowerCase();

  let badgeStyle =
    styles.defaultHealthBadge;

  let textStyle =
    styles.defaultHealthText;

  if (
    normalized === "excellent" ||
    normalized === "healthy"
  ) {
    badgeStyle =
      styles.goodHealthBadge;
    textStyle =
      styles.goodHealthText;
  } else if (
    normalized === "moderate"
  ) {
    badgeStyle =
      styles.moderateHealthBadge;
    textStyle =
      styles.moderateHealthText;
  } else if (
    normalized === "poor"
  ) {
    badgeStyle =
      styles.poorHealthBadge;
    textStyle =
      styles.poorHealthText;
  }

  return (
    <View
      style={[
        styles.healthBadge,
        badgeStyle,
      ]}
    >
      <ShieldCheck
        size={14}
        color={textStyle.color}
      />

      <Text
        style={[
          styles.healthBadgeText,
          textStyle,
        ]}
      >
        {health || "Unknown"}
      </Text>
    </View>
  );
}


function EmptyAnalysisCard() {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <Sprout
          size={34}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No soil analysis generated
      </Text>

      <Text style={styles.emptyDescription}>
        Select a state and tap Analyze Soil
        to view nutrient values, overall
        health and recommendations.
      </Text>
    </View>
  );
}


function AnalysisLoadingCard() {
  return (
    <View
      style={styles.analysisLoadingCard}
    >
      <ActivityIndicator
        size="large"
        color={colors.primary}
      />

      <Text
        style={styles.analysisLoadingTitle}
      >
        Analyzing soil health
      </Text>

      <Text
        style={
          styles.analysisLoadingDescription
        }
      >
        Evaluating nitrogen, phosphorus,
        potassium and pH levels...
      </Text>
    </View>
  );
}


function ErrorCard({
  message,
}) {
  return (
    <View style={styles.errorCard}>
      <AlertTriangle
        size={21}
        color="#DC2626"
      />

      <Text style={styles.errorText}>
        {message}
      </Text>
    </View>
  );
}


function getErrorMessage(
  error,
  fallbackMessage
) {
  const detail =
    error?.response?.data?.detail;

  if (typeof detail === "string") {
    return detail;
  }

  if (
    Array.isArray(detail) &&
    detail.length
  ) {
    return (
      detail[0]?.msg ||
      fallbackMessage
    );
  }

  return fallbackMessage;
}


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toFixed(2);
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  contentContainer: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  centeredContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
    gap: 12,
  },

  loadingText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },

  headerCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 24,
    backgroundColor: "#ECFDF5",
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },

  headerContent: {
    flex: 1,
  },

  headerBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
  },

  headerBadgeText: {
    flexShrink: 1,
    fontSize: 11,
    fontWeight: "700",
    color: colors.primary,
  },

  headerTitle: {
    marginTop: 15,
    fontSize: 27,
    fontWeight: "800",
    color: "#0F172A",
  },

  headerDescription: {
    marginTop: 8,
    fontSize: 14,
    lineHeight: 21,
    color: "#475569",
  },

  headerIcon: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  card: {
    padding: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
  },

  section: {
    gap: 12,
  },

  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color: "#64748B",
  },

  filterField: {
    marginTop: 18,
  },

  fieldLabel: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#334155",
  },

  selectButton: {
    minHeight: 51,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectButtonPressed: {
    backgroundColor: "#F8FAFC",
  },

  selectValueArea: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  selectValueText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
  },

  placeholderText: {
    color: "#94A3B8",
  },

  analyzeButton: {
    minHeight: 52,
    marginTop: 18,
    borderRadius: 14,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },

  analyzeButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.6,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.48)",
  },

  modalContent: {
    maxHeight: "72%",
    padding: 18,
    paddingBottom: 28,
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: "#FFFFFF",
  },

  modalHeader: {
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  modalTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  modalSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
  },

  optionList: {
    marginTop: 10,
  },

  optionItem: {
    minHeight: 50,
    paddingHorizontal: 13,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  selectedOption: {
    backgroundColor: "#ECFDF5",
  },

  optionPressed: {
    backgroundColor: "#F1F5F9",
  },

  optionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },

  selectedOptionText: {
    color: colors.primary,
    fontWeight: "800",
  },

  emptyOptionsText: {
    paddingVertical: 30,
    textAlign: "center",
    fontSize: 14,
    color: "#64748B",
  },

  errorCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },

  errorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
    color: "#B91C1C",
  },

  emptyCard: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "800",
    color: "#1E293B",
  },

  emptyDescription: {
    marginTop: 8,
    maxWidth: 310,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  analysisLoadingCard: {
    padding: 32,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 22,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
  },

  analysisLoadingTitle: {
    marginTop: 14,
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  analysisLoadingDescription: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
  },

  analysisInfoCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  analysisLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: colors.primary,
  },

  analysisState: {
    marginTop: 3,
    fontSize: 19,
    fontWeight: "800",
    color: "#0F172A",
  },

  analysisType: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748B",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  metricCard: {
    width: "48%",
    minHeight: 210,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  metricTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 6,
  },

  metricIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
  },

  metricTitle: {
    marginTop: 13,
    fontSize: 13,
    fontWeight: "700",
    color: "#64748B",
  },

  metricValue: {
    marginTop: 7,
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  metricSymbol: {
    marginTop: 3,
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary,
  },

  metricDescription: {
    marginTop: 10,
    fontSize: 11,
    lineHeight: 17,
    color: "#64748B",
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1,
    borderRadius: 20,
  },

  statusBadgeText: {
    fontSize: 9,
    fontWeight: "800",
  },

  goodStatusBadge: {
    borderColor: "#A7F3D0",
    backgroundColor: "#D1FAE5",
  },

  goodStatusText: {
    color: "#047857",
  },

  warningStatusBadge: {
    borderColor: "#FDE68A",
    backgroundColor: "#FEF3C7",
  },

  warningStatusText: {
    color: "#B45309",
  },

  dangerStatusBadge: {
    borderColor: "#FECACA",
    backgroundColor: "#FEE2E2",
  },

  dangerStatusText: {
    color: "#B91C1C",
  },

  defaultStatusBadge: {
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
  },

  defaultStatusText: {
    color: "#475569",
  },

  visualHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  visualIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#ECFDF5",
  },

  visualHeaderText: {
    flex: 1,
  },

  progressList: {
    marginTop: 22,
    gap: 22,
  },

  progressHeader: {
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progressLabel: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1E293B",
  },

  progressStatus: {
    marginTop: 2,
    fontSize: 11,
    color: "#64748B",
  },

  progressValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0F172A",
  },

  progressTrack: {
    height: 11,
    overflow: "hidden",
    borderRadius: 20,
    backgroundColor: "#E2E8F0",
  },

  progressFill: {
    height: "100%",
    minWidth: 4,
    borderRadius: 20,
    backgroundColor: colors.primary,
  },

  overallCard: {
    padding: 17,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  overallIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  overallContent: {
    flex: 1,
  },

  overallLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: colors.primary,
  },

  overallHealth: {
    marginTop: 4,
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  overallDescription: {
    marginTop: 7,
    fontSize: 12,
    lineHeight: 18,
    color: "#475569",
  },

  healthBadge: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  healthBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  goodHealthBadge: {
    borderColor: "#A7F3D0",
    backgroundColor: "#D1FAE5",
  },

  goodHealthText: {
    color: "#047857",
  },

  moderateHealthBadge: {
    borderColor: "#FDE68A",
    backgroundColor: "#FEF3C7",
  },

  moderateHealthText: {
    color: "#B45309",
  },

  poorHealthBadge: {
    borderColor: "#FECACA",
    backgroundColor: "#FEE2E2",
  },

  poorHealthText: {
    color: "#B91C1C",
  },

  defaultHealthBadge: {
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
  },

  defaultHealthText: {
    color: "#475569",
  },

  recommendationList: {
    gap: 11,
  },

  recommendationCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  recommendationIcon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#FFFBEB",
  },

  recommendationContent: {
    flex: 1,
  },

  recommendationTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#0F172A",
  },

  recommendationMessage: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  noActionCard: {
    padding: 26,
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },

  noActionTitle: {
    marginTop: 11,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  noActionDescription: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 12,
    lineHeight: 18,
    color: "#64748B",
  },
});