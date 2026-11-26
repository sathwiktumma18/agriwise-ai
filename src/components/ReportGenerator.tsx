import { Download, Printer } from "lucide-react";
import { AnalysisResult, FarmInput, VoiceParseResult, WeatherData } from "@/lib/agentEngine";
import { Language, t } from "@/lib/translations";

interface ReportGeneratorProps {
  lang: Language;
  result: AnalysisResult;
  input: FarmInput;
  weather: WeatherData;
  voiceParse: VoiceParseResult | null;
}

function generateReportHTML(
  result: AnalysisResult,
  input: FarmInput,
  weather: WeatherData,
  lang: Language,
  voiceParse: VoiceParseResult | null,
): string {
  const bestName = lang === "te" ? result.bestCrop.crop.nameTE : lang === "hi" ? result.bestCrop.crop.nameHI : result.bestCrop.crop.name;
  const advisoryId = `AGR-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Agricultural Advisory Report</title>
<style>
  body { font-family: Georgia, serif; margin: 0; padding: 40px; color: #1a1a1a; line-height: 1.6; }
  .header { text-align: center; border-bottom: 3px double #2d5016; padding-bottom: 20px; margin-bottom: 30px; }
  .seal { width: 80px; height: 80px; border-radius: 50%; border: 3px solid #2d5016; display: inline-flex; align-items: center; justify-content: center; font-size: 36px; margin-bottom: 10px; }
  .title { font-size: 22px; font-weight: bold; color: #2d5016; margin: 10px 0 5px; }
  .subtitle { font-size: 14px; color: #555; }
  .advisory-id { font-size: 12px; color: #888; margin-top: 8px; }
  .section { margin: 24px 0; }
  .section-title { font-size: 16px; font-weight: bold; color: #2d5016; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 12px; }
  table { width: 100%; border-collapse: collapse; margin: 10px 0; }
  td, th { padding: 8px 12px; border: 1px solid #ddd; text-align: left; font-size: 13px; }
  th { background: #f0f5ec; font-weight: bold; }
  .highlight { background: #f8fdf5; padding: 15px; border-left: 4px solid #2d5016; margin: 15px 0; }
  .footer { margin-top: 40px; border-top: 2px solid #2d5016; padding-top: 20px; font-size: 11px; color: #777; }
</style></head><body>
<div class="header">
  <div class="seal">🌱</div>
  <div class="title">AGRICULTURAL ADVISORY REPORT</div>
  <div class="subtitle">AGENTIC AI POWERED FARM ADVISOR SYSTEM</div>
  <div class="advisory-id">Advisory ID: ${advisoryId} | Date: ${dateStr} | Location: ${input.location}, ${input.state}</div>
</div>

<div class="section">
  <div class="section-title">1. Farm Input Summary</div>
  <table><tr><th>Parameter</th><th>Value</th></tr>
  <tr><td>Soil Type</td><td>${input.soilType}</td></tr>
  <tr><td>Water Source</td><td>${input.waterSource}</td></tr>
  <tr><td>Farm Area</td><td>${input.farmArea} Acres</td></tr>
  <tr><td>Season</td><td>${input.season}</td></tr>
  <tr><td>Location</td><td>${input.location}, ${input.state}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">2. Voice Understanding</div>
  <table><tr><th>Voice Field</th><th>Value</th></tr>
  <tr><td>Original Voice Text</td><td>${voiceParse?.originalText || input.voiceText || "Not available"}</td></tr>
  <tr><td>English Interpretation</td><td>${voiceParse?.normalizedEnglish || result.voiceInput.normalizedEnglish || "Not available"}</td></tr>
  <tr><td>Localized Interpretation</td><td>${voiceParse?.localizedInterpretation || result.voiceInput.originalText || "Not available"}</td></tr>
  <tr><td>Detected Language</td><td>${voiceParse?.detectedLanguage || result.voiceInput.detectedLanguage || lang}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">3. Weather Assessment</div>
  <table><tr><th>Parameter</th><th>Current Value</th></tr>
  <tr><td>Temperature</td><td>${weather.temperature}°C</td></tr>
  <tr><td>Humidity</td><td>${weather.humidity}%</td></tr>
  <tr><td>Rainfall</td><td>${weather.rainfall} mm</td></tr>
  <tr><td>Condition</td><td>${weather.condition}</td></tr>
  <tr><td>Provider</td><td>${weather.provider || weather.source || "Local weather"}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">4. Multi-Agent Analysis</div>
  <table><tr><th>Agent</th><th>Score</th><th>Analysis</th></tr>
  ${result.bestCrop.agentResults.map((agent) => `<tr><td>${agent.icon} ${agent.agentName}</td><td>${Math.round(agent.score)}%</td><td>${agent.analysis}</td></tr>`).join("")}
  </table>
</div>

<div class="section">
  <div class="section-title">5. Crop Recommendation</div>
  <div class="highlight">
    <strong>Recommended Crop: ${bestName}</strong><br>
    Confidence Score: ${result.bestCrop.confidence}% | Total Score: ${Math.round(result.bestCrop.totalScore)}<br>
    <em>${result.bestCrop.reasoning}</em>
  </div>
  <div class="highlight">
    <strong>English Summary</strong><br>${result.bilingualResponse.englishSummary}
  </div>
  <div class="highlight">
    <strong>Localized Summary</strong><br>${result.bilingualResponse.localizedSummary}
  </div>
</div>

<div class="section">
  <div class="section-title">6. Action Plan</div>
  <table><tr><th>English Actions</th><th>Localized Actions</th></tr>
  <tr><td><ul>${result.bilingualResponse.englishActions.map((item) => `<li>${item}</li>`).join("")}</ul></td><td><ul>${result.bilingualResponse.localizedActions.map((item) => `<li>${item}</li>`).join("")}</ul></td></tr>
  </table>
</div>

<div class="section">
  <div class="section-title">7. Alternative Crops</div>
  <table><tr><th>#</th><th>Crop</th><th>Score</th><th>Confidence</th></tr>
  ${result.alternatives.map((entry, index) => `<tr><td>${index + 1}</td><td>${entry.crop.icon} ${entry.crop.name}</td><td>${Math.round(entry.totalScore)}</td><td>${entry.confidence}%</td></tr>`).join("")}
  </table>
</div>

<div class="section">
  <div class="section-title">8. Mixed Cropping Strategy</div>
  <p><strong>${result.mixedCropping.crop1.name}</strong> + <strong>${result.mixedCropping.crop2.name}</strong></p>
  <p>${result.mixedCropping.reason}</p>
</div>

<div class="section">
  <div class="section-title">9. Risk & Sustainability</div>
  <table><tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Risk Level</td><td>${result.riskLevel.toUpperCase()}</td></tr>
  <tr><td>Sustainability Score</td><td>${result.sustainabilityScore}%</td></tr>
  <tr><td>Irrigation Advice</td><td>${result.irrigationAdvice}</td></tr>
  ${result.riskFactors.map((factor) => `<tr><td>Risk Factor</td><td>${factor}</td></tr>`).join("")}
  </table>
</div>

<div class="footer">
  <strong>Generated by the Agentic AI Powered Farm Advisor System</strong><br>
  This report uses multilingual voice understanding, live weather, random-forest crop ranking, and agent-based reasoning.
</div>
</body></html>`;
}

export function ReportGenerator({ lang, result, input, weather, voiceParse }: ReportGeneratorProps) {
  const handleDownload = () => {
    const html = generateReportHTML(result, input, weather, lang, voiceParse);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `Agricultural_Advisory_Report_${Date.now()}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateReportHTML(result, input, weather, lang, voiceParse);
    const nextWindow = window.open("", "_blank");
    if (nextWindow) {
      nextWindow.document.write(html);
      nextWindow.document.close();
      setTimeout(() => nextWindow.print(), 500);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all hover:scale-105"
        style={{
          background: "var(--gradient-accent)",
          color: "hsl(0, 0%, 100%)",
          boxShadow: "var(--shadow-glow-accent)",
        }}
        type="button"
      >
        <Download className="h-4 w-4" />
        {t("downloadReport", lang)}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 rounded-xl border border-border bg-muted px-5 py-3 text-sm font-semibold text-foreground transition-all hover:scale-105"
        type="button"
      >
        <Printer className="h-4 w-4" />
        Print
      </button>
    </div>
  );
}
