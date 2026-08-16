"""
YieldSense AI - Reports Router
Module 9: PDF/CSV/Excel report generation
"""
from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session
from app.database import get_db
from app import models
from app.core.deps import get_current_user
from app.ml.predictor import get_model_metrics
import json
from datetime import datetime
from io import BytesIO
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_LEFT

router = APIRouter(prefix="/api/v1/reports", tags=["Reports"])

@router.get("/prediction-summary")
def get_prediction_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).order_by(models.Prediction.created_at.desc()).all() if farm_ids else []

    avg_yield = round(sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2) if predictions else 0

    return {
        "report_type": "Prediction Summary",
        "generated_at": datetime.now().isoformat(),
        "generated_by": current_user.full_name,
        "summary": {
            "total_predictions": len(predictions),
            "average_yield": avg_yield,
            "high_risk_count": len([p for p in predictions if p.risk_level == "High"]),
            "low_risk_count": len([p for p in predictions if p.risk_level == "Low"]),
            "crops_analyzed": list(set(p.crop_type for p in predictions)),
        },
        "predictions": [
            {
                "id": p.id,
                "crop_type": p.crop_type,
                "predicted_yield": p.predicted_yield_tons_per_ha,
                "confidence": p.confidence_score,
                "risk_level": p.risk_level,
                "rainfall_mm": p.rainfall_mm,
                "temperature_c": p.temperature_c,
                "soil_ph": p.soil_ph,
                "date": p.created_at.strftime("%Y-%m-%d"),
            }
            for p in predictions[:20]
        ]
    }

