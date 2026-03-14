export interface DiseaseDetectionResult {
  diseaseKey: string;
  diseaseLabel: string;
  severityKey: string;
  severityLabel: string;
  treatmentKey: string;
  treatment: string;
  confidence: number;
  modelId: string;
  isHealthy: boolean;
}

type CandidateDisease = {
  id: string;
  label: string;
  severity: "low" | "medium" | "high";
  treatmentKey: string;
  treatment: string;
  isHealthy?: boolean;
};

type ZeroShotPrediction = {
  label: string;
  score: number;
};

type ZeroShotClassifier = (
  image: Blob | HTMLCanvasElement,
  candidateLabels: string[],
  options?: Record<string, unknown>
) => Promise<ZeroShotPrediction[] | ZeroShotPrediction[][]>;

const DEFAULT_MODEL_ID =
  process.env.NEXT_PUBLIC_DISEASE_MODEL_ID || "Xenova/clip-vit-base-patch32";

const CANDIDATE_DISEASES: CandidateDisease[] = [
  {
    id: "healthy_leaf",
    label: "healthy green leaf",
    severity: "low",
    treatmentKey: "treatment_healthy_leaf",
    treatment:
      "Leaf looks healthy. Keep monitoring, avoid overwatering, and maintain balanced nutrition.",
    isHealthy: true,
  },
  {
    id: "bacterial_leaf_spot",
    label: "bacterial leaf spot on crop leaf",
    severity: "medium",
    treatmentKey: "treatment_bacterial_leaf_spot",
    treatment:
      "Remove badly affected leaves, avoid overhead irrigation, and use a copper-based bactericide if required.",
  },
  {
    id: "early_blight",
    label: "early blight on plant leaf",
    severity: "medium",
    treatmentKey: "treatment_early_blight",
    treatment:
      "Prune infected foliage, improve airflow, and apply a recommended fungicide before spread increases.",
  },
  {
    id: "late_blight",
    label: "late blight on plant leaf",
    severity: "high",
    treatmentKey: "treatment_late_blight",
    treatment:
      "Isolate infected plants quickly, reduce leaf wetness, and use a fast-acting blight fungicide.",
  },
  {
    id: "leaf_rust",
    label: "leaf rust disease on crop leaf",
    severity: "medium",
    treatmentKey: "treatment_leaf_rust",
    treatment:
      "Remove affected leaves where possible and use a rust-control fungicide with proper field sanitation.",
  },
  {
    id: "powdery_mildew",
    label: "powdery mildew on crop leaf",
    severity: "medium",
    treatmentKey: "treatment_powdery_mildew",
    treatment:
      "Reduce humidity around plants, improve spacing, and spray sulfur or another suitable mildew treatment.",
  },
  {
    id: "mosaic_virus",
    label: "mosaic virus symptoms on plant leaf",
    severity: "high",
    treatmentKey: "treatment_mosaic_virus",
    treatment:
      "Remove infected plants, disinfect tools, and control insect vectors such as aphids and whiteflies.",
  },
  {
    id: "nutrient_deficiency",
    label: "nutrient deficiency on crop leaf",
    severity: "low",
    treatmentKey: "treatment_nutrient_deficiency",
    treatment:
      "Check soil nutrition, correct the missing nutrient gradually, and monitor new leaf growth for recovery.",
  },
];

let classifierPromise: Promise<ZeroShotClassifier> | null = null;

async function createClassifier(
  device: "webgpu" | "wasm"
): Promise<ZeroShotClassifier> {
  const { env, pipeline } = await import("@huggingface/transformers");

  env.allowLocalModels = true;
  env.allowRemoteModels = true;

  const options = {
    device,
    dtype: device === "webgpu" ? ("fp16" as const) : ("q8" as const),
  };

  const result = await pipeline(
    "zero-shot-image-classification",
    DEFAULT_MODEL_ID,
    options
  );
  return result as unknown as ZeroShotClassifier;
}

async function getClassifier(): Promise<ZeroShotClassifier> {
  if (!classifierPromise) {
    classifierPromise = (async () => {
      const prefersWebGpu =
        typeof navigator !== "undefined" && "gpu" in navigator;

      if (prefersWebGpu) {
        try {
          return await createClassifier("webgpu");
        } catch {
          return await createClassifier("wasm");
        }
      }

      return await createClassifier("wasm");
    })();
  }

  return classifierPromise;
}

function normalizePredictions(
  predictions: ZeroShotPrediction[] | ZeroShotPrediction[][]
): ZeroShotPrediction[] {
  const firstPrediction = predictions[0];
  const flatPredictions = Array.isArray(firstPrediction)
    ? (firstPrediction as ZeroShotPrediction[])
    : (predictions as ZeroShotPrediction[]);

  return [...flatPredictions].sort((a, b) => b.score - a.score);
}

export function getDiseaseModelId() {
  return DEFAULT_MODEL_ID;
}

export async function analyzePlantDisease(
  image: Blob | HTMLCanvasElement
): Promise<DiseaseDetectionResult> {
  const classifier = await getClassifier();
  const predictions = normalizePredictions(
    await classifier(
      image,
      CANDIDATE_DISEASES.map((candidate) => candidate.label),
      {
        hypothesis_template: "This image shows {}.",
      }
    )
  );

  const topPrediction = predictions[0];
  const matchedDisease =
    CANDIDATE_DISEASES.find(
      (candidate) => candidate.label === topPrediction?.label
    ) || CANDIDATE_DISEASES[0];

  return {
    diseaseKey: `disease_${matchedDisease.id}`,
    diseaseLabel: matchedDisease.label,
    severityKey: `severity_${matchedDisease.severity}`,
    severityLabel: matchedDisease.severity,
    treatmentKey: matchedDisease.treatmentKey,
    treatment: matchedDisease.treatment,
    confidence: Math.round((topPrediction?.score || 0) * 100),
    modelId: DEFAULT_MODEL_ID,
    isHealthy: Boolean(matchedDisease.isHealthy),
  };
}
