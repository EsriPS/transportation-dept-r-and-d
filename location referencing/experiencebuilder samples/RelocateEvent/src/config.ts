import { ImmutableObject } from "seamless-immutable";

export interface Config {
  relocateEventUrl: string;
}

export type IMConfig = ImmutableObject<Config>;