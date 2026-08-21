"""
YieldSense AI  -  Weather Schemas

Pydantic models for weather API request/response validation.
"""

from typing import List, Optional

from pydantic import BaseModel, Field


class WeatherCurrent(BaseModel):
    """Current weather conditions."""

    temperature: float = Field(..., description="Temperature in °C")
    humidity: float = Field(..., description="Relative humidity in %")
    rainfall: float = Field(..., description="Precipitation in mm")
    wind_speed: float = Field(..., description="Wind speed in km/h")
    description: str = Field(..., description="Weather description")
    cloud_cover: Optional[float] = Field(None, description="Cloud cover in %")


class WeatherForecastDay(BaseModel):
    """Single day forecast."""

    date: str = Field(..., description="Date (YYYY-MM-DD)")
    temp_max: float = Field(..., description="Max temperature in °C")
    temp_min: float = Field(..., description="Min temperature in °C")
    rainfall: float = Field(..., description="Expected precipitation in mm")
    humidity: Optional[float] = Field(None, description="Average humidity in %")
    description: str = Field(..., description="Weather summary")


class WeatherResponse(BaseModel):
    """Full weather response."""

    latitude: float
    longitude: float
    current: WeatherCurrent
    forecast: List[WeatherForecastDay] = Field(default_factory=list)
    source: str = Field(default="Open-Meteo", description="Data source")


class WeatherSummary(BaseModel):
    """Abbreviated weather summary for prediction responses."""

    temperature: float
    humidity: float
    rainfall: float
    wind_speed: float
    description: str
    source: str = "Open-Meteo"
