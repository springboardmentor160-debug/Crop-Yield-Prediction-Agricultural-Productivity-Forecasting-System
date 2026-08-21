"""
YieldSense AI  -  Export Service

Generates PDF and CSV exports of reports and prediction history.

PDF: Built with ReportLab (pure Python, free, production-ready).
CSV: Built with Python's standard csv module.
"""

import csv
import io
from datetime import datetime
from typing import Any, Dict, List, Optional


# ============================================================
# Color palette for PDF
# ============================================================

try:
    from reportlab.lib import colors
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import cm
    from reportlab.platypus import (
        HRFlowable, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle,
    )
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


# Brand colors
BRAND_GREEN = colors.HexColor("#16a34a") if REPORTLAB_AVAILABLE else None
BRAND_DARK = colors.HexColor("#111827") if REPORTLAB_AVAILABLE else None
BRAND_LIGHT_BG = colors.HexColor("#f0fdf4") if REPORTLAB_AVAILABLE else None
ACCENT_BLUE = colors.HexColor("#2563eb") if REPORTLAB_AVAILABLE else None
WARNING_ORANGE = colors.HexColor("#ea580c") if REPORTLAB_AVAILABLE else None
DANGER_RED = colors.HexColor("#dc2626") if REPORTLAB_AVAILABLE else None
LOW_GREEN = colors.HexColor("#22c55e") if REPORTLAB_AVAILABLE else None
MEDIUM_YELLOW = colors.HexColor("#eab308") if REPORTLAB_AVAILABLE else None
LIGHT_GRAY = colors.HexColor("#f9fafb") if REPORTLAB_AVAILABLE else None
MED_GRAY = colors.HexColor("#6b7280") if REPORTLAB_AVAILABLE else None
BORDER_GRAY = colors.HexColor("#e5e7eb") if REPORTLAB_AVAILABLE else None


def _risk_color(level: str):
    mapping = {
        "Low": LOW_GREEN,
        "Medium": MEDIUM_YELLOW,
        "High": WARNING_ORANGE,
        "Critical": DANGER_RED,
    }
    return mapping.get(level, MED_GRAY)


def _get_styles():
    styles = getSampleStyleSheet()
    custom = {
        "Title": ParagraphStyle("Title", parent=styles["Normal"],
                                 fontSize=22, textColor=BRAND_DARK, spaceAfter=4,
                                 fontName="Helvetica-Bold"),
        "Subtitle": ParagraphStyle("Subtitle", parent=styles["Normal"],
                                    fontSize=11, textColor=MED_GRAY, spaceAfter=8,
                                    fontName="Helvetica"),
        "SectionHeader": ParagraphStyle("SectionHeader", parent=styles["Normal"],
                                         fontSize=13, textColor=BRAND_GREEN, spaceBefore=14,
                                         spaceAfter=6, fontName="Helvetica-Bold"),
        "Body": ParagraphStyle("Body", parent=styles["Normal"],
                                fontSize=9, textColor=BRAND_DARK, leading=14,
                                fontName="Helvetica"),
        "Bold": ParagraphStyle("Bold", parent=styles["Normal"],
                                fontSize=9, textColor=BRAND_DARK, fontName="Helvetica-Bold"),
        "Small": ParagraphStyle("Small", parent=styles["Normal"],
                                 fontSize=8, textColor=MED_GRAY, fontName="Helvetica"),
        "RiskCritical": ParagraphStyle("RiskCritical", parent=styles["Normal"],
                                        fontSize=9, textColor=DANGER_RED, fontName="Helvetica-Bold"),
        "RiskHigh": ParagraphStyle("RiskHigh", parent=styles["Normal"],
                                    fontSize=9, textColor=WARNING_ORANGE, fontName="Helvetica-Bold"),
        "RiskMedium": ParagraphStyle("RiskMedium", parent=styles["Normal"],
                                      fontSize=9, textColor=MEDIUM_YELLOW, fontName="Helvetica-Bold"),
        "RiskLow": ParagraphStyle("RiskLow", parent=styles["Normal"],
                                   fontSize=9, textColor=LOW_GREEN, fontName="Helvetica-Bold"),
        "Center": ParagraphStyle("Center", parent=styles["Normal"],
                                  fontSize=9, textColor=BRAND_DARK, alignment=TA_CENTER,
                                  fontName="Helvetica"),
    }
    return custom


def _clean_text(val: Any) -> str:
    """Sanitize text to latin-1 compatible ASCII/Latin-1 string for ReportLab."""
    if val is None:
        return "N/A"
    s = str(val)
    replacements = {
        "\u2014": "-",  # em-dash  - 
        "\u2013": "-",  # en-dash –
        "\u2018": "'",  # left single quote ‘
        "\u2019": "'",  # right single quote ’
        "\u201c": '"',  # left double quote “
        "\u201d": '"',  # right double quote ”
        "\u2022": "*",  # bullet •
        "\u2026": "...", # ellipsis …
        "\u00a0": " ",  # non-breaking space
        "°": "deg ",     # degree sign
        "²": "^2",      # superscript 2
    }
    for old, new in replacements.items():
        s = s.replace(old, new)
    return s.encode("latin-1", errors="ignore").decode("latin-1")


