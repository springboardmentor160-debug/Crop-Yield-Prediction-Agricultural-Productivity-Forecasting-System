import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import {
  ArrowLeft,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  History,
  Plus,
} from "lucide-react-native";

import ScreenContainer from "../../src/components/common/ScreenContainer";
import PredictionHistoryCard from "../../src/components/prediction/PredictionHistoryCard";

import { predictionService } from "../../src/services/predictionService";
import { colors } from "../../src/constants/colors";
import { getErrorMessage } from "../../src/utils/errorMessage";

const PAGE_SIZE = 10;

export default function PredictionHistoryScreen() {
  const [predictions, setPredictions] =
    useState([]);

  const [page, setPage] = useState(1);

  const [pagination, setPagination] =
    useState({
      total: 0,
      total_pages: 0,
    });

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [exportingFormat, setExportingFormat] =
    useState("");

  const loadPredictions = useCallback(
    async ({ refresh = false } = {}) => {
      try {
        if (refresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const result =
          await predictionService.getPredictions({
            page,
            page_size: PAGE_SIZE,
          });

        setPredictions(result.items || []);

        setPagination({
          total: result.total || 0,
          total_pages: result.total_pages || 0,
        });
      } catch (error) {
        Alert.alert(
          "Unable to load predictions",
          getErrorMessage(
            error,
            "Prediction history could not be loaded."
          )
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [page]
  );

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  const handleExport = async (format) => {
    try {
      setExportingFormat(format);

      if (format === "csv") {
        await predictionService.exportPredictionsCsv();
      } else {
        await predictionService.exportPredictionsPdf();
      }

      Alert.alert(
        "Success",
        `${format.toUpperCase()} report exported successfully.`
      );
    } catch (error) {
      Alert.alert(
        "Export Failed",
        getErrorMessage(
          error,
          `Unable to export ${format.toUpperCase()} report.`
        )
      );
    } finally {
      setExportingFormat("");
    }
  };

  return (
    <ScreenContainer
      contentStyle={styles.screenContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() =>
            loadPredictions({
              refresh: true,
            })
          }
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft
            size={22}
            color={colors.text}
          />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.title}>
            Prediction History
          </Text>

          <Text style={styles.subtitle}>
            Review saved crop-yield forecasts
          </Text>
        </View>

        <Pressable
          onPress={() =>
            router.push(
              "/(protected)/prediction"
            )
          }
          style={styles.addButton}
        >
          <Plus
            size={22}
            color={colors.surface}
          />
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryIcon}>
          <BrainCircuit
            size={24}
            color={colors.primary}
          />
        </View>

        <View style={styles.summaryText}>
          <Text style={styles.summaryValue}>
            {pagination.total}
          </Text>

          <Text style={styles.summaryLabel}>
            Saved prediction
            {pagination.total === 1 ? "" : "s"}
          </Text>
        </View>

        <History
          size={28}
          color={colors.textSecondary}
        />
      </View>

      <View style={styles.exportRow}>
        <Pressable
          disabled={
            loading ||
            exportingFormat !== "" ||
            predictions.length === 0
          }
          onPress={() => handleExport("csv")}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && styles.pressed,
            (loading ||
              exportingFormat !== "" ||
              predictions.length === 0) &&
              styles.disabledButton,
          ]}
        >
          <FileSpreadsheet
            size={18}
            color={colors.primary}
          />

          <Text style={styles.exportButtonText}>
            {exportingFormat === "csv"
              ? "Exporting..."
              : "CSV"}
          </Text>
        </Pressable>

        <Pressable
          disabled={
            loading ||
            exportingFormat !== "" ||
            predictions.length === 0
          }
          onPress={() => handleExport("pdf")}
          style={({ pressed }) => [
            styles.exportButton,
            pressed && styles.pressed,
            (loading ||
              exportingFormat !== "" ||
              predictions.length === 0) &&
              styles.disabledButton,
          ]}
        >
          <FileText
            size={18}
            color="#DC2626"
          />

          <Text
            style={[
              styles.exportButtonText,
              { color: "#DC2626" },
            ]}
          >
            {exportingFormat === "pdf"
              ? "Exporting..."
              : "PDF"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.records}>
        {loading ? (
          <View style={styles.messageCard}>
            <Text style={styles.messageText}>
              Loading prediction history...
            </Text>
          </View>
        ) : predictions.length === 0 ? (
          <View style={styles.emptyCard}>
            <History
              size={42}
              color={colors.primary}
            />

            <Text style={styles.emptyTitle}>
              No predictions yet
            </Text>

            <Text style={styles.emptyText}>
              Generate your first crop-yield
              prediction to see it here.
            </Text>

            <Pressable
              onPress={() =>
                router.push(
                  "/(protected)/prediction"
                )
              }
              style={({ pressed }) => [
                styles.generateButton,
                pressed && styles.pressed,
              ]}
            >
              <Text style={styles.generateText}>
                Generate Prediction
              </Text>
            </Pressable>
          </View>
        ) : (
          predictions.map((prediction) => (
            <PredictionHistoryCard
              key={prediction.id}
              prediction={prediction}
              onPress={() =>
                router.push({
                  pathname:
                    "/(protected)/prediction-details",
                  params: {
                    predictionId: String(
                      prediction.id
                    ),
                  },
                })
              }
            />
          ))
        )}
      </View>

      {pagination.total_pages > 1 ? (
        <View style={styles.pagination}>
          <Pressable
            disabled={page <= 1 || loading}
            onPress={() =>
              setPage((current) =>
                Math.max(1, current - 1)
              )
            }
            style={({ pressed }) => [
              styles.pageButton,
              (page <= 1 || loading) &&
                styles.disabledButton,
              pressed &&
                page > 1 &&
                !loading &&
                styles.pressed,
            ]}
          >
            <ChevronLeft
              size={19}
              color={colors.primary}
            />
          </Pressable>

          <Text style={styles.pageText}>
            Page {page} of{" "}
            {pagination.total_pages}
          </Text>

          <Pressable
            disabled={
              page >= pagination.total_pages ||
              loading
            }
            onPress={() =>
              setPage((current) =>
                Math.min(
                  pagination.total_pages,
                  current + 1
                )
              )
            }
            style={({ pressed }) => [
              styles.pageButton,
              (page >=
                pagination.total_pages ||
                loading) &&
                styles.disabledButton,
              pressed &&
                page <
                  pagination.total_pages &&
                !loading &&
                styles.pressed,
            ]}
          >
            <ChevronRight
              size={19}
              color={colors.primary}
            />
          </Pressable>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingBottom: 36,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
    marginLeft: 13,
  },

  title: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.text,
  },

  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textSecondary,
  },

  addButton: {
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primary,
  },

  summaryCard: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 17,
  },

  summaryIcon: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
    backgroundColor: colors.primaryLight,
  },

  summaryText: {
    flex: 1,
    marginLeft: 12,
  },

  summaryValue: {
    fontSize: 24,
    fontWeight: "900",
    color: colors.primaryDark,
  },

  summaryLabel: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textSecondary,
  },

  records: {
    marginTop: 18,
    gap: 14,
  },

  messageCard: {
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: colors.surface,
    paddingVertical: 34,
  },

  messageText: {
    color: colors.textSecondary,
  },

  emptyCard: {
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    backgroundColor: colors.surface,
    padding: 28,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: "800",
    color: colors.text,
  },

  emptyText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 13,
    lineHeight: 20,
    color: colors.textSecondary,
  },

  generateButton: {
    marginTop: 18,
    borderRadius: 13,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },

  generateText: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.surface,
  },

  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 18,
    marginTop: 22,
  },

  pageButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: 13,
    backgroundColor: colors.surface,
  },

  disabledButton: {
    opacity: 0.35,
  },

  pageText: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.textSecondary,
  },

  pressed: {
    opacity: 0.7,
  },

  exportRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 14,
  },

  exportButton: {
    flex: 1,
    minHeight: 50,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 12,
  },

  exportButtonText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: "800",
    color: colors.primary,
  },

  pdfExportText: {
    color: "#DC2626",
  },
});