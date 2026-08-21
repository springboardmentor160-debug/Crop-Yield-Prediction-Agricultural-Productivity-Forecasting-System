import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  CalendarDays,
  Check,
  ChevronDown,
  CloudRain,
  CloudSun,
  Droplets,
  FlaskConical,
  Leaf,
  Sprout,
  ThermometerSun,
  Tractor,
  X,
} from "lucide-react-native";

import AppButton from "../common/AppButton";
import AppInput from "../common/AppInput";
import PredictionFarmCard from "./PredictionFarmCard";

import { datasetService } from "../../services/datasetService";
import { farmService } from "../../services/farmService";
import { colors } from "../../constants/colors";
import { getErrorMessage } from "../../utils/errorMessage";

const currentYear = new Date().getFullYear();

const initialForm = {
  farm_id: "",
  crop: "",
  crop_year: String(currentYear),
  season: "",
  fertilizer: "",
  pesticide: "",
  annual_rainfall: "",
  average_temperature_c: "",
  total_rainfall_mm: "",
  average_humidity_percent: "",
};

export default function PredictionForm({
  onSubmit,
  submitting = false,
}) {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});

  const [farms, setFarms] = useState([]);
  const [cropOptions, setCropOptions] =
    useState([]);
  const [seasonOptions, setSeasonOptions] =
    useState([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [
    showAdvancedWeather,
    setShowAdvancedWeather,
  ] = useState(false);

  const [selector, setSelector] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setLoadingOptions(true);

        const [farmResult, datasetResult] =
          await Promise.all([
            farmService.getFarms({
              page: 1,
              page_size: 100,
              is_active: true,
            }),
            datasetService.getFarmOptions(),
          ]);

        if (!mounted) {
          return;
        }

        setFarms(farmResult.items || []);
        setCropOptions(
          datasetResult.crops || []
        );
        setSeasonOptions(
          datasetResult.seasons || []
        );
      } catch (error) {
        if (!mounted) {
          return;
        }

        Alert.alert(
          "Unable to load prediction options",
          getErrorMessage(
            error,
            "Prediction options could not be loaded."
          )
        );
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedFarm = useMemo(
    () =>
      farms.find(
        (farm) =>
          String(farm.id) === form.farm_id
      ) || null,
    [farms, form.farm_id]
  );

  const hasCustomWeatherValues = useMemo(
    () =>
      Boolean(
        form.annual_rainfall ||
          form.average_temperature_c ||
          form.total_rainfall_mm ||
          form.average_humidity_percent
      ),
    [
      form.annual_rainfall,
      form.average_temperature_c,
      form.total_rainfall_mm,
      form.average_humidity_percent,
    ]
  );

  useEffect(() => {
    if (
      !selectedFarm?.primary_crop ||
      form.crop ||
      cropOptions.length === 0
    ) {
      return;
    }

    const supportedCrop = cropOptions.some(
      (option) =>
        option.value ===
        selectedFarm.primary_crop
    );

    if (supportedCrop) {
      setForm((current) => ({
        ...current,
        crop: selectedFarm.primary_crop,
      }));
    }
  }, [
    selectedFarm,
    form.crop,
    cropOptions,
  ]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const handleFarmSelection = (value) => {
    setForm((current) => ({
      ...current,
      farm_id: value,
      crop: "",
    }));

    setErrors((current) => ({
      ...current,
      farm_id: "",
      crop: "",
    }));

    setSelector(null);
  };

  const openFarmSelector = () => {
    setSelector({
      title: "Select Active Farm",
      field: "farm_id",
      options: farms.map((farm) => ({
        value: String(farm.id),
        label: farm.farm_name,
        description: [
          farm.district,
          farm.state,
        ]
          .filter(Boolean)
          .join(", "),
      })),
    });
  };

  const openCropSelector = () => {
    setSelector({
      title: "Select Crop",
      field: "crop",
      options: cropOptions,
    });
  };

  const openSeasonSelector = () => {
    setSelector({
      title: "Select Season",
      field: "season",
      options: seasonOptions,
    });
  };

  const selectOption = (field, value) => {
    if (field === "farm_id") {
      handleFarmSelection(value);
      return;
    }

    updateField(field, value);
    setSelector(null);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.farm_id) {
      nextErrors.farm_id =
        "Select an active farm.";
    }

    if (!form.crop) {
      nextErrors.crop = "Select a crop.";
    }

    if (!form.season) {
      nextErrors.season =
        "Select a season.";
    }

    const cropYear = Number(form.crop_year);

    if (
      !Number.isInteger(cropYear) ||
      cropYear < 1990 ||
      cropYear > 2100
    ) {
      nextErrors.crop_year =
        "Year must be between 1990 and 2100.";
    }

    validateNonNegativeNumber(
      form.fertilizer,
      "fertilizer",
      nextErrors,
      "Enter a valid fertilizer amount."
    );

    validateNonNegativeNumber(
      form.pesticide,
      "pesticide",
      nextErrors,
      "Enter a valid pesticide amount."
    );

    validateOptionalNumber(
      form.annual_rainfall,
      "annual_rainfall",
      nextErrors,
      {
        minimum: 0,
        message:
          "Annual rainfall cannot be negative.",
      }
    );

    validateOptionalNumber(
      form.average_temperature_c,
      "average_temperature_c",
      nextErrors,
      {
        minimum: -50,
        maximum: 60,
        message:
          "Temperature must be between -50 and 60°C.",
      }
    );

    validateOptionalNumber(
      form.total_rainfall_mm,
      "total_rainfall_mm",
      nextErrors,
      {
        minimum: 0,
        message:
          "Total rainfall cannot be negative.",
      }
    );

    validateOptionalNumber(
      form.average_humidity_percent,
      "average_humidity_percent",
      nextErrors,
      {
        minimum: 0,
        maximum: 100,
        message:
          "Humidity must be between 0 and 100.",
      }
    );

    setErrors(nextErrors);

    const hasWeatherErrors = Boolean(
      nextErrors.annual_rainfall ||
        nextErrors.average_temperature_c ||
        nextErrors.total_rainfall_mm ||
        nextErrors.average_humidity_percent
    );

    if (hasWeatherErrors) {
      setShowAdvancedWeather(true);
    }

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert(
        "Check prediction details",
        "Please correct the highlighted fields."
      );

      return;
    }

    const payload = {
      farm_id: Number(form.farm_id),
      crop: form.crop,
      crop_year: Number(form.crop_year),
      season: form.season,
      fertilizer: Number(form.fertilizer),
      pesticide: Number(form.pesticide),

      annual_rainfall: toOptionalNumber(
        form.annual_rainfall
      ),

      average_temperature_c:
        toOptionalNumber(
          form.average_temperature_c
        ),

      total_rainfall_mm: toOptionalNumber(
        form.total_rainfall_mm
      ),

      average_humidity_percent:
        toOptionalNumber(
          form.average_humidity_percent
        ),
    };

    await onSubmit(payload);
  };

  const selectedFarmLabel =
    selectedFarm?.farm_name || "";

  return (
    <>
      <PredictionFarmCard farm={selectedFarm} />

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerIcon}>
            <Sprout
              size={23}
              color={colors.primary}
            />
          </View>

          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>
              Generate Prediction
            </Text>

            <Text style={styles.cardSubtitle}>
              Enter the farming details required by
              the AI model.
            </Text>
          </View>
        </View>

        {farms.length === 0 &&
        !loadingOptions ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              No active farms are available. Create
              or reactivate a farm before generating
              a prediction.
            </Text>
          </View>
        ) : null}

        <View style={styles.form}>
          <SelectorField
            label="Farm"
            required
            icon={Tractor}
            value={selectedFarmLabel}
            placeholder={
              loadingOptions
                ? "Loading farms..."
                : "Select active farm"
            }
            error={errors.farm_id}
            disabled={
              loadingOptions ||
              submitting ||
              farms.length === 0
            }
            onPress={openFarmSelector}
          />

          <SelectorField
            label="Crop"
            required
            icon={Sprout}
            value={form.crop}
            placeholder={
              !form.farm_id
                ? "Select a farm first"
                : loadingOptions
                  ? "Loading crops..."
                  : "Select crop"
            }
            error={errors.crop}
            disabled={
              loadingOptions ||
              submitting ||
              !form.farm_id
            }
            onPress={openCropSelector}
          />

          <SelectorField
            label="Season"
            required
            value={form.season}
            placeholder={
              loadingOptions
                ? "Loading seasons..."
                : "Select season"
            }
            error={errors.season}
            disabled={
              loadingOptions || submitting
            }
            onPress={openSeasonSelector}
          />

          <AppInput
            label="Prediction Year"
            required
            value={form.crop_year}
            onChangeText={(value) =>
              updateField("crop_year", value)
            }
            keyboardType="number-pad"
            placeholder="Example: 2026"
            editable={!submitting}
            error={errors.crop_year}
            leftIcon={
              <CalendarDays
                size={19}
                color={colors.textSecondary}
              />
            }
          />

          <AppInput
            label="Fertilizer"
            required
            value={form.fertilizer}
            onChangeText={(value) =>
              updateField("fertilizer", value)
            }
            keyboardType="decimal-pad"
            placeholder="Example: 1250 kg"
            editable={!submitting}
            error={errors.fertilizer}
            leftIcon={
              <FlaskConical
                size={19}
                color={colors.textSecondary}
              />
            }
          />

          <Text style={styles.helpText}>
            Enter the fertilizer amount using the
            same unit used in your agricultural
            records.
          </Text>

          <AppInput
            label="Pesticide"
            required
            value={form.pesticide}
            onChangeText={(value) =>
              updateField("pesticide", value)
            }
            keyboardType="decimal-pad"
            placeholder="Example: 25 kg"
            editable={!submitting}
            error={errors.pesticide}
            leftIcon={
              <Leaf
                size={19}
                color={colors.textSecondary}
              />
            }
          />

          <Text style={styles.helpText}>
            Soil values are obtained automatically
            from the selected farm&apos;s state.
            Weather values come from reference data
            unless you provide custom values below.
          </Text>

          <View style={styles.weatherCard}>
            <Pressable
              disabled={submitting}
              onPress={() =>
                setShowAdvancedWeather(
                  (current) => !current
                )
              }
              style={({ pressed }) => [
                styles.weatherHeader,
                pressed &&
                  !submitting &&
                  styles.pressed,
              ]}
            >
              <View style={styles.weatherHeaderLeft}>
                <View style={styles.weatherIconBox}>
                  <CloudSun
                    size={21}
                    color="#1D4ED8"
                  />
                </View>

                <View
                  style={styles.weatherHeaderText}
                >
                  <Text style={styles.weatherTitle}>
                    Advanced Weather Inputs
                  </Text>

                  <Text
                    style={styles.weatherSubtitle}
                  >
                    Optional. Leave empty to use
                    reference weather data.
                  </Text>

                  <View
                    style={[
                      styles.weatherStatus,
                      hasCustomWeatherValues
                        ? styles.customWeatherStatus
                        : styles.referenceWeatherStatus,
                    ]}
                  >
                    <Check
                      size={13}
                      color={
                        hasCustomWeatherValues
                          ? "#1D4ED8"
                          : colors.primaryDark
                      }
                    />

                    <Text
                      style={[
                        styles.weatherStatusText,
                        hasCustomWeatherValues
                          ? styles.customWeatherStatusText
                          : styles.referenceWeatherStatusText,
                      ]}
                    >
                      {hasCustomWeatherValues
                        ? "Using custom weather values"
                        : "Using reference weather data"}
                    </Text>
                  </View>
                </View>
              </View>

              <ChevronDown
                size={20}
                color={colors.textSecondary}
                style={{
                  transform: [
                    {
                      rotate: showAdvancedWeather
                        ? "180deg"
                        : "0deg",
                    },
                  ],
                }}
              />
            </Pressable>

            {showAdvancedWeather ? (
              <View style={styles.weatherFields}>
                <AppInput
                  label="Annual Rainfall"
                  value={form.annual_rainfall}
                  onChangeText={(value) =>
                    updateField(
                      "annual_rainfall",
                      value
                    )
                  }
                  keyboardType="decimal-pad"
                  placeholder="Example: 950 mm"
                  editable={!submitting}
                  error={errors.annual_rainfall}
                  leftIcon={
                    <CloudRain
                      size={19}
                      color={
                        colors.textSecondary
                      }
                    />
                  }
                />

                <AppInput
                  label="Average Temperature (°C)"
                  value={
                    form.average_temperature_c
                  }
                  onChangeText={(value) =>
                    updateField(
                      "average_temperature_c",
                      value
                    )
                  }
                  keyboardType="numbers-and-punctuation"
                  placeholder="Example: 27.5°C"
                  editable={!submitting}
                  error={
                    errors.average_temperature_c
                  }
                  leftIcon={
                    <ThermometerSun
                      size={19}
                      color={
                        colors.textSecondary
                      }
                    />
                  }
                />

                <AppInput
                  label="Total Rainfall (mm)"
                  value={form.total_rainfall_mm}
                  onChangeText={(value) =>
                    updateField(
                      "total_rainfall_mm",
                      value
                    )
                  }
                  keyboardType="decimal-pad"
                  placeholder="Example: 940 mm"
                  editable={!submitting}
                  error={
                    errors.total_rainfall_mm
                  }
                  leftIcon={
                    <CloudRain
                      size={19}
                      color={
                        colors.textSecondary
                      }
                    />
                  }
                />

                <AppInput
                  label="Average Humidity (%)"
                  value={
                    form.average_humidity_percent
                  }
                  onChangeText={(value) =>
                    updateField(
                      "average_humidity_percent",
                      value
                    )
                  }
                  keyboardType="decimal-pad"
                  placeholder="Example: 72%"
                  editable={!submitting}
                  error={
                    errors.average_humidity_percent
                  }
                  leftIcon={
                    <Droplets
                      size={19}
                      color={
                        colors.textSecondary
                      }
                    />
                  }
                />
              </View>
            ) : null}
          </View>

          <AppButton
            title={
              submitting
                ? "Generating Prediction..."
                : "Generate Prediction"
            }
            onPress={handleSubmit}
            loading={submitting}
            disabled={
              submitting ||
              loadingOptions ||
              farms.length === 0
            }
          />
        </View>
      </View>

      <OptionSelectorModal
        selector={selector}
        selectedValue={
          selector
            ? form[selector.field]
            : ""
        }
        onClose={() => setSelector(null)}
        onSelect={selectOption}
      />
    </>
  );
}

