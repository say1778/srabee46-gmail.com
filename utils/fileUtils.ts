
export const fileToGenerativePart = (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      const mimeType = result.split(';')[0].split(':')[1];
      
      if (!mimeType.startsWith('image/')) {
        return reject(new Error('الملف المحدد ليس صورة.'));
      }

      resolve({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    };
    reader.onerror = (error) => reject(error);
  });
};
