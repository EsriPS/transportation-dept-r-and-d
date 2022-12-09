import { ImmutableObject } from "seamless-immutable";

export interface Config {
  networkurl: string;
}

export type IMConfig = ImmutableObject<Config>;