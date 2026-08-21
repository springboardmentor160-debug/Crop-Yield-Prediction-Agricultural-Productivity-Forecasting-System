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
  CalendarDays,
  Check,
  ChevronDown,
  CloudRain,
  Droplets,
  MapPinned,
  Search,
  ThermometerSun,
  TrendingDown,
  TrendingUp,
  X,
} from "lucide-react-native";

import {
  getWeatherAnalysis,
  getWeatherAnalysisOptions,
} from "../../src/services/weatherAnalysisService";
import { colors } from "../../src/constants/colors";
import WeatherTrendCharts from "../../src/components/weather/WeatherTrendCharts";

const RECORDS_PAGE_SIZE = 10;
export default function WeatherAnalysisScreen() {
  const [options, setOptions] = useState({
    states: [],
    years: [],
    minimum_year: null,
    maximum_year: null,
  });

  const [filters, setFilters] = useState({
    state: "",
    startYear: "",
    endYear: "",
  });

  const [analysis, setAnalysis] = useState(null);

  const [optionsLoading, setOptionsLoading] =
    useState(true);

  const [analysisLoading, setAnalysisLoading] =
    useState(false);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] = useState("");

  const [recordsPage, setRecordsPage] =
  useState(1);


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
        await getWeatherAnalysisOptions();

      setOptions(data);
      setRecordsPage(1);

      const defaultState =
        data.states?.[0] || "";

      const defaultStartYear =
        data.minimum_year ??
        data.years?.[0] ??
        "";

      const defaultEndYear =
        data.maximum_year ??
        data.years?.[
          data.years.length - 1
        ] ??
        "";

      setFilters((current) => ({
        state:
          current.state || defaultState,
        startYear:
          current.startYear ||
          String(defaultStartYear),
        endYear:
          current.endYear ||
          String(defaultEndYear),
      }));
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to load weather analysis options."
        )
      );
    } finally {
      setOptionsLoading(false);
      setRefreshing(false);
    }
  }


  const availableStartYears = useMemo(() => {
    if (!filters.endYear) {
      return options.years;
    }

    return options.years.filter(
      (year) =>
        year <= Number(filters.endYear)
    );
  }, [
    options.years,
    filters.endYear,
  ]);


  const availableEndYears = useMemo(() => {
    if (!filters.startYear) {
      return options.years;
    }

    return options.years.filter(
      (year) =>
        year >= Number(filters.startYear)
    );
  }, [
    options.years,
    filters.startYear,
  ]);


  async function handleAnalyzeWeather() {
    if (
      !filters.state ||
      !filters.startYear ||
      !filters.endYear
    ) {
      setError(
        "Please select a state and year range."
      );

      return;
    }

    if (
      Number(filters.startYear) >
      Number(filters.endYear)
    ) {
      setError(
        "Start year cannot be greater than end year."
      );

      return;
    }

    try {
      setError("");
      setAnalysisLoading(true);

      const data = await getWeatherAnalysis({
        state: filters.state,
        startYear: Number(
          filters.startYear
        ),
        endYear: Number(
          filters.endYear
        ),
      });

      setAnalysis(data);
      setRecordsPage(1);
    } catch (requestError) {
      setError(
        getErrorMessage(
          requestError,
          "Unable to generate weather analysis."
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
          Loading weather analysis...
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
      <WeatherHeader />

      <WeatherFilterCard
        filters={filters}
        setFilters={setFilters}
        states={options.states}
        startYears={availableStartYears}
        endYears={availableEndYears}
        loading={analysisLoading}
        onAnalyze={handleAnalyzeWeather}
      />

      {error ? (
        <ErrorCard message={error} />
      ) : null}

      {!analysis &&
        !analysisLoading && (
          <EmptyAnalysisCard />
        )}

      {analysisLoading ? (
        <AnalysisLoadingCard />
      ) : null}

      {analysis &&
        !analysisLoading && (
          <>
            <AnalysisInformation
              analysis={analysis}
            />

            <WeatherSummarySection
                analysis={analysis}
            />

            <WeatherTrendCharts
                records={analysis.records}
            />

            <WeatherTrendSection
                trend={analysis.trend}
            />

            <WeatherAssessmentSection
              assessment={
                analysis.assessment
              }
            />

            <WeatherRecordsSection
              records={analysis.records || []}
              page={recordsPage}
              onPageChange={setRecordsPage}
            />
          </>
        )}
    </ScrollView>
  );
}


function WeatherHeader() {
  return (
    <View style={styles.headerCard}>
      <View style={styles.headerContent}>
        <View style={styles.headerBadge}>
          <CloudRain
            size={16}
            color={colors.primary}
          />

          <Text style={styles.headerBadgeText}>
            Agricultural Weather Intelligence
          </Text>
        </View>

        <Text style={styles.headerTitle}>
          Weather Analysis
        </Text>

        <Text style={styles.headerDescription}>
          Analyze historical temperature,
          rainfall and humidity trends and
          understand their possible impact on
          farming.
        </Text>
      </View>

      <View style={styles.headerIconContainer}>
        <CloudRain
          size={38}
          color={colors.primary}
        />
      </View>
    </View>
  );
}


function WeatherFilterCard({
  filters,
  setFilters,
  states,
  startYears,
  endYears,
  loading,
  onAnalyze,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>
        Select Analysis Period
      </Text>

      <Text style={styles.sectionDescription}>
        Choose a state and historical year
        range.
      </Text>

      <View style={styles.filterFields}>
        <SelectField
          label="State"
          value={filters.state}
          placeholder="Select state"
          options={states}
          icon={MapPinned}
          onSelect={(value) => {
            setFilters((current) => ({
              ...current,
              state: value,
            }));
          }}
        />

        <View style={styles.yearRow}>
          <View style={styles.yearField}>
            <SelectField
              label="Start Year"
              value={filters.startYear}
              placeholder="Start year"
              options={startYears}
              icon={CalendarDays}
              onSelect={(value) => {
                setFilters((current) => ({
                  ...current,
                  startYear:
                    String(value),
                }));
              }}
            />
          </View>

          <View style={styles.yearField}>
            <SelectField
              label="End Year"
              value={filters.endYear}
              placeholder="End year"
              options={endYears}
              icon={CalendarDays}
              onSelect={(value) => {
                setFilters((current) => ({
                  ...current,
                  endYear: String(value),
                }));
              }}
            />
          </View>
        </View>
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
            : "Analyze Weather"}
        </Text>
      </Pressable>
    </View>
  );
}


function SelectField({
  label,
  value,
  placeholder,
  options,
  onSelect,
  icon: Icon,
}) {
  const [visible, setVisible] =
    useState(false);

  const normalizedOptions =
    options.map((option) => ({
      label: String(option),
      value: String(option),
    }));

  return (
    <View>
      <Text style={styles.fieldLabel}>
        {label}
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
          <Icon
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
            {value || placeholder}
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
                  Select {label}
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Choose one option
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
              data={normalizedOptions}
              keyboardShouldPersistTaps="handled"
              keyExtractor={(item) =>
                item.value
              }
              style={styles.optionList}
              showsVerticalScrollIndicator={
                false
              }
              renderItem={({ item }) => {
                const selected =
                  item.value ===
                  String(value);

                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item.value);
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
                      {item.label}
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
                  No options available.
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
        <Text style={styles.analysisState}>
          {analysis.state}
        </Text>

        <Text style={styles.analysisPeriod}>
          {analysis.start_year} –{" "}
          {analysis.end_year}
        </Text>
      </View>

      <View style={styles.recordCountBadge}>
        <Text
          style={
            styles.recordCountBadgeText
          }
        >
          {analysis.total_records} records
        </Text>
      </View>
    </View>
  );
}


function WeatherSummarySection({
  analysis,
}) {
  const summary = analysis.summary;
  const assessment =
    analysis.assessment;

  const items = [
    {
      title: "Average Temperature",
      value: `${formatNumber(
        summary.temperature.average
      )} °C`,
      detail: `${formatNumber(
        summary.temperature.minimum
      )} °C – ${formatNumber(
        summary.temperature.maximum
      )} °C`,
      icon: ThermometerSun,
    },
    {
      title: "Average Rainfall",
      value: `${formatNumber(
        summary.rainfall.average
      )} mm`,
      detail: `${formatNumber(
        summary.rainfall.minimum
      )} – ${formatNumber(
        summary.rainfall.maximum
      )} mm`,
      icon: CloudRain,
    },
    {
      title: "Average Humidity",
      value: `${formatNumber(
        summary.humidity.average
      )}%`,
      detail: `${formatNumber(
        summary.humidity.minimum
      )}% – ${formatNumber(
        summary.humidity.maximum
      )}%`,
      icon: Droplets,
    },
    {
      title: "Overall Weather Risk",
      value:
        assessment.overall_risk_level,
      detail:
        assessment.overall_status,
      icon: AlertTriangle,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Weather Overview
      </Text>

      <Text style={styles.sectionDescription}>
        Summary of the selected historical
        period.
      </Text>

      <View style={styles.summaryGrid}>
        {items.map((item) => (
          <SummaryCard
            key={item.title}
            {...item}
          />
        ))}
      </View>
    </View>
  );
}


function SummaryCard({
  title,
  value,
  detail,
  icon: Icon,
}) {
  return (
    <View style={styles.summaryCard}>
      <View style={styles.summaryIcon}>
        <Icon
          size={21}
          color={colors.primary}
        />
      </View>

      <Text style={styles.summaryTitle}>
        {title}
      </Text>

      <Text style={styles.summaryValue}>
        {value}
      </Text>

      <Text
        numberOfLines={2}
        style={styles.summaryDetail}
      >
        {detail}
      </Text>
    </View>
  );
}


function WeatherTrendSection({
  trend,
}) {
  if (!trend) {
    return null;
  }

  const trendItems = [
    {
      title: "Temperature Change",
      value: `${formatSignedNumber(
        trend.temperature_change_c
      )} °C`,
      direction:
        trend.temperature_direction,
    },
    {
      title: "Rainfall Change",
      value: `${formatSignedNumber(
        trend.rainfall_change_percent
      )}%`,
      direction:
        trend.rainfall_direction,
    },
    {
      title: "Humidity Change",
      value: `${formatSignedNumber(
        trend.humidity_change_percent
      )}%`,
      direction:
        trend.humidity_direction,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Climate Trend Analysis
      </Text>

      <Text style={styles.sectionDescription}>
        Change from {trend.start_year} to{" "}
        {trend.end_year}.
      </Text>

      <View style={styles.trendList}>
        {trendItems.map((item) => (
          <TrendCard
            key={item.title}
            {...item}
          />
        ))}
      </View>
    </View>
  );
}


function TrendCard({
  title,
  value,
  direction,
}) {
  const normalizedDirection =
    direction?.toLowerCase();

  const isIncreasing =
    normalizedDirection ===
    "increasing";

  const isDecreasing =
    normalizedDirection ===
    "decreasing";

  const DirectionIcon = isIncreasing
    ? TrendingUp
    : isDecreasing
      ? TrendingDown
      : null;

  return (
    <View style={styles.trendCard}>
      <View style={styles.trendTopRow}>
        <Text style={styles.trendTitle}>
          {title}
        </Text>

        {DirectionIcon ? (
          <DirectionIcon
            size={20}
            color={
              isIncreasing
                ? "#D97706"
                : "#0284C7"
            }
          />
        ) : null}
      </View>

      <Text style={styles.trendValue}>
        {value}
      </Text>

      <Text style={styles.trendDirection}>
        {direction || "Stable"}
      </Text>
    </View>
  );
}


function WeatherAssessmentSection({
  assessment,
}) {
  if (!assessment) {
    return null;
  }

  const items = [
    {
      title: "Temperature Impact",
      data: assessment.temperature,
      icon: ThermometerSun,
    },
    {
      title: "Rainfall Impact",
      data: assessment.rainfall,
      icon: CloudRain,
    },
    {
      title: "Humidity Impact",
      data: assessment.humidity,
      icon: Droplets,
    },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Agricultural Weather Impact
      </Text>

      <Text style={styles.sectionDescription}>
        Farmer-friendly interpretation of
        historical conditions.
      </Text>

      <View style={styles.assessmentList}>
        {items.map((item) => (
          <AssessmentCard
            key={item.title}
            {...item}
          />
        ))}
      </View>

      <View style={styles.overallCard}>
        <View style={styles.overallTopRow}>
          <Text style={styles.overallLabel}>
            OVERALL ASSESSMENT
          </Text>

          <RiskBadge
            riskLevel={
              assessment.overall_risk_level
            }
          />
        </View>

        <Text style={styles.overallTitle}>
          {assessment.overall_status}
        </Text>

        <Text style={styles.overallMessage}>
          {assessment.overall_message}
        </Text>
      </View>
    </View>
  );
}


function AssessmentCard({
  title,
  data,
  icon: Icon,
}) {
  if (!data) {
    return null;
  }

  return (
    <View style={styles.assessmentCard}>
      <View
        style={styles.assessmentHeader}
      >
        <View
          style={styles.assessmentIcon}
        >
          <Icon
            size={21}
            color={colors.primary}
          />
        </View>

        <RiskBadge
          riskLevel={data.risk_level}
        />
      </View>

      <Text style={styles.assessmentTitle}>
        {title}
      </Text>

      <Text style={styles.assessmentStatus}>
        {data.status}
      </Text>

      <Text style={styles.assessmentMessage}>
        {data.message}
      </Text>
    </View>
  );
}


function RiskBadge({
  riskLevel,
}) {
  const normalized =
    riskLevel?.toLowerCase();

  const badgeStyle =
    normalized === "low"
      ? styles.lowRiskBadge
      : normalized === "medium"
        ? styles.mediumRiskBadge
        : normalized === "high"
          ? styles.highRiskBadge
          : styles.defaultRiskBadge;

  const textStyle =
    normalized === "low"
      ? styles.lowRiskText
      : normalized === "medium"
        ? styles.mediumRiskText
        : normalized === "high"
          ? styles.highRiskText
          : styles.defaultRiskText;

  return (
    <View
      style={[
        styles.riskBadge,
        badgeStyle,
      ]}
    >
      <Text
        style={[
          styles.riskBadgeText,
          textStyle,
        ]}
      >
        {riskLevel || "Unknown"} Risk
      </Text>
    </View>
  );
}


function WeatherRecordsSection({
  records,
  page,
  onPageChange,
}) {
  const totalPages =
    records.length > 0
      ? Math.ceil(
          records.length /
            RECORDS_PAGE_SIZE
        )
      : 0;

  const safePage = Math.min(
    Math.max(page, 1),
    totalPages || 1
  );

  const startIndex =
    (safePage - 1) *
    RECORDS_PAGE_SIZE;

  const visibleRecords = records.slice(
    startIndex,
    startIndex +
      RECORDS_PAGE_SIZE
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        Yearly Weather Records
      </Text>

      <Text style={styles.sectionDescription}>
        Historical values used in the
        analysis.
      </Text>

      {records.length ? (
        <>
          <View style={styles.recordsList}>
            {visibleRecords.map((record) => (
              <WeatherRecordCard
                key={record.year}
                record={record}
              />
            ))}
          </View>

          <View style={styles.paginationCard}>
            <Pressable
              disabled={safePage <= 1}
              onPress={() =>
                onPageChange((current) =>
                  Math.max(
                    1,
                    current - 1
                  )
                )
              }
              style={({ pressed }) => [
                styles.paginationButton,
                pressed &&
                  styles.buttonPressed,
                safePage <= 1 &&
                  styles.paginationButtonDisabled,
              ]}
            >
              <Text
                style={
                  styles.paginationButtonText
                }
              >
                Previous
              </Text>
            </Pressable>

            <View
              style={
                styles.paginationInformation
              }
            >
              <Text style={styles.pageText}>
                Page {safePage} of{" "}
                {totalPages || 1}
              </Text>

              <Text style={styles.totalText}>
                {records.length} yearly record
                {records.length === 1
                  ? ""
                  : "s"}
              </Text>
            </View>

            <Pressable
              disabled={
                safePage >= totalPages
              }
              onPress={() =>
                onPageChange((current) =>
                  Math.min(
                    totalPages,
                    current + 1
                  )
                )
              }
              style={({ pressed }) => [
                styles.paginationButton,
                pressed &&
                  styles.buttonPressed,
                safePage >= totalPages &&
                  styles.paginationButtonDisabled,
              ]}
            >
              <Text
                style={
                  styles.paginationButtonText
                }
              >
                Next
              </Text>
            </Pressable>
          </View>
        </>
      ) : (
        <View style={styles.emptyRecordsCard}>
          <Text style={styles.emptyRecordsText}>
            No yearly records were returned.
          </Text>
        </View>
      )}
    </View>
  );
}


function WeatherRecordCard({
  record,
}) {
  return (
    <View style={styles.recordCard}>
      <View style={styles.recordHeader}>
        <View style={styles.recordYearIcon}>
          <CalendarDays
            size={18}
            color={colors.primary}
          />
        </View>

        <Text style={styles.recordYear}>
          {record.year}
        </Text>
      </View>

      <View style={styles.recordMetrics}>
        <RecordMetric
          icon={ThermometerSun}
          label="Temperature"
          value={`${formatNumber(
            record.avg_temp_c
          )} °C`}
        />

        <RecordMetric
          icon={CloudRain}
          label="Rainfall"
          value={`${formatNumber(
            record.total_rainfall_mm
          )} mm`}
        />

        <RecordMetric
          icon={Droplets}
          label="Humidity"
          value={`${formatNumber(
            record.avg_humidity_percent
          )}%`}
        />
      </View>
    </View>
  );
}


function RecordMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <View style={styles.recordMetric}>
      <Icon
        size={17}
        color="#64748B"
      />

      <View style={styles.recordMetricText}>
        <Text
          style={styles.recordMetricLabel}
        >
          {label}
        </Text>

        <Text
          style={styles.recordMetricValue}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}


function EmptyAnalysisCard() {
  return (
    <View style={styles.emptyCard}>
      <View style={styles.emptyIcon}>
        <CloudRain
          size={34}
          color="#94A3B8"
        />
      </View>

      <Text style={styles.emptyTitle}>
        No analysis generated yet
      </Text>

      <Text style={styles.emptyDescription}>
        Select a state and year range, then
        tap Analyze Weather to view the
        weather summary and agricultural
        impact.
      </Text>
    </View>
  );
}


function AnalysisLoadingCard() {
  return (
    <View style={styles.analysisLoadingCard}>
      <ActivityIndicator
        size="large"
        color={colors.primary}
      />

      <Text
        style={styles.analysisLoadingTitle}
      >
        Analyzing weather data
      </Text>

      <Text
        style={
          styles.analysisLoadingDescription
        }
      >
        Calculating historical averages,
        trends and agricultural risks...
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


function formatSignedNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  if (number > 0) {
    return `+${number.toFixed(2)}`;
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
    overflow: "hidden",
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
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#A7F3D0",
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

  headerIconContainer: {
    width: 70,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },

  card: {
    padding: 17,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
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

  filterFields: {
    marginTop: 18,
    gap: 15,
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

  yearRow: {
    flexDirection: "row",
    gap: 12,
  },

  yearField: {
    flex: 1,
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
    backgroundColor: "#F8FAFC",
    alignItems: "center",
  },

  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
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
  },

  analysisState: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  analysisPeriod: {
    marginTop: 3,
    fontSize: 13,
    color: "#64748B",
  },

  recordCountBadge: {
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },

  recordCountBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#475569",
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  summaryCard: {
    width: "48%",
    minHeight: 157,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  summaryIcon: {
    width: 39,
    height: 39,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#ECFDF5",
  },

  summaryTitle: {
    marginTop: 11,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
    color: "#64748B",
  },

  summaryValue: {
    marginTop: 7,
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },

  summaryDetail: {
    marginTop: 5,
    fontSize: 11,
    lineHeight: 16,
    color: "#64748B",
  },

  trendList: {
    gap: 11,
  },

  trendCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  trendTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  trendTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: "#475569",
  },

  trendValue: {
    marginTop: 12,
    fontSize: 23,
    fontWeight: "800",
    color: "#0F172A",
  },

  trendDirection: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
    color: "#64748B",
  },

  assessmentList: {
    gap: 12,
  },

  assessmentCard: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 19,
    backgroundColor: "#FFFFFF",
  },

  assessmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  assessmentIcon: {
    width: 41,
    height: 41,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#ECFDF5",
  },

  assessmentTitle: {
    marginTop: 13,
    fontSize: 16,
    fontWeight: "800",
    color: "#0F172A",
  },

  assessmentStatus: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: "700",
    color: colors.primary,
  },

  assessmentMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 20,
    color: "#475569",
  },

  riskBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderRadius: 20,
  },

  riskBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },

  lowRiskBadge: {
    borderColor: "#A7F3D0",
    backgroundColor: "#D1FAE5",
  },

  lowRiskText: {
    color: "#047857",
  },

  mediumRiskBadge: {
    borderColor: "#FDE68A",
    backgroundColor: "#FEF3C7",
  },

  mediumRiskText: {
    color: "#B45309",
  },

  highRiskBadge: {
    borderColor: "#FECACA",
    backgroundColor: "#FEE2E2",
  },

  highRiskText: {
    color: "#B91C1C",
  },

  defaultRiskBadge: {
    borderColor: "#CBD5E1",
    backgroundColor: "#F1F5F9",
  },

  defaultRiskText: {
    color: "#475569",
  },

  overallCard: {
    padding: 17,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    borderRadius: 20,
    backgroundColor: "#ECFDF5",
  },

  overallTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  overallLabel: {
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.7,
    color: colors.primary,
  },

  overallTitle: {
    marginTop: 12,
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },

  overallMessage: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 21,
    color: "#334155",
  },

  recordsList: {
    gap: 11,
  },

  recordCard: {
    padding: 15,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  recordHeader: {
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  recordYearIcon: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#ECFDF5",
  },

  recordYear: {
    fontSize: 17,
    fontWeight: "800",
    color: "#0F172A",
  },

  recordMetrics: {
    marginTop: 12,
    gap: 11,
  },

  recordMetric: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  recordMetricText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  recordMetricLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },

  recordMetricValue: {
    fontSize: 13,
    fontWeight: "800",
    color: "#1E293B",
  },

  emptyRecordsCard: {
    padding: 24,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 18,
    backgroundColor: "#FFFFFF",
  },

  emptyRecordsText: {
    textAlign: "center",
    fontSize: 13,
    color: "#64748B",
  },

  paginationCard: {
    marginTop: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
  },

  paginationButton: {
    minWidth: 84,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
  },

  paginationButtonDisabled: {
    opacity: 0.4,
  },

  paginationButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  paginationInformation: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },

  pageText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#0F172A",
  },

  totalText: {
    marginTop: 3,
    fontSize: 11,
    color: "#64748B",
  },
});