import { ImmutableObject } from "seamless-immutable";

export interface Config {
  networkurl: string;
  g2murl: string;
}

export type IMConfig = ImmutableObject<Config>;