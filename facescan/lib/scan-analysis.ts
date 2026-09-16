export type ScanPhotoAnalysis = {
  qualityScore: number;
  qualityLabel: "Faible" | "Correcte" | "Bonne" | "Excellente";
  brightness: number;
  contrast: number;
  recommendations: string[];
};

function getQualityLabel(score: number): ScanPhotoAnalysis["qualityLabel"] {
  if (score < 50) return "Faible";
  if (score < 70) return "Correcte";
  if (score < 85) return "Bonne";
  return "Excellente";
}

export function analyzeScanPhoto(
  imageDataUrl: string
): Promise<ScanPhotoAnalysis> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement("canvas");

      const maxSize = 600;
      const ratio = Math.min(
        1,
        maxSize / Math.max(image.naturalWidth, image.naturalHeight)
      );

      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));

      const context = canvas.getContext("2d", { willReadFrequently: true });

      if (!context) {
        reject(new Error("Impossible d'analyser l'image."));
        return;
      }

      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const { data } = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      let brightnessTotal = 0;
      let brightnessSquaredTotal = 0;
      let pixels = 0;

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        brightnessTotal += brightness;
        brightnessSquaredTotal += brightness * brightness;
        pixels += 1;
      }

      const averageBrightness = brightnessTotal / pixels;
      const variance =
        brightnessSquaredTotal / pixels -
        averageBrightness * averageBrightness;

      const standardDeviation = Math.sqrt(Math.max(0, variance));

      const brightnessScore =
        100 -
        Math.min(
          100,
          Math.abs(averageBrightness - 135) * 0.85
        );

      const contrastScore = Math.min(
        100,
        standardDeviation * 3.2
      );

      const qualityScore = Math.round(
        brightnessScore * 0.6 + contrastScore * 0.4
      );

      const recommendations: string[] = [];

      if (averageBrightness < 75) {
        recommendations.push("Augmenter légèrement la lumière.");
      }

      if (averageBrightness > 205) {
        recommendations.push("Éviter une lumière trop forte ou directe.");
      }

      if (standardDeviation < 22) {
        recommendations.push("Privilégier une image plus nette et mieux contrastée.");
      }

      if (recommendations.length === 0) {
        recommendations.push("Conditions visuelles favorables pour le scan.");
      }

      resolve({
        qualityScore,
        qualityLabel: getQualityLabel(qualityScore),
        brightness: Math.round(averageBrightness),
        contrast: Math.round(standardDeviation),
        recommendations,
      });
    };

    image.onerror = () => {
      reject(new Error("Impossible de charger l'image."));
    };

    image.src = imageDataUrl;
  });
}
