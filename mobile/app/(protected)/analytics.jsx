import { useCallback, useEffect, useState } from "react";
import { useRouter } from "expo-router";
import {
  BarChart3,
  RefreshCw,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import AnalyticsBarChart from "../../src/components/analytics/AnalyticsBarChart";
import AnalyticsSeasonChart from "../../src/components/analytics/AnalyticsSeasonChart";
import AnalyticsSummaryCards from "../../src/components/analytics/AnalyticsSummaryCards";
import RecentPredictionsList from "../../src/components/analytics/RecentPredictionsList";
import { colors } from "../../src/constants/colors";
import { getAnalyticsDashboard } from "../../src/services/analyticsService";


const EMPTY_ANALYTICS = {
  summary: {
    total_predictions: 0,
    active_farms: 0,
    average_predicted_yield: 0,
    average_estimated_production: 0,
  },
  crops: [],
  seasons: [],
  states: [],
  recent_predictions: [],
};


export default function AnalyticsScreen() {
  const router = useRouter();

  const [analytics, setAnalytics] =
    useState(EMPTY_ANALYTICS);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    try {
      setError("");

      const data = await getAnalyticsDashboard();

      setAnalytics({
        summary: {
          ...EMPTY_ANALYTICS.summary,
          ...(data?.summary || {}),
        },

        crops: Array.isArray(data?.crops)
          ? data.crops
          : [],

        seasons: Array.isArray(data?.seasons)
          ? data.seasons
          : [],

        states: Array.isArray(data?.states)
          ? data.states
          : [],

        recent_predictions: Array.isArray(
          data?.recent_predictions
        )
          ? data.recent_predictions.slice(0, 3)
          : [],
      });
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        requestError?.message ||
        "Unable to load analytics dashboard.";

      setError(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    loadAnalytics();
  }, [loadAnalytics]);

  const handleRetry = () => {
    setLoading(true);
    loadAnalytics();
  };

  const handlePredictionPress = (prediction) => {
    if (!prediction?.id) {
      return;
    }

    router.push({
      pathname: "/(protected)/prediction-details",
      params: {
        predictionId: String(prediction.id),
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centeredContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primary}
        />

        <Text style={styles.loadingTitle}>
          Loading analytics
        </Text>

        <Text style={styles.loadingMessage}>
          Preparing your farm and prediction insights...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centeredContainer}>
        <View style={styles.errorIcon}>
          <BarChart3
            size={30}
            color="#DC2626"
          />
        </View>

        <Text style={styles.errorTitle}>
          Analytics unavailable
        </Text>

        <Text style={styles.errorMessage}>
          {error}
        </Text>

        <Pressable
          onPress={handleRetry}
          style={({ pressed }) => [
            styles.retryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <RefreshCw
            size={18}
            color="#FFFFFF"
          />

          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroDecorationLarge} />
        <View style={styles.heroDecorationSmall} />

        <View style={styles.heroIcon}>
          <BarChart3
            size={27}
            color="#FFFFFF"
          />
        </View>

        <Text style={styles.heroEyebrow}>
          YIELDSENSE AI
        </Text>

        <Text style={styles.heroTitle}>
          Analytics Dashboard
        </Text>

        <Text style={styles.heroDescription}>
          Review farm activity, prediction performance,
          crop trends, seasonal distribution and
          state-level agricultural insights.
        </Text>

        <Pressable
          onPress={handleRefresh}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.refreshButton,
            pressed && styles.refreshButtonPressed,
            refreshing && styles.buttonDisabled,
          ]}
        >
          {refreshing ? (
            <ActivityIndicator
              size="small"
              color="#FFFFFF"
            />
          ) : (
            <RefreshCw
              size={17}
              color="#FFFFFF"
            />
          )}

          <Text style={styles.refreshButtonText}>
            {refreshing
              ? "Refreshing..."
              : "Refresh Analytics"}
          </Text>
        </Pressable>
      </View>

      <AnalyticsSummaryCards
        summary={analytics.summary}
      />

      <AnalyticsBarChart
        title="Crop Analytics"
        description="Prediction volume and average yield by crop."
        data={analytics.crops}
        labelKey="crop"
        emptyMessage="Crop statistics will appear after yield predictions are generated."
      />

      <AnalyticsSeasonChart
        seasons={analytics.seasons}
      />

      <AnalyticsBarChart
        title="State Analytics"
        description="Compare prediction activity and average yield across states."
        data={analytics.states}
        labelKey="state"
        emptyMessage="State-wise insights will appear after prediction records are generated."
      />

      <RecentPredictionsList
        predictions={analytics.recent_predictions}
        onPredictionPress={handlePredictionPress}
      />
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 34,
    gap: 16,
  },

  centeredContainer: {
    flex: 1,
    paddingHorizontal: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingTitle: {
    marginTop: 16,
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  loadingMessage: {
    marginTop: 6,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  errorIcon: {
    width: 62,
    height: 62,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEE2E2",
  },

  errorTitle: {
    marginTop: 18,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "800",
  },

  errorMessage: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
    lineHeight: 21,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 22,
    paddingHorizontal: 20,
    paddingVertical: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },

  hero: {
    position: "relative",
    overflow: "hidden",
    padding: 22,
    borderRadius: 26,
    backgroundColor: colors.primaryDark,
  },

  heroDecorationLarge: {
    position: "absolute",
    top: -65,
    right: -55,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: "rgba(255,255,255,0.08)",
  },

  heroDecorationSmall: {
    position: "absolute",
    right: 70,
    bottom: -70,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(255,255,255,0.05)",
  },

  heroIcon: {
    width: 50,
    height: 50,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },

  heroEyebrow: {
    marginTop: 18,
    color: "#D1FAE5",
    fontSize: 11,
    letterSpacing: 2,
    fontWeight: "800",
  },

  heroTitle: {
    marginTop: 7,
    color: "#FFFFFF",
    fontSize: 27,
    lineHeight: 34,
    fontWeight: "900",
  },

  heroDescription: {
    marginTop: 10,
    maxWidth: 560,
    color: "#ECFDF5",
    fontSize: 13,
    lineHeight: 21,
    fontWeight: "500",
  },

  refreshButton: {
    alignSelf: "flex-start",
    marginTop: 20,
    paddingHorizontal: 16,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.26)",
    backgroundColor: "rgba(255,255,255,0.14)",
  },

  refreshButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800",
  },

  refreshButtonPressed: {
    backgroundColor: "rgba(255,255,255,0.22)",
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },
});