import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import FarmForm from "../../src/components/farms/FarmForm";

import { farmService } from "../../src/services/farmService";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

export default function CreateFarmScreen() {
  const [loading, setLoading] = useState(false);

  const handleCreateFarm = async (payload) => {
    try {
      setLoading(true);

      const createdFarm = await farmService.createFarm(payload);

      Alert.alert(
        "Farm created",
        "The farm was created successfully.",
        [
          {
            text: "View Farm",
            onPress: () =>
              router.replace({
                pathname: "/(protected)/farm-details",
                params: {
                  farmId: String(createdFarm.id),
                },
              }),
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Unable to create farm",
        getErrorMessage(
          error,
          "The farm could not be created."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer contentStyle={styles.screenContent}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={22} color={colors.text} />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.pageTitle}>Create Farm</Text>

          <Text style={styles.pageSubtitle}>
            Register a farm under your account
          </Text>
        </View>
      </View>

      <FarmForm
        onSubmit={handleCreateFarm}
        loading={loading}
        submitTitle="Create Farm"
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
});