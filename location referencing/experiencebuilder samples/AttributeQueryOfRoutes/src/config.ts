import { ImmutableObject } from "seamless-immutable";

export interface Config {
  networkurl: string;
  routeid: string;
  routename: string;
  routetype: string;
}

export type IMConfig = ImmutableObject<Config>;