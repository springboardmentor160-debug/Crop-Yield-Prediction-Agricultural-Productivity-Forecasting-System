import csv
from collections.abc import Iterable, Sequence
from datetime import UTC, datetime
from io import BytesIO, StringIO
from typing import Any

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


def utc_now() -> datetime:
    return datetime.now(UTC)


def build_report_filename(
    report_name: str,
    extension: str,
) -> str:
    timestamp = utc_now().strftime("%Y-%m-%d_%H-%M-%S")

    safe_name = (
        report_name.strip()
        .lower()
        .replace(" ", "_")
        .replace("/", "_")
    )

    safe_extension = extension.lstrip(".")

    return f"{safe_name}_{timestamp}.{safe_extension}"


def normalize_value(value: Any) -> str:
    if value is None:
        return ""

    if isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, float):
        return f"{value:.4f}"

    return str(value)


def create_csv_buffer(
    headers: Sequence[str],
    rows: Iterable[Sequence[Any]],
) -> BytesIO:
    text_buffer = StringIO(newline="")

    writer = csv.writer(text_buffer)

    writer.writerow(headers)

    for row in rows:
        writer.writerow(
            [normalize_value(value) for value in row]
        )

    byte_buffer = BytesIO(
        text_buffer.getvalue().encode("utf-8-sig")
    )

    byte_buffer.seek(0)

    return byte_buffer


def create_pdf_buffer(
    title: str,
    headers: Sequence[str],
    rows: Iterable[Sequence[Any]],
    subtitle: str | None = None,
    summary_items: dict[str, Any] | None = None,
) -> BytesIO:
    buffer = BytesIO()

    document = SimpleDocTemplate(
        buffer,
        pagesize=landscape(A4),
        rightMargin=15 * mm,
        leftMargin=15 * mm,
        topMargin=15 * mm,
        bottomMargin=15 * mm,
        title=title,
        author="YieldSense AI",
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        name="YieldSenseReportTitle",
        parent=styles["Title"],
        alignment=TA_CENTER,
        fontSize=20,
        leading=25,
        spaceAfter=10,
    )

    subtitle_style = ParagraphStyle(
        name="YieldSenseReportSubtitle",
        parent=styles["Normal"],
        alignment=TA_CENTER,
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=14,
    )

    section_style = ParagraphStyle(
        name="YieldSenseSection",
        parent=styles["Heading2"],
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#14532D"),
        spaceBefore=10,
        spaceAfter=8,
    )

    small_style = ParagraphStyle(
        name="YieldSenseSmall",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
    )

    story = [
        Paragraph("YieldSense AI", title_style),
        Paragraph(title, styles["Heading1"]),
    ]

    if subtitle:
        story.append(
            Paragraph(subtitle, subtitle_style)
        )

    generated_at = utc_now().strftime(
        "%Y-%m-%d %H:%M:%S UTC"
    )

    story.append(
        Paragraph(
            f"Generated on: {generated_at}",
            subtitle_style,
        )
    )

    if summary_items:
        story.append(
            Paragraph("Report Summary", section_style)
        )

        summary_data = [
            [
                Paragraph(
                    "<b>Field</b>",
                    small_style,
                ),
                Paragraph(
                    "<b>Value</b>",
                    small_style,
                ),
            ]
        ]

        for label, value in summary_items.items():
            summary_data.append(
                [
                    Paragraph(
                        normalize_value(label),
                        small_style,
                    ),
                    Paragraph(
                        normalize_value(value),
                        small_style,
                    ),
                ]
            )

        summary_table = Table(
            summary_data,
            colWidths=[70 * mm, 170 * mm],
            repeatRows=1,
        )

        summary_table.setStyle(
            TableStyle(
                [
                    (
                        "BACKGROUND",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#DCFCE7"),
                    ),
                    (
                        "TEXTCOLOR",
                        (0, 0),
                        (-1, 0),
                        colors.HexColor("#14532D"),
                    ),
                    (
                        "GRID",
                        (0, 0),
                        (-1, -1),
                        0.4,
                        colors.HexColor("#D1D5DB"),
                    ),
                    (
                        "VALIGN",
                        (0, 0),
                        (-1, -1),
                        "TOP",
                    ),
                    (
                        "LEFTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "RIGHTPADDING",
                        (0, 0),
                        (-1, -1),
                        6,
                    ),
                    (
                        "TOPPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                    (
                        "BOTTOMPADDING",
                        (0, 0),
                        (-1, -1),
                        5,
                    ),
                ]
            )
        )

        story.extend(
            [
                summary_table,
                Spacer(1, 12),
            ]
        )

    story.append(
        Paragraph("Report Records", section_style)
    )

    table_data = [
        [
            Paragraph(
                f"<b>{normalize_value(header)}</b>",
                small_style,
            )
            for header in headers
        ]
    ]

    for row in rows:
        table_data.append(
            [
                Paragraph(
                    normalize_value(value),
                    small_style,
                )
                for value in row
            ]
        )

    if len(table_data) == 1:
        table_data.append(
            [
                Paragraph(
                    "No records available",
                    small_style,
                )
            ]
            + [
                Paragraph("", small_style)
                for _ in range(len(headers) - 1)
            ]
        )

    available_width = landscape(A4)[0] - 30 * mm
    column_width = available_width / max(
        len(headers),
        1,
    )

    records_table = Table(
        table_data,
        colWidths=[
            column_width
            for _ in headers
        ],
        repeatRows=1,
    )

    records_table.setStyle(
        TableStyle(
            [
                (
                    "BACKGROUND",
                    (0, 0),
                    (-1, 0),
                    colors.HexColor("#166534"),
                ),
                (
                    "TEXTCOLOR",
                    (0, 0),
                    (-1, 0),
                    colors.white,
                ),
                (
                    "GRID",
                    (0, 0),
                    (-1, -1),
                    0.35,
                    colors.HexColor("#D1D5DB"),
                ),
                (
                    "VALIGN",
                    (0, 0),
                    (-1, -1),
                    "TOP",
                ),
                (
                    "ROWBACKGROUNDS",
                    (0, 1),
                    (-1, -1),
                    [
                        colors.white,
                        colors.HexColor("#F9FAFB"),
                    ],
                ),
                (
                    "LEFTPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),
                (
                    "RIGHTPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),
                (
                    "TOPPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),
                (
                    "BOTTOMPADDING",
                    (0, 0),
                    (-1, -1),
                    4,
                ),
            ]
        )
    )

    story.append(records_table)

    document.build(story)

    buffer.seek(0)

    return buffer