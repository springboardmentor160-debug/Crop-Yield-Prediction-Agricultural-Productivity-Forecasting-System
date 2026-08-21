import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CloudSun,
  Database,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  Sprout,
  Tractor,
  UserRound,
} from "lucide-react-native";
import { useRouter } from "expo-router";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import DatasetSummaryCard from "../../src/components/datasets/DatasetSummaryCard";

import { datasetService } from "../../src/services/datasetService";
import { useAuth } from "../../src/hooks/useAuth";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function DashboardScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const [summary, setSummary] = useState({
    historicalRecords: 0,
    cropTypes: 0,
    soilStates: 0,
    weatherRecords: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboardData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      const [
        historicalSummary,
        soilSummary,
        weatherSummary,
      ] = await Promise.all([
        datasetService.getHistoricalYieldSummary(),
        datasetService.getSoilSummary(),
        datasetService.getWeatherSummary(),
      ]);

      setSummary({
        historicalRecords:
          historicalSummary?.total_records ?? 0,

        cropTypes:
          historicalSummary?.total_crops ?? 0,

        soilStates:
          soilSummary?.total_states ?? 0,

        weatherRecords:
          weatherSummary?.total_records ?? 0,
      });
    } catch (error) {
      Alert.alert(
        "Dashboard unavailable",
        getErrorMessage(
          error,
          "Unable to load dataset summary information."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  if (loading) {
    return (
      <LoadingScreen message="Loading dashboard..." />
    );
  }

  return (
    <ScreenContainer>
      {/* Dashboard heading */}
      <View style={styles.headingRow}>
        <View style={styles.headingText}>
          <Text style={styles.brand}>
            YIELDSENSE AI
          </Text>

          <Text style={styles.pageTitle}>
            Dashboard
          </Text>

          <Text style={styles.pageSubtitle}>
            Smart crop yield prediction and agricultural insights
          </Text>
        </View>

        <Pressable
          onPress={() => loadDashboardData(false)}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.pressedButton,
            refreshing && styles.disabledButton,
          ]}
        >
          <RefreshCw
            size={21}
            color={colors.primary}
          />
        </Pressable>
      </View>

      {/* Welcome card */}
      <View style={styles.welcomeCard}>
        <Text style={styles.welcomeLabel}>
          Welcome back
        </Text>

        <Text style={styles.userName}>
          {user?.full_name || "YieldSense User"}
        </Text>

        <Text style={styles.userEmail}>
          {user?.email || ""}
        </Text>
      </View>

      {/* Account information */}
      <View style={styles.accountGrid}>
        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <UserRound
              size={25}
              color={colors.primary}
            />
          </View>

          <Text style={styles.accountLabel}>
            Role
          </Text>

          <Text style={styles.accountValue}>
            {user?.role || "Unknown"}
          </Text>
        </View>

        <View style={styles.accountCard}>
          <View style={styles.accountIcon}>
            <ShieldCheck
              size={25}
              color={colors.primary}
            />
          </View>

          <Text style={styles.accountLabel}>
            Verification
          </Text>

          <Text style={styles.accountValue}>
            {user?.is_verified
              ? "Verified"
              : "Pending"}
          </Text>
        </View>
      </View>

      {/* Dataset overview */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Dataset Overview
        </Text>

        <Text style={styles.sectionDescription}>
          Explore the agricultural datasets powering predictions,
          recommendations, and analytical insights.
        </Text>
      </View>

      <View style={styles.summaryGrid}>
        <DatasetSummaryCard
          label="Historical Records"
          value={summary.historicalRecords.toLocaleString()}
          subtitle="Crop yield rows"
          icon={
            <Database
              size={23}
              color={colors.primary}
            />
          }
        />

        <DatasetSummaryCard
          label="Crop Types"
          value={summary.cropTypes.toLocaleString()}
          subtitle="Unique crops"
          icon={
            <Sprout
              size={23}
              color={colors.primary}
            />
          }
        />

        <DatasetSummaryCard
          label="Soil States"
          value={summary.soilStates.toLocaleString()}
          subtitle="State soil references"
          icon={
            <MapPinned
              size={23}
              color={colors.primary}
            />
          }
        />

        <DatasetSummaryCard
          label="Weather Records"
          value={summary.weatherRecords.toLocaleString()}
          subtitle="State and year records"
          icon={
            <CloudSun
              size={23}
              color={colors.primary}
            />
          }
        />
      </View>
      {/* Farm Management */}
<View style={styles.sectionHeader}>
  <Text style={styles.sectionTitle}>
    Farm Management
  </Text>

  <Text style={styles.sectionDescription}>
    {user?.role === "admin"
      ? "Review and manage farms across all registered users."
      : "Create, view, and manage farms linked to your account."}
  </Text>
</View>

<View style={styles.farmManagementContainer}>
  {user?.role === "admin" ? (
    <Pressable
      onPress={() =>
        router.push("/(protected)/admin-farms")
      }
      style={({ pressed }) => [
        styles.farmManagementCard,
        pressed && styles.pressedButton,
      ]}
    >
      <View style={styles.farmManagementIcon}>
        <ShieldCheck
          size={26}
          color={colors.primary}
        />
      </View>

      <View style={styles.farmManagementText}>
        <Text style={styles.farmManagementTitle}>
          All Farms
        </Text>

        <Text style={styles.farmManagementDescription}>
          View farm owners, filter records, and manage farm status.
        </Text>
      </View>
    </Pressable>
  ) : (
    <Pressable
      onPress={() =>
        router.push("/(protected)/farms")
      }
      style={({ pressed }) => [
        styles.farmManagementCard,
        pressed && styles.pressedButton,
      ]}
    >
      <View style={styles.farmManagementIcon}>
        <Tractor
          size={26}
          color={colors.primary}
        />
      </View>

      <View style={styles.farmManagementText}>
        <Text style={styles.farmManagementTitle}>
          My Farms
        </Text>

        <Text style={styles.farmManagementDescription}>
          Create, update, deactivate, and manage your farm records.
        </Text>
      </View>
    </Pressable>
  )}
</View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  headingText: {
    flex: 1,
    paddingRight: 14,
  },

  brand: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: colors.primary,
  },

  pageTitle: {
    marginTop: 4,
    fontSize: 30,
    fontWeight: "800",
    color: colors.text,
  },

  pageSubtitle: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  refreshButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  pressedButton: {
    opacity: 0.75,
  },

  disabledButton: {
    opacity: 0.45,
  },

  welcomeCard: {
    borderRadius: 20,
    backgroundColor: colors.primary,
    padding: 22,
  },

  welcomeLabel: {
    fontSize: 14,
    color: "#DCFCE7",
  },

  userName: {
    marginTop: 5,
    fontSize: 24,
    fontWeight: "800",
    color: colors.surface,
  },

  userEmail: {
    marginTop: 5,
    fontSize: 14,
    color: "#DCFCE7",
  },

  accountGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 16,
  },

  accountCard: {
    flex: 1,
    minHeight: 135,
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 17,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  accountIcon: {
    width: 43,
    height: 43,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  accountLabel: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  accountValue: {
    marginTop: 4,
    fontSize: 17,
    fontWeight: "800",
    textTransform: "capitalize",
    color: colors.text,
  },

  sectionHeader: {
    marginTop: 26,
    marginBottom: 14,
  },

  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: colors.text,
  },

  sectionDescription: {
    marginTop: 5,
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  farmManagementContainer: {
    marginTop: 2,
    },

    farmManagementCard: {
    minHeight: 104,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1FAE5",
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: {
        width: 0,
        height: 3,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    },

    farmManagementIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
    },

    farmManagementText: {
    flex: 1,
    marginLeft: 15,
    },

    farmManagementTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
    },

    farmManagementDescription: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
    },
});