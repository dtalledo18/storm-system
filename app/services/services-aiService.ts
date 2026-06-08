// services/services-aiService.ts
import { GoogleGenAI } from "@google/genai";
import { AlertFeature } from "@/app/types/types-alert";

// Inicialización con el nuevo SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getLeadQualityScore(alert: AlertFeature, countyName: string) {
    const props = alert.properties;

    // Prompt optimizado para ser un experto en Roofing y retorno de JSON
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

        // La respuesta del SDK nuevo viene en response.text
        const text = response.text || "";

        // Limpiamos la respuesta por si incluye bloques de markdown
        const jsonStr = text.replace(/```json|```/g, "").trim();

        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("Error al obtener score de IA:", error);
        // Retorno de fallback seguro si la IA falla
        return {
            score: 0,
            reason: "Analysis unavailable due to technical error."
        };
    }
}