import {
  useCallback,
  useState,
} from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Alert,
} from "react-native";
import { router } from "expo-router";
import {
  BrainCircuit,
  Sprout,
} from "lucide-react-native";

import { colors } from "../../src/constants/colors";
import RecommendationForm from "../../src/components/recommendation/RecommendationForm";
import RecommendationResult from "../../src/components/recommendation/RecommendationResult";
import RecommendationAnimation from "../../src/components/recommendation/RecommendationAnimation";
import { recommendationService } from "../../src/services/recommendationService";

export default function RecommendationScreen() {
  const [submitting, setSubmitting] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);
  const [recommendation, setRecommendation] = useState(null);
  
  const handleAnimationFinished =
    useCallback(() => {
      setShowAnimation(false);
    }, []);

  const handleRecommendation = async (payload) => {
    try {
      setSubmitting(true);

      const response =
        await recommendationService.createRecommendation(
          payload
        );

      setRecommendation(response);
      setShowAnimation(true);
    } catch (error) {
      const message =
        error.response?.data?.detail ||
        error.message ||
        "Unable to generate crop recommendation.";

      Alert.alert(
        "Recommendation Failed",
        message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecommendAgain = () => {
    setRecommendation(null);
    setShowAnimation(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroCard}>
          <View style={styles.badge}>
            <BrainCircuit
              size={18}
              color={colors.primaryDark}
            />

            <Text style={styles.badgeText}>
              AI Crop Selection
            </Text>
          </View>

          <View style={styles.iconContainer}>
            <Sprout
              size={38}
              color={colors.primaryDark}
            />
          </View>

          <Text style={styles.title}>
            Crop Recommendation
          </Text>

          <Text style={styles.description}>
            Select your farm, crop year, and season.
            YieldSense AI will compare suitable crops and
            recommend the best option for your farm.
          </Text>
        </View>

        {recommendation ? (
          <RecommendationResult
            recommendation={recommendation}
            onRecommendAgain={handleRecommendAgain}
            onViewHistory={() =>
              router.push(
                "/(protected)/recommendation-history"
              )
            }
          />
        ) : (
          <RecommendationForm
            submitting={submitting}
            onSubmit={handleRecommendation}
          />
        )}
      </ScrollView>

      <RecommendationAnimation
        visible={showAnimation}
        onFinished={handleAnimationFinished}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

  heroCard: {
    padding: 22,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  badge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },

  badgeText: {
    fontSize: 13,
    fontWeight: "800",
    color: colors.primaryDark,
  },

  iconContainer: {
    width: 64,
    height: 64,
    marginTop: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
  },

  title: {
    marginTop: 18,
    fontSize: 27,
    fontWeight: "900",
    color: colors.textPrimary,
  },

  description: {
    marginTop: 10,
    fontSize: 15,
    lineHeight: 23,
    color: colors.textSecondary,
  },
});