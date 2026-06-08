// services/services-aiService.ts
import { GoogleGenAI } from "@google/genai";
import { AlertFeature } from "@/app/types/types-alert";
import 'server-only';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getLeadQualityScore(alert: AlertFeature, countyName: string) {
    const props = alert.properties;

    const prompt = `
    Actúa como un analista experto en inteligencia comercial para empresas de techado (roofing) en EE.UU.
    Analiza el siguiente evento meteorológico para el condado de ${countyName}:
    - Evento: ${props.event}
    - Severidad: ${props.severity}
    - Urgencia: ${props.urgency}
    - Certeza: ${props.certainty}
    - Descripción: ${props.description || 'N/A'}

    Tu objetivo es evaluar el "Lead Quality Score" (del 1 al 10) de esta área para una empresa que busca trabajos de reparación de techos tras tormentas.
    
    Consideraciones:
    - Severidad ${props.severity} y certeza ${props.certainty} son claves.
    - Evalúa el potencial de daño estructural basado en el evento.
    - Un 10 es un "SÍ" seguro, alta prioridad comercial. Un 1 es bajo interés.

    Responde ÚNICAMENTE en formato JSON:
    {
        "score": number,
        "reason": "String corto en inglés, máximo 20 palabras explicando el impacto comercial."
    }
  `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
        });

        const text = response.text || "";
        const jsonStr = text.replace(/```json|```/g, "").trim();
        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("Error al obtener score de IA:", error);
        return { score: 0, reason: "Analysis unavailable due to technical error." };
    }
}

export async function getBatchLeadQuality(
    alertsData: { idx: number; alert: AlertFeature; county: string }[]
) {
    // CRITICAL: We send a numeric idx to the AI instead of the real alert ID.
    // LLMs can silently corrupt long URL-like strings (urn:oid → urn:ico, etc.),
    // so we never trust the AI to echo back our IDs. We map results by idx instead.
    const simplifiedAlerts = alertsData.map(item => ({
        idx: item.idx,           // short integer — safe for the model to echo back
        event: item.alert.properties.event,
        severity: item.alert.properties.severity,
        urgency: item.alert.properties.urgency,
        certainty: item.alert.properties.certainty,
        county: item.county,
    }));

    const prompt = `
    Actúa como un experto analista comercial de roofing. Evalúa estas ${simplifiedAlerts.length} alertas meteorológicas.
    Para cada alerta, asigna un "score" (1-10) y una breve razón comercial (max 15 palabras, en inglés).

    Alertas a analizar:
    ${JSON.stringify(simplifiedAlerts)}

    Responde ÚNICAMENTE en formato JSON, devolviendo un array.
    Usa el campo "idx" exactamente como te lo doy (es un número entero, no lo modifiques):
    [
        { "idx": 0, "score": number, "reason": "string" },
        ...
    ]
  `;

    try {
        console.log(`[IA-Batch] Enviando ${simplifiedAlerts.length} alertas al modelo.`);

        const response = await ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: prompt,
        });

        const text = response.text || "[]";
        const jsonStr = text.replace(/```json|```/g, "").trim();
        const results: Array<{ idx: number; score: number; reason: string }> = JSON.parse(jsonStr);

        // Validate all idx values are integers in range
        const validated = results.filter(r => {
            const valid = typeof r.idx === 'number' && r.idx >= 0 && r.idx < alertsData.length;
            if (!valid) console.warn(`[IA-Batch] Resultado con idx inválido ignorado:`, r);
            return valid;
        });

        console.log(`[IA-Batch] Parseo exitoso. ${validated.length}/${simplifiedAlerts.length} resultados válidos.`);
        return validated;

    } catch (error) {
        console.error("[IA-Batch] ERROR CRÍTICO:", error);
        // Fallback: return score 0 for every alert using their idx
        return alertsData.map(a => ({ idx: a.idx, score: 0, reason: "Analysis failed." }));
    }
}