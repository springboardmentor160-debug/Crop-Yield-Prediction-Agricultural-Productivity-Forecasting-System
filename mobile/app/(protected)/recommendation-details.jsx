import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ArrowLeft,
  Sprout,
} from "lucide-react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";

import RecommendationResult from "../../src/components/recommendation/RecommendationResult";
import { recommendationService } from "../../src/services/recommendationService";
import { colors } from "../../src/constants/colors";

export default function RecommendationDetailsScreen() {
  const { recommendationId } = useLocalSearchParams();

  const [recommendation, setRecommendation] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const loadRecommendation = useCallback(async () => {
    if (!recommendationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const response =
        await recommendationService.getRecommendation(
          recommendationId
        );

      setRecommendation(response);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Unable to load recommendation details.";

      Alert.alert(
        "Recommendation Loading Failed",
        message
      );
    } finally {
      setLoading(false);
    }
  }, [recommendationId]);

  useFocusEffect(
    useCallback(() => {
      loadRecommendation();
    }, [loadRecommendation])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator
          size="large"
          color={colors.primaryDark}
        />

        <Text style={styles.loadingText}>
          Loading recommendation details...
        </Text>
      </View>
    );
  }

  if (!recommendation) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIcon}>
          <Sprout
            size={34}
            color={colors.primaryDark}
          />
        </View>

        <Text style={styles.emptyTitle}>
          Recommendation not found
        </Text>

        <Text style={styles.emptyDescription}>
          This recommendation may no longer be available.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() =>
            router.replace(
              "/(protected)/recommendation-history"
            )
          }
        >
          <ArrowLeft size={19} color="#ffffff" />

          <Text style={styles.primaryButtonText}>
            Back to History
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
    >
      <View style={styles.headerCard}>
        <View style={styles.badge}>
          <Sprout
            size={18}
            color={colors.primaryDark}
          />

          <Text style={styles.badgeText}>
            Recommendation Details
          </Text>
        </View>

        <Text style={styles.title}>
          Crop Recommendation Record
        </Text>

        <Text style={styles.description}>
          Review the recommended crop, predicted
          performance, supporting reasons, and alternative
          crop options.
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() =>
            router.back()
          }
        >
          <ArrowLeft
            size={18}
            color={colors.primaryDark}
          />

          <Text style={styles.backButtonText}>
            Back to History
          </Text>
        </Pressable>
      </View>

      <RecommendationResult
        recommendation={recommendation}
        onRecommendAgain={() =>
          router.replace(
            "/(protected)/recommendation"
          )
        }
        onViewHistory={() =>
          router.replace(
            "/(protected)/recommendation-history"
          )
        }
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
    paddingBottom: 32,
  },

  centerContainer: {
    flex: 1,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },

  loadingText: {
    marginTop: 14,
    fontSize: 14,
    fontWeight: "600",
    color: colors.textSecondary,
  },

  headerCard: {
    padding: 21,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },

  badgeText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  description: {
    marginTop: 9,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  backButton: {
    alignSelf: "flex-start",
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  backButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  emptyIcon: {
    width: 68,
    height: 68,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 21,
    backgroundColor: colors.primaryLight,
  },

  emptyTitle: {
    marginTop: 18,
    fontSize: 21,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  emptyDescription: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 21,
    color: colors.textSecondary,
  },

  primaryButton: {
    minHeight: 54,
    marginTop: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
  },

  primaryButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "800",
    color: "#ffffff",
  },
});