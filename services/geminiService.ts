
import { GoogleGenAI, Modality, GenerateContentResponse, Part } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const model = 'gemini-2.5-flash-image-preview';

export const removeImageBackground = async (imagePart: { inlineData: { data: string; mimeType: string } }): Promise<string> => {
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          imagePart,
          {
            text: 'أزل خلفية هذه الصورة. يجب أن يكون الناتج هو العنصر الرئيسي فقط مع خلفية شفافة تمامًا. لا تقم بإضافة أي عناصر أو تعديلات أخرى.',
          },
        ],
      },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    const candidate = response.candidates?.[0];
    if (!candidate) {
      throw new Error("لم يتم العثور على استجابة من الـ API.");
    }
    
    const resultImagePart = candidate.content?.parts?.find((part: Part) => part.inlineData);

    if (resultImagePart && resultImagePart.inlineData) {
        const newMimeType = resultImagePart.inlineData.mimeType;
        const newBase64Data = resultImagePart.inlineData.data;
        return `data:${newMimeType};base64,${newBase64Data}`;
    }
    
    const textPart = candidate.content?.parts?.find((part: Part) => part.text);
    if (textPart && textPart.text) {
        throw new Error(`استجاب الـ API بنص بدلاً من صورة: "${textPart.text}"`);
    }

    throw new Error("لم يتمكن الـ API من إرجاع صورة صالحة. الرجاء تجربة صورة مختلفة.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`فشلت إزالة الخلفية: ${error.message}`);
    }
    throw new Error("حدث خطأ غير معروف أثناء إزالة الخلفية.");
  }
};
