from fastapi import APIRouter
from database import get_conn

router = APIRouter()


# ================= Prediction History =================

@router.get("/analytics/history")
def prediction_history():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            prediction_time,
            estimated_yield,
            temperature,
            humidity,
            rainfall,
            crop,
            yield_potential,
            risk_level
        FROM predictions
        ORDER BY prediction_time DESC
        LIMIT 20
    """)

    rows = cur.fetchall()

    history = []

    for row in rows:

        history.append({

            "prediction_time": row[0],
            "estimated_yield": row[1],
            "temperature": row[2],
            "humidity": row[3],
            "rainfall": row[4],
            "crop": row[5],
            "yield_potential": row[6],
            "risk_level": row[7]

        })

    cur.close()
    conn.close()

    history.reverse()

    return history


# ================= Seasonal Performance =================

@router.get("/analytics/season")
def season_analytics():

    conn = get_conn()
    cur = conn.cursor()

    cur.execute("""
        SELECT season, AVG(estimated_yield)
        FROM predictions
        WHERE season IS NOT NULL
        GROUP BY season
        ORDER BY season
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return [
        {"season": row[0], "yield": round(row[1], 2)}
        for row in rows
    ]