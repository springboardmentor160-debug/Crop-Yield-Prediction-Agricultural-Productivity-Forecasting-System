from __future__ import annotations

import json
import logging
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib
from azure.storage.blob import BlobServiceClient
from sklearn.pipeline import Pipeline

from app.core.config import settings

BACKEND_ROOT = Path(__file__).resolve().parents[1]

MODEL_ARTIFACT_PATH = (
    BACKEND_ROOT
    / "ml"
    / "artifacts"
    / "yield_prediction_pipeline.joblib"
)

MODEL_METADATA_PATH = (
    BACKEND_ROOT
    / "ml"
    / "artifacts"
    / "model_metadata.json"
)

EXPECTED_FEATURES = [
    "Crop_Year",
    "Area",
    "Annual_Rainfall",
    "Fertilizer",
    "Pesticide",
    "N",
    "P",
    "K",
    "pH",
    "avg_temp_c",
    "total_rainfall_mm",
    "avg_humidity_percent",
    "Crop",
    "Season",
    "State",
]

logger = logging.getLogger(
    "yieldsense.ml.model_loader"
)

@dataclass(frozen=True)
class YieldModelBundle:
    pipeline: Pipeline
    metadata: dict[str, Any]

    @property
    def model_name(self) -> str:
        return str(
            self.metadata.get(
                "model_name",
                "Unknown model",
            )
        )

    @property
    def model_version(self) -> str:
        return str(
            self.metadata.get(
                "model_version",
                "unknown",
            )
        )

    @property
    def features(self) -> list[str]:
        return list(
            self.metadata.get(
                "features",
                [],
            )
        )


def _validate_model_files() -> None:
    if not MODEL_ARTIFACT_PATH.exists():
        _download_model_from_azure()

    if not MODEL_ARTIFACT_PATH.exists():
        raise FileNotFoundError(
            "Yield prediction model artifact was not found: "
            f"{MODEL_ARTIFACT_PATH}"
        )

def _download_model_from_azure() -> None:
    """
    Download the production model from Azure Blob Storage
    when it is not already available locally.
    """
    if MODEL_ARTIFACT_PATH.exists():
        return

    connection_string = (
        settings.AZURE_STORAGE_CONNECTION_STRING
    )

    if not connection_string:
        raise RuntimeError(
            "Production model is missing locally and "
            "AZURE_STORAGE_CONNECTION_STRING is not configured."
        )

    MODEL_ARTIFACT_PATH.parent.mkdir(
        parents=True,
        exist_ok=True,
    )

    logger.info(
        "Downloading YieldSense production model "
        "from Azure Blob Storage"
    )

    try:
        blob_service_client = (
            BlobServiceClient.from_connection_string(
                connection_string
            )
        )

        blob_client = blob_service_client.get_blob_client(
            container=(
                settings.AZURE_STORAGE_CONTAINER_NAME
            ),
            blob=(
                settings.AZURE_ML_MODEL_BLOB_NAME
            ),
        )

        downloader = blob_client.download_blob()

        with MODEL_ARTIFACT_PATH.open("wb") as file:
            downloader.readinto(file)

    except Exception as exc:
        if MODEL_ARTIFACT_PATH.exists():
            MODEL_ARTIFACT_PATH.unlink()

        raise RuntimeError(
            "The YieldSense AI production model "
            "could not be downloaded from Azure Blob Storage."
        ) from exc

    logger.info(
        "YieldSense production model downloaded successfully"
    )

def _load_metadata() -> dict[str, Any]:
    try:
        metadata = json.loads(
            MODEL_METADATA_PATH.read_text(
                encoding="utf-8",
            )
        )
    except json.JSONDecodeError as exc:
        raise RuntimeError(
            "The model metadata file contains invalid JSON."
        ) from exc

    if not isinstance(metadata, dict):
        raise RuntimeError(
            "The model metadata must contain a JSON object."
        )

    return metadata


def _validate_metadata(
    metadata: dict[str, Any],
) -> None:
    required_keys = [
        "model_name",
        "model_type",
        "model_version",
        "features",
        "target",
        "target_transformation",
        "prediction_inverse_transformation",
    ]

    missing_keys = [
        key
        for key in required_keys
        if key not in metadata
    ]

    if missing_keys:
        raise RuntimeError(
            "Model metadata is missing required keys: "
            f"{missing_keys}"
        )

    metadata_features = metadata.get("features")

    if metadata_features != EXPECTED_FEATURES:
        raise RuntimeError(
            "Model feature order does not match the "
            "application feature order.\n"
            f"Expected: {EXPECTED_FEATURES}\n"
            f"Received: {metadata_features}"
        )

    if metadata.get("target_transformation") != "log1p":
        raise RuntimeError(
            "Unsupported model target transformation."
        )

    if (
        metadata.get(
            "prediction_inverse_transformation"
        )
        != "expm1"
    ):
        raise RuntimeError(
            "Unsupported prediction inverse transformation."
        )


@lru_cache(maxsize=1)
def get_yield_model() -> YieldModelBundle:
    """
    Load the production model once per backend process.

    The lru_cache prevents the large Random Forest artifact
    from being read from disk for every prediction request.
    """
    _validate_model_files()

    metadata = _load_metadata()
    _validate_metadata(metadata)

    try:
        pipeline = joblib.load(
            MODEL_ARTIFACT_PATH
        )
    except Exception as exc:
        raise RuntimeError(
            "The YieldSense AI production model "
            "could not be loaded."
        ) from exc

    if not isinstance(pipeline, Pipeline):
        raise RuntimeError(
            "The production artifact is not a valid "
            "Scikit-learn Pipeline."
        )

    required_steps = {
        "preprocessor",
        "model",
    }

    pipeline_steps = set(
        pipeline.named_steps.keys()
    )

    if not required_steps.issubset(
        pipeline_steps
    ):
        raise RuntimeError(
            "The production pipeline is missing required "
            "preprocessor or model steps."
        )

    return YieldModelBundle(
        pipeline=pipeline,
        metadata=metadata,
    )


def clear_yield_model_cache() -> None:
    """
    Useful for automated tests or intentional model reloads.
    """
    get_yield_model.cache_clear()