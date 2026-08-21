import math
from io import BytesIO
from typing import Any

import pandas as pd
from pandas.errors import ParserError
from sqlalchemy.orm import Session

from app.models.agriculture import (
    HistoricalCropYield,
    StateSoilReference,
    StateWeatherReference,
)


class DatasetImportException(Exception):
    pass


def normalize_column_name(column: Any) -> str:
    """
    Converts CSV headings into predictable lowercase names.

    Examples:
    Crop_Year        -> crop_year
    Annual Rainfall  -> annual_rainfall
    pH               -> ph
    """
    return (
        str(column)
        .strip()
        .lower()
        .replace(" ", "_")
        .replace("-", "_")
        .replace(".", "")
    )


def normalize_text(value: Any) -> str:
    if pd.isna(value):
        return ""

    return " ".join(str(value).strip().split())


def normalize_state(value: Any) -> str:
    return normalize_text(value).title()


def normalize_crop(value: Any) -> str:
    return normalize_text(value).title()


def normalize_season(value: Any) -> str:
    return normalize_text(value).title()


def to_float(
    value: Any,
    field_name: str,
    required: bool = True,
) -> float | None:
    if pd.isna(value) or str(value).strip() == "":
        if required:
            raise ValueError(f"{field_name} is required")
        return None

    try:
        number = float(value)
    except (TypeError, ValueError) as error:
        raise ValueError(
            f"{field_name} must be numeric"
        ) from error

    if math.isnan(number) or math.isinf(number):
        raise ValueError(f"{field_name} contains an invalid number")

    return number


def to_integer(value: Any, field_name: str) -> int:
    number = to_float(value, field_name)

    if number is None or not float(number).is_integer():
        raise ValueError(f"{field_name} must be a whole number")

    return int(number)


def read_csv_file(file_content: bytes) -> pd.DataFrame:
    if not file_content:
        raise DatasetImportException("The uploaded CSV file is empty.")

    try:
        dataframe = pd.read_csv(BytesIO(file_content))
    except UnicodeDecodeError:
        try:
            dataframe = pd.read_csv(
                BytesIO(file_content),
                encoding="latin-1",
            )
        except (UnicodeDecodeError, ParserError, ValueError) as error:
            raise DatasetImportException(
                f"Unable to decode CSV file: {error}"
            ) from error
    except (ParserError, ValueError) as error:
            raise DatasetImportException(
                f"Unable to read CSV file: {error}"
            ) from error

    if dataframe.empty:
        raise DatasetImportException(
            "The uploaded CSV does not contain any data rows."
        )

    dataframe.columns = [
        normalize_column_name(column)
        for column in dataframe.columns
    ]

    # Remove accidental unnamed index columns.
    dataframe = dataframe.loc[
        :,
        ~dataframe.columns.str.startswith("unnamed"),
    ]

    return dataframe


def validate_columns(
    dataframe: pd.DataFrame,
    required_columns: set[str],
) -> None:
    available_columns = set(dataframe.columns)
    missing_columns = required_columns - available_columns

    if missing_columns:
        missing_text = ", ".join(sorted(missing_columns))

        raise DatasetImportException(
            f"Missing required CSV columns: {missing_text}"
        )


def import_historical_crop_yield(
    db: Session,
    file_content: bytes,
) -> dict:
    dataframe = read_csv_file(file_content)

    required_columns = {
        "crop",
        "crop_year",
        "season",
        "state",
        "area",
        "production",
        "annual_rainfall",
        "fertilizer",
        "pesticide",
        "yield",
    }

    validate_columns(dataframe, required_columns)

    inserted_rows = 0
    skipped_rows = 0
    invalid_rows = 0
    errors = []

    for dataframe_index, row in dataframe.iterrows():
        csv_row_number = int(dataframe_index) + 2

        try:
            crop = normalize_crop(row["crop"])
            crop_year = to_integer(row["crop_year"], "Crop_Year")
            season = normalize_season(row["season"])
            state = normalize_state(row["state"])

            if not crop:
                raise ValueError("Crop is required")

            if not season:
                raise ValueError("Season is required")

            if not state:
                raise ValueError("State is required")

            area = to_float(row["area"], "Area")
            production = to_float(row["production"], "Production")
            annual_rainfall = to_float(
                row["annual_rainfall"],
                "Annual_Rainfall",
                required=False,
            )
            fertilizer = to_float(
                row["fertilizer"],
                "Fertilizer",
                required=False,
            )
            pesticide = to_float(
                row["pesticide"],
                "Pesticide",
                required=False,
            )
            yield_value = to_float(row["yield"], "Yield")

            if area is not None and area < 0:
                raise ValueError("Area cannot be negative")

            if production is not None and production < 0:
                raise ValueError("Production cannot be negative")

            existing_record = (
                db.query(HistoricalCropYield)
                .filter(
                    HistoricalCropYield.crop == crop,
                    HistoricalCropYield.crop_year == crop_year,
                    HistoricalCropYield.season == season,
                    HistoricalCropYield.state == state,
                    HistoricalCropYield.area == area,
                )
                .first()
            )

            if existing_record:
                skipped_rows += 1
                continue

            record = HistoricalCropYield(
                crop=crop,
                crop_year=crop_year,
                season=season,
                state=state,
                area=area,
                production=production,
                annual_rainfall=annual_rainfall,
                fertilizer=fertilizer,
                pesticide=pesticide,
                yield_value=yield_value,
            )

            db.add(record)
            inserted_rows += 1

        except ValueError as error:
            invalid_rows += 1
            errors.append(
                {
                    "row_number": csv_row_number,
                    "message": str(error),
                }
            )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "dataset": "historical_crop_yield",
        "total_rows": len(dataframe),
        "inserted_rows": inserted_rows,
        "updated_rows": 0,
        "skipped_rows": skipped_rows,
        "invalid_rows": invalid_rows,
        "errors": errors[:100],
    }


