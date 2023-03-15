import { ImmutableObject } from "seamless-immutable";

export interface Config {
  editurl: string;
  eventurl: string;
}

export type IMConfig = ImmutableObject<Config>;