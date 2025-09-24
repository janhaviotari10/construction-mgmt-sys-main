import React, { useRef } from "react";
import "./CostEstimation.css";
import CostBreakdownChart from "./CostBreakdownChart";
import html2canvas from "html2canvas";

const ResultDisplay = ({ result, contributions }) => {
  const captureRef = useRef(null);

  const handleDownload = () => {
    const element = captureRef.current;
    
    html2canvas(element, {
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff"
    }).then((canvas) => {
      const link = document.createElement("a");
      link.download = `cost-estimation-${new Date().toISOString().slice(0, 10)}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }).catch((err) => {
      console.error("Error capturing image:", err);
    });
  };

  return (
    <div>
      <div className="download-section">
        <button onClick={handleDownload} className="download-btn">
          Download as Image
        </button>
      </div>

      <div ref={captureRef} className="result-display">
        <h2>Result</h2>
        <p>Predicted Cost: {result} INR</p>
        <h3>Cost Breakdown</h3>
        {contributions && <CostBreakdownChart data={contributions} />}
      </div>
    </div>
  );
};

export default ResultDisplay;