import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechRecognitionHook {
  isListening: boolean;
  transcript: string;
  startListening: (lang?: string, onFinalTranscript?: (text: string) => void) => void;
  stopListening: () => void;
  error: string | null;
  clearTranscript: () => void;
}

export function useSpeechRecognition(): SpeechRecognitionHook {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef("");
  const finalCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort?.();
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback((lang = "en-US", onFinalTranscript?: (text: string) => void) => {
    const SpeechRecognitionCtor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    recognitionRef.current?.abort?.();
    finalCallbackRef.current = onFinalTranscript ?? null;
    finalTranscriptRef.current = "";
    setTranscript("");
    setError(null);

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onerror = (event) => {
      if (event.error !== "aborted") {
        setError(event.error);
      }
      setIsListening(false);
      recognitionRef.current = null;
    };
    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let index = 0; index < event.results.length; index += 1) {
        const result = event.results[index];
        const text = result[0]?.transcript ?? "";
        if (result.isFinal) {
          finalText += text;
        } else {
          interimText += text;
        }
      }

      if (finalText.trim()) {
        finalTranscriptRef.current = `${finalTranscriptRef.current} ${finalText}`.trim();
      }

      setTranscript(`${finalTranscriptRef.current} ${interimText}`.trim());
    };
    recognition.onend = () => {
      const completedTranscript = finalTranscriptRef.current.trim();
      setIsListening(false);
      recognitionRef.current = null;
      if (completedTranscript && finalCallbackRef.current) {
        finalCallbackRef.current(completedTranscript);
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const clearTranscript = useCallback(() => {
    finalTranscriptRef.current = "";
    setTranscript("");
  }, []);

  return { isListening, transcript, startListening, stopListening, error, clearTranscript };
}
