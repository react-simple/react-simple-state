import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateContextData } from "./types";

export function getGlobalStateContextData(contextId: string): GlobalStateContextData | undefined {
  return REACT_SIMPLE_STATE.CONTEXTS[contextId];
}

export function getGlobalStateContextDataAll(): GlobalStateContextData[] {
  return Object.values(REACT_SIMPLE_STATE.CONTEXTS);
}
