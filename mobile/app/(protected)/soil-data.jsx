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
  Filter,
  FlaskConical,
  MapPinned,
  Sprout,
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

export default function SoilDataScreen() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);

  const [stateFilter, setStateFilter] = useState("");
  const [appliedState, setAppliedState] = useState("");

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
        };

        if (appliedState) {
          params.state = appliedState;
        }

        const [recordsResult, summaryResult] = await Promise.all([
          datasetService.getSoil(params),
          datasetService.getSoilSummary(),
        ]);

        setRecords(recordsResult.items || []);

        setPagination({
          total: recordsResult.total || 0,
          total_pages: recordsResult.total_pages || 0,
        });

        setSummary(summaryResult);
      } catch (error) {
        Alert.alert(
          "Unable to load soil data",
          getErrorMessage(
            error,
            "State soil reference records could not be loaded."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page, appliedState]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const applyFilter = () => {
    setPage(1);
    setAppliedState(stateFilter.trim());
    setShowFilters(false);
  };

  const clearFilter = () => {
    setStateFilter("");
    setAppliedState("");
    setPage(1);
    setShowFilters(false);
  };

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
          <Text style={styles.pageTitle}>Soil Data</Text>

          <Text style={styles.pageSubtitle}>
            State-level soil nutrient reference values
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <DatasetSummaryCard
          label="States"
          value={summary?.total_states}
          icon={<MapPinned size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Average N"
          value={
            summary?.average_nitrogen != null
              ? Number(summary.average_nitrogen).toFixed(2)
              : "—"
          }
          icon={<Sprout size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Average P"
          value={
            summary?.average_phosphorus != null
              ? Number(summary.average_phosphorus).toFixed(2)
              : "—"
          }
          icon={<Sprout size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Average K"
          value={
            summary?.average_potassium != null
              ? Number(summary.average_potassium).toFixed(2)
              : "—"
          }
          icon={<Sprout size={22} color={colors.primary} />}
        />

        <DatasetSummaryCard
          label="Average pH"
          value={
            summary?.average_ph != null
              ? Number(summary.average_ph).toFixed(2)
              : "—"
          }
          icon={<FlaskConical size={22} color={colors.primary} />}
        />
      </View>

      <View style={styles.filterHeader}>
        <View>
          <Text style={commonStyles.sectionTitle}>Soil Records</Text>

          <Text style={styles.filterStatus}>
            {appliedState
              ? `Filtered by ${appliedState}`
              : "Showing all available states"}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowFilters((current) => !current)}
          style={[
            styles.filterButton,
            appliedState && styles.activeFilterButton,
          ]}
        >
          <Filter
            size={19}
            color={appliedState ? colors.surface : colors.primary}
          />

          <Text
            style={[
              styles.filterButtonText,
              appliedState && styles.activeFilterButtonText,
            ]}
          >
            Filter
          </Text>
        </Pressable>
      </View>

      {showFilters ? (
        <View style={[commonStyles.card, styles.filterCard]}>
          <View style={commonStyles.form}>
            <AppInput
              label="State"
              placeholder="Example: Karnataka"
              value={stateFilter}
              onChangeText={setStateFilter}
              autoCapitalize="words"
            />

            <AppButton title="Apply Filter" onPress={applyFilter} />

            <AppButton
              title="Clear Filter"
              variant="outline"
              onPress={clearFilter}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.recordsContainer}>
        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              Loading soil reference records...
            </Text>
          </View>
        ) : records.length === 0 ? (
          <EmptyState
            title="No soil records found"
            message="Try clearing or changing the selected state filter."
          />
        ) : (
          records.map((record) => (
            <View key={record.id} style={styles.recordCard}>
              <View style={styles.recordHeader}>
                <View style={styles.stateIcon}>
                  <MapPinned size={21} color={colors.primary} />
                </View>

                <View style={styles.recordHeading}>
                  <Text style={styles.stateName}>{record.state}</Text>

                  <Text style={styles.recordSubtitle}>
                    State soil reference
                  </Text>
                </View>

                <View style={styles.phBadge}>
                  <Text style={styles.phLabel}>pH</Text>
                  <Text style={styles.phValue}>{record.ph}</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.nutrientGrid}>
                <NutrientItem
                  label="Nitrogen"
                  shortLabel="N"
                  value={record.nitrogen}
                />

                <NutrientItem
                  label="Phosphorus"
                  shortLabel="P"
                  value={record.phosphorus}
                />

                <NutrientItem
                  label="Potassium"
                  shortLabel="K"
                  value={record.potassium}
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

function NutrientItem({ label, shortLabel, value }) {
  return (
    <View style={styles.nutrientItem}>
      <View style={styles.nutrientCircle}>
        <Text style={styles.nutrientShortLabel}>{shortLabel}</Text>
      </View>

      <Text style={styles.nutrientLabel}>{label}</Text>
      <Text style={styles.nutrientValue}>{value}</Text>
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

  stateIcon: {
    width: 44,
    height: 44,
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

  recordSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  phBadge: {
    alignItems: "center",
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  phLabel: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    color: colors.primaryDark,
  },

  phValue: {
    marginTop: 2,
    fontSize: 18,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  divider: {
    height: 1,
    marginVertical: 16,
    backgroundColor: "#E5E7EB",
  },

  nutrientGrid: {
    flexDirection: "row",
    gap: 10,
  },

  nutrientItem: {
    flex: 1,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#F8FAFC",
    paddingVertical: 14,
    paddingHorizontal: 8,
  },

  nutrientCircle: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: colors.primaryLight,
  },

  nutrientShortLabel: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  nutrientLabel: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 10,
    color: colors.textSecondary,
  },

  nutrientValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },
});