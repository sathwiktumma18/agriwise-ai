import type { AnalysisApiResponse, FarmInput, VoiceParseResult } from "@/lib/agentEngine";
import type { Language } from "@/lib/translations";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";

async function readError(response: Response) {
  const text = await response.text();
  try {
    const parsed = JSON.parse(text) as { detail?: string };
    return parsed.detail || text || "Request failed.";
  } catch {
    return text || "Request failed.";
  }
}

export async function parseVoiceInput(text: string, language: Language): Promise<VoiceParseResult> {
  const response = await fetch(`${API_BASE_URL}/voice/parse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, language }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as VoiceParseResult;
}

export async function analyzeFarm(formInput: FarmInput, language: Language): Promise<AnalysisApiResponse> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language, formInput }),
  });

  if (!response.ok) {
    throw new Error(await readError(response));
  }

  return (await response.json()) as AnalysisApiResponse;
}
