import { ImmutableObject } from "seamless-immutable";

export interface Config {
  baseUrl: string;
  perPageCount: number;
  token: string;
  userGuidance: string;
}

export type IMConfig = ImmutableObject<Config>;