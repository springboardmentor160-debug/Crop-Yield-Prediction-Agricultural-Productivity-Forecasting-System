"""
YieldSense AI  -  Export API Endpoints

Generates PDF and CSV export downloads.
"""

import io
import re
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response

from app.api.deps import get_current_user_id
from app.services.report_service import ReportService
from app.services.history_service import HistoryService
from app.services.export_service import generate_pdf, generate_history_csv, generate_report_csv
from app.utils.exceptions import NotFoundException, ForbiddenException

router = APIRouter(prefix="/export", tags=["Export"])


def _safe_filename(raw_title: str, ext: str) -> str:
    """Ensure filename in Content-Disposition header is strictly ASCII-encoded for HTTP/1.1 compliance."""
    s = str(raw_title).replace(" - ", "-").replace("–", "-").replace(" ", "_")
    s = re.sub(r"[^\w\-]", "", s)
    s = s[:40] or "report"
    return f"YieldSense_{s}.{ext}"


@router.get("/pdf/{report_id}", summary="Download report as PDF")
async def download_pdf(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Generate and download a PDF report.

    Returns a professional PDF containing:
    - Prediction summary
    - Input parameters
    - Risk assessment with per-risk mitigations
    - Agricultural recommendations
    - Soil health summary
    """
    try:
        report_svc = ReportService()
        report = report_svc.get_report(report_id, user_id)

        pdf_bytes = generate_pdf(report)
        filename = _safe_filename(report.get("title", "report"), "pdf")

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


@router.get("/csv/history", summary="Download prediction history as CSV")
async def download_history_csv(
    user_id: str = Depends(get_current_user_id),
):
    """
    Download all prediction history as a CSV file.
    Columns include all prediction parameters, results, and risk data.
    """
    try:
        history_svc = HistoryService()
        records, _ = history_svc.get_history(user_id, page=1, limit=1000)

        csv_content = generate_history_csv(records)
        filename = "YieldSense_Prediction_History.csv"

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV generation failed: {str(e)}")


@router.get("/csv/report/{report_id}", summary="Download single report as CSV")
async def download_report_csv(
    report_id: str,
    user_id: str = Depends(get_current_user_id),
):
    """
    Download a single report's data as a CSV summary.
    """
    try:
        report_svc = ReportService()
        report = report_svc.get_report(report_id, user_id)

        csv_content = generate_report_csv(report)
        filename = _safe_filename(report.get("title", "report"), "csv")

        return Response(
            content=csv_content,
            media_type="text/csv",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except ForbiddenException as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"CSV generation failed: {str(e)}")

