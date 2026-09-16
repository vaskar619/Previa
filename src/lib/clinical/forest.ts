import { CATALOG_VERSION, DISEASES, MAX_DEPTH, N_TREES } from "./catalog";
import { BIO_FEATURES, FEATURE_INDEX, FEATURE_NAMES, emptyVector } from "./features";
import type { Disease } from "./types";

type Split = { t: 0; f: number; th: number; l: number; r: number };
type Leaf = { t: 1; k: number[]; v: number[] };
type Node = Split | Leaf;
export type Tree = { nodes: Node[] };

export type Forest = {
  version: string;
  nTrees: number;
  nFeatures: number;
  classIds: string[];
  trees: Tree[];
};

const CONTINUOUS = new Set([
  "age",
  "bmi",
  "temperature",
  "heart_rate",
  "sbp",
  "dbp",
  "spo2",
  "resp_rate",
  "duration_days",
  "severity",
]);

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function randn(rng: () => number) {
  const u = Math.max(rng(), 1e-9);
  const v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function clamp(x: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, x));
}

function samplePatient(d: Disease, rng: () => number): Float64Array {
  const v = emptyVector();
  const set = (name: string, value: number) => {
    const i = FEATURE_INDEX[name];
    if (i != null) v[i] = value;
  };

  const age = clamp(d.ageMin + rng() * (d.ageMax - d.ageMin), 0, 100);
  set("age", age);

  let female = rng() < 0.51;
  if (d.sexBias === "female") female = rng() < 0.78;
  if (d.sexBias === "male") female = rng() < 0.22;
  set("is_female", female ? 1 : 0);
  set("is_male", female ? 0 : 1);

  const bmi = clamp(24 + randn(rng) * 5 + (d.smokerBoost ? 1 : 0), 16, 48);
  set("bmi", bmi);
  set("pregnant", d.pregnancyRisk && female && age >= 16 && age <= 44 && rng() < 0.12 ? 1 : 0);
  set("smoker", d.smokerBoost ? (rng() < 0.55 ? 1 : 0) : rng() < 0.18 ? 1 : 0);

  const fever = d.vitals.highFever || d.vitals.fever;
  set(
    "temperature",
    d.vitals.highFever
      ? 39.3 + randn(rng) * 0.45
      : d.vitals.fever
        ? 38.3 + randn(rng) * 0.5
        : 36.7 + randn(rng) * 0.25,
  );
  set("heart_rate", d.vitals.tachy ? 110 + randn(rng) * 12 : d.vitals.brady ? 54 + randn(rng) * 6 : 74 + randn(rng) * 10);
  set(
    "sbp",
    d.vitals.hypotensive ? 86 + randn(rng) * 8 : d.vitals.hypertensive ? 168 + randn(rng) * 14 : 122 + randn(rng) * 12,
  );
  set("dbp", d.vitals.hypertensive ? 98 + randn(rng) * 8 : d.vitals.hypotensive ? 54 + randn(rng) * 6 : 76 + randn(rng) * 8);
  set("spo2", d.vitals.hypoxic ? 90 + randn(rng) * 3 : 97.6 + randn(rng) * 1.1);
  set("resp_rate", d.vitals.hypoxic || d.vitals.tachy ? 24 + randn(rng) * 4 : 16 + randn(rng) * 2);

  const acute = d.urgency === "emergency" || d.urgency === "urgent";
  set("duration_days", acute ? Math.max(0.2, rng() * 4) : 2 + rng() * 14);
  set("severity", d.urgency === "emergency" ? 8 + rng() * 2 : d.urgency === "urgent" ? 6 + rng() * 2.5 : 3 + rng() * 4);
  set("sudden_onset", acute && rng() < 0.7 ? 1 : rng() < 0.2 ? 1 : 0);

  for (const c of d.comorbidBoost) {
    const key = c.replace("-", "_");
    if (key === "heart_disease" || FEATURE_INDEX[c] != null || FEATURE_INDEX[key] != null) {
      if (c === "heart-disease") set("heart_disease", rng() < 0.55 ? 1 : 0);
      else if (c === "kidney-disease") set("kidney_disease", rng() < 0.5 ? 1 : 0);
      else if (c === "immunocompromised") set("immunocompromised", rng() < 0.35 ? 1 : 0);
      else set(c, rng() < 0.55 ? 1 : 0);
    }
  }
  set("travel", d.travelBoost ? (rng() < 0.7 ? 1 : 0) : rng() < 0.04 ? 1 : 0);

  for (const id of Object.keys(FEATURE_INDEX)) {
    if ((BIO_FEATURES as readonly string[]).includes(id)) continue;
    const p = d.symptoms[id] ?? 0.018;
    if (rng() < p) set(id, 1);
  }
  return v;
}

