import OpenAI from "openai";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const analysisSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    skinUniformity: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    visibleRedness: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    texture: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    underEyeAppearance: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    apparentHydration: {
      type: "number",
      minimum: 0,
      maximum: 100,
    },
    visualNotes: {
      type: "array",
      items: {
        type: "string",
      },
      maxItems: 5,
    },
  },
  required: [
    "skinUniformity",
    "visibleRedness",
    "texture",
    "underEyeAppearance",
    "apparentHydration",
    "visualNotes",
  ],
};

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

const analysisCooldowns = new Map<string, number>();

const MAX_SCANS_PER_WINDOW = 5;
const SCAN_WINDOW_MS = 15 * 60 * 1000;
const MIN_ANALYSIS_INTERVAL_MS = 20 * 1000;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Utilisateur non authentifié." },
        { status: 401 }
      );
    }

    const now = Date.now();
    const lastAnalysisAt = analysisCooldowns.get(user.id);

    if (
      lastAnalysisAt &&
      now - lastAnalysisAt < MIN_ANALYSIS_INTERVAL_MS
    ) {
      const retryAfter = Math.ceil(
        (MIN_ANALYSIS_INTERVAL_MS - (now - lastAnalysisAt)) / 1000
      );

      return NextResponse.json(
        {
          error:
            "Une analyse vient déjà d’être lancée. Réessayez dans quelques secondes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
          },
        }
      );
    }

    if (
      lastAnalysisAt &&
      now - lastAnalysisAt >= MIN_ANALYSIS_INTERVAL_MS
    ) {
      analysisCooldowns.delete(user.id);
    }

    const windowStart = new Date(
      now - SCAN_WINDOW_MS
    ).toISOString();

    const {
      count: recentScanCount,
      error: recentScanError,
    } = await supabase
      .from("scans")
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("user_id", user.id)
      .gte("created_at", windowStart);

    if (recentScanError) {
      console.error(
        "Scan rate limit lookup error:",
        recentScanError
      );

      return NextResponse.json(
        {
          error:
            "Le service d’analyse est temporairement indisponible. Réessayez dans quelques instants.",
        },
        { status: 503 }
      );
    }

    if ((recentScanCount ?? 0) >= MAX_SCANS_PER_WINDOW) {
      return NextResponse.json(
        {
          error:
            "La limite temporaire d’analyses a été atteinte. Réessayez dans quelques minutes.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil(SCAN_WINDOW_MS / 1000)
            ),
          },
        }
      );
    }

    const body = await request.json().catch(() => null);
    const image = body?.image;

    if (typeof image !== "string" || !image.startsWith("data:image/")) {
      return NextResponse.json(
        { error: "Image invalide." },
        { status: 400 }
      );
    }

    const allowedTypes = [
      "data:image/jpeg",
      "data:image/png",
      "data:image/webp",
    ];

    if (!allowedTypes.some((type) => image.startsWith(type))) {
      return NextResponse.json(
        { error: "Format d’image non pris en charge." },
        { status: 400 }
      );
    }

    if (image.length > 7_000_000) {
      return NextResponse.json(
        { error: "Image trop volumineuse." },
        { status: 413 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Service d’analyse temporairement indisponible." },
        { status: 503 }
      );
    }

    const openai = new OpenAI({ apiKey });

    analysisCooldowns.set(user.id, Date.now());

    const response = await openai.responses.create({
      model: "gpt-5.6-luna",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyse cette photo de visage uniquement sur des caractéristiques
VISUELLEMENT OBSERVABLES.

Ne pose aucun diagnostic médical.
N'affirme pas un niveau physiologique réel d'hydratation.
N'infère pas une maladie, un état de santé, un stress psychologique ou
une condition médicale à partir du visage.

Évalue uniquement :
- uniformité visuelle du teint et de la peau
- rougeurs visibles
- aspect visuel de la texture
- aspect visuel du contour sous les yeux
- apparence visuelle de sécheresse ou de confort cutané

Les scores vont de 0 à 100.
Pour uniformité, texture, contour sous les yeux et apparence d'hydratation,
100 signifie un aspect visuel plus homogène/favorable.
Pour visibleRedness, 0 signifie très peu de rougeur visible et 100 beaucoup
de rougeur visible.

Retourne uniquement le JSON demandé par le schéma.
              `.trim(),
            },
            {
              type: "input_image",
              image_url: image,
              detail: "low",
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "facescan_visual_analysis",
          strict: true,
          schema: analysisSchema,
        },
      },
      max_output_tokens: 500,
    });

    const raw = response.output_text;

    if (!raw) {
      return NextResponse.json(
        { error: "L’analyse n’a renvoyé aucun résultat." },
        { status: 502 }
      );
    }

    const parsed = JSON.parse(raw);

    const visualSignals = {
      skinUniformity: clamp(parsed.skinUniformity),
      visibleRedness: clamp(parsed.visibleRedness),
      texture: clamp(parsed.texture),
      underEyeAppearance: clamp(parsed.underEyeAppearance),
      apparentHydration: clamp(parsed.apparentHydration),
    };

    return NextResponse.json({
      visualSignals,
      visualNotes: Array.isArray(parsed.visualNotes)
        ? parsed.visualNotes.slice(0, 5)
        : [],
    });
  } catch (error) {
    console.error("OpenAI scan analysis error:", error);

    return NextResponse.json(
      { error: "Analyse visuelle indisponible pour le moment." },
      { status: 500 }
    );
  }
}
