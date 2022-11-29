import { ImmutableObject } from "seamless-immutable";

export interface Config {
  networkurl: string;
  m2gurl: string;
}

export type IMConfig = ImmutableObject<Config>;