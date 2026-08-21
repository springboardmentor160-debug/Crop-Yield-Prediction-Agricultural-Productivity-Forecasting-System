import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  BrainCircuit,
  Sprout,
  Tractor,
  Wheat,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

const STAGES = [
  {
    icon: Tractor,
    title: "Preparing Farm",
    description: "Collecting farm information...",
  },
  {
    icon: Sprout,
    title: "Finding Candidate Crops",
    description: "Searching historical crop records...",
  },
  {
    icon: Wheat,
    title: "Predicting Yield",
    description: "Running Random Forest prediction...",
  },
  {
    icon: BrainCircuit,
    title: "AI Comparing Crops",
    description: "Ranking crops by expected performance...",
  },
  {
    icon: Wheat,
    title: "Best Crop Selected",
    description: "Preparing recommendation...",
  },
];

export default function RecommendationAnimation({
  visible,
  onFinished,
}) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!visible) {
      setStage(0);
      return;
    }

    let current = 0;

    const timer = setInterval(() => {
      current++;

      if (current >= STAGES.length) {
        clearInterval(timer);

        setTimeout(() => {
          onFinished?.();
        }, 500);

        return;
      }

      setStage(current);
    }, 800);

    return () => clearInterval(timer);
  }, [visible, onFinished]);

  if (!visible) {
    return null;
  }

  const CurrentIcon = STAGES[stage].icon;

  return (
    <View style={styles.overlay}>
      <View style={styles.card}>
        <CurrentIcon
          size={52}
          color={colors.primaryDark}
        />

        <Text style={styles.title}>
          {STAGES[stage].title}
        </Text>

        <Text style={styles.description}>
          {STAGES[stage].description}
        </Text>

        <ActivityIndicator
          size="large"
          color={colors.primaryDark}
          style={{ marginTop: 24 }}
        />

        <View style={styles.progress}>
          {STAGES.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index <= stage && styles.activeDot,
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.96)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },

  card: {
    width: "85%",
    padding: 28,
    borderRadius: 24,
    alignItems: "center",
    backgroundColor: colors.surface,
    elevation: 6,
  },

  title: {
    marginTop: 18,
    fontSize: 22,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  description: {
    marginTop: 10,
    textAlign: "center",
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
  },

  progress: {
    flexDirection: "row",
    marginTop: 30,
  },

  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginHorizontal: 5,
    backgroundColor: "#D1D5DB",
  },

  activeDot: {
    backgroundColor: colors.primaryDark,
  },
});