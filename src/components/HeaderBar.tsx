import { motion } from "framer-motion";
import { Globe, LogOut, VolumeX } from "lucide-react";
import { Language, t } from "@/lib/translations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";

interface HeaderBarProps {
  lang: Language;
  setLang: (lang: Language) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
}

export function HeaderBar({ lang, setLang, isSpeaking, onStopSpeaking }: HeaderBarProps) {
  const { signOut } = useAuth();

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/50"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg text-lg" style={{ background: "var(--gradient-primary)" }}>
            🌱
          </div>
          <h1 className="text-lg font-bold font-display text-foreground">{t("appTitle", lang)}</h1>
        </div>

        <div className="flex items-center gap-3">
          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="rounded-lg bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
              type="button"
            >
              <VolumeX className="h-4 w-4" />
            </button>
          )}

          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <Select value={lang} onValueChange={(value) => setLang(value as Language)}>
              <SelectTrigger className="h-9 w-[120px] border-border bg-card text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="te">తెలుగు</SelectItem>
                <SelectItem value="hi">हिंदी</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <button
            onClick={signOut}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title="Sign Out"
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.header>
  );
}
