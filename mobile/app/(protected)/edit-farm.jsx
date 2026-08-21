import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import LoadingScreen from "../../src/components/common/LoadingScreen";
import FarmForm from "../../src/components/farms/FarmForm";

import { farmService } from "../../src/services/farmService";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function EditFarmScreen() {
  const params = useLocalSearchParams();

  const farmId =
    typeof params.farmId === "string"
      ? Number(params.farmId)
      : Number(params.farmId?.[0]);

  const [farm, setFarm] = useState(null);
  const [screenLoading, setScreenLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      setScreenLoading(true);

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
      setScreenLoading(false);
    }
  }, [farmId]);

  useEffect(() => {
    loadFarm();
  }, [loadFarm]);

  const handleUpdateFarm = async (payload) => {
    try {
      setSubmitting(true);

      const updatedFarm = await farmService.updateFarm(
        farmId,
        payload
      );

      Alert.alert(
        "Farm updated",
        "Farm information was updated successfully.",
        [
          {
            text: "View Farm",
            onPress: () =>
              router.replace({
                pathname: "/(protected)/farm-details",
                params: {
                  farmId: String(updatedFarm.id),
                },
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Unable to update farm",
        getErrorMessage(
          error,
          "Farm information could not be updated."
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (screenLoading) {
    return <LoadingScreen message="Loading farm information..." />;
  }

  if (!farm) {
    return (
      <ScreenContainer>
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableTitle}>
            Farm information unavailable
          </Text>
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
          <Text style={styles.pageTitle}>Edit Farm</Text>

          <Text style={styles.pageSubtitle}>
            Update {farm.farm_name}
          </Text>
        </View>
      </View>

      <FarmForm
        initialValues={farm}
        onSubmit={handleUpdateFarm}
        loading={submitting}
        submitTitle="Update Farm"
      />
    </ScreenContainer>
  );
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
});