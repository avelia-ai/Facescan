import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";

let detector: FaceDetector | null = null;

async function getDetector() {
  if (detector) return detector;

  const vision = await FilesetResolver.forVisionTasks("/mediapipe");

  detector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: "/models/face_detector.tflite",
      delegate: "CPU",
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.5,
  });

  return detector;
}

export type FaceBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type FaceDetectionResult = {
  detected: boolean;
  faceCount: number;
  confidence: number;
  faceBox: FaceBox | null;
  imageWidth: number;
  imageHeight: number;
};

export async function detectFace(
  imageDataUrl: string
): Promise<FaceDetectionResult> {
  if (typeof window === "undefined") {
    throw new Error("La détection doit être exécutée dans le navigateur.");
  }

  const image = new Image();

  const loadedImage = await new Promise<HTMLImageElement>(
    (resolve, reject) => {
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error("Impossible de charger l’image."));
      image.src = imageDataUrl;
    }
  );

  const imageWidth = loadedImage.naturalWidth;
  const imageHeight = loadedImage.naturalHeight;

  if (!imageWidth || !imageHeight) {
    throw new Error("Dimensions d’image invalides.");
  }

  /*
   * Sur certains smartphones, MediaPipe peut échouer sur une image
   * haute résolution fournie directement sous forme de HTMLImageElement.
   * On réduit donc l’image avant l’inférence.
   */
  const maxDetectionSize = 640;
  const scale = Math.min(
    1,
    maxDetectionSize / Math.max(imageWidth, imageHeight)
  );

  const detectionWidth = Math.max(1, Math.round(imageWidth * scale));
  const detectionHeight = Math.max(1, Math.round(imageHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = detectionWidth;
  canvas.height = detectionHeight;

  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Impossible de préparer l’image pour la détection.");
  }

  context.drawImage(
    loadedImage,
    0,
    0,
    imageWidth,
    imageHeight,
    0,
    0,
    detectionWidth,
    detectionHeight
  );

  const faceDetector = await getDetector();

  let detections: any[] = [];

  try {
    const result = faceDetector.detect(canvas);
    detections = result.detections ?? [];
  } catch (error) {
    console.error("Erreur MediaPipe pendant la détection du visage.", error);
    throw new Error(
      "La détection du visage n’a pas pu être effectuée."
    );
  }

  if (detections.length === 0) {
    return {
      detected: false,
      faceCount: 0,
      confidence: 0,
      faceBox: null,
      imageWidth,
      imageHeight,
    };
  }

  const bestDetection = detections.reduce((best, current) => {
    const bestScore = best.categories?.[0]?.score ?? 0;
    const currentScore = current.categories?.[0]?.score ?? 0;

    return currentScore > bestScore ? current : best;
  });

  const box = bestDetection.boundingBox;

  const confidence = Math.round(
    (bestDetection.categories?.[0]?.score ?? 0) * 100
  );

  return {
    detected: true,
    faceCount: detections.length,
    confidence,
    faceBox: box
      ? {
          x: box.originX / scale,
          y: box.originY / scale,
          width: box.width / scale,
          height: box.height / scale,
        }
      : null,
    imageWidth,
    imageHeight,
  };
}
