import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  CloudRain,
  CloudSun,
  Droplets,
  Filter,
  MapPinned,
  ThermometerSun,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";
import DatasetSummaryCard from "../../src/components/datasets/DatasetSummaryCard";
import PaginationControls from "../../src/components/datasets/PaginationControls";
import EmptyState from "../../src/components/datasets/EmptyState";

import { datasetService } from "../../src/services/datasetService";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { getErrorMessage } from "../../src/utils/errorMessage";

const PAGE_SIZE = 10;

export default function WeatherDataScreen() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState({
    state: "",
    year: "",
  });

  const [appliedFilters, setAppliedFilters] = useState({});
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const loadData = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const params = {
          page,
          page_size: PAGE_SIZE,
          ...appliedFilters,
        };

        const summaryParams = {};

        if (appliedFilters.state) {
          summaryParams.state = appliedFilters.state;
        }

        const [recordsResult, summaryResult] = await Promise.all([
          datasetService.getWeather(params),
          datasetService.getWeatherSummary(summaryParams),
        ]);

        setRecords(recordsResult.items || []);

        setPagination({
          total: recordsResult.total || 0,
          total_pages: recordsResult.total_pages || 0,
        });

        setSummary(summaryResult);
      } catch (error) {
        Alert.alert(
          "Unable to load weather data",
          getErrorMessage(
            error,
            "State weather reference records could not be loaded."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, appliedFilters]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    const cleanedFilters = {};

    const state = filters.state.trim();
    const year = filters.year.trim();

    if (state) {
      cleanedFilters.state = state;
    }

    if (year) {
      cleanedFilters.year = Number(year);
    }

    setPage(1);
    setAppliedFilters(cleanedFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      year: "",
    });

    setPage(1);
    setAppliedFilters({});
    setShowFilters(false);
  };

  const hasAppliedFilters = Object.keys(appliedFilters).length > 0;

  return (
    <ScreenContainer
      contentStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadData({ refresh: true })}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.pageTitle}>Weather Data</Text>

          <Text style={styles.pageSubtitle}>
            State and year-level climate reference data
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <DatasetSummaryCard
          label="Records"
          value={summary?.total_records}
          icon={<CloudSun size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="States"
          value={summary?.total_states}
          icon={<MapPinned size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Temperature"
          value={
            summary?.average_temperature_c != null
              ? `${Number(summary.average_temperature_c).toFixed(2)}°C`
              : "—"
          }
          subtitle="Average"
          icon={<ThermometerSun size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Rainfall"
          value={
            summary?.average_rainfall_mm != null
              ? `${Number(summary.average_rainfall_mm).toFixed(1)} mm`
              : "—"
          }
          subtitle="Average"
          icon={<CloudRain size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Humidity"
          value={
            summary?.average_humidity_percent != null
              ? `${Number(summary.average_humidity_percent).toFixed(1)}%`
              : "—"
          }
          subtitle="Average"
          icon={<Droplets size={22} color={colors.primary} />}
        />
      </View>

      <View style={styles.filterHeader}>
        <View>
          <Text style={commonStyles.sectionTitle}>Weather Records</Text>

          <Text style={styles.filterStatus}>
            {hasAppliedFilters
              ? "Weather filters are applied"
              : "Showing all available records"}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowFilters((current) => !current)}
          style={[
            styles.filterButton,
            hasAppliedFilters && styles.activeFilterButton,
          ]}
        >
          <Filter
            size={19}
            color={
              hasAppliedFilters ? colors.surface : colors.primary
            }
          />

          <Text
            style={[
              styles.filterButtonText,
              hasAppliedFilters && styles.activeFilterButtonText,
            ]}
          >
            Filters
          </Text>
        </Pressable>
      </View>

      {showFilters ? (
        <View style={[commonStyles.card, styles.filterCard]}>
          <View style={commonStyles.form}>
            <AppInput
              label="State"
              placeholder="Example: Karnataka"
              value={filters.state}
              onChangeText={(value) => updateFilter("state", value)}
              autoCapitalize="words"
            />

            <AppInput
              label="Year"
              placeholder="Example: 2020"
              value={filters.year}
              onChangeText={(value) =>
                updateFilter("year", value.replace(/\D/g, ""))
              }
              keyboardType="number-pad"
              maxLength={4}
            />

            <AppButton title="Apply Filters" onPress={applyFilters} />

            <AppButton
              title="Clear Filters"
              variant="outline"
              onPress={clearFilters}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.recordsContainer}>
        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              Loading weather reference records...
            </Text>
          </View>
        ) : records.length === 0 ? (
          <EmptyState
            title="No weather records found"
            message="Try changing or clearing the selected filters."
          />
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.weatherIcon}>
                  <CloudSun size={23} color={colors.primary} />
                </View>

                <View style={styles.recordHeading}>
                  <Text style={styles.stateName}>{record.state}</Text>

                  <View style={styles.yearRow}>
                    <CalendarDays
                      size={14}
                      color={colors.textSecondary}
                    />

                    <Text style={styles.yearText}>{record.year}</Text>
                  </View>
                </View>

                <View style={styles.temperatureBadge}>
                  <Text style={styles.temperatureValue}>
                    {record.avg_temp_c}°C
                  </Text>

                  <Text style={styles.temperatureLabel}>
                    Average
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.weatherMetrics}>
                <WeatherMetric
                  icon={<CloudRain size={22} color={colors.primary} />}
                  label="Total Rainfall"
                  value={`${record.total_rainfall_mm} mm`}
                />

                <WeatherMetric
                  icon={<Droplets size={22} color={colors.primary} />}
                  label="Average Humidity"
                  value={`${record.avg_humidity_percent}%`}
                />
              </View>
            </View>
          ))
        )}
      </View>

      <PaginationControls
        page={page}
        totalPages={pagination.total_pages}
        total={pagination.total}
        pageSize={PAGE_SIZE}
        disabled={loading}
        onPageChange={setPage}
      />
    </ScreenContainer>
  );
}

function WeatherMetric({ icon, label, value }) {
  return (
    <View style={styles.metricCard}>
      <View style={styles.metricIcon}>{icon}</View>

      <View style={styles.metricText}>
        <Text style={styles.metricLabel}>{label}</Text>
        <Text style={styles.metricValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
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
    marginLeft: 14,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  filterHeader: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  filterStatus: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textSecondary,
  },

  filterButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },

  activeFilterButton: {
    backgroundColor: colors.primary,
  },

  filterButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primary,
  },

  activeFilterButtonText: {
    color: colors.surface,
  },

  filterCard: {
    marginTop: 14,
  },

  recordsContainer: {
    marginTop: 16,
    gap: 14,
  },

  loadingCard: {
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingVertical: 36,
    paddingHorizontal: 20,
  },

  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },

  recordCard: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  recordHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  weatherIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  recordHeading: {
    flex: 1,
    marginLeft: 12,
  },

  stateName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  yearRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  yearText: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  temperatureBadge: {
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  temperatureValue: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  temperatureLabel: {
    marginTop: 2,
    fontSize: 9,
    textTransform: "uppercase",
    color: colors.primaryDark,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#E5E7EB",
  },

  weatherMetrics: {
    gap: 10,
  },

  metricCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    padding: 14,
  },

  metricIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  metricText: {
    marginLeft: 12,
  },

  metricLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },

  metricValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
});