@router.get("/farm-report")
def get_farm_report(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_data = []
    for farm in farms:
        preds = db.query(models.Prediction).filter(models.Prediction.farm_id == farm.id).all()
        farm_data.append({
            "farm_name": farm.farm_name,
            "location": farm.location,
            "area_hectares": farm.area_hectares,
            "soil_ph": farm.soil_ph,
            "total_predictions": len(preds),
            "avg_yield": round(sum(p.predicted_yield_tons_per_ha for p in preds) / len(preds), 2) if preds else 0,
            "created_date": farm.created_at.strftime("%Y-%m-%d"),
        })
    return {
        "report_type": "Farm Report",
        "generated_at": datetime.now().isoformat(),
        "total_farms": len(farms),
        "farms": farm_data
    }

@router.get("/weather-report")
def get_weather_report(current_user: models.User = Depends(get_current_user)):
    return {
        "report_type": "Weather Report",
        "generated_at": datetime.now().isoformat(),
        "period": "Current Season 2026",
        "summary": {
            "avg_temperature_c": 28.5,
            "total_rainfall_mm": 842,
            "peak_rain_month": "July",
            "dry_months": ["Jan", "Feb", "Mar"],
            "weather_alerts": 3,
        },
        "monthly_data": [
            {"month": "Jan", "temp": 22, "rain": 12, "humidity": 45},
            {"month": "Feb", "temp": 25, "rain": 18, "humidity": 50},
            {"month": "Mar", "temp": 29, "rain": 25, "humidity": 55},
            {"month": "Apr", "temp": 33, "rain": 45, "humidity": 60},
            {"month": "May", "temp": 36, "rain": 80, "humidity": 65},
            {"month": "Jun", "temp": 32, "rain": 180, "humidity": 80},
            {"month": "Jul", "temp": 29, "rain": 320, "humidity": 85},
            {"month": "Aug", "temp": 28, "rain": 290, "humidity": 82},
            {"month": "Sep", "temp": 29, "rain": 210, "humidity": 78},
            {"month": "Oct", "temp": 28, "rain": 85, "humidity": 70},
            {"month": "Nov", "temp": 25, "rain": 30, "humidity": 55},
            {"month": "Dec", "temp": 22, "rain": 15, "humidity": 48},
        ]
    }

@router.get("/soil-report")
def get_soil_report(current_user: models.User = Depends(get_current_user)):
    return {
        "report_type": "Soil Health Report",
        "generated_at": datetime.now().isoformat(),
        "overall_soil_health": "Good",
        "health_score": 72,
        "parameters": {
            "ph": {"value": 6.5, "status": "Optimal", "range": "6.0-7.0"},
            "nitrogen": {"value": 85, "unit": "kg/ha", "status": "Good"},
            "phosphorus": {"value": 42, "unit": "kg/ha", "status": "Optimal"},
            "potassium": {"value": 65, "unit": "kg/ha", "status": "Good"},
            "organic_carbon": {"value": 1.2, "unit": "%", "status": "Low"},
            "moisture": {"value": 35, "unit": "%", "status": "Adequate"},
        },
        "recommendations": [
            "Add organic matter to improve soil structure",
            "Apply micronutrients zinc and boron",
            "Consider green manure crops next season",
        ]
    }

@router.get("/export/csv")
def export_csv(
    report_type: str = "predictions",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).all() if farm_ids else []

    csv_data = "id,crop_type,yield_tons_ha,confidence,risk_level,rainfall_mm,temperature_c,soil_ph,date\n"
    for p in predictions:
        csv_data += f"{p.id},{p.crop_type},{p.predicted_yield_tons_per_ha},{p.confidence_score},{p.risk_level},{p.rainfall_mm},{p.temperature_c},{p.soil_ph},{p.created_at.strftime('%Y-%m-%d')}\n"

    return {
        "filename": f"yieldsense_predictions_{datetime.now().strftime('%Y%m%d')}.csv",
        "content_type": "text/csv",
        "data": csv_data,
        "rows": len(predictions)
    }


@router.get("/export/pdf")
def export_pdf(
    report_type: str = "predictions",
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    farms = db.query(models.Farm).filter(models.Farm.user_id == current_user.id).all()
    farm_ids = [f.id for f in farms]
    predictions = db.query(models.Prediction).filter(
        models.Prediction.farm_id.in_(farm_ids)
    ).order_by(models.Prediction.created_at.desc()).all() if farm_ids else []

    avg_yield = round(sum(p.predicted_yield_tons_per_ha for p in predictions) / len(predictions), 2) if predictions else 0

    # Create PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4, rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#166534')
    )
    
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        alignment=TA_CENTER,
        textColor=colors.HexColor('#15803d')
    )
    
    normal_style = styles['Normal']
    normal_style.fontSize = 10
    normal_style.leading = 14

    # Title
    elements.append(Paragraph("YieldSense AI - Prediction Summary Report", title_style))
    elements.append(Spacer(1, 12))
    elements.append(Paragraph(f"Generated on: {datetime.now().strftime('%B %d, %Y at %I:%M %p')}", normal_style))
    elements.append(Paragraph(f"Generated by: {current_user.full_name}", normal_style))
    elements.append(Spacer(1, 20))

    # Summary Section
    elements.append(Paragraph("Executive Summary", subtitle_style))
    elements.append(Spacer(1, 12))
    
    summary_data = [
        ['Metric', 'Value'],
        ['Total Predictions', str(len(predictions))],
        ['Average Yield', f'{avg_yield} t/ha'],
        ['High Risk Count', str(len([p for p in predictions if p.risk_level == "High"]))],
        ['Low Risk Count', str(len([p for p in predictions if p.risk_level == "Low"]))],
        ['Crops Analyzed', ', '.join(set(p.crop_type for p in predictions)) if predictions else 'None'],
    ]
    
    summary_table = Table(summary_data, colWidths=[2.5*inch, 3.5*inch])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#166534')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
        ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bbf7d0')),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 1), (-1, -1), 10),
        ('TOPPADDING', (0, 1), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
    ]))
    elements.append(summary_table)
    elements.append(Spacer(1, 30))

    # Predictions Table
    elements.append(Paragraph("Recent Predictions", subtitle_style))
    elements.append(Spacer(1, 12))
    
    if predictions:
        pred_data = [['Crop', 'Yield (t/ha)', 'Confidence', 'Risk Level', 'Rainfall (mm)', 'Temp (°C)', 'Soil pH', 'Date']]
        for p in predictions[:20]:
            pred_data.append([
                p.crop_type,
                f'{p.predicted_yield_tons_per_ha:.2f}',
                f'{p.confidence_score}%',
                p.risk_level,
                str(p.rainfall_mm),
                str(p.temperature_c),
                str(p.soil_ph),
                p.created_at.strftime('%Y-%m-%d')
            ])
        
        pred_table = Table(pred_data, colWidths=[0.9*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.7*inch, 0.6*inch, 0.6*inch, 0.9*inch])
        pred_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#166534')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 10),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f0fdf4')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#bbf7d0')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('TOPPADDING', (0, 1), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 6),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#f0fdf4'), colors.white]),
        ]))
        elements.append(pred_table)
    else:
        elements.append(Paragraph("No predictions available.", normal_style))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    
    return Response(
        content=buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=yieldsense_report_{datetime.now().strftime('%Y%m%d')}.pdf"
        }
    )
