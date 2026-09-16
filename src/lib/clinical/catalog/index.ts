import { CARDIO_NEURO } from "./cardio-neuro";
import { GI_ENDO_RENAL } from "./gi-endo-renal";
import { HOSPITAL_PLUS } from "./hospital-plus";
import { INFECTIOUS } from "./infectious";
import { MSK_DERM_OTHER } from "./msk-derm-other";
import type { Disease } from "../types";

export const DISEASES: Disease[] = [
  ...INFECTIOUS,
  ...CARDIO_NEURO,
  ...GI_ENDO_RENAL,
  ...MSK_DERM_OTHER,
  ...HOSPITAL_PLUS,
];

export const DISEASE_BY_ID: Record<string, Disease> = Object.fromEntries(
  DISEASES.map((d) => [d.id, d]),
);

export const CATALOG_VERSION = "ashbourne-rf-v2";
export const N_TREES = 41;
export const MAX_DEPTH = 8;
