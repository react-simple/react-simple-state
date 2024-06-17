export interface GlobalStateContextData {
  readonly contextId: string;

  // any useGlobalState() calls within the context will be prefixed with this path
  // nested contexts will also be prefixed
  readonly fullQualifiedName: string;

  readonly uniqueId: string;
  readonly parentContexts: GlobalStateContextData[];
}
