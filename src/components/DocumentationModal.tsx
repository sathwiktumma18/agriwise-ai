import { Language, t } from '@/lib/translations';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Cpu, ArrowRight, Database, Cloud, Mic } from 'lucide-react';

interface DocumentationModalProps {
  lang: Language;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DocumentationModal({ lang, open, onOpenChange }: DocumentationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-display text-foreground">{t('documentation', lang)}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 text-sm text-muted-foreground">
          <section>
            <h3 className="text-base font-bold font-display text-foreground mb-3">Multi-Agent Architecture</h3>
            <p className="mb-3">
              The system employs 6 specialized AI agents, each analyzing a distinct agricultural parameter independently.
              A 7th Decision Fusion Agent aggregates results using a weighted scoring model.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {[
                { name: t('soilAgent', lang), weight: '30%', icon: '🔬' },
                { name: t('waterAgent', lang), weight: '25%', icon: '💧' },
                { name: t('seasonAgent', lang), weight: '15%', icon: '📅' },
                { name: t('weatherAgent', lang), weight: '15%', icon: '🌤️' },
                { name: t('pestAgent', lang), weight: '15%', icon: '🐛' },
                { name: t('decisionAgent', lang), weight: 'Final', icon: '🧠' },
              ].map((agent) => (
                <div key={agent.name} className="p-3 rounded-lg bg-background border border-border">
                  <div className="text-xl mb-1">{agent.icon}</div>
                  <div className="font-semibold text-foreground text-xs">{agent.name}</div>
                  <div className="text-xs text-primary font-bold">{agent.weight}</div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold font-display text-foreground mb-3">Decision Flow</h3>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {['User Input', 'Voice/Text Processing', 'Parallel Agent Analysis', 'Weighted Scoring', 'Decision Fusion', 'Recommendation'].map((step, i) => (
                <div key={step} className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-medium">{step}</span>
                  {i < 5 && <ArrowRight className="w-3 h-3 text-muted-foreground" />}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-base font-bold font-display text-foreground mb-3">Scoring Algorithm</h3>
            <pre className="p-4 rounded-lg bg-background border border-border text-xs overflow-x-auto font-mono">
{`Total Score = (Soil × 0.30) + (Water × 0.25) + (Season × 0.15) 
            + (Temperature × 0.15) + (Pest × 0.15)

Confidence = Normalized(TotalScore) + Variance Adjustment
Risk Level = f(individual_agent_failures)
Sustainability = f(TotalScore × 0.9 + environmental_bonus)`}
            </pre>
          </section>

          <section>
            <h3 className="text-base font-bold font-display text-foreground mb-3">Technology Stack</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Frontend', items: 'React 18, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion' },
                { label: 'Charts', items: 'Recharts' },
                { label: 'Voice I/O', items: 'Web Speech API (Recognition + Synthesis)' },
                { label: 'Languages', items: 'English, Telugu (తెలుగు), Hindi (हिंदी)' },
              ].map((tech) => (
                <div key={tech.label} className="p-3 rounded-lg bg-background border border-border">
                  <div className="font-semibold text-foreground text-xs mb-1">{tech.label}</div>
                  <div className="text-xs">{tech.items}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
