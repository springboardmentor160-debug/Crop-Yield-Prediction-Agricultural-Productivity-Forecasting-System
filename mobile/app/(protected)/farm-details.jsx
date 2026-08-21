import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from "expo-router";
import {
  ArrowLeft,
  CalendarDays,
  Droplets,
  Edit3,
  MapPinned,
  Navigation,
  Power,
  PowerOff,
  Ruler,
  Sprout,
  Trash2,
  Tractor,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import AppButton from "../../src/components/common/AppButton";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import FarmStatusBadge from "../../src/components/farms/FarmStatusBadge";

import { farmService } from "../../src/services/farmService";
import { colors } from "../../src/constants/colors";
import { commonStyles } from "../../src/styles/commonStyles";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function FarmDetailsScreen() {
  const params = useLocalSearchParams();

  const farmId =
    typeof params.farmId === "string"
      ? Number(params.farmId)
      : Number(params.farmId?.[0]);

  const [farm, setFarm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadFarm = useCallback(async () => {
    if (!Number.isInteger(farmId) || farmId <= 0) {
      Alert.alert(
        "Invalid farm",
        "The selected farm ID is invalid.",
        [
          {
            text: "Back to Farms",
            onPress: () =>
              router.replace("/(protected)/farms"),
          },
        ]
      );

      return;
    }

    try {
      setLoading(true);

      const result = await farmService.getFarm(farmId);
      setFarm(result);
    } catch (error) {
      Alert.alert(
        "Unable to load farm",
        getErrorMessage(
          error,
          "Farm information could not be loaded."
        ),
        [
          {
            text: "Back to Farms",
            onPress: () =>
              router.replace("/(protected)/farms"),
          },
        ]
      );
    } finally {
      setLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  useFocusEffect(
    useCallback(() => {
      if (farmId) {
        loadFarm();
      }
    }, [farmId, loadFarm])
  );

  const deactivateFarm = async () => {
    try {
      setActionLoading(true);

      const updatedFarm =
        await farmService.deactivateFarm(farm.id);

      setFarm(updatedFarm);

      Alert.alert(
        "Farm deactivated",
        "The farm is now inactive and will not appear in the default active farm list."
      );
    } catch (error) {
      Alert.alert(
        "Unable to deactivate farm",
        getErrorMessage(
          error,
          "The farm could not be deactivated."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Farm",
      "The farm will remain stored, but its status will become inactive.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Deactivate",
          onPress: deactivateFarm,
        },
      ]
    );
  };

  const reactivateFarm = async () => {
    try {
      setActionLoading(true);

      const updatedFarm =
        await farmService.reactivateFarm(farm.id);

      setFarm(updatedFarm);

      Alert.alert(
        "Farm reactivated",
        "The farm is active again."
      );
    } catch (error) {
      Alert.alert(
        "Unable to reactivate farm",
        getErrorMessage(
          error,
          "The farm could not be reactivated."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleReactivate = () => {
    Alert.alert(
      "Reactivate Farm",
      "Return this farm to the active farm list?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Reactivate",
          onPress: reactivateFarm,
        },
      ]
    );
  };

  const softDeleteFarm = async () => {
    try {
      setActionLoading(true);

      const updatedFarm =
        await farmService.softDeleteFarm(farm.id);

      setFarm(updatedFarm);

      Alert.alert(
        "Farm moved to inactive records",
        "The farm was soft deleted and remains safely stored."
      );
    } catch (error) {
      Alert.alert(
        "Unable to delete farm",
        getErrorMessage(
          error,
          "The farm could not be deleted."
        )
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleSoftDelete = () => {
    Alert.alert(
      "Delete Farm",
      "This will not permanently erase the farm. It will be moved to inactive records.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: softDeleteFarm,
        },
      ]
    );
  };

  if (loading) {
    return <LoadingScreen message="Loading farm details..." />;
  }

  if (!farm) {
    return (
      <ScreenContainer>
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableTitle}>
            Farm information unavailable
          </Text>

          <AppButton
            title="Back to Farms"
            onPress={() =>
              router.replace("/(protected)/farms")
            }
            style={styles.unavailableButton}
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.pageTitle}>Farm Details</Text>

          <Text style={styles.pageSubtitle}>
            View and manage this farm
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push({
              pathname: "/(protected)/edit-farm",
              params: {
                farmId: String(farm.id),
              },
            })
          }
          style={styles.editButton}
          hitSlop={8}
        >
          <Edit3 size={21} color={colors.surface} />
        </Pressable>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIcon}>
            <Tractor size={30} color={colors.surface} />
          </View>

          <FarmStatusBadge isActive={farm.is_active} />
        </View>

        <Text style={styles.farmName}>{farm.farm_name}</Text>

        <View style={styles.locationRow}>
          <MapPinned size={16} color="#DCFCE7" />

          <Text style={styles.locationText}>
            {farm.village ? `${farm.village}, ` : ""}
            {farm.district}, {farm.state}
          </Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryItem
          icon={<Ruler size={22} color={colors.primary} />}
          label="Farm Area"
          value={`${farm.area_hectares} ha`}
        />

        <SummaryItem
          icon={<Sprout size={22} color={colors.primary} />}
          label="Primary Crop"
          value={farm.primary_crop || "Not provided"}
        />

        <SummaryItem
          icon={<Tractor size={22} color={colors.primary} />}
          label="Soil Type"
          value={farm.soil_type || "Not provided"}
        />

        <SummaryItem
          icon={<Droplets size={22} color={colors.primary} />}
          label="Irrigation"
          value={farm.irrigation_type || "Not provided"}
        />
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <View style={styles.sectionHeading}>
          <MapPinned size={22} color={colors.primary} />
          <Text style={commonStyles.sectionTitle}>
            Location Details
          </Text>
        </View>

        <DetailRow label="State" value={farm.state} />
        <DetailRow label="District" value={farm.district} />
        <DetailRow
          label="Village"
          value={farm.village || "Not provided"}
          hideDivider
        />
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <View style={styles.sectionHeading}>
          <Navigation size={22} color={colors.primary} />
          <Text style={commonStyles.sectionTitle}>
            Farm Coordinates
          </Text>
        </View>

        <DetailRow
          label="Latitude"
          value={
            farm.latitude != null
              ? String(farm.latitude)
              : "Not provided"
          }
        />

        <DetailRow
          label="Longitude"
          value={
            farm.longitude != null
              ? String(farm.longitude)
              : "Not provided"
          }
          hideDivider
        />
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <View style={styles.sectionHeading}>
          <CalendarDays size={22} color={colors.primary} />
          <Text style={commonStyles.sectionTitle}>
            Record Information
          </Text>
        </View>

        <DetailRow label="Farm ID" value={String(farm.id)} />
        <DetailRow
          label="Owner ID"
          value={String(farm.owner_id)}
        />
        <DetailRow
          label="Created"
          value={formatDate(farm.created_at)}
        />
        <DetailRow
          label="Last Updated"
          value={formatDate(farm.updated_at)}
          hideDivider
        />
      </View>

      <View style={[commonStyles.card, styles.section]}>
        <Text style={commonStyles.sectionTitle}>Farm Actions</Text>

        <Text style={styles.actionDescription}>
          <Text style={styles.actionDescription}>
            {"Edit farm details or change the farm's active status."}
          </Text>
        </Text>

        <View style={styles.actionButtons}>
          <AppButton
            title="Edit Farm"
            onPress={() =>
              router.push({
                pathname: "/(protected)/edit-farm",
                params: {
                  farmId: String(farm.id),
                },
              })
            }
            icon={<Edit3 size={19} color={colors.surface} />}
          />

          {farm.is_active ? (
            <>
              <AppButton
                title="Deactivate Farm"
                variant="outline"
                loading={actionLoading}
                onPress={handleDeactivate}
                icon={
                  <PowerOff size={19} color={colors.primary} />
                }
              />

              <AppButton
                title="Delete Farm"
                variant="danger"
                loading={actionLoading}
                onPress={handleSoftDelete}
                icon={<Trash2 size={19} color={colors.surface} />}
              />
            </>
          ) : (
            <AppButton
              title="Reactivate Farm"
              loading={actionLoading}
              onPress={handleReactivate}
              icon={<Power size={19} color={colors.surface} />}
            />
          )}
        </View>
      </View>
    </ScreenContainer>
  );
}

function SummaryItem({ icon, label, value }) {
  return (
    <View style={styles.summaryItem}>
      <View style={styles.summaryIcon}>{icon}</View>

      <Text style={styles.summaryLabel}>{label}</Text>

      <Text
        style={styles.summaryValue}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function DetailRow({ label, value, hideDivider = false }) {
  return (
    <View
      style={[
        styles.detailRow,
        hideDivider && styles.lastDetailRow,
      ]}
    >
      <Text style={styles.detailLabel}>{label}</Text>

      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function formatDate(value) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleString();
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 30,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
  },

  backButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  headerText: {
    flex: 1,
    marginLeft: 14,
  },

  pageTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: colors.text,
  },

  pageSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  editButton: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  heroCard: {
    borderRadius: 22,
    backgroundColor: colors.primary,
    padding: 22,
  },

  heroTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  heroIcon: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.primaryDark,
  },

  farmName: {
    marginTop: 18,
    fontSize: 25,
    fontWeight: "800",
    color: colors.surface,
  },

  locationRow: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },

  locationText: {
    flex: 1,
    fontSize: 14,
    color: "#DCFCE7",
  },

  summaryGrid: {
    marginTop: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  summaryItem: {
    width: "48%",
    minHeight: 135,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  summaryIcon: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.primaryLight,
  },

  summaryLabel: {
    marginTop: 12,
    fontSize: 12,
    color: colors.textSecondary,
  },

  summaryValue: {
    marginTop: 4,
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  section: {
    marginTop: 18,
  },

  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    marginBottom: 12,
  },

  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingVertical: 14,
  },

  lastDetailRow: {
    borderBottomWidth: 0,
    paddingBottom: 0,
  },

  detailLabel: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  detailValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  actionDescription: {
    marginTop: 7,
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  actionButtons: {
    marginTop: 18,
    gap: 12,
  },

  unavailableCard: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 28,
  },

  unavailableTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.text,
  },

  unavailableButton: {
    marginTop: 18,
  },
});