import { BarChart3 } from "lucide-react-native";
import {
  ScrollView,
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


function AnalyticsBarChart({
  title,
  description,
  data = [],
  labelKey,
  valueKey = "prediction_count",
  emptyMessage = "No analytics data available.",
}) {
  const normalizedData = data.map((item) => ({
    label:
      item?.[labelKey] || "Unknown",
    value: Number(
      item?.[valueKey] || 0
    ),
    averageYield: Number(
      item?.average_yield || 0
    ),
  }));

  const maximumValue = Math.max(
    ...normalizedData.map(
      (item) => item.value
    ),
    1
  );

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <BarChart3
            size={21}
            color="#059669"
          />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            {title}
          </Text>

          <Text style={styles.description}>
            {description}
          </Text>
        </View>
      </View>

      {normalizedData.length === 0 ? (
        <View style={styles.emptyContainer}>
          <BarChart3
            size={36}
            color="#CBD5E1"
          />

          <Text style={styles.emptyTitle}>
            No data available
          </Text>

          <Text style={styles.emptyMessage}>
            {emptyMessage}
          </Text>
        </View>
      ) : (
        <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chartScroll}
        contentContainerStyle={styles.chartContent}
        >
          {normalizedData.map((item) => {
            const barHeight = Math.max(
              (item.value / maximumValue) * 150,
              10
            );

            return (
              <View
                key={item.label}
                style={styles.barItem}
              >
                <Text style={styles.value}>
                  {item.value.toLocaleString(
                    "en-IN"
                  )}
                </Text>

                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barHeight,
                      },
                    ]}
                  />
                </View>

                <Text
                  style={styles.label}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>

                <Text style={styles.yield}>
                  {formatYield(
                    item.averageYield
                  )}{" "}
                  t/ha
                </Text>
              </View>
            );
          })}
        </ScrollView>
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
    backgroundColor: "#D1FAE5",
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

  chartScroll: {
  width: "100%",
  marginTop: 18,
},

chartContent: {
  flexGrow: 1,
  minHeight: 245,
  alignItems: "flex-end",
  justifyContent: "space-around",
  paddingTop: 8,
  paddingBottom: 4,
  paddingHorizontal: 12,
},

  barItem: {
    width: 76,
    alignItems: "center",
  },

  value: {
    marginBottom: 8,
    color: "#334155",
    fontSize: 11,
    fontWeight: "700",
  },

  barTrack: {
    width: 34,
    height: 150,
    justifyContent: "flex-end",
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#ECFDF5",
  },

  bar: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#10B981",
  },

  label: {
    minHeight: 32,
    marginTop: 9,
    color: "#334155",
    fontSize: 11,
    lineHeight: 15,
    textAlign: "center",
    fontWeight: "700",
  },

  yield: {
    marginTop: 3,
    color: "#94A3B8",
    fontSize: 9,
    textAlign: "center",
    fontWeight: "600",
  },

  emptyContainer: {
    minHeight: 220,
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


export default AnalyticsBarChart;