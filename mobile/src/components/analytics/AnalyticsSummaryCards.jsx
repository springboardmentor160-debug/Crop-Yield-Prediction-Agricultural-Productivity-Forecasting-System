import {
  Activity,
  BarChart3,
  Sprout,
  Tractor,
} from "lucide-react-native";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { colors } from "../../constants/colors";


function formatNumber(value, decimals = 2) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return Number(0).toFixed(decimals);
  }

  return number.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}


function AnalyticsSummaryCards({ summary }) {
  const cards = [
    {
      title: "Total Predictions",
      value: Number(
        summary?.total_predictions || 0
      ).toLocaleString("en-IN"),
      description: "Predictions generated",
      icon: BarChart3,
      iconBackground: "#EDE9FE",
      iconColor: "#7C3AED",
    },
    {
      title: "Active Farms",
      value: Number(
        summary?.active_farms || 0
      ).toLocaleString("en-IN"),
      description: "Currently active farms",
      icon: Tractor,
      iconBackground: "#FEF3C7",
      iconColor: "#D97706",
    },
    {
      title: "Average Yield",
      value: `${formatNumber(
        summary?.average_predicted_yield
      )} t/ha`,
      description: "Average predicted yield",
      icon: Sprout,
      iconBackground: "#D1FAE5",
      iconColor: "#059669",
    },
    {
      title: "Average Production",
      value: `${formatNumber(
        summary?.average_estimated_production
      )} t`,
      description: "Average estimated production",
      icon: Activity,
      iconBackground: "#E0F2FE",
      iconColor: "#0284C7",
    },
  ];

  return (
    <View style={styles.grid}>
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <View
            key={card.title}
            style={styles.card}
          >
            <View
              style={[
                styles.iconContainer,
                {
                  backgroundColor:
                    card.iconBackground,
                },
              ]}
            >
              <Icon
                size={21}
                color={card.iconColor}
                strokeWidth={2.2}
              />
            </View>

            <Text style={styles.title}>
              {card.title}
            </Text>

            <Text
              style={styles.value}
              numberOfLines={2}
            >
              {card.value}
            </Text>

            <Text style={styles.description}>
              {card.description}
            </Text>
          </View>
        );
      })}
    </View>
  );
}


const styles = StyleSheet.create({
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },

  card: {
    width: "48%",
    minHeight: 165,
    padding: 16,
    borderRadius: 20,
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

  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginTop: 14,
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
  },

  value: {
    marginTop: 7,
    color: "#0F172A",
    fontSize: 21,
    lineHeight: 27,
    fontWeight: "800",
  },

  description: {
    marginTop: 6,
    color: "#94A3B8",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: "500",
  },
});


export default AnalyticsSummaryCards;