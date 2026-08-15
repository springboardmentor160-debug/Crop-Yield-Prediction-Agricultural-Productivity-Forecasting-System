"use client";

export default function PDFExport() {
  async function downloadPDF() {
    const html2pdf = (await import("html2pdf.js")).default;

    const element = document.getElementById("dashboard-report");

    if (!element) {
      alert("Dashboard not found.");
      return;
    }

    html2pdf()
      .set({
        margin: 0.5,
        filename: "YieldSense_Report.pdf",
        image: { type: "jpeg", quality: 1 },
        html2canvas: {
          scale: 2,
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      })
      .from(element)
      .save();
  }

  return (
    <button
      onClick={downloadPDF}
      style={{
        background: "#4CAF50",
        color: "white",
        padding: "12px 25px",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "16px",
        fontWeight: "bold",
      }}
    >
      📄 Download PDF Report
    </button>
  );
}