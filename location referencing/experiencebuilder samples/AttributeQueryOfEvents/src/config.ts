import { ImmutableObject } from "seamless-immutable";

export interface Config {
  eventurl: string;
}

export type IMConfig = ImmutableObject<Config>;