import { useCallback, useEffect, useRef, useState } from "react";

function splitIntoChunks(text: string, maxLength = 220) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) {
    return [];
  }

  const chunks: string[] = [];
  let current = "";
  for (const sentence of cleaned.split(/(?<=[.!?])\s+/)) {
    if (!sentence) {
      continue;
    }

    if (`${current} ${sentence}`.trim().length <= maxLength) {
      current = `${current} ${sentence}`.trim();
      continue;
    }

    if (current) {
      chunks.push(current);
    }
    current = sentence;
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function selectVoice(lang: string, voices: SpeechSynthesisVoice[]) {
  const normalizedLang = lang.toLowerCase();
  const primaryLocale = normalizedLang.split("-")[0];

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalizedLang) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(primaryLocale)) ??
    null
  );
}

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      stopRef.current?.();
      stopRef.current = null;
    };
  }, []);

  const speak = useCallback(async (text: string, lang = "en-US") => {
    if (!window.speechSynthesis) {
      return;
    }

    const chunks = splitIntoChunks(text);
    if (chunks.length === 0) {
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const voice = selectVoice(lang, voices);
    let active = true;
    let index = 0;

    const playNext = () => {
      if (!active) {
        return;
      }

      const chunk = chunks[index];
      if (!chunk) {
        setIsSpeaking(false);
        stopRef.current = null;
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = lang;
      utterance.rate = 0.94;
      utterance.pitch = 1;
      if (voice) {
        utterance.voice = voice;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onerror = () => {
        active = false;
        setIsSpeaking(false);
        stopRef.current = null;
      };
      utterance.onend = () => {
        index += 1;
        if (index >= chunks.length) {
          setIsSpeaking(false);
          stopRef.current = null;
        } else {
          playNext();
        }
      };

      window.speechSynthesis.speak(utterance);
    };

    window.speechSynthesis.cancel();
    stopRef.current = () => {
      active = false;
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    };
    playNext();
  }, []);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
  }, []);

  return { speak, stop, isSpeaking };
}
