import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  Droplets,
  MapPinned,
  Navigation,
  Sprout,
  Tractor,
} from "lucide-react-native";

import AppButton from "../common/AppButton";
import AppInput from "../common/AppInput";

import { colors } from "../../constants/colors";
import { commonStyles } from "../../styles/commonStyles";

const emptyForm = {
  farm_name: "",
  state: "",
  district: "",
  village: "",
  area_hectares: "",
  soil_type: "",
  primary_crop: "",
  irrigation_type: "",
  latitude: "",
  longitude: "",
};

function FarmForm({
  initialValues,
  onSubmit,
  loading = false,
  submitTitle = "Save Farm",
}) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!initialValues) {
      return;
    }

    setForm({
      farm_name: initialValues.farm_name || "",
      state: initialValues.state || "",
      district: initialValues.district || "",
      village: initialValues.village || "",
      area_hectares:
        initialValues.area_hectares != null
          ? String(initialValues.area_hectares)
          : "",
      soil_type: initialValues.soil_type || "",
      primary_crop: initialValues.primary_crop || "",
      irrigation_type: initialValues.irrigation_type || "",
      latitude:
        initialValues.latitude != null
          ? String(initialValues.latitude)
          : "",
      longitude:
        initialValues.longitude != null
          ? String(initialValues.longitude)
          : "",
    });
  }, [initialValues]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const farmName = form.farm_name.trim();
    const state = form.state.trim();
    const district = form.district.trim();
    const area = Number(form.area_hectares);

    if (farmName.length < 2) {
      Alert.alert(
        "Invalid farm name",
        "Farm name must contain at least two characters."
      );
      return;
    }

    if (state.length < 2) {
      Alert.alert("Missing state", "Enter the farm state.");
      return;
    }

    if (district.length < 2) {
      Alert.alert("Missing district", "Enter the farm district.");
      return;
    }

    if (
      !form.area_hectares.trim() ||
      Number.isNaN(area) ||
      area <= 0
    ) {
      Alert.alert(
        "Invalid farm area",
        "Area must be greater than zero hectares."
      );
      return;
    }

    let latitude = null;
    let longitude = null;

    if (form.latitude.trim()) {
      latitude = Number(form.latitude);

      if (
        Number.isNaN(latitude) ||
        latitude < -90 ||
        latitude > 90
      ) {
        Alert.alert(
          "Invalid latitude",
          "Latitude must be between -90 and 90."
        );
        return;
      }
    }

    if (form.longitude.trim()) {
      longitude = Number(form.longitude);

      if (
        Number.isNaN(longitude) ||
        longitude < -180 ||
        longitude > 180
      ) {
        Alert.alert(
          "Invalid longitude",
          "Longitude must be between -180 and 180."
        );
        return;
      }
    }

    await onSubmit({
      farm_name: farmName,
      state,
      district,
      village: form.village.trim() || null,
      area_hectares: area,
      soil_type: form.soil_type.trim() || null,
      primary_crop: form.primary_crop.trim() || null,
      irrigation_type:
        form.irrigation_type.trim() || null,
      latitude,
      longitude,
    });
  };

  return (
    <View style={[commonStyles.card, styles.container]}>
      <View style={styles.heading}>
        <View style={styles.headingIcon}>
          <Tractor size={25} color={colors.primary} />
        </View>

        <View style={styles.headingText}>
          <Text style={styles.title}>Farm Information</Text>

          <Text style={styles.subtitle}>
            Enter location, area, soil, crop, irrigation, and
            coordinate details.
          </Text>
        </View>
      </View>

      <View style={[commonStyles.form, styles.section]}>
        <AppInput
          label="Farm name *"
          placeholder="Example: Green Valley Farm"
          value={form.farm_name}
          onChangeText={(value) =>
            updateField("farm_name", value)
          }
          autoCapitalize="words"
        />

        <AppInput
          label="Area in hectares *"
          placeholder="Example: 4.5"
          value={form.area_hectares}
          onChangeText={(value) =>
            updateField(
              "area_hectares",
              value.replace(/[^0-9.]/g, "")
            )
          }
          keyboardType="decimal-pad"
        />
      </View>

      <SectionTitle
        title="Location"
        icon={<MapPinned size={20} color={colors.primary} />}
      />

      <View style={commonStyles.form}>
        <AppInput
          label="State *"
          placeholder="Example: Karnataka"
          value={form.state}
          onChangeText={(value) => updateField("state", value)}
          autoCapitalize="words"
        />

        <AppInput
          label="District *"
          placeholder="Example: Mysuru"
          value={form.district}
          onChangeText={(value) =>
            updateField("district", value)
          }
          autoCapitalize="words"
        />

        <AppInput
          label="Village"
          placeholder="Example: Nanjangud"
          value={form.village}
          onChangeText={(value) =>
            updateField("village", value)
          }
          autoCapitalize="words"
        />
      </View>

      <SectionTitle
        title="Agricultural Details"
        icon={<Sprout size={20} color={colors.primary} />}
      />

      <View style={commonStyles.form}>
        <AppInput
          label="Soil type"
          placeholder="Example: Red Soil"
          value={form.soil_type}
          onChangeText={(value) =>
            updateField("soil_type", value)
          }
          autoCapitalize="words"
        />

        <AppInput
          label="Primary crop"
          placeholder="Example: Rice"
          value={form.primary_crop}
          onChangeText={(value) =>
            updateField("primary_crop", value)
          }
          autoCapitalize="words"
        />

        <AppInput
          label="Irrigation type"
          placeholder="Example: Canal, Drip, Rainfed"
          value={form.irrigation_type}
          onChangeText={(value) =>
            updateField("irrigation_type", value)
          }
          autoCapitalize="words"
          leftIcon={
            <Droplets size={20} color={colors.textSecondary} />
          }
        />
      </View>

      <SectionTitle
        title="Farm Coordinates"
        subtitle="Optional now; useful later for weather integration."
        icon={<Navigation size={20} color={colors.primary} />}
      />

      <View style={commonStyles.form}>
        <AppInput
          label="Latitude"
          placeholder="Between -90 and 90"
          value={form.latitude}
          onChangeText={(value) =>
            updateField(
              "latitude",
              value.replace(/[^0-9.-]/g, "")
            )
          }
          keyboardType="numbers-and-punctuation"
        />

        <AppInput
          label="Longitude"
          placeholder="Between -180 and 180"
          value={form.longitude}
          onChangeText={(value) =>
            updateField(
              "longitude",
              value.replace(/[^0-9.-]/g, "")
            )
          }
          keyboardType="numbers-and-punctuation"
        />

        <AppButton
          title={submitTitle}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </View>
  );
}

function SectionTitle({ title, subtitle, icon }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionTitleRow}>
        {icon}
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>

      {subtitle ? (
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },

  heading: {
    flexDirection: "row",
    alignItems: "center",
  },

  headingIcon: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 15,
    backgroundColor: colors.primaryLight,
  },

  headingText: {
    flex: 1,
    marginLeft: 13,
  },

  title: {
    fontSize: 20,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
  },

  section: {
    marginTop: 22,
  },

  sectionHeading: {
    marginTop: 25,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text,
  },

  sectionSubtitle: {
    marginTop: 5,
    fontSize: 12,
    lineHeight: 18,
    color: colors.textSecondary,
  },
});

export default FarmForm;