function gini(counts: number[], n: number) {
  if (n <= 0) return 0;
  let sumSq = 0;
  for (const c of counts) sumSq += c * c;
  return 1 - sumSq / (n * n);
}

function majorityLeaf(y: Int16Array, idx: number[], nClasses: number): Leaf {
  const counts = new Array<number>(nClasses).fill(0);
  for (const i of idx) counts[y[i]]++;
  const k: number[] = [];
  const v: number[] = [];
  for (let c = 0; c < nClasses; c++) {
    if (counts[c] > 0) {
      k.push(c);
      v.push(counts[c]);
    }
  }
  return { t: 1, k, v };
}

function bestSplit(
  X: Float64Array[],
  y: Int16Array,
  idx: number[],
  nClasses: number,
  rng: () => number,
): { f: number; th: number; left: number[]; right: number[] } | null {
  const n = idx.length;
  if (n < 8) return null;
  const nFeat = FEATURE_NAMES.length;
  const nTry = Math.max(8, Math.floor(Math.sqrt(nFeat)));
  const tried = new Set<number>();
  let bestGain = 1e-4;
  let bestF = -1;
  let bestTh = 0;
  let bestLeft: number[] | null = null;
  let bestRight: number[] | null = null;

  const parentCounts = new Array<number>(nClasses).fill(0);
  for (const i of idx) parentCounts[y[i]]++;
  const parentG = gini(parentCounts, n);

  for (let t = 0; t < nTry * 3 && tried.size < nTry; t++) {
    const f = Math.floor(rng() * nFeat);
    if (tried.has(f)) continue;
    tried.add(f);
    const name = FEATURE_NAMES[f];
    const continuous = CONTINUOUS.has(name);

    if (!continuous) {
      const left: number[] = [];
      const right: number[] = [];
      for (const i of idx) {
        if (X[i][f] <= 0.5) left.push(i);
        else right.push(i);
      }
      if (left.length < 4 || right.length < 4) continue;
      const lc = new Array<number>(nClasses).fill(0);
      const rc = new Array<number>(nClasses).fill(0);
      for (const i of left) lc[y[i]]++;
      for (const i of right) rc[y[i]]++;
      const gain = parentG - (left.length / n) * gini(lc, left.length) - (right.length / n) * gini(rc, right.length);
      if (gain > bestGain) {
        bestGain = gain;
        bestF = f;
        bestTh = 0.5;
        bestLeft = left;
        bestRight = right;
      }
    } else {
      const vals = idx.map((i) => X[i][f]);
      vals.sort((a, b) => a - b);
      const qs = [0.25, 0.4, 0.5, 0.6, 0.75];
      for (const q of qs) {
        const th = vals[Math.min(vals.length - 1, Math.floor(q * vals.length))];
        const left: number[] = [];
        const right: number[] = [];
        for (const i of idx) {
          if (X[i][f] <= th) left.push(i);
          else right.push(i);
        }
        if (left.length < 4 || right.length < 4) continue;
        const lc = new Array<number>(nClasses).fill(0);
        const rc = new Array<number>(nClasses).fill(0);
        for (const i of left) lc[y[i]]++;
        for (const i of right) rc[y[i]]++;
        const gain = parentG - (left.length / n) * gini(lc, left.length) - (right.length / n) * gini(rc, right.length);
        if (gain > bestGain) {
          bestGain = gain;
          bestF = f;
          bestTh = th;
          bestLeft = left;
          bestRight = right;
        }
      }
    }
  }
  if (bestF < 0 || !bestLeft || !bestRight) return null;
  return { f: bestF, th: bestTh, left: bestLeft, right: bestRight };
}

