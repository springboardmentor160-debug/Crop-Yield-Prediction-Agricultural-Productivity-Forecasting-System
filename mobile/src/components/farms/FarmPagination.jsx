import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";

import { colors } from "../../constants/colors";

function FarmPagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  disabled = false,
}) {
  if (!total) {
    return null;
  }

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <View style={styles.container}>
      <Text style={styles.resultText}>
        {start}–{end} of {total}
      </Text>

      <View style={styles.controls}>
        <Pressable
          disabled={disabled || page <= 1}
          onPress={() => onPageChange(page - 1)}
          style={[
            styles.button,
            (disabled || page <= 1) && styles.disabled,
          ]}
        >
          <ChevronLeft size={19} color={colors.text} />
        </Pressable>

        <Text style={styles.pageText}>
          {page} / {totalPages || 1}
        </Text>

        <Pressable
          disabled={disabled || page >= totalPages}
          onPress={() => onPageChange(page + 1)}
          style={[
            styles.button,
            (disabled || page >= totalPages) &&
              styles.disabled,
          ]}
        >
          <ChevronRight size={19} color={colors.text} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderRadius: 16,
    backgroundColor: colors.surface,
    padding: 14,
  },

  resultText: {
    fontSize: 13,
    color: colors.textSecondary,
  },

  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  button: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.surface,
  },

  disabled: {
    opacity: 0.35,
  },

  pageText: {
    minWidth: 48,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "700",
    color: colors.text,
  },
});

export default FarmPagination;