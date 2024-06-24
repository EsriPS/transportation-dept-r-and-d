import { ImmutableObject } from "seamless-immutable";

export interface Config {
  g2murl: string;
  g2rurl: string;
  g2rLayerId: string,
  featureIdFieldName: string;
  padFeatureId: boolean;
  defaultOffset: string
  offsetUnitRounding: string;
  tolerance: number;
  outSR: string;
  outOffsetUnit: string;
  userGuidance: string;
  posReferentSeperator: string;
  negReferentSeperator: string;
}

export type IMConfig = ImmutableObject<Config>;