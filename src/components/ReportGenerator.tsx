import { Language, t } from '@/lib/translations';
import { AnalysisResult, FarmInput, WeatherData } from '@/lib/agentEngine';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Download, Printer } from 'lucide-react';

interface ReportGeneratorProps {
  lang: Language;
  result: AnalysisResult;
  input: FarmInput;
  weather: WeatherData;
}

function generateReportHTML(result: AnalysisResult, input: FarmInput, weather: WeatherData, lang: Language): string {
  const bestName = lang === 'te' ? result.bestCrop.crop.nameTE : lang === 'hi' ? result.bestCrop.crop.nameHI : result.bestCrop.crop.name;
  const advisoryId = `AGR-${Date.now().toString(36).toUpperCase()}`;
  const dateStr = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Agricultural Advisory Report</title>
<style>
  body { font-family: 'Georgia', serif; margin: 0; padding: 40px; color: #1a1a1a; line-height: 1.6; }
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
  .signature { margin-top: 30px; }
  .disclaimer { font-style: italic; font-size: 10px; color: #999; margin-top: 15px; }
  @media print { body { padding: 20px; } }
</style></head><body>
<div class="header">
  <div class="seal">🌾</div>
  <div class="title">AGRICULTURAL ADVISORY REPORT</div>
  <div class="subtitle">AgriVision AI — Smart Farm Decision Intelligence System</div>
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
  <div class="section-title">2. Weather Assessment</div>
  <table><tr><th>Parameter</th><th>Current Value</th></tr>
  <tr><td>Temperature</td><td>${weather.temperature}°C</td></tr>
  <tr><td>Humidity</td><td>${weather.humidity}%</td></tr>
  <tr><td>Rainfall</td><td>${weather.rainfall} mm</td></tr>
  <tr><td>Condition</td><td>${weather.condition}</td></tr></table>
</div>

<div class="section">
  <div class="section-title">3. Multi-Agent Analysis</div>
  <table><tr><th>Agent</th><th>Score</th><th>Analysis</th></tr>
  ${result.bestCrop.agentResults.map(a => `<tr><td>${a.icon} ${a.agentName}</td><td>${Math.round(a.score)}%</td><td>${a.analysis}</td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <div class="section-title">4. Crop Recommendation</div>
  <div class="highlight">
    <strong>Recommended Crop: ${bestName}</strong><br>
    Confidence Score: ${result.bestCrop.confidence}% | Total Score: ${Math.round(result.bestCrop.totalScore)}<br>
    <em>${result.bestCrop.reasoning}</em>
  </div>
</div>

<div class="section">
  <div class="section-title">5. Alternative Crops</div>
  <table><tr><th>#</th><th>Crop</th><th>Score</th><th>Confidence</th></tr>
  ${result.alternatives.map((a, i) => `<tr><td>${i + 1}</td><td>${a.crop.icon} ${a.crop.name}</td><td>${Math.round(a.totalScore)}</td><td>${a.confidence}%</td></tr>`).join('')}
  </table>
</div>

<div class="section">
  <div class="section-title">6. Mixed Cropping Strategy</div>
  <p><strong>${result.mixedCropping.crop1.name}</strong> + <strong>${result.mixedCropping.crop2.name}</strong></p>
  <p>${result.mixedCropping.reason}</p>
</div>

<div class="section">
  <div class="section-title">7. Risk & Sustainability</div>
  <table><tr><th>Metric</th><th>Value</th></tr>
  <tr><td>Risk Level</td><td>${result.riskLevel.toUpperCase()}</td></tr>
  <tr><td>Sustainability Score</td><td>${result.sustainabilityScore}%</td></tr>
  <tr><td>Irrigation Advice</td><td>${result.irrigationAdvice}</td></tr>
  ${result.riskFactors.map(f => `<tr><td>Risk Factor</td><td>${f}</td></tr>`).join('')}
  </table>
</div>

<div class="footer">
  <div class="signature">
    <strong>Digital Advisory System</strong><br>
    AgriVision AI — Multi-Agent Decision Intelligence Platform<br>
    Generated on ${dateStr}
  </div>
  <div class="disclaimer">
    DISCLAIMER: This advisory report is generated by an AI-powered decision support system. 
    The recommendations are based on the input parameters provided and simulated environmental data. 
    For critical agricultural decisions, please consult with local agricultural extension officers and domain experts. 
    This report does not constitute a guarantee of crop yield or success.
  </div>
</div>
</body></html>`;
}

export function ReportGenerator({ lang, result, input, weather }: ReportGeneratorProps) {
  const handleDownload = () => {
    const html = generateReportHTML(result, input, weather, lang);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Agricultural_Advisory_Report_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const html = generateReportHTML(result, input, weather, lang);
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(html);
      win.document.close();
      setTimeout(() => win.print(), 500);
    }
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={handleDownload}
        className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105"
        style={{
          background: 'var(--gradient-accent)',
          color: 'hsl(0, 0%, 100%)',
          boxShadow: 'var(--shadow-glow-accent)',
        }}
      >
        <Download className="w-4 h-4" />
        {t('downloadReport', lang)}
      </button>
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-105 bg-muted text-foreground border border-border"
      >
        <Printer className="w-4 h-4" />
        Print
      </button>
    </div>
  );
}
