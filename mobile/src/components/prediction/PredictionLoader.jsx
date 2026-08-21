import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Modal,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CheckCircle2,
  Sparkles,
  Tractor,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

const { width: screenWidth } =
  Dimensions.get("window");

const stages = {
  TRACTOR: "tractor",
  GROWING: "growing",
  GREEN: "green",
  HARVEST: "harvest",
  READY: "ready",
};

export default function PredictionLoader({
  visible,
}) {
  const [stage, setStage] = useState(
    stages.TRACTOR
  );

  const tractorPosition = useRef(
    new Animated.Value(-90)
  ).current;

  const readyOpacity = useRef(
    new Animated.Value(0)
  ).current;

  const readyScale = useRef(
    new Animated.Value(0.82)
  ).current;

  useEffect(() => {
    if (!visible) {
      setStage(stages.TRACTOR);
      tractorPosition.setValue(-90);
      readyOpacity.setValue(0);
      readyScale.setValue(0.82);

      return undefined;
    }

    setStage(stages.TRACTOR);
    tractorPosition.setValue(-90);
    readyOpacity.setValue(0);
    readyScale.setValue(0.82);

    Animated.timing(
      tractorPosition,
      {
        toValue: screenWidth - 35,
        duration: 2800,
        useNativeDriver: true,
      }
    ).start();

    const timers = [
      setTimeout(() => {
        setStage(stages.GROWING);
      }, 1700),

      setTimeout(() => {
        setStage(stages.GREEN);
      }, 2800),

      setTimeout(() => {
        setStage(stages.HARVEST);
      }, 3600),

      setTimeout(() => {
        setStage(stages.READY);

        Animated.parallel([
          Animated.timing(
            readyOpacity,
            {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
            }
          ),

          Animated.spring(
            readyScale,
            {
              toValue: 1,
              friction: 6,
              tension: 70,
              useNativeDriver: true,
            }
          ),
        ]).start();
      }, 4100),
    ];

    return () => {
      timers.forEach(clearTimeout);
      tractorPosition.stopAnimation();
    };
  }, [
    visible,
    tractorPosition,
    readyOpacity,
    readyScale,
  ]);

  const showSprouts = [
    stages.GROWING,
    stages.GREEN,
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const showGreen = [
    stages.GREEN,
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const showHarvest = [
    stages.HARVEST,
    stages.READY,
  ].includes(stage);

  const ready = stage === stages.READY;

  const stageInformation = {
    [stages.TRACTOR]: {
      title: "Preparing Field",
      description:
        "The tractor is preparing your farmland...",
    },

    [stages.GROWING]: {
      title: "Growing Crops",
      description:
        "The AI is simulating crop development...",
    },

    [stages.GREEN]: {
      title: "Healthy Crop",
      description:
        "Growth conditions look promising...",
    },

    [stages.HARVEST]: {
      title: "Estimating Harvest",
      description:
        "Calculating the expected crop yield...",
    },
  };

  const currentStage =
    stageInformation[stage];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.sky}>
            <View style={styles.sun} />

            <View style={styles.cloudOne} />
            <View style={styles.cloudTwo} />

            <View
              style={[
                styles.field,
                showHarvest
                  ? styles.harvestField
                  : showGreen
                    ? styles.greenField
                    : styles.soilField,
              ]}
            />

            <CropRows
              visible={showSprouts}
              green={showGreen}
              harvest={showHarvest}
            />

            {!ready ? (
              <Animated.View
                style={[
                  styles.tractor,
                  {
                    transform: [
                      {
                        translateX:
                          tractorPosition,
                      },
                    ],
                  },
                ]}
              >
                <View style={styles.tractorBody}>
                  <Tractor
                    size={46}
                    color={colors.surface}
                  />
                </View>
              </Animated.View>
            ) : null}

            {ready ? (
              <View style={styles.readyOverlay}>
                <Animated.View
                  style={[
                    styles.readyContent,
                    {
                      opacity: readyOpacity,
                      transform: [
                        {
                          scale: readyScale,
                        },
                      ],
                    },
                  ]}
                >
                  <View style={styles.readyIcon}>
                    <CheckCircle2
                      size={50}
                      color={colors.primary}
                    />

                    <Sparkles
                      size={22}
                      color="#D97706"
                      style={styles.sparkleTop}
                    />

                    <Sparkles
                      size={17}
                      color={colors.primary}
                      style={styles.sparkleBottom}
                    />
                  </View>

                  <Text style={styles.readyTitle}>
                    Prediction Ready
                  </Text>
                </Animated.View>
              </View>
            ) : null}
          </View>

          {!ready ? (
            <View style={styles.footer}>
              <Text style={styles.footerTitle}>
                {currentStage.title}
              </Text>

              <Text style={styles.footerText}>
                {currentStage.description}
              </Text>

              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressValue,
                    stage === stages.TRACTOR &&
                      styles.progressTractor,
                    stage === stages.GROWING &&
                      styles.progressGrowing,
                    stage === stages.GREEN &&
                      styles.progressGreen,
                    stage === stages.HARVEST &&
                      styles.progressHarvest,
                  ]}
                />
              </View>
            </View>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function CropRows({
  visible,
  green,
  harvest,
}) {
  if (!visible) {
    return null;
  }

  const symbol = harvest
    ? "🌾"
    : green
      ? "🌿"
      : "🌱";

  return (
    <View style={styles.cropContainer}>
      {[0, 1, 2, 3].map((row) => (
        <View
          key={row}
          style={[
            styles.cropRow,
            {
              opacity:
                0.72 + row * 0.08,
            },
          ]}
        >
          {[0, 1, 2, 3, 4, 5, 6, 7].map(
            (crop) => (
              <Text
                key={crop}
                style={[
                  styles.crop,
                  row > 1 &&
                    styles.frontCrop,
                ]}
              >
                {symbol}
              </Text>
            )
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(15, 23, 42, 0.72)",
    paddingHorizontal: 18,
  },

  card: {
    width: "100%",
    maxWidth: 430,
    overflow: "hidden",
    borderRadius: 26,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: {
      width: 0,
      height: 12,
    },
    elevation: 15,
  },

  sky: {
    height: 360,
    overflow: "hidden",
    backgroundColor: "#DBEAFE",
  },

  sun: {
    position: "absolute",
    top: 30,
    left: 30,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FCD34D",
    shadowColor: "#F59E0B",
    shadowOpacity: 0.55,
    shadowRadius: 20,
    elevation: 6,
  },

  cloudOne: {
    position: "absolute",
    top: 48,
    right: 38,
    width: 92,
    height: 18,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.85)",
  },

  cloudTwo: {
    position: "absolute",
    top: 75,
    right: 80,
    width: 76,
    height: 14,
    borderRadius: 20,
    backgroundColor:
      "rgba(255,255,255,0.72)",
  },

  field: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 170,
  },

  soilField: {
    backgroundColor: "#78350F",
  },

  greenField: {
    backgroundColor: "#15803D",
  },

  harvestField: {
    backgroundColor: "#D97706",
  },

  tractor: {
    position: "absolute",
    bottom: 118,
    left: 0,
    zIndex: 8,
  },

  tractorBody: {
    width: 68,
    height: 62,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primary,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },

  cropContainer: {
    position: "absolute",
    right: 10,
    bottom: 10,
    left: 10,
    zIndex: 5,
    gap: 2,
  },

  cropRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "flex-end",
  },

  crop: {
    fontSize: 24,
  },

  frontCrop: {
    fontSize: 28,
  },

  readyOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor:
      "rgba(255, 251, 235, 0.78)",
  },

  readyContent: {
    alignItems: "center",
  },

  readyIcon: {
    width: 90,
    height: 90,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 45,
    backgroundColor: colors.surface,
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 15,
    elevation: 10,
  },

  sparkleTop: {
    position: "absolute",
    top: -6,
    right: -4,
  },

  sparkleBottom: {
    position: "absolute",
    bottom: 1,
    left: -7,
  },

  readyTitle: {
    marginTop: 20,
    fontSize: 29,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  footer: {
    paddingHorizontal: 22,
    paddingVertical: 20,
  },

  footerTitle: {
    textAlign: "center",
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  footerText: {
    marginTop: 5,
    textAlign: "center",
    fontSize: 12,
    color: colors.textSecondary,
  },

  progressTrack: {
    height: 7,
    overflow: "hidden",
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: "#E5E7EB",
  },

  progressValue: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: colors.primary,
  },

  progressTractor: {
    width: "28%",
  },

  progressGrowing: {
    width: "52%",
  },

  progressGreen: {
    width: "75%",
  },

  progressHarvest: {
    width: "94%",
  },
});