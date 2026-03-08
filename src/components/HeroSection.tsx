import { motion } from 'framer-motion';
import { Mic, FileText, Leaf, Droplets, Sun, Bug, BarChart3 } from 'lucide-react';
import { Language, t } from '@/lib/translations';

interface HeroSectionProps {
  lang: Language;
  onGetStarted: () => void;
  onViewDocs: () => void;
}

const agentIcons = [
  { icon: Leaf, label: 'Soil', delay: 0 },
  { icon: Droplets, label: 'Water', delay: 0.1 },
  { icon: Bug, label: 'Pest', delay: 0.2 },
  { icon: Sun, label: 'Weather', delay: 0.3 },
  { icon: BarChart3, label: 'Decision', delay: 0.4 },
];

export function HeroSection({ lang, onGetStarted, onViewDocs }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
      {/* Animated background particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2,
              height: Math.random() * 6 + 2,
              background: `hsla(145, 58%, 42%, ${0.1 + Math.random() * 0.2})`,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.3, 0.7, 0.3],
            }}
            transition={{
              duration: 4 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{
                background: 'hsla(145, 58%, 32%, 0.2)',
                border: '1px solid hsla(145, 58%, 42%, 0.3)',
                color: 'hsl(145, 58%, 65%)',
              }}>
              <Leaf className="w-4 h-4" />
              Multi-Agent AI Architecture
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold font-display mb-6 leading-tight"
            style={{ color: 'hsl(0, 0%, 100%)' }}
          >
            {t('heroHeading', lang)}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ color: 'hsla(140, 10%, 80%, 0.9)' }}
          >
            {t('heroDescription', lang)}
          </motion.p>

          {/* Agent icons */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-4 mb-10"
          >
            {agentIcons.map(({ icon: Icon, label, delay }) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + delay, type: 'spring' }}
                className="flex flex-col items-center gap-1"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'hsla(145, 58%, 32%, 0.15)',
                    border: '1px solid hsla(145, 58%, 42%, 0.25)',
                  }}>
                  <Icon className="w-5 h-5" style={{ color: 'hsl(145, 58%, 60%)' }} />
                </div>
                <span className="text-xs" style={{ color: 'hsla(140, 10%, 70%, 0.7)' }}>{label}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <button
              onClick={onGetStarted}
              className="px-8 py-4 rounded-xl text-lg font-semibold font-display transition-all duration-300 hover:scale-105"
              style={{
                background: 'var(--gradient-primary)',
                color: 'hsl(0, 0%, 100%)',
                boxShadow: 'var(--shadow-glow-primary)',
              }}
            >
              <span className="flex items-center gap-2 justify-center">
                <Mic className="w-5 h-5" />
                {t('getStarted', lang)}
              </span>
            </button>
            <button
              onClick={onViewDocs}
              className="px-8 py-4 rounded-xl text-lg font-semibold font-display transition-all duration-300 hover:scale-105"
              style={{
                background: 'hsla(0, 0%, 100%, 0.08)',
                color: 'hsl(0, 0%, 90%)',
                border: '1px solid hsla(0, 0%, 100%, 0.15)',
              }}
            >
              <span className="flex items-center gap-2 justify-center">
                <FileText className="w-5 h-5" />
                {t('viewDocs', lang)}
              </span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24" style={{ background: 'linear-gradient(transparent, hsl(140, 15%, 97%))' }} />
    </section>
  );
}
