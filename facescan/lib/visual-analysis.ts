import type { ScanPhotoAnalysis } from "@/lib/scan-analysis";
import type { FaceDetectionResult } from "@/lib/face-detector";

export type VisualSignals = {
  skinUniformity: number;
  visibleRedness: number;
  texture: number;
  underEyeAppearance: number;
  apparentHydration: number;
};

export type VisualIndicators = {
  peau: number;
  hydratation: number;
  fatigue: number;
  equilibre: number;
};

export type VisualAnalysis = {
  imageQuality: ScanPhotoAnalysis;
  faceDetection: FaceDetectionResult;
  visualSignals: VisualSignals;
  indicators: VisualIndicators;
};

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function analyzeFacePixels(
  imageDataUrl: string,
  face: FaceDetectionResult
): Promise<VisualSignals> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      if (!face.faceBox) {
        resolve({
          skinUniformity: 50,
          visibleRedness: 50,
          texture: 50,
          underEyeAppearance: 50,
          apparentHydration: 50,
        });
        return;
      }

      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;

      const scaleX = sourceWidth / face.imageWidth;
      const scaleY = sourceHeight / face.imageHeight;

      const x = Math.max(0, Math.floor(face.faceBox.x * scaleX));
      const y = Math.max(0, Math.floor(face.faceBox.y * scaleY));
      const width = Math.min(
        sourceWidth - x,
        Math.max(1, Math.floor(face.faceBox.width * scaleX))
      );
      const height = Math.min(
        sourceHeight - y,
        Math.max(1, Math.floor(face.faceBox.height * scaleY))
      );

      const canvas = document.createElement("canvas");
      const maxSize = 500;
      const ratio = Math.min(1, maxSize / Math.max(width, height));

      canvas.width = Math.max(1, Math.round(width * ratio));
      canvas.height = Math.max(1, Math.round(height * ratio));

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!context) {
        reject(new Error("Impossible d'analyser la zone du visage."));
        return;
      }

      context.drawImage(
        image,
        x,
        y,
        width,
        height,
        0,
        0,
        canvas.width,
        canvas.height
      );

      const { data } = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
      );

      const brightnessValues: number[] = [];
      const rednessValues: number[] = [];

      let totalBrightness = 0;
      let totalRedness = 0;
      let totalSaturation = 0;
      let pixels = 0;

      for (let index = 0; index < data.length; index += 4) {
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];

        const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const saturation = max === 0 ? 0 : ((max - min) / max) * 100;

        const redness = Math.max(
          0,
          ((r - (g + b) / 2) / 255) * 100
        );

        brightnessValues.push(brightness);
        rednessValues.push(redness);

        totalBrightness += brightness;
        totalRedness += redness;
        totalSaturation += saturation;
        pixels += 1;
      }

      if (pixels === 0) {
        resolve({
          skinUniformity: 50,
          visibleRedness: 50,
          texture: 50,
          underEyeAppearance: 50,
          apparentHydration: 50,
        });
        return;
      }

      const averageBrightness = totalBrightness / pixels;
      const averageRedness = totalRedness / pixels;
      const averageSaturation = totalSaturation / pixels;

      const brightnessVariance = average(
        brightnessValues.map((value) =>
          Math.pow(value - averageBrightness, 2)
        )
      );

      const brightnessDeviation = Math.sqrt(brightnessVariance);

      /*
       * Ces signaux sont volontairement des indicateurs visuels
       * approximatifs. Ils ne constituent pas des mesures médicales.
       */

      const skinUniformity = clamp(
        100 - brightnessDeviation * 2.1
      );

      const visibleRedness = clamp(
        50 + averageRedness * 2.4
      );

      const texture = clamp(
        100 - brightnessDeviation * 1.7
      );

      const underEyeAppearance = clamp(
        100 -
          Math.abs(averageBrightness - 125) * 0.45 -
          brightnessDeviation * 0.65
      );

      const apparentHydration = clamp(
        45 +
          averageBrightness * 0.16 +
          averageSaturation * 0.18 -
          brightnessDeviation * 0.25
      );

      resolve({
        skinUniformity,
        visibleRedness,
        texture,
        underEyeAppearance,
        apparentHydration,
      });
    };

    image.onerror = () => {
      reject(new Error("Impossible de charger l'image."));
    };

    image.src = imageDataUrl;
  });
}

function buildIndicators(
  signals: VisualSignals,
  imageQuality: ScanPhotoAnalysis,
  faceDetection: FaceDetectionResult
): VisualIndicators {
  const qualityFactor = imageQuality.qualityScore / 100;
  const confidenceFactor = faceDetection.confidence / 100;

  const peau = clamp(
    signals.skinUniformity * 0.45 +
      signals.texture * 0.30 +
      (100 - signals.visibleRedness) * 0.15 +
      qualityFactor * 100 * 0.10
  );

  const hydratation = clamp(
    signals.apparentHydration * 0.70 +
      signals.skinUniformity * 0.15 +
      qualityFactor * 100 * 0.15
  );

  const fatigue = clamp(
    signals.underEyeAppearance * 0.65 +
      signals.skinUniformity * 0.15 +
      confidenceFactor * 100 * 0.10 +
      qualityFactor * 100 * 0.10
  );

  const equilibre = clamp(
    average([
      peau,
      hydratation,
      fatigue,
      signals.skinUniformity,
    ])
  );

  return {
    peau,
    hydratation,
    fatigue,
    equilibre,
  };
}

export async function buildVisualAnalysis(
  imageDataUrl: string,
  imageQuality: ScanPhotoAnalysis,
  faceDetection: FaceDetectionResult
): Promise<VisualAnalysis> {
  const visualSignals = await analyzeFacePixels(
    imageDataUrl,
    faceDetection
  );

  const indicators = buildIndicators(
    visualSignals,
    imageQuality,
    faceDetection
  );

  return {
    imageQuality,
    faceDetection,
    visualSignals,
    indicators,
  };
}
