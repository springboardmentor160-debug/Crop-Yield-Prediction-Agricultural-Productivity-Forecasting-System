"use client";

import jsPDF from "jspdf";

export default function DownloadReport({
  farm,
  prediction,
  recommendation,
}: any) {
  const download = () => {
    const doc = new jsPDF();

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    let y = 18;

    // -----------------------------
    // CHECK PAGE SPACE
    // -----------------------------

    const checkPageSpace = (space = 10) => {
      if (y + space > pageHeight - 25) {
        doc.addPage();
        y = 18;
      }
    };

    // -----------------------------
    // SECTION HEADING
    // -----------------------------

    const heading = (title: string) => {
      checkPageSpace(15);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);

      doc.text(title, 20, y);

      y += 3;

      doc.line(20, y, 190, y);

      y += 7;
    };

    // -----------------------------
    // LABEL + VALUE
    // -----------------------------

    const row = (label: string, value: any) => {
      const text =
        value === undefined ||
        value === null ||
        value === ""
          ? "N/A"
          : String(value);

      const valueX = 65;
      const maxWidth = 125;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);

      doc.text(label, 20, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      const lines = doc.splitTextToSize(
        text,
        maxWidth
      );

      lines.forEach((line: string, index: number) => {
        checkPageSpace(6);

        doc.text(line, valueX, y);

        if (index < lines.length - 1) {
          y += 5;
        }
      });

      y += 6;
    };

    // -----------------------------
    // BULLET LIST
    // -----------------------------

    const bullets = (items: string[]) => {
      if (!items || items.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text("No data available.", 25, y);

        y += 6;
        return;
      }

      items.forEach((item) => {
        checkPageSpace(10);

        const lines = doc.splitTextToSize(
          String(item),
          160
        );

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);

        doc.text("•", 22, y);

        lines.forEach(
          (line: string, index: number) => {
            doc.text(line, 28, y);

            if (index < lines.length - 1) {
              y += 5;
            }
          }
        );

        y += 6;
      });
    };

    // -----------------------------
    // TITLE
    // -----------------------------

    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);

    doc.text("YieldSense AI", 20, y);

    y += 8;

    doc.setFontSize(12);

    doc.text(
      "Agricultural Performance Report",
      20,
      y
    );

    y += 6;

    doc.line(20, y, 190, y);

    y += 10;

    // -----------------------------
    // FARM INFORMATION
    // -----------------------------

    heading("Farm Information");

    row(
      "Farm Name :",
      farm?.farm_name
    );

    row(
      "Location :",
      farm?.location
    );

    row(
      "Crop :",
      farm?.crop_type
    );

    row(
      "Season :",
      farm?.season
    );

    y += 2;

    // -----------------------------
    // PREDICTION SUMMARY
    // -----------------------------

    heading("Prediction Summary");

    row(
      "Estimated Yield :",
      `${prediction?.estimated_yield ?? "N/A"} kg/ha`
    );

    row(
      "Yield Potential :",
      prediction?.yield_potential
    );

    row(
      "Risk Level :",
      recommendation?.risk_level
    );

    y += 2;

    // -----------------------------
    // RISK ASSESSMENT
    // -----------------------------

    heading("Risk Assessment");

    row(
      "Overall Risk :",
      recommendation?.risk_level
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    doc.text(
      "Detected Risks :",
      20,
      y
    );

    y += 6;

    bullets(
      recommendation?.identified_risks || []
    );

    y += 2;

    // -----------------------------
    // AI RECOMMENDATIONS
    // -----------------------------

    heading("AI Recommendations");

    row(
      "Soil Advice :",
      recommendation?.soil_advice
    );

    row(
      "Recommended Fertilizer :",
      recommendation?.recommended_fertilizer
    );

    row(
      "Irrigation :",
      recommendation?.irrigation
    );

    row(
      "Today's Action :",
      recommendation?.today_action
    );

    row(
      "Weekly Action :",
      recommendation?.weekly_action
    );

    y += 2;

    bullets(
      recommendation?.recommendations || []
    );

    y += 2;

    // -----------------------------
    // BEST FARMING PRACTICES
    // -----------------------------

    heading("Best Farming Practices");

    bullets(
      recommendation?.best_practices || []
    );

    // -----------------------------
    // FOOTER
    // -----------------------------

    const footerY = pageHeight - 18;

    doc.setFont("helvetica", "italic");
    doc.setFontSize(8.5);

    doc.text(
      "Generated by YieldSense AI Recommendation Engine",
      pageWidth / 2,
      footerY,
      {
        align: "center",
      }
    );

    const now = new Date();

    const date = now.toLocaleDateString(
      "en-GB"
    );

    const time = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    doc.text(
      `Report Generated On: ${date} ${time}`,
      pageWidth / 2,
      footerY + 5,
      {
        align: "center",
      }
    );

    // -----------------------------
    // DOWNLOAD
    // -----------------------------

    doc.save(
      "YieldSense_AI_Report.pdf"
    );
  };

  return (
    <button
      className="save-btn"
      onClick={download}
    >
      ⬇ Download PDF Report
    </button>
  );
}