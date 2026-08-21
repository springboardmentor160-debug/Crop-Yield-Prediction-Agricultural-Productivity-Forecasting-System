import {
  CalendarDays,
  ChevronRight,
  Clock3,
  Sprout,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";


function formatNumber(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function RecentPredictionsList({
  predictions = [],
  onPredictionPress,
}) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Clock3
            size={21}
            color="#7C3AED"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Recent Predictions
          </Text>

          <Text style={styles.description}>
            Latest crop-yield prediction records.
          </Text>
        </View>

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {predictions.length}
          </Text>
        </View>
      </View>

      {predictions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Sprout
            size={36}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No recent predictions
          </Text>

          <Text style={styles.emptyMessage}>
            Newly generated prediction records will
            appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {predictions.map((prediction) => (
            <Pressable
              key={prediction.id}
              onPress={() =>
                onPredictionPress?.(prediction)
              }
              disabled={!onPredictionPress}
              style={({ pressed }) => [
                styles.predictionItem,
                pressed &&
                  onPredictionPress &&
                  styles.predictionItemPressed,
              ]}
            >
              <View style={styles.topRow}>
                <View style={styles.cropIcon}>
                  <Sprout
                    size={19}
                    color="#059669"
                  />
                </View>

                <View style={styles.mainContent}>
                  <Text
                    style={styles.farmName}
                    numberOfLines={1}
                  >
                    {prediction.farm_name ||
                      "Unknown Farm"}
                  </Text>

                  <Text
                    style={styles.cropText}
                    numberOfLines={1}
                  >
                    {prediction.crop ||
                      "Unknown Crop"}
                    {" · "}
                    {prediction.season ||
                      "Unknown Season"}
                  </Text>
                </View>

                {onPredictionPress ? (
                  <ChevronRight
                    size={19}
                    color="#94A3B8"
                  />
                ) : null}
              </View>

              <View style={styles.yearRow}>
                <CalendarDays
                  size={14}
                  color="#64748B"
                />

                <Text style={styles.yearText}>
                  Crop year:{" "}
                  {prediction.crop_year || "—"}
                </Text>
              </View>

              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>
                    Predicted Yield
                  </Text>

                  <Text style={styles.metricValue}>
                    {formatNumber(
                      prediction.predicted_yield
                    )}{" "}
                    t/ha
                  </Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.metric}>
                  <Text style={styles.metricLabel}>
                    Production
                  </Text>

                  <Text style={styles.metricValue}>
                    {formatNumber(
                      prediction.estimated_production
                    )}{" "}
                    t
                  </Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  card: {
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: "#E2E8F0",

    shadowColor: "#0F172A",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EDE9FE",
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "800",
  },

  description: {
    marginTop: 4,
    color: "#64748B",
    fontSize: 12,
    lineHeight: 18,
  },

  countBadge: {
    minWidth: 32,
    height: 30,
    paddingHorizontal: 9,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  countText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "800",
  },

  list: {
    marginTop: 20,
    gap: 12,
  },

  predictionItem: {
    padding: 15,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  predictionItemPressed: {
    opacity: 0.75,
    backgroundColor: "#ECFDF5",
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  cropIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },

  mainContent: {
    flex: 1,
  },

  farmName: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },

  cropText: {
    marginTop: 3,
    color: "#64748B",
    fontSize: 12,
    fontWeight: "500",
  },

  yearRow: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  yearText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
  },

  metrics: {
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    backgroundColor: colors.white,
  },

  metric: {
    flex: 1,
  },

  metricLabel: {
    color: "#94A3B8",
    fontSize: 10,
    fontWeight: "600",
  },

  metricValue: {
    marginTop: 4,
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },

  divider: {
    width: 1,
    height: 34,
    marginHorizontal: 12,
    backgroundColor: "#E2E8F0",
  },

  emptyContainer: {
    minHeight: 210,
    marginTop: 18,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    backgroundColor: "#F8FAFC",
  },

  emptyTitle: {
    marginTop: 12,
    color: "#475569",
    fontSize: 15,
    fontWeight: "700",
  },

  emptyMessage: {
    marginTop: 5,
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
});


export default RecentPredictionsList;