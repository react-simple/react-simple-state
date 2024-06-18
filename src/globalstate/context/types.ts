import { Guid } from "@react-simple/react-simple-util";

export interface GlobalStateContextData {
  readonly contextId: string;

  // any useGlobalState() calls within the context will be prefixed with this path
  // nested contexts will also be prefixed
  readonly fullQualifiedNamePrefix: string;

  readonly uniqueId: Guid;
  readonly parentContexts: GlobalStateContextData[];
}
