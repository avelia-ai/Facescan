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
        reject(
          new Error(
            "Impossible de déterminer précisément la zone du visage."
          )
        );
        return;
      }

      const sourceWidth = image.naturalWidth;
      const sourceHeight = image.naturalHeight;

      const scaleX = sourceWidth / face.imageWidth;
      const scaleY = sourceHeight / face.imageHeight;

      const faceX = Math.max(0, Math.floor(face.faceBox.x * scaleX));
      const faceY = Math.max(0, Math.floor(face.faceBox.y * scaleY));
      const faceWidth = Math.min(
        sourceWidth - faceX,
        Math.max(1, Math.floor(face.faceBox.width * scaleX))
      );
      const faceHeight = Math.min(
        sourceHeight - faceY,
        Math.max(1, Math.floor(face.faceBox.height * scaleY))
      );

      /*
       * La bounding box MediaPipe peut contenir une partie des cheveux,
       * du fond ou du cou. On réduit légèrement la zone avant analyse.
       */
      const cropX = faceX + Math.floor(faceWidth * 0.10);
      const cropY = faceY + Math.floor(faceHeight * 0.08);
      const cropWidth = Math.max(
        1,
        Math.min(
          sourceWidth - cropX,
          Math.floor(faceWidth * 0.80)
        )
      );
      const cropHeight = Math.max(
        1,
        Math.min(
          sourceHeight - cropY,
          Math.floor(faceHeight * 0.84)
        )
      );

      const canvas = document.createElement("canvas");
      const maxSize = 500;
      const ratio = Math.min(
        1,
        maxSize / Math.max(cropWidth, cropHeight)
      );

      canvas.width = Math.max(1, Math.round(cropWidth * ratio));
      canvas.height = Math.max(1, Math.round(cropHeight * ratio));

      const context = canvas.getContext("2d", {
        willReadFrequently: true,
      });

      if (!context) {
        reject(new Error("Impossible d'analyser la zone du visage."));
        return;
      }

      context.drawImage(
        image,
        cropX,
        cropY,
        cropWidth,
        cropHeight,
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

      /*
       * Masque elliptique central :
       * il réduit l'influence des cheveux, du contour du visage
       * et de l'arrière-plan restant dans la bounding box.
       */
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radiusX = Math.max(1, canvas.width * 0.45);
      const radiusY = Math.max(1, canvas.height * 0.46);

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const normalizedX = (x - centerX) / radiusX;
          const normalizedY = (y - centerY) / radiusY;

          if (
            normalizedX * normalizedX +
              normalizedY * normalizedY >
            1
          ) {
            continue;
          }

          const index = (y * canvas.width + x) * 4;

          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];

          const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          const saturation =
            max === 0 ? 0 : ((max - min) / max) * 100;

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
      }

      if (pixels === 0) {
        reject(
          new Error(
            "Aucun pixel exploitable dans la zone du visage."
          )
        );
        return;
      }

      /*
       * Statistiques robustes :
       * on retire les 10 % de valeurs les plus basses et les plus hautes
       * avant d'estimer la dispersion. Cela limite l'effet des yeux,
       * cheveux, lèvres et zones très ombrées.
       */
      const sortedBrightness = [...brightnessValues].sort(
        (a, b) => a - b
      );

      const trimCount = Math.floor(sortedBrightness.length * 0.10);
      const trimmedBrightness =
        sortedBrightness.slice(
          trimCount,
          Math.max(
            trimCount + 1,
            sortedBrightness.length - trimCount
          )
        );

      const trimmedAverage =
        trimmedBrightness.reduce(
          (sum, value) => sum + value,
          0
        ) / trimmedBrightness.length;

      const trimmedVariance =
        trimmedBrightness.reduce(
          (sum, value) =>
            sum + Math.pow(value - trimmedAverage, 2),
          0
        ) / trimmedBrightness.length;

      const brightnessDeviation = Math.sqrt(
        Math.max(0, trimmedVariance)
      );

      const averageBrightness = totalBrightness / pixels;
      const averageRedness = totalRedness / pixels;
      const averageSaturation = totalSaturation / pixels;

      /*
       * Ces signaux restent des indicateurs visuels heuristiques.
       * Ils ne constituent pas des mesures médicales.
       *
       * Les coefficients sont volontairement moins sévères que
       * l'ancienne version afin qu'une variation normale d'éclairage
       * ne transforme pas immédiatement le score peau en valeur extrême.
       */
      const skinUniformity = clamp(
        100 -
          Math.max(0, brightnessDeviation - 8) * 1.55
      );

      const texture = clamp(
        100 -
          Math.max(0, brightnessDeviation - 10) * 1.05
      );

      const visibleRedness = clamp(
        48 + averageRedness * 2.15
      );

      const underEyeAppearance = clamp(
        100 -
          Math.abs(averageBrightness - 125) * 0.30 -
          Math.max(0, brightnessDeviation - 8) * 0.48
      );

      const apparentHydration = clamp(
        48 +
          averageBrightness * 0.13 +
          averageSaturation * 0.14 -
          Math.max(0, brightnessDeviation - 10) * 0.18
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

  /*
   * L'équilibre représente le score global visible dans l'application.
   * Il est calculé uniquement à partir des trois indicateurs principaux
   * afin que le score global soit transparent et cohérent avec l'interface.
   */
  const equilibre = clamp(
    average([
      peau,
      hydratation,
      fatigue,
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