def import_state_soil(
    db: Session,
    file_content: bytes,
) -> dict:
    dataframe = read_csv_file(file_content)

    required_columns = {
        "state",
        "n",
        "p",
        "k",
        "ph",
    }

    validate_columns(dataframe, required_columns)

    inserted_rows = 0
    updated_rows = 0
    skipped_rows = 0
    invalid_rows = 0
    errors = []

    for dataframe_index, row in dataframe.iterrows():
        csv_row_number = int(dataframe_index) + 2

        try:
            state = normalize_state(row["state"])

            if not state:
                raise ValueError("State is required")

            nitrogen = to_float(row["n"], "N")
            phosphorus = to_float(row["p"], "P")
            potassium = to_float(row["k"], "K")
            ph = to_float(row["ph"], "pH")

            if ph is not None and not 0 <= ph <= 14:
                raise ValueError("pH must be between 0 and 14")

            existing_record = (
                db.query(StateSoilReference)
                .filter(StateSoilReference.state == state)
                .first()
            )

            if existing_record:
                values_unchanged = (
                    existing_record.nitrogen == nitrogen
                    and existing_record.phosphorus == phosphorus
                    and existing_record.potassium == potassium
                    and existing_record.ph == ph
                )

                if values_unchanged:
                    skipped_rows += 1
                    continue

                existing_record.nitrogen = nitrogen
                existing_record.phosphorus = phosphorus
                existing_record.potassium = potassium
                existing_record.ph = ph

                updated_rows += 1
                continue

            record = StateSoilReference(
                state=state,
                nitrogen=nitrogen,
                phosphorus=phosphorus,
                potassium=potassium,
                ph=ph,
            )

            db.add(record)
            inserted_rows += 1

        except ValueError as error:
            invalid_rows += 1
            errors.append(
                {
                    "row_number": csv_row_number,
                    "message": str(error),
                }
            )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "dataset": "state_soil",
        "total_rows": len(dataframe),
        "inserted_rows": inserted_rows,
        "updated_rows": updated_rows,
        "skipped_rows": skipped_rows,
        "invalid_rows": invalid_rows,
        "errors": errors[:100],
    }


def import_state_weather(
    db: Session,
    file_content: bytes,
) -> dict:
    dataframe = read_csv_file(file_content)

    required_columns = {
        "state",
        "year",
        "avg_temp_c",
        "total_rainfall_mm",
        "avg_humidity_percent",
    }

    validate_columns(dataframe, required_columns)

    inserted_rows = 0
    updated_rows = 0
    skipped_rows = 0
    invalid_rows = 0
    errors = []

    for dataframe_index, row in dataframe.iterrows():
        csv_row_number = int(dataframe_index) + 2

        try:
            state = normalize_state(row["state"])
            year = to_integer(row["year"], "Year")

            if not state:
                raise ValueError("State is required")

            avg_temp_c = to_float(
                row["avg_temp_c"],
                "avg_temp_c",
            )
            total_rainfall_mm = to_float(
                row["total_rainfall_mm"],
                "total_rainfall_mm",
            )
            avg_humidity_percent = to_float(
                row["avg_humidity_percent"],
                "avg_humidity_percent",
            )

            if total_rainfall_mm is not None and total_rainfall_mm < 0:
                raise ValueError(
                    "Total rainfall cannot be negative"
                )

            if (
                avg_humidity_percent is not None
                and not 0 <= avg_humidity_percent <= 100
            ):
                raise ValueError(
                    "Average humidity must be between 0 and 100"
                )

            existing_record = (
                db.query(StateWeatherReference)
                .filter(
                    StateWeatherReference.state == state,
                    StateWeatherReference.year == year,
                )
                .first()
            )

            if existing_record:
                values_unchanged = (
                    existing_record.avg_temp_c == avg_temp_c
                    and existing_record.total_rainfall_mm
                    == total_rainfall_mm
                    and existing_record.avg_humidity_percent
                    == avg_humidity_percent
                )

                if values_unchanged:
                    skipped_rows += 1
                    continue

                existing_record.avg_temp_c = avg_temp_c
                existing_record.total_rainfall_mm = (
                    total_rainfall_mm
                )
                existing_record.avg_humidity_percent = (
                    avg_humidity_percent
                )

                updated_rows += 1
                continue

            record = StateWeatherReference(
                state=state,
                year=year,
                avg_temp_c=avg_temp_c,
                total_rainfall_mm=total_rainfall_mm,
                avg_humidity_percent=avg_humidity_percent,
            )

            db.add(record)
            inserted_rows += 1

        except ValueError as error:
            invalid_rows += 1
            errors.append(
                {
                    "row_number": csv_row_number,
                    "message": str(error),
                }
            )

    try:
        db.commit()
    except Exception:
        db.rollback()
        raise

    return {
        "dataset": "state_weather",
        "total_rows": len(dataframe),
        "inserted_rows": inserted_rows,
        "updated_rows": updated_rows,
        "skipped_rows": skipped_rows,
        "invalid_rows": invalid_rows,
        "errors": errors[:100],
    }