function SelectorField({
  label,
  required = false,
  icon: Icon,
  value,
  placeholder,
  error,
  disabled,
  onPress,
}) {
  return (
    <View>
      <Text style={styles.label}>
        {label}

        {required ? (
          <Text style={styles.required}>
            {" "}
            *
          </Text>
        ) : null}
      </Text>

      <Pressable
        disabled={disabled}
        onPress={onPress}
        style={({ pressed }) => [
          styles.selectorField,
          error && styles.errorBorder,
          disabled && styles.disabledField,
          pressed &&
            !disabled &&
            styles.pressedField,
        ]}
      >
        {Icon ? (
          <Icon
            size={19}
            color={colors.textSecondary}
          />
        ) : null}

        <Text
          style={[
            styles.selectorText,
            !value &&
              styles.selectorPlaceholder,
          ]}
          numberOfLines={1}
        >
          {value || placeholder}
        </Text>

        <ChevronDown
          size={19}
          color={colors.textSecondary}
        />
      </Pressable>

      {error ? (
        <Text style={styles.errorText}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

function OptionSelectorModal({
  selector,
  selectedValue,
  onClose,
  onSelect,
}) {
  return (
    <Modal
      visible={Boolean(selector)}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Pressable
          style={styles.modalBackdrop}
          onPress={onClose}
        />

        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {selector?.title ||
                "Select Option"}
            </Text>

            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <X
                size={21}
                color={colors.text}
              />
            </Pressable>
          </View>

          <ScrollView
            style={styles.optionList}
            showsVerticalScrollIndicator={false}
          >
            {(selector?.options || []).map(
              (option) => {
                const selected =
                  option.value ===
                  selectedValue;

                return (
                  <Pressable
                    key={String(option.value)}
                    onPress={() =>
                      onSelect(
                        selector.field,
                        option.value
                      )
                    }
                    style={({ pressed }) => [
                      styles.optionRow,
                      selected &&
                        styles.selectedOptionRow,
                      pressed &&
                        styles.pressedOptionRow,
                    ]}
                  >
                    <View style={styles.optionText}>
                      <Text
                        style={[
                          styles.optionLabel,
                          selected &&
                            styles.selectedOptionLabel,
                        ]}
                      >
                        {option.label}
                      </Text>

                      {option.description ? (
                        <Text
                          style={
                            styles.optionDescription
                          }
                        >
                          {option.description}
                        </Text>
                      ) : null}
                    </View>

                    {selected ? (
                      <Check
                        size={20}
                        color={colors.primary}
                      />
                    ) : null}
                  </Pressable>
                );
              }
            )}

            {(selector?.options || []).length ===
            0 ? (
              <Text style={styles.noOptions}>
                No options are available.
              </Text>
            ) : null}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function validateNonNegativeNumber(
  value,
  field,
  errors,
  message
) {
  const number = Number(value);

  if (
    value === "" ||
    Number.isNaN(number) ||
    number < 0
  ) {
    errors[field] = message;
  }
}

function validateOptionalNumber(
  value,
  field,
  errors,
  {
    minimum,
    maximum,
    message,
  }
) {
  if (value === "") {
    return;
  }

  const number = Number(value);

  if (
    Number.isNaN(number) ||
    number < minimum ||
    (maximum != null && number > maximum)
  ) {
    errors[field] = message;
  }
}

function toOptionalNumber(value) {
  return value === ""
    ? null
    : Number(value);
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 18,
  },

  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },

  headerIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  headerText: {
    flex: 1,
    marginLeft: 12,
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },

  warningBox: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: "#FCD34D",
    borderRadius: 14,
    backgroundColor: "#FFFBEB",
    padding: 14,
  },

  warningText: {
    fontSize: 13,
    lineHeight: 20,
    color: "#92400E",
  },

  form: {
    marginTop: 22,
    gap: 16,
  },

  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: "700",
    color: colors.text,
  },

  required: {
    color: colors.danger,
  },

  selectorField: {
    minHeight: 54,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
  },

  disabledField: {
    backgroundColor: "#F3F4F6",
    opacity: 0.65,
  },

  pressedField: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },

  errorBorder: {
    borderColor: colors.danger,
  },

  selectorText: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
  },

  selectorPlaceholder: {
    color: colors.textSecondary,
  },

  errorText: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: colors.danger,
  },

  helpText: {
    marginTop: -9,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  weatherCard: {
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 18,
    backgroundColor: "#EFF6FF",
  },

  weatherHeader: {
    minHeight: 92,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 14,
  },

  weatherHeaderLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 12,
  },

  weatherIconBox: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  weatherHeaderText: {
    flex: 1,
    marginLeft: 11,
  },

  weatherTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: colors.text,
  },

  weatherSubtitle: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 17,
    color: colors.textSecondary,
  },

  weatherStatus: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },

  referenceWeatherStatus: {
    backgroundColor: "#DCFCE7",
  },

  customWeatherStatus: {
    backgroundColor: "#DBEAFE",
  },

  weatherStatusText: {
    fontSize: 10,
    fontWeight: "800",
  },

  referenceWeatherStatusText: {
    color: colors.primaryDark,
  },

  customWeatherStatusText: {
    color: "#1D4ED8",
  },

  weatherFields: {
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: "#BFDBFE",
    padding: 14,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },

  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
  },

  modalSheet: {
    maxHeight: "72%",
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    backgroundColor: colors.surface,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 28,
  },

  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 15,
  },

  modalTitle: {
    flex: 1,
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  closeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },

  optionList: {
    marginTop: 8,
  },

  optionRow: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },

  selectedOptionRow: {
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
  },

  pressedOptionRow: {
    opacity: 0.7,
  },

  optionText: {
    flex: 1,
    paddingRight: 12,
  },

  optionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.text,
  },

  selectedOptionLabel: {
    color: colors.primaryDark,
  },

  optionDescription: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  noOptions: {
    paddingVertical: 30,
    textAlign: "center",
    color: colors.textSecondary,
  },

  pressed: {
    opacity: 0.72,
  },
});