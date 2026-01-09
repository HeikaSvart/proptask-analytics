import { TaskPriority, AIAnalysisResult } from "../types";

// If a backend is configured, prefer it to hide API keys client-side.
const backendUrl = (import.meta.env.VITE_BACKEND_URL as string | undefined) || "http://localhost:5001";

export const analyzeMaintenanceImage = async (input: string | File): Promise<AIAnalysisResult> => {
  // Try backend first if reachable; send file if we have one, else base64 JSON
  try {
    let res: Response;
    if (typeof input !== "string") {
      const form = new FormData();
      form.append("file", input);
      res = await fetch(`${backendUrl}/api/analyze-image`, { method: "POST", body: form });
    } else {
      res = await fetch(`${backendUrl}/api/analyze-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: input }),
      });
    }

    if (res.ok) {
      const data = (await res.json()) as AIAnalysisResult;
      const validPriority = Object.values(TaskPriority).includes(data.priority as TaskPriority)
        ? (data.priority as TaskPriority)
        : TaskPriority.MEDIUM;
      return { ...data, priority: validPriority };
    }
  } catch (e) {
    // Backend might be down; fall back to client SDK below.
    console.warn("Backend analyze-image failed, falling back to client SDK.");
  }

  // Fallback: client-side with @google/genai if available and API key provided.
  const { GoogleGenAI, Type } = await import("@google/genai");
  const apiKey = import.meta.env.VITE_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Mangler VITE_API_KEY og backend er utilgjengelig.");
  const ai = new GoogleGenAI({ apiKey });

  const cleanBase64 = typeof input === "string"
    ? input.replace(/^data:image\/(png|jpg|jpeg|webp);base64,/, "")
    : await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve((reader.result as string).split(",", 1).pop() || "");
        reader.onerror = reject;
        reader.readAsDataURL(input);
      });

  const modelName = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";
  const result = await ai.models.generateContent({
    model: modelName,
    contents: [
      {
        role: "user",
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: cleanBase64 } },
          { text: "Du er en ekspert vaktmester-assistent. Analyser bildet og returner KUN JSON: title, description, priority (LOW, MEDIUM, HIGH, CRITICAL), optional suggestedAction. Norsk språk." },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          priority: { type: Type.STRING, enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"] },
          suggestedAction: { type: Type.STRING },
        },
        required: ["title", "description", "priority"],
      },
    },
  });

  const text = result.text;
  if (!text) throw new Error("Ingen respons fra AI.");
  const data = JSON.parse(text) as AIAnalysisResult;
  const validPriority = Object.values(TaskPriority).includes(data.priority as TaskPriority)
    ? (data.priority as TaskPriority)
    : TaskPriority.MEDIUM;
  return { ...data, priority: validPriority };
};
