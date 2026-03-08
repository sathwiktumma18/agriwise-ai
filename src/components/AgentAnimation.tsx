import { motion } from 'framer-motion';
import { Language, t } from '@/lib/translations';

interface AgentAnimationProps {
  lang: Language;
}

const agents = [
  { icon: '🔬', key: 'soilAgent', color: 'hsl(25, 45%, 30%)' },
  { icon: '💧', key: 'waterAgent', color: 'hsl(195, 80%, 45%)' },
  { icon: '🐛', key: 'pestAgent', color: 'hsl(0, 72%, 50%)' },
  { icon: '🌤️', key: 'weatherAgent', color: 'hsl(200, 65%, 55%)' },
  { icon: '📅', key: 'seasonAgent', color: 'hsl(120, 45%, 40%)' },
  { icon: '🧠', key: 'decisionAgent', color: 'hsl(145, 58%, 32%)' },
];

export function AgentAnimation({ lang }: AgentAnimationProps) {
  return (
    <div className="py-12">
      <div className="flex flex-wrap justify-center gap-4">
        {agents.map((agent, i) => (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.3, type: 'spring', stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{
                boxShadow: [
                  `0 0 0 0 ${agent.color}40`,
                  `0 0 0 12px ${agent.color}00`,
                ],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.3 }}
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: `${agent.color}15`, border: `2px solid ${agent.color}30` }}
            >
              {agent.icon}
            </motion.div>
            <span className="text-xs font-medium text-muted-foreground text-center max-w-[80px]">
              {t(agent.key, lang)}
            </span>
            {i < agents.length - 1 && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: i * 0.3 + 0.5, duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="text-center mt-6 text-lg font-display font-semibold text-primary"
      >
        {t('analyzing', lang)}
      </motion.p>
    </div>
  );
}
