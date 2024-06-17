export { };
	
// export interface StateContextData {
// 	readonly contextId: string;
// }

// export interface ContextStateChangeArgs<State = unknown> extends StateChangeArgs<State> {
// 	contextId: string;
// }

// export interface ContextStateEntry<State = unknown> extends StateEntry<State, ContextStateChangeArgs<State>> {
// 	readonly contextId: string;
// }

// export interface ContextState {
// 	readonly contextId: string;
// 	contextState: { [stateKey: string]: ContextStateEntry };

// 	// context level subscriptions
// 	readonly contextStateSubscriptions: StateChangeSubscriptionsByUniqueId<unknown, ContextStateChangeArgs>;
// }

// export interface ContextGlobalState {
// 	readonly rootState: { [contextId: string]: ContextState };
// 	readonly rootStateSubscriptions: StateChangeSubscriptionsByUniqueId<unknown, ContextStateChangeArgs>;
// }
