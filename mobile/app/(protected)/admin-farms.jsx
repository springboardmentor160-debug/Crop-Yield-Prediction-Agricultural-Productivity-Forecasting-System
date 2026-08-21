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
  Activity,
  ArrowLeft,
  Filter,
  MapPinned,
  Ruler,
  ShieldCheck,
  Tractor,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AppInput from "../../src/components/common/AppInput";
import AppButton from "../../src/components/common/AppButton";
import LoadingScreen from "../../src/components/common/LoadingScreen";

import FarmCard from "../../src/components/farms/FarmCard";
import FarmSummaryCard from "../../src/components/farms/FarmSummaryCard";
import FarmPagination from "../../src/components/farms/FarmPagination";
import EmptyFarmState from "../../src/components/farms/EmptyFarmState";

import { farmService } from "../../src/services/farmService";
import { useAuth } from "../../src/hooks/useAuth";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { getErrorMessage } from "../../src/utils/errorMessage";

const PAGE_SIZE = 10;

const initialFilters = {
  owner_email: "",
  state: "",
  district: "",
  primary_crop: "",
  is_active: "",
};

export default function AdminFarmsScreen() {
  const { user, initializing } = useAuth();

  const [farms, setFarms] = useState([]);
  const [summary, setSummary] = useState(null);

  const [filters, setFilters] = useState(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState({});

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    total: 0,
    total_pages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = user?.role === "admin";

  const loadFarms = useCallback(
    async ({ refresh = false } = {}) => {
      if (!isAdmin) {
        setLoading(false);
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const listParams = {
          page,
          page_size: PAGE_SIZE,
          ...appliedFilters,
        };

        const summaryParams = {};

        if (appliedFilters.state) {
          summaryParams.state = appliedFilters.state;
        }

        if (appliedFilters.district) {
          summaryParams.district = appliedFilters.district;
        }

        if (appliedFilters.primary_crop) {
          summaryParams.primary_crop =
            appliedFilters.primary_crop;
        }

        const [farmResult, summaryResult] = await Promise.all([
          farmService.getAdminFarms(listParams),
          farmService.getSummary(summaryParams),
        ]);

        setFarms(farmResult.items || []);

        setPagination({
          total: farmResult.total || 0,
          total_pages: farmResult.total_pages || 0,
        });

        setSummary(summaryResult);
      } catch (error) {
        Alert.alert(
          "Unable to load farms",
          getErrorMessage(
            error,
            "Administrator farm records could not be loaded."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isAdmin, page, appliedFilters]
  );

  useEffect(() => {
    loadFarms();
  }, [loadFarms]);

  const updateFilter = (field, value) => {
    setFilters((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    const nextFilters = {};

    if (filters.owner_email.trim()) {
      nextFilters.owner_email =
        filters.owner_email.trim().toLowerCase();
    }

    if (filters.state.trim()) {
      nextFilters.state = filters.state.trim();
    }

    if (filters.district.trim()) {
      nextFilters.district = filters.district.trim();
    }

    if (filters.primary_crop.trim()) {
      nextFilters.primary_crop =
        filters.primary_crop.trim();
    }

    if (filters.is_active !== "") {
      nextFilters.is_active =
        filters.is_active === "true";
    }

    setPage(1);
    setAppliedFilters(nextFilters);
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    setAppliedFilters({});
    setPage(1);
    setShowFilters(false);
  };

  const hasFilters = Object.keys(appliedFilters).length > 0;

  if (initializing) {
    return <LoadingScreen message="Checking administrator access..." />;
  }

  if (!isAdmin) {
    return (
      <ScreenContainer>
        <View style={styles.accessDeniedCard}>
          <View style={styles.accessIcon}>
            <ShieldCheck size={34} color={colors.warning} />
          </View>

          <Text style={styles.accessDeniedTitle}>
            Admin Access Required
          </Text>

          <Text style={styles.accessDeniedMessage}>
            Only administrators can view farms belonging to all users.
          </Text>

          <AppButton
            title="Back to Dashboard"
            onPress={() =>
              router.replace("/(protected)/dashboard")
            }
            style={styles.accessButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer
      contentStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => loadFarms({ refresh: true })}
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
          <Text style={styles.pageTitle}>All Farms</Text>

          <Text style={styles.pageSubtitle}>
            Review farms across all registered users
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <FarmSummaryCard
          label="Total Farms"
          value={summary?.total_farms}
          icon={<Tractor size={22} color={colors.primary} />}
        />

        <FarmSummaryCard
          label="Active Farms"
          value={summary?.active_farms}
          icon={<Activity size={22} color={colors.primary} />}
        />

        <FarmSummaryCard
          label="Total Area"
          value={
            summary?.total_area_hectares != null
              ? `${Number(
                  summary.total_area_hectares
                ).toFixed(2)} ha`
              : "—"
          }
          icon={<Ruler size={22} color={colors.primary} />}
        />

        <FarmSummaryCard
          label="Districts"
          value={summary?.total_districts}
          subtitle={
            summary?.total_states != null
              ? `${summary.total_states} state(s)`
              : undefined
          }
          icon={<MapPinned size={22} color={colors.primary} />}
        />
      </View>

      <View style={styles.listHeading}>
        <View>
          <Text style={commonStyles.sectionTitle}>
            Administrator Farm Records
          </Text>

          <Text style={styles.filterStatus}>
            {hasFilters
              ? "Administrator filters are applied"
              : "Showing all available farm records"}
          </Text>
        </View>

        <Pressable
          onPress={() => setShowFilters((current) => !current)}
          style={[
            styles.filterButton,
            hasFilters && styles.activeFilterButton,
          ]}
        >
          <Filter
            size={19}
            color={hasFilters ? colors.surface : colors.primary}
          />

          <Text
            style={[
              styles.filterButtonText,
              hasFilters && styles.activeFilterText,
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
              label="Owner email"
              placeholder="farmer@example.com"
              value={filters.owner_email}
              onChangeText={(value) =>
                updateFilter("owner_email", value)
              }
              keyboardType="email-address"
              autoComplete="email"
            />

            <AppInput
              label="State"
              placeholder="Example: Karnataka"
              value={filters.state}
              onChangeText={(value) =>
                updateFilter("state", value)
              }
              autoCapitalize="words"
            />

            <AppInput
              label="District"
              placeholder="Example: Mysuru"
              value={filters.district}
              onChangeText={(value) =>
                updateFilter("district", value)
              }
              autoCapitalize="words"
            />

            <AppInput
              label="Primary crop"
              placeholder="Example: Rice"
              value={filters.primary_crop}
              onChangeText={(value) =>
                updateFilter("primary_crop", value)
              }
              autoCapitalize="words"
            />

            <Text style={styles.statusLabel}>Farm status</Text>

            <View style={styles.statusOptions}>
              {[
                { label: "All", value: "" },
                { label: "Active", value: "true" },
                { label: "Inactive", value: "false" },
              ].map((option) => {
                const selected =
                  filters.is_active === option.value;

                return (
                  <Pressable
                    key={option.label}
                    onPress={() =>
                      updateFilter("is_active", option.value)
                    }
                    style={[
                      styles.statusOption,
                      selected && styles.selectedStatusOption,
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusOptionText,
                        selected &&
                          styles.selectedStatusOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <AppButton
              title="Apply Filters"
              onPress={applyFilters}
            />

            <AppButton
              title="Clear Filters"
              variant="outline"
              onPress={clearFilters}
            />
          </View>
        </View>
      ) : null}

      <View style={styles.records}>
        {loading ? (
          <View style={styles.loadingCard}>
            <Text style={styles.loadingText}>
              Loading administrator farm records...
            </Text>
          </View>
        ) : farms.length === 0 ? (
          <EmptyFarmState
            title="No farm records found"
            message="No farms match the selected administrator filters."
            showCreateButton={false}
          />
        ) : (
          farms.map((farm) => (
            <FarmCard
              key={farm.id}
              farm={farm}
              showOwner
              onPress={() =>
                router.push({
                  pathname: "/(protected)/farm-details",
                  params: {
                    farmId: String(farm.id),
                  },
                })
              }
            />
          ))
        )}
      </View>

      <FarmPagination
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

  listHeading: {
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

  activeFilterText: {
    color: colors.surface,
  },

  filterCard: {
    marginTop: 14,
  },

  statusLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.text,
  },

  statusOptions: {
    flexDirection: "row",
    gap: 10,
  },

  statusOption: {
    flex: 1,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 12,
  },

  selectedStatusOption: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  statusOptionText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  selectedStatusOptionText: {
    color: colors.primaryDark,
  },

  records: {
    marginTop: 16,
    gap: 14,
  },

  loadingCard: {
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingVertical: 36,
  },

  loadingText: {
    color: colors.textSecondary,
  },

  accessDeniedCard: {
    marginTop: 80,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingVertical: 36,
  },

  accessIcon: {
    width: 66,
    height: 66,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 22,
    backgroundColor: "#FEF3C7",
  },

  accessDeniedTitle: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "800",
    color: colors.text,
  },

  accessDeniedMessage: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  accessButton: {
    marginTop: 22,
  },
});