export async function compressImageToDataUrl(
  file: File,
  targetBytes: number = 300 * 1024,
  maxDimension: number = 1280
): Promise<string> {
  const img = await fileToImage(file);

  const { width, height } = scaleToFit(img.width, img.height, maxDimension);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Kan ikke opprette 2D context');
  ctx.drawImage(img, 0, 0, width, height);

  // Try multiple qualities to get under target size
  const qualities = [0.8, 0.7, 0.6, 0.5];
  for (const q of qualities) {
    const dataUrl = canvas.toDataURL('image/jpeg', q);
    const approxBytes = Math.ceil((dataUrl.length * 3) / 4) - 2; // base64 to bytes estimate
    if (approxBytes <= targetBytes) return dataUrl;
  }
  // Return last attempt if still over target
  return canvas.toDataURL('image/jpeg', 0.5);
}

function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function scaleToFit(width: number, height: number, maxDim: number) {
  const scale = Math.min(1, maxDim / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

