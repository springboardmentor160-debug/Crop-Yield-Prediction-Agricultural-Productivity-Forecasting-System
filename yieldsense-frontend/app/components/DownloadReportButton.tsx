"use client";

export default function DownloadReportButton() {
  async function download() {
    const html2pdf = (await import("html2pdf.js")).default;

    const element = document.body;

    html2pdf()
      .from(element)
      .save("YieldSense_AI_Report.pdf");
  }

  return (
    <button
      onClick={download}
      style={{
        padding: "12px 24px",
        background: "#4CAF50",
        color: "#fff",
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