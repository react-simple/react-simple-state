import { Nullable } from "@react-simple/react-simple-util";
import { StateChangeArgs, StateChangeSubscription, StateEntry } from "types";

export interface StateContextData {
	readonly contextId: string;
}

export interface ContextStateChangeArgs<State> extends StateChangeArgs<State> {
	contextId: string;
}

export interface ContextStateEntry<State> extends StateEntry<State, ContextStateChangeArgs<State>> {
	readonly contextId: string;
}

export interface ContextState {
	readonly contextId: string;
	contextState: { [stateKey: string]: ContextStateEntry<unknown> };

	// context level subscriptions
	readonly contextStateSubscriptions: { [uniqueId: string]: Nullable<StateChangeSubscription<ContextStateChangeArgs<unknown>>> };
}

export interface ContextGlobalState {
	readonly rootState: { [contextId: string]: ContextState };
	readonly rootStateSubscriptions: { [uniqueId: string]: Nullable<StateChangeSubscription<ContextStateChangeArgs<unknown>>> };
}
