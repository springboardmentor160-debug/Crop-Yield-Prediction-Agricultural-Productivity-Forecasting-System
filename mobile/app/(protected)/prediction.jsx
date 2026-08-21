import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import {
  BrainCircuit,
  Sparkles,
  History,
} from "lucide-react-native";

import { router } from "expo-router";
import ScreenContainer from "../../src/components/common/ScreenContainer";
import PredictionForm from "../../src/components/prediction/PredictionForm";
import PredictionLoader from "../../src/components/prediction/PredictionLoader";
import PredictionResultCard from "../../src/components/prediction/PredictionResultCard";

import { predictionService } from "../../src/services/predictionService";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

const MINIMUM_ANIMATION_TIME = 4600;

export default function PredictionScreen() {
  const [submitting, setSubmitting] =
    useState(false);

  const [showLoader, setShowLoader] =
    useState(false);

  const [prediction, setPrediction] =
    useState(null);

  const handlePrediction = async (payload) => {
    try {
      setSubmitting(true);
      setShowLoader(true);
      setPrediction(null);

      const animationDelay =
        new Promise((resolve) => {
          setTimeout(
            resolve,
            MINIMUM_ANIMATION_TIME
          );
        });

      const predictionRequest =
        predictionService.createPrediction(
          payload
        );

      const [result] = await Promise.all([
        predictionRequest,
        animationDelay,
      ]);

      setPrediction(result);

      setTimeout(() => {
        setShowLoader(false);
      }, 250);
    } catch (error) {
      setShowLoader(false);

      Alert.alert(
        "Prediction failed",
        getErrorMessage(
          error,
          "Unable to generate the crop yield prediction."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handlePredictAgain = () => {
    setPrediction(null);
  };

  return (
    <>
      <PredictionLoader
        visible={showLoader}
      />

      <ScreenContainer
        contentStyle={styles.screenContent}
      >
        <View style={styles.header}>
          <View style={styles.headerIcon}>
            <BrainCircuit
              size={27}
              color={colors.primary}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.title}>
              Crop Yield Prediction
            </Text>

            <Text style={styles.subtitle}>
              Generate AI-powered yield and
              production estimates for your active
              farms.
            </Text>
          </View>
        </View>

        <View style={styles.modelBadge}>
          <Sparkles
            size={17}
            color={colors.primaryDark}
          />

          <Text style={styles.modelBadgeText}>
            Random Forest Model
          </Text>
        </View>

        <Pressable
        onPress={() =>
            router.push(
            "/(protected)/prediction-history"
            )
        }
        style={({ pressed }) => [
            styles.historyButton,
            pressed && styles.pressed,
        ]}
        >
        <History
            size={18}
            color={colors.primary}
        />

        <Text style={styles.historyButtonText}>
            View Prediction History
        </Text>
        </Pressable>

        {!prediction ? (
          <PredictionForm
            onSubmit={handlePrediction}
            submitting={submitting}
          />
        ) : (
          <PredictionResultCard
            prediction={prediction}
            onPredictAgain={
              handlePredictAgain
            }
          />
        )}
      </ScreenContainer>
    </>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },

  headerIcon: {
    width: 52,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.primaryLight,
  },

  headerText: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  modelBadge: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  modelBadgeText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  historyButton: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 14,
    backgroundColor: colors.surface,
    },

    historyButtonText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.primary,
    },

    pressed: {
    opacity: 0.72,
  },
});