def generate_pdf(report_data: Dict[str, Any]) -> bytes:
    """
    Generate a professional PDF report from a report data dict.

    Args:
        report_data: Full report payload from ReportService.generate_report().

    Returns:
        PDF bytes.
    """
    if not REPORTLAB_AVAILABLE:
        raise RuntimeError("ReportLab is not installed. Run: pip install reportlab")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=2.5 * cm,
        bottomMargin=2 * cm,
    )

    styles = _get_styles()
    story = []

    # ---- Cover Header ----
    story.append(Paragraph("YieldSense AI", styles["Title"]))
    story.append(Paragraph("Agricultural Yield & Risk Analysis Report", styles["Subtitle"]))
    story.append(HRFlowable(width="100%", thickness=2, color=BRAND_GREEN))
    story.append(Spacer(1, 0.4 * cm))

    title = _clean_text(report_data.get("data", {}).get("prediction", {}).get("crop", "")) + " Crop Report"
    report_title = _clean_text(report_data.get("title", title))
    story.append(Paragraph(f"Report: {report_title}", styles["Bold"]))
    gen_at = _clean_text(report_data.get('data', {}).get('generated_at', datetime.now().isoformat())[:19].replace('T', ' '))
    story.append(Paragraph(
        f"Generated: {gen_at} UTC",
        styles["Small"],
    ))
    story.append(Spacer(1, 0.5 * cm))


    data_payload = report_data.get("data", {})
    prediction = data_payload.get("prediction", {})
    inputs = data_payload.get("inputs", {})
    weather = data_payload.get("weather_summary")
    soil = data_payload.get("soil_summary")
    risk = data_payload.get("risk_assessment", {})
    recommendations = data_payload.get("recommendations", {})
    farm = data_payload.get("farm")

    # ---- Section 1: Prediction Summary ----
    story.append(Paragraph("1. Prediction Summary", styles["SectionHeader"]))

    pred_table_data = [
        ["Parameter", "Value"],
        ["Crop", _clean_text(prediction.get("crop", "-"))],
        ["Season", _clean_text(prediction.get("season", "-"))],
        ["State / Region", _clean_text(prediction.get("state", "-"))],
        ["Farm Area", _clean_text(f"{prediction.get('area', 0):,.1f} ha")],
        ["Predicted Yield", _clean_text(f"{prediction.get('predicted_yield', 0):.3f} {prediction.get('prediction_unit', 'tons/ha')}")],
        ["Total Estimated Production", _clean_text(f"{prediction.get('total_production', 0):,.2f} tons")],
        ["ML Model", _clean_text(prediction.get("model_used", "-"))],
        ["Model Accuracy (R^2)", _clean_text(f"{(prediction.get('model_accuracy') or 0) * 100:.1f}%" if prediction.get("model_accuracy") else "-")],
        ["Prediction Confidence", _clean_text(prediction.get("confidence", "-"))],
        ["Prediction Date", _clean_text(str(prediction.get("created_at", "-"))[:19].replace("T", " "))],
    ]

    pred_table = Table(pred_table_data, colWidths=[8 * cm, 9 * cm])
    pred_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), BRAND_GREEN),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("BACKGROUND", (0, 1), (-1, -1), LIGHT_GRAY),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
    ]))
    story.append(pred_table)
    story.append(Spacer(1, 0.3 * cm))

    # ---- Section 2: Input Parameters ----
    story.append(Paragraph("2. Input Parameters", styles["SectionHeader"]))
    input_table_data = [
        ["Parameter", "Value"],
        ["Temperature", _clean_text(f"{inputs.get('temperature', '-')} deg C")],
        ["Annual Rainfall", _clean_text(f"{inputs.get('annual_rainfall', '-')} mm")],
        ["Humidity", _clean_text(f"{inputs.get('humidity', '-')} %" if inputs.get('humidity') else "-")],
        ["Soil pH", _clean_text(f"{inputs.get('soil_ph', '-')}")],
        ["Nitrogen (N)", _clean_text(f"{inputs.get('nitrogen', '-')} kg/ha")],
        ["Phosphorus (P)", _clean_text(f"{inputs.get('phosphorus', '-')} kg/ha")],
        ["Potassium (K)", _clean_text(f"{inputs.get('potassium', '-')} kg/ha")],
        ["Fertilizer Usage", _clean_text(f"{inputs.get('fertilizer_usage', '-')} kg/ha")],
        ["Pesticide Usage", _clean_text(f"{inputs.get('pesticide_usage', '-')} kg/ha")],
    ]
    input_table = Table(input_table_data, colWidths=[8 * cm, 9 * cm])
    input_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), ACCENT_BLUE),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
        ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
        ("TOPPADDING", (0, 0), (-1, -1), 5),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
        ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
    ]))
    story.append(input_table)
    story.append(Spacer(1, 0.3 * cm))

    # ---- Section 3: Risk Assessment ----
    if risk:
        story.append(Paragraph("3. Agricultural Risk Assessment", styles["SectionHeader"]))
        risk_level = _clean_text(risk.get("overall_risk_level", "Unknown"))
        risk_score = risk.get("risk_score", 0)
        risk_priority = _clean_text(risk.get("priority_level", "Monitor"))

        risk_summary_data = [
            ["Overall Risk Level", risk_level],
            ["Risk Score", f"{risk_score:.1f} / 100"],
            ["Risk Category", _clean_text(risk.get("risk_category", "-"))],
            ["Priority", risk_priority],
            ["Risks Detected", str(risk.get("detected_risk_count", 0))],
        ]

        risk_color_obj = _risk_color(risk_level)
        risk_summary_table = Table(risk_summary_data, colWidths=[8 * cm, 9 * cm])
        risk_summary_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), risk_color_obj),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("FONTNAME", (0, 1), (0, -1), "Helvetica-Bold"),
        ]))
        story.append(risk_summary_table)
        story.append(Spacer(1, 0.2 * cm))

        # Individual risks
        risks_list = risk.get("risks", [])
        if risks_list:
            story.append(Paragraph("Detected Risks:", styles["Bold"]))
            story.append(Spacer(1, 0.1 * cm))
            risk_items_data = [["Risk", "Severity", "Category", "Mitigation"]]
            for r in risks_list[:8]:
                mitigation_text = _clean_text(r.get("mitigation", "")[:120]) + ("..." if len(r.get("mitigation", "")) > 120 else "")
                risk_items_data.append([
                    _clean_text(r.get("name", "")),
                    _clean_text(r.get("severity", "")),
                    _clean_text(r.get("category", "")),
                    mitigation_text,
                ])
            risk_items_table = Table(risk_items_data, colWidths=[4 * cm, 2.5 * cm, 2.5 * cm, 8 * cm])
            risk_items_table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), BRAND_DARK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, -1), 8),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, LIGHT_GRAY]),
                ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 4),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            story.append(risk_items_table)

        story.append(Spacer(1, 0.3 * cm))

    # ---- Section 4: Recommendations ----
    if recommendations:
        story.append(Paragraph("4. Agricultural Recommendations", styles["SectionHeader"]))

        irrigation = _clean_text(recommendations.get("irrigation_advice", ""))
        if irrigation:
            story.append(Paragraph("Irrigation:", styles["Bold"]))
            story.append(Paragraph(irrigation, styles["Body"]))
            freq = _clean_text(recommendations.get("irrigation_frequency", ""))
            if freq:
                story.append(Paragraph(f"Frequency: {freq}", styles["Body"]))
            story.append(Spacer(1, 0.2 * cm))

        season_plan = _clean_text(recommendations.get("season_planning", ""))
        if season_plan:
            story.append(Paragraph("Season Planning:", styles["Bold"]))
            story.append(Paragraph(season_plan, styles["Body"]))
            story.append(Spacer(1, 0.2 * cm))

        best_practices = recommendations.get("best_practices", [])
        if best_practices:
            story.append(Paragraph("Best Farming Practices:", styles["Bold"]))
            for bp in best_practices:
                story.append(Paragraph(f"  * {_clean_text(bp)}", styles["Body"]))
            story.append(Spacer(1, 0.2 * cm))

        yield_tips = recommendations.get("yield_improvement_tips", [])
        if yield_tips:
            story.append(Paragraph("Yield Improvement Tips:", styles["Bold"]))
            for tip in yield_tips:
                story.append(Paragraph(f"  * {_clean_text(tip)}", styles["Body"]))
            story.append(Spacer(1, 0.2 * cm))

        improvement_est = _clean_text(recommendations.get("estimated_yield_improvement", ""))
        if improvement_est:
            story.append(Paragraph(f"Estimated Improvement: {improvement_est}", styles["Bold"]))

        story.append(Spacer(1, 0.3 * cm))

    # ---- Section 5: Soil Summary ----
    if soil:
        story.append(Paragraph("5. Soil Health Summary", styles["SectionHeader"]))
        soil_data = [
            ["Health Score", f"{soil.get('health_score', 0):.1f} / 100"],
            ["Health Label", _clean_text(soil.get("health_label", "-"))],
            ["pH Status", _clean_text(soil.get("ph_status", "-"))],
        ]
        soil_table = Table(soil_data, colWidths=[6 * cm, 11 * cm])
        soil_table.setStyle(TableStyle([
            ("FONTSIZE", (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 0), (-1, -1), [colors.white, LIGHT_GRAY]),
            ("GRID", (0, 0), (-1, -1), 0.5, BORDER_GRAY),
            ("LEFTPADDING", (0, 0), (-1, -1), 8),
            ("RIGHTPADDING", (0, 0), (-1, -1), 8),
            ("TOPPADDING", (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ]))
        story.append(soil_table)
        story.append(Spacer(1, 0.3 * cm))

    # ---- Footer disclaimer ----
    story.append(HRFlowable(width="100%", thickness=1, color=BORDER_GRAY))
    story.append(Spacer(1, 0.2 * cm))
    story.append(Paragraph(
        "This report was generated by YieldSense AI - an AI-powered agricultural productivity forecasting system. "
        "Recommendations are based on agronomic rule-based analysis and should be used in conjunction with "
        "local agricultural expertise and field observations.",
        styles["Small"],
    ))
    story.append(Paragraph(
        "Consult your local agricultural extension officer for field-specific advice.",
        styles["Small"],
    ))


    doc.build(story)
    buffer.seek(0)
    return buffer.read()


# ============================================================
# CSV Export
# ============================================================

def generate_history_csv(records: List[Dict[str, Any]]) -> str:
    """
    Generate CSV export of prediction history records.

    Args:
        records: List of prediction history dicts.

    Returns:
        CSV string.
    """
    if not records:
        return "No data available"

    output = io.StringIO()

    fieldnames = [
        "id", "crop", "season", "state", "area",
        "predicted_yield", "total_production", "prediction_unit",
        "model_used", "confidence", "model_accuracy",
        "temperature", "annual_rainfall", "humidity",
        "soil_ph", "nitrogen", "phosphorus", "potassium",
        "fertilizer_usage", "pesticide_usage",
        "farm_id", "farm_name",
        "risk_level", "risk_score",
        "created_at",
    ]

    writer = csv.DictWriter(output, fieldnames=fieldnames, extrasaction="ignore")
    writer.writeheader()

    for record in records:
        # Flatten nested objects
        row = {k: record.get(k, "") for k in fieldnames}
        writer.writerow(row)

    return output.getvalue()


def generate_report_csv(report_data: Dict[str, Any]) -> str:
    """
    Generate CSV export of a single report's prediction data.

    Args:
        report_data: Full report dict from ReportService.

    Returns:
        CSV string.
    """
    output = io.StringIO()
    data_payload = report_data.get("data", {})
    prediction = data_payload.get("prediction", {})
    inputs = data_payload.get("inputs", {})
    risk = data_payload.get("risk_assessment", {})

    rows = [
        {"Field": "Report Title", "Value": report_data.get("title", "")},
        {"Field": "Generated At", "Value": data_payload.get("generated_at", "")},
        {"Field": "Crop", "Value": prediction.get("crop", "")},
        {"Field": "Season", "Value": prediction.get("season", "")},
        {"Field": "State", "Value": prediction.get("state", "")},
        {"Field": "Farm Area (ha)", "Value": prediction.get("area", "")},
        {"Field": "Predicted Yield (tons/ha)", "Value": prediction.get("predicted_yield", "")},
        {"Field": "Total Production (tons)", "Value": prediction.get("total_production", "")},
        {"Field": "ML Model", "Value": prediction.get("model_used", "")},
        {"Field": "Model Accuracy (R²)", "Value": prediction.get("model_accuracy", "")},
        {"Field": "Confidence", "Value": prediction.get("confidence", "")},
        {"Field": "Temperature (°C)", "Value": inputs.get("temperature", "")},
        {"Field": "Annual Rainfall (mm)", "Value": inputs.get("annual_rainfall", "")},
        {"Field": "Humidity (%)", "Value": inputs.get("humidity", "")},
        {"Field": "Soil pH", "Value": inputs.get("soil_ph", "")},
        {"Field": "Nitrogen (kg/ha)", "Value": inputs.get("nitrogen", "")},
        {"Field": "Phosphorus (kg/ha)", "Value": inputs.get("phosphorus", "")},
        {"Field": "Potassium (kg/ha)", "Value": inputs.get("potassium", "")},
        {"Field": "Overall Risk Level", "Value": risk.get("overall_risk_level", "") if risk else ""},
        {"Field": "Risk Score", "Value": risk.get("risk_score", "") if risk else ""},
        {"Field": "Risk Category", "Value": risk.get("risk_category", "") if risk else ""},
        {"Field": "Priority Level", "Value": risk.get("priority_level", "") if risk else ""},
    ]

    writer = csv.DictWriter(output, fieldnames=["Field", "Value"])
    writer.writeheader()
    writer.writerows(rows)
    return output.getvalue()
