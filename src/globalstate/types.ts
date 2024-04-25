import { StateChangeArgs, StateChangeSubscriptions, StateEntry } from "types";

export interface GlobalState {
	readonly rootState: { [stateKey: string]: StateEntry<unknown> };
	readonly rootStateSubscriptions: StateChangeSubscriptions<StateChangeArgs<unknown>>;
};
