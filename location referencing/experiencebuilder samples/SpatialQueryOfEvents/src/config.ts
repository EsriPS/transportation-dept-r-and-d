import { ImmutableObject } from "seamless-immutable";

export interface Config {
  mapservice: string;
  visiblelayers: string;
  querylayerindex: string;
  eventid : string;
  routeid : string;
  frommeasure : string;
  tomeasure : string;
  functionalclasstype : string;
  to_date : string;
}

export type IMConfig = ImmutableObject<Config>;