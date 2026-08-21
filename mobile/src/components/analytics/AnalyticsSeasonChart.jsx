import {
  CalendarRange,
  Sprout,
} from "lucide-react-native";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";


function formatYield(value) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return "0.00";
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}


function AnalyticsSeasonChart({
  seasons = [],
}) {
  const normalizedSeasons = seasons.map(
    (item) => ({
      season: item?.season || "Unknown",
      predictionCount: Number(
        item?.prediction_count || 0
      ),
      averageYield: Number(
        item?.average_yield || 0
      ),
    })
  );

  const totalPredictions =
    normalizedSeasons.reduce(
      (total, item) =>
        total + item.predictionCount,
      0
    );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <CalendarRange
            size={21}
            color="#D97706"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Season Analytics
          </Text>

          <Text style={styles.description}>
            Prediction distribution across farming
            seasons.
          </Text>
        </View>
      </View>

      {normalizedSeasons.length === 0 ? (
        <View style={styles.emptyContainer}>
          <CalendarRange
            size={36}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No season data
          </Text>

          <Text style={styles.emptyMessage}>
            Seasonal insights will appear after
            predictions are generated.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {normalizedSeasons.map((item) => {
            const percentage =
              totalPredictions > 0
                ? (item.predictionCount /
                    totalPredictions) *
                  100
                : 0;

            return (
              <View
                key={item.season}
                style={styles.seasonItem}
              >
                <View style={styles.itemHeader}>
                  <View style={styles.seasonNameRow}>
                    <View
                      style={styles.smallIcon}
                    >
                      <Sprout
                        size={15}
                        color="#059669"
                      />
                    </View>

                    <Text
                      style={styles.seasonName}
                      numberOfLines={1}
                    >
                      {item.season}
                    </Text>
                  </View>

                  <Text style={styles.percentage}>
                    {percentage.toFixed(1)}%
                  </Text>
                </View>

                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${percentage}%`,
                      },
                    ]}
                  />
                </View>

                <View style={styles.detailsRow}>
                  <Text style={styles.detailText}>
                    {item.predictionCount.toLocaleString(
                      "en-IN"
                    )}{" "}
                    predictions
                  </Text>

                  <Text style={styles.detailText}>
                    {formatYield(
                      item.averageYield
                    )}{" "}
                    t/ha
                  </Text>
                </View>
              </View>
            );
          })}
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
    backgroundColor: "#FEF3C7",
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

  list: {
    marginTop: 20,
    gap: 14,
  },

  seasonItem: {
    padding: 15,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#F8FAFC",
  },

  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  seasonNameRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
  },

  smallIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#D1FAE5",
  },

  seasonName: {
    flex: 1,
    color: "#1E293B",
    fontSize: 14,
    fontWeight: "700",
  },

  percentage: {
    color: "#0F172A",
    fontSize: 13,
    fontWeight: "800",
  },

  progressTrack: {
    height: 8,
    marginTop: 13,
    overflow: "hidden",
    borderRadius: 999,
    backgroundColor: "#E2E8F0",
  },

  progressBar: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#10B981",
  },

  detailsRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },

  detailText: {
    color: "#64748B",
    fontSize: 11,
    fontWeight: "600",
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


export default AnalyticsSeasonChart;