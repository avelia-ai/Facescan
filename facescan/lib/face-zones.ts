import type { FaceBox } from "./face-detector";

export type FaceZoneName =
  | "front"
  | "yeux"
  | "joues"
  | "nez"
  | "bouche"
  | "menton";

export type FaceZone = {
  name: FaceZoneName;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export function buildFaceZones(faceBox: FaceBox): FaceZone[] {
  const { x, y, width, height } = faceBox;

  return [
    {
      name: "front",
      label: "Front",
      x: x + width * 0.28,
      y: y + height * 0.08,
      width: width * 0.44,
      height: height * 0.18,
    },
    {
      name: "yeux",
      label: "Yeux",
      x: x + width * 0.12,
      y: y + height * 0.24,
      width: width * 0.76,
      height: height * 0.16,
    },
    {
      name: "joues",
      label: "Joues",
      x: x + width * 0.08,
      y: y + height * 0.40,
      width: width * 0.84,
      height: height * 0.18,
    },
    {
      name: "nez",
      label: "Nez",
      x: x + width * 0.34,
      y: y + height * 0.38,
      width: width * 0.32,
      height: height * 0.22,
    },
    {
      name: "bouche",
      label: "Bouche",
      x: x + width * 0.27,
      y: y + height * 0.61,
      width: width * 0.46,
      height: height * 0.14,
    },
    {
      name: "menton",
      label: "Menton",
      x: x + width * 0.25,
      y: y + height * 0.76,
      width: width * 0.50,
      height: height * 0.16,
    },
  ];
}
