import { useState } from "react";
import { ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../hooks/useAuth";
import { datasetService } from "../../services/datasetService";
import DatasetUploadCard from "../../components/datasets/DatasetUploadCard";
import ImportResult from "../../components/datasets/ImportResult";
import DashboardLayout from "../../layouts/dashboard/DashboardLayout";

function DatasetUpload() {
  const { user, isAdmin } = useAuth();
  const [loadingType, setLoadingType] = useState(null);
  const [result, setResult] = useState(null);

  const uploadDataset = async (type, file) => {
    try {
      setLoadingType(type);
      setResult(null);

      let importResult;

      if (type === "historical") {
        importResult =
          await datasetService.importHistoricalYield(file);
      } else if (type === "soil") {
        importResult = await datasetService.importSoil(file);
      } else {
        importResult = await datasetService.importWeather(file);
      }

      setResult(importResult);
      toast.success("Dataset imported successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Dataset import failed"
      );
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dataset Import
        </h1>

        <p className="mt-2 max-w-3xl text-gray-600">
          Upload the approved historical yield, state soil, and state
          weather CSV files into PostgreSQL.
        </p>
      </div>

      {!isAdmin && user && (
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
          <ShieldAlert className="mt-0.5 shrink-0" size={22} />

          <div>
            <h2 className="font-bold">Admin access required</h2>
            <p className="mt-1 text-sm">
              Farmers can view datasets, but only administrators can
              upload or replace reference datasets.
            </p>
          </div>
        </div>
      )}

      {isAdmin && (
        <>
          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <DatasetUploadCard
              title="Historical Crop Yield"
              description="Primary crop production and yield reference dataset."
              expectedColumns={[
                "Crop",
                "Crop_Year",
                "Season",
                "State",
                "Area",
                "Production",
                "Annual_Rainfall",
                "Fertilizer",
                "Pesticide",
                "Yield",
              ]}
              loading={loadingType === "historical"}
              onUpload={(file) =>
                uploadDataset("historical", file)
              }
            />

            <DatasetUploadCard
              title="State Soil Reference"
              description="State-level nutrient and pH reference dataset."
              expectedColumns={["state", "N", "P", "K", "pH"]}
              loading={loadingType === "soil"}
              onUpload={(file) => uploadDataset("soil", file)}
            />

            <DatasetUploadCard
              title="State Weather Reference"
              description="State and year-level temperature, rainfall, and humidity data."
              expectedColumns={[
                "state",
                "year",
                "avg_temp_c",
                "total_rainfall_mm",
                "avg_humidity_percent",
              ]}
              loading={loadingType === "weather"}
              onUpload={(file) => uploadDataset("weather", file)}
            />
          </div>

          <ImportResult result={result} />
        </>
      )}
    </DashboardLayout>
  );
}

export default DatasetUpload;