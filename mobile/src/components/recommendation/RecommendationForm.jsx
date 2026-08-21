import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import {
  CalendarDays,
  Check,
  ChevronDown,
  MapPin,
  Sprout,
  Tractor,
  X,
} from "lucide-react-native";

import { colors } from "../../constants/colors";
import { farmService } from "../../services/farmService";

const SEASONS = [
  "Kharif",
  "Rabi",
  "Summer",
  "Whole Year",
  "Autumn",
  "Winter",
];

function extractFarms(response) {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.items)) {
    return response.items;
  }

  if (Array.isArray(response?.farms)) {
    return response.farms;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
}

function SelectionModal({
  visible,
  title,
  options,
  selectedValue,
  onSelect,
  onClose,
  getLabel,
  getValue,
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <X size={22} color={colors.textPrimary} />
            </Pressable>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.optionsContainer}
          >
            {options.map((option) => {
              const value = getValue(option);
              const label = getLabel(option);
              const selected =
                String(value) === String(selectedValue);

              return (
                <Pressable
                  key={String(value)}
                  style={[
                    styles.optionButton,
                    selected && styles.selectedOption,
                  ]}
                  onPress={() => {
                    onSelect(value);
                    onClose();
                  }}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selected && styles.selectedOptionText,
                    ]}
                  >
                    {label}
                  </Text>

                  {selected && (
                    <Check
                      size={19}
                      color={colors.primaryDark}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

export default function RecommendationForm({
  submitting = false,
  onSubmit,
}) {
  const [farms, setFarms] = useState([]);
  const [loadingFarms, setLoadingFarms] = useState(true);
  const [farmError, setFarmError] = useState("");

  const [farmId, setFarmId] = useState("");
  const [cropYear, setCropYear] = useState(
    String(new Date().getFullYear())
  );
  const [season, setSeason] = useState("");

  const [farmModalVisible, setFarmModalVisible] =
    useState(false);
  const [seasonModalVisible, setSeasonModalVisible] =
    useState(false);

  useEffect(() => {
    const loadFarms = async () => {
      try {
        setLoadingFarms(true);
        setFarmError("");

        const response = await farmService.getFarms();
        const loadedFarms = extractFarms(response);

        setFarms(
          loadedFarms.filter(
            (farm) => farm.is_active !== false
          )
        );
      } catch (_error) {
        setFarmError("Unable to load your farms.");
      } finally {
        setLoadingFarms(false);
      }
    };

    loadFarms();
  }, []);

  const selectedFarm = useMemo(
    () =>
      farms.find(
        (farm) => String(farm.id) === String(farmId)
      ),
    [farms, farmId]
  );

  const validationMessage = useMemo(() => {
    if (!farmId) {
      return "Please select a farm.";
    }

    const year = Number(cropYear);

    if (
      !Number.isInteger(year) ||
      year < 1990 ||
      year > 2100
    ) {
      return "Enter a valid crop year.";
    }

    if (!season) {
      return "Please select a season.";
    }

    return "";
  }, [farmId, cropYear, season]);

  const handleSubmit = () => {
    if (validationMessage || submitting) {
      return;
    }

    onSubmit?.({
      farm_id: Number(farmId),
      crop_year: Number(cropYear),
      season,
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <Sprout size={22} color={colors.primaryDark} />
        </View>

        <View style={styles.sectionHeaderText}>
          <Text style={styles.sectionTitle}>
            Recommendation Details
          </Text>

          <Text style={styles.sectionDescription}>
            Select the farm and cultivation period.
          </Text>
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Farm</Text>

        {loadingFarms ? (
          <View style={styles.loadingField}>
            <ActivityIndicator
              size="small"
              color={colors.primaryDark}
            />

            <Text style={styles.loadingText}>
              Loading farms...
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.selectInput}
            onPress={() => setFarmModalVisible(true)}
            disabled={farms.length === 0}
          >
            <View style={styles.selectValue}>
              <Tractor
                size={20}
                color={colors.textSecondary}
              />

              <Text
                style={[
                  styles.selectText,
                  !selectedFarm && styles.placeholderText,
                ]}
                numberOfLines={1}
              >
                {selectedFarm?.farm_name ??
                  "Select a farm"}
              </Text>
            </View>

            <ChevronDown
              size={20}
              color={colors.textSecondary}
            />
          </Pressable>
        )}

        {selectedFarm && (
          <View style={styles.farmSummary}>
            <MapPin
              size={16}
              color={colors.primaryDark}
            />

            <Text style={styles.farmSummaryText}>
              {[selectedFarm.village, selectedFarm.district, selectedFarm.state]
                .filter(Boolean)
                .join(", ")}
            </Text>
          </View>
        )}

        {farmError ? (
          <Text style={styles.errorText}>{farmError}</Text>
        ) : null}

        {!loadingFarms &&
          !farmError &&
          farms.length === 0 && (
            <Text style={styles.errorText}>
              No active farms found. Create a farm first.
            </Text>
          )}
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Crop Year</Text>

        <View style={styles.textInputContainer}>
          <CalendarDays
            size={20}
            color={colors.textSecondary}
          />

          <TextInput
            value={cropYear}
            onChangeText={(value) =>
              setCropYear(value.replace(/[^0-9]/g, ""))
            }
            placeholder="Enter crop year"
            placeholderTextColor={colors.textSecondary}
            keyboardType="number-pad"
            maxLength={4}
            style={styles.textInput}
          />
        </View>
      </View>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Season</Text>

        <Pressable
          style={styles.selectInput}
          onPress={() => setSeasonModalVisible(true)}
        >
          <View style={styles.selectValue}>
            <Sprout
              size={20}
              color={colors.textSecondary}
            />

            <Text
              style={[
                styles.selectText,
                !season && styles.placeholderText,
              ]}
            >
              {season || "Select a season"}
            </Text>
          </View>

          <ChevronDown
            size={20}
            color={colors.textSecondary}
          />
        </Pressable>
      </View>

      {validationMessage ? (
        <Text style={styles.validationText}>
          {validationMessage}
        </Text>
      ) : null}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          (pressed || submitting || validationMessage) &&
            styles.submitButtonDisabled,
        ]}
        disabled={
          submitting ||
          Boolean(validationMessage) ||
          farms.length === 0
        }
        onPress={handleSubmit}
      >
        {submitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Sprout size={20} color="#ffffff" />
        )}

        <Text style={styles.submitButtonText}>
          {submitting
            ? "Generating Recommendation..."
            : "Generate Recommendation"}
        </Text>
      </Pressable>

      <SelectionModal
        visible={farmModalVisible}
        title="Select Farm"
        options={farms}
        selectedValue={farmId}
        getValue={(farm) => farm.id}
        getLabel={(farm) => farm.farm_name}
        onSelect={setFarmId}
        onClose={() => setFarmModalVisible(false)}
      />

      <SelectionModal
        visible={seasonModalVisible}
        title="Select Season"
        options={SEASONS}
        selectedValue={season}
        getValue={(item) => item}
        getLabel={(item) => item}
        onSelect={setSeason}
        onClose={() => setSeasonModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 18,
    padding: 20,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  sectionIcon: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  sectionHeaderText: {
    flex: 1,
    marginLeft: 12,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  sectionDescription: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textSecondary,
  },

  fieldGroup: {
    marginTop: 20,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: colors.textPrimary,
  },

  selectInput: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
  },

  selectValue: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },

  selectText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  placeholderText: {
    color: colors.textSecondary,
    fontWeight: "500",
  },

  textInputContainer: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
  },

  textInput: {
    flex: 1,
    marginLeft: 10,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  loadingField: {
    minHeight: 54,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.background,
  },

  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },

  farmSummary: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  farmSummaryText: {
    flex: 1,
    marginLeft: 7,
    fontSize: 13,
    color: colors.textSecondary,
  },

  errorText: {
    marginTop: 8,
    fontSize: 13,
    color: "#b91c1c",
  },

  validationText: {
    marginTop: 16,
    fontSize: 13,
    color: "#b45309",
  },

  submitButton: {
    minHeight: 56,
    marginTop: 22,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primaryDark,
  },

  submitButtonDisabled: {
    opacity: 0.55,
  },

  submitButtonText: {
    marginLeft: 9,
    fontSize: 15,
    fontWeight: "800",
    color: "#ffffff",
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(15, 23, 42, 0.45)",
  },

  modalCard: {
    maxHeight: "70%",
    paddingBottom: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: colors.surface,
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: colors.textPrimary,
  },

  closeButton: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: colors.background,
  },

  optionsContainer: {
    padding: 16,
  },

  optionButton: {
    minHeight: 52,
    marginBottom: 9,
    paddingHorizontal: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
  },

  selectedOption: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primaryLight,
  },

  optionText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: colors.textPrimary,
  },

  selectedOptionText: {
    color: colors.primaryDark,
    fontWeight: "800",
  },
});