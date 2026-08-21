import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Droplets,
  MapPinned,
  Sprout,
  Tractor,
} from "lucide-react-native";

import { colors } from "../../constants/colors";
import FarmStatusBadge from "./FarmStatusBadge";

function FarmCard({
  farm,
  onPress,
  showOwner = false,
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.pressed,
      ]}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Tractor size={24} color={colors.primary} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.name}>{farm.farm_name}</Text>

          <View style={styles.locationRow}>
            <MapPinned size={14} color={colors.textSecondary} />

            <Text style={styles.location} numberOfLines={1}>
              {farm.village ? `${farm.village}, ` : ""}
              {farm.district}, {farm.state}
            </Text>
          </View>
        </View>

        <FarmStatusBadge isActive={farm.is_active} />
      </View>

      {showOwner ? (
        <View style={styles.ownerContainer}>
          <Text style={styles.ownerLabel}>Owner</Text>
          <Text style={styles.ownerName}>{farm.owner_name}</Text>
          <Text style={styles.ownerEmail}>{farm.owner_email}</Text>
        </View>
      ) : null}

      <View style={styles.metrics}>
        <Metric
          label="Area"
          value={`${farm.area_hectares} ha`}
        />

        <Metric
          label="Primary Crop"
          value={farm.primary_crop || "Not provided"}
          icon={<Sprout size={14} color={colors.textSecondary} />}
        />

        <Metric
          label="Irrigation"
          value={farm.irrigation_type || "Not provided"}
          icon={<Droplets size={14} color={colors.textSecondary} />}
        />
      </View>
    </Pressable>
  );
}

function Metric({ label, value, icon }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricLabelRow}>
        {icon}
        <Text style={styles.metricLabel}>{label}</Text>
      </View>

      <Text style={styles.metricValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
  },

  iconContainer: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  heading: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  name: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text,
  },

  locationRow: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  location: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
  },

  ownerContainer: {
    marginTop: 14,
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    padding: 13,
  },

  ownerLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  ownerName: {
    marginTop: 3,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },

  ownerEmail: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },

  metrics: {
    marginTop: 16,
    gap: 10,
  },

  metric: {
    borderRadius: 13,
    backgroundColor: "#F8FAFC",
    padding: 12,
  },

  metricLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },

  metricLabel: {
    fontSize: 11,
    color: colors.textSecondary,
  },

  metricValue: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "800",
    color: colors.text,
  },
});

export default FarmCard;