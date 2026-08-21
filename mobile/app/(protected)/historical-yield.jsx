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
  Database,
  Filter,
  MapPinned,
  Sprout,
  TrendingUp,
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

export default function HistoricalYieldScreen() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState({
    state: "",
    crop: "",
    season: "",
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

        if (appliedFilters.crop) {
          summaryParams.crop = appliedFilters.crop;
        }

        const [recordsResult, summaryResult] = await Promise.all([
          datasetService.getHistoricalYield(params),
          datasetService.getHistoricalYieldSummary(summaryParams),
        ]);

        setRecords(recordsResult.items || []);
        setPagination({
          total: recordsResult.total || 0,
          total_pages: recordsResult.total_pages || 0,
        });
        setSummary(summaryResult);
      } catch (error) {
        Alert.alert(
          "Unable to load data",
          getErrorMessage(
            error,
            "Historical yield records could not be loaded."
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

    Object.entries(filters).forEach(([key, value]) => {
      const cleanedValue = value.trim();

      if (cleanedValue) {
        cleanedFilters[key] =
          key === "year" ? Number(cleanedValue) : cleanedValue;
      }
    });

    setPage(1);
    setAppliedFilters(cleanedFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      state: "",
      crop: "",
      season: "",
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
          <Text style={styles.pageTitle}>Historical Yield</Text>
          <Text style={styles.pageSubtitle}>
            Crop production and yield records
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <DatasetSummaryCard
          label="Records"
          value={summary?.total_records}
          icon={<Database size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Crops"
          value={summary?.total_crops}
          icon={<Sprout size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="States"
          value={summary?.total_states}
          icon={<MapPinned size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Average Yield"
          value={
            summary?.average_yield != null
              ? Number(summary.average_yield).toFixed(2)
              : "—"
          }
          subtitle="Dataset yield unit"
          icon={<TrendingUp size={22} color={colors.primary} />}
        />
      </View>

      <View style={styles.filterHeader}>
        <View>
          <Text style={commonStyles.sectionTitle}>Dataset Records</Text>

          <Text style={styles.filterStatus}>
            {hasAppliedFilters
              ? "Filters are currently applied"
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
              label="Crop"
              placeholder="Example: Rice"
              value={filters.crop}
              onChangeText={(value) => updateFilter("crop", value)}
              autoCapitalize="words"
            />

            <AppInput
              label="Season"
              placeholder="Example: Kharif"
              value={filters.season}
              onChangeText={(value) => updateFilter("season", value)}
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
              Loading historical yield records...
            </Text>
          </View>
        ) : records.length === 0 ? (
          <EmptyState
            title="No yield records found"
            message="Try changing or clearing the current filters."
          />
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.cropBadge}>
                  <Sprout size={19} color={colors.primary} />
                </View>

                <View style={styles.recordHeadingText}>
                  <Text style={styles.cropName}>{record.crop}</Text>

                  <Text style={styles.recordMeta}>
                    {record.state} · {record.crop_year}
                  </Text>
                </View>

                <View style={styles.yieldBadge}>
                  <Text style={styles.yieldLabel}>Yield</Text>
                  <Text style={styles.yieldValue}>
                    {record.yield_value}
                  </Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.detailGrid}>
                <DetailItem label="Season" value={record.season} />
                <DetailItem label="Area" value={record.area} />
                <DetailItem
                  label="Production"
                  value={record.production}
                />
                <DetailItem
                  label="Rainfall"
                  value={record.annual_rainfall ?? "—"}
                />
                <DetailItem
                  label="Fertilizer"
                  value={record.fertilizer ?? "—"}
                />
                <DetailItem
                  label="Pesticide"
                  value={record.pesticide ?? "—"}
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
        onPageChange={(nextPage) => {
          setPage(nextPage);
        }}
      />
    </ScreenContainer>
  );
}

function DetailItem({ label, value }) {
  return (
    <View style={styles.detailItem}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
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

  cropBadge: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  recordHeadingText: {
    flex: 1,
    marginLeft: 12,
  },

  cropName: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  recordMeta: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  yieldBadge: {
    alignItems: "flex-end",
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  yieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.primaryDark,
  },

  yieldValue: {
    marginTop: 2,
    fontSize: 17,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#E5E7EB",
  },

  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  detailItem: {
    width: "47%",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },

  detailLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  detailValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },
});