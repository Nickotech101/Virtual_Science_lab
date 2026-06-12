import React, { useRef, useState } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ReportGenerator({ notebook }) {
  const reportRef = useRef();
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!reportRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${notebook.title || "Scientific_Report"}.pdf`);
    } catch (error) {
      console.error("PDF generation failed", error);
    } finally {
      setGenerating(false);
    }
  };

  if (!notebook) return <p className="text-white">No notebook data available.</p>;

  return (
    <div>
      <div className="flex justify-end mb-6">
        <button
          onClick={generatePDF}
          disabled={generating}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg shadow hover:bg-indigo-700 transition"
        >
          {generating ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div 
        ref={reportRef} 
        className="bg-white text-slate-900 p-10 rounded shadow-sm max-w-[210mm] min-h-[297mm] mx-auto ql-editor"
      >
        <h1 className="text-3xl font-bold border-b pb-4 mb-6 text-center">
          {notebook.title || "Experiment Report"}
        </h1>
        
        <div>
          {notebook.content_html ? (
            <div dangerouslySetInnerHTML={{ __html: notebook.content_html }} />
          ) : (
            <div className="space-y-6">
              {notebook.objective && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Objective</h3>
                  <p className="whitespace-pre-wrap">{notebook.objective}</p>
                </div>
              )}
              {notebook.procedure_summary && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Procedure Summary</h3>
                  <p className="whitespace-pre-wrap">{notebook.procedure_summary}</p>
                </div>
              )}
              {notebook.observations && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Observations</h3>
                  <p className="whitespace-pre-wrap">{notebook.observations}</p>
                </div>
              )}
              {notebook.results && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Results</h3>
                  <p className="whitespace-pre-wrap">{notebook.results}</p>
                </div>
              )}
              {notebook.conclusions && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Conclusions</h3>
                  <p className="whitespace-pre-wrap">{notebook.conclusions}</p>
                </div>
              )}
              {notebook.reflection && (
                <div>
                  <h3 className="text-xl font-semibold mb-2">Scientific Reflection</h3>
                  <p className="whitespace-pre-wrap">{notebook.reflection}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