function buildTree(
  X: Float64Array[],
  y: Int16Array,
  idx: number[],
  nClasses: number,
  depth: number,
  rng: () => number,
  nodes: Node[],
): number {
  const id = nodes.length;
  nodes.push({ t: 1, k: [], v: [] });
  const counts = new Array<number>(nClasses).fill(0);
  for (const i of idx) counts[y[i]]++;
  const nonempty = counts.filter((c) => c > 0).length;
  if (depth >= MAX_DEPTH || idx.length < 8 || nonempty === 1) {
    nodes[id] = majorityLeaf(y, idx, nClasses);
    return id;
  }
  const split = bestSplit(X, y, idx, nClasses, rng);
  if (!split) {
    nodes[id] = majorityLeaf(y, idx, nClasses);
    return id;
  }
  const l = buildTree(X, y, split.left, nClasses, depth + 1, rng, nodes);
  const r = buildTree(X, y, split.right, nClasses, depth + 1, rng, nodes);
  nodes[id] = { t: 0, f: split.f, th: split.th, l, r };
  return id;
}

function bootstrap(n: number, rng: () => number): number[] {
  const idx = new Array<number>(n);
  for (let i = 0; i < n; i++) idx[i] = Math.floor(rng() * n);
  return idx;
}

export function trainForest(seed = 20260914): Forest {
  const rng = mulberry32(seed);
  const classIds = DISEASES.map((d) => d.id);
  const nClasses = classIds.length;
  const perClass = 20;
  const X: Float64Array[] = [];
  const yArr: number[] = [];
  for (let c = 0; c < nClasses; c++) {
    for (let i = 0; i < perClass; i++) {
      X.push(samplePatient(DISEASES[c], rng));
      yArr.push(c);
    }
  }
  const y = Int16Array.from(yArr);
  const trees: Tree[] = [];
  for (let t = 0; t < N_TREES; t++) {
    const idx = bootstrap(X.length, rng);
    const nodes: Node[] = [];
    buildTree(X, y, idx, nClasses, 0, rng, nodes);
    trees.push({ nodes });
  }
  return {
    version: CATALOG_VERSION,
    nTrees: trees.length,
    nFeatures: FEATURE_NAMES.length,
    classIds,
    trees,
  };
}

function leafDist(leaf: Leaf, nClasses: number): Float64Array {
  const out = new Float64Array(nClasses);
  let tot = 0;
  for (const n of leaf.v) tot += n;
  if (tot === 0) return out;
  for (let i = 0; i < leaf.k.length; i++) out[leaf.k[i]] = leaf.v[i] / tot;
  return out;
}

function walk(tree: Tree, x: Float64Array, nClasses: number): Float64Array {
  let i = 0;
  for (let guard = 0; guard < 64; guard++) {
    const node = tree.nodes[i];
    if (!node || node.t === 1) return leafDist(node as Leaf, nClasses);
    i = x[node.f] <= node.th ? node.l : node.r;
  }
  return new Float64Array(nClasses);
}

export function forestPredict(forest: Forest, x: Float64Array): Float64Array {
  const n = forest.classIds.length;
  const acc = new Float64Array(n);
  for (const tree of forest.trees) {
    const d = walk(tree, x, n);
    for (let i = 0; i < n; i++) acc[i] += d[i];
  }
  const inv = 1 / forest.trees.length;
  for (let i = 0; i < n; i++) acc[i] *= inv;
  return acc;
}

let cached: Forest | null = null;

export function getForest(): Forest {
  if (!cached) cached = trainForest();
  return cached;
}
