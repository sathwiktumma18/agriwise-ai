import { motion } from "framer-motion";
import { Language, t } from "@/lib/translations";

interface AgentAnimationProps {
  lang: Language;
}

const agents = [
  { icon: "🔬", key: "soilAgent", color: "hsl(25, 45%, 30%)" },
  { icon: "💧", key: "waterAgent", color: "hsl(195, 80%, 45%)" },
  { icon: "🐛", key: "pestAgent", color: "hsl(0, 72%, 50%)" },
  { icon: "🌤️", key: "weatherAgent", color: "hsl(200, 65%, 55%)" },
  { icon: "📅", key: "seasonAgent", color: "hsl(120, 45%, 40%)" },
  { icon: "🧠", key: "decisionAgent", color: "hsl(145, 58%, 32%)" },
];

export function AgentAnimation({ lang }: AgentAnimationProps) {
  return (
    <div className="py-12">
      <div className="flex flex-wrap justify-center gap-4">
        {agents.map((agent, index) => (
          <motion.div
            key={agent.key}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.25, type: "spring", stiffness: 200 }}
            className="flex flex-col items-center gap-2"
          >
            <motion.div
              animate={{
                boxShadow: [`0 0 0 0 ${agent.color}40`, `0 0 0 12px ${agent.color}00`],
              }}
              transition={{ duration: 1.5, repeat: Infinity, delay: index * 0.25 }}
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl"
              style={{ background: `${agent.color}15`, border: `2px solid ${agent.color}30` }}
            >
              {agent.icon}
            </motion.div>
            <span className="max-w-[90px] text-center text-xs font-medium text-muted-foreground">{t(agent.key, lang)}</span>
          </motion.div>
        ))}
      </div>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0.4, 1, 0.4] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="mt-6 text-center text-lg font-semibold font-display text-primary"
      >
        {t("analyzing", lang)}
      </motion.p>
    </div>
  );
}
