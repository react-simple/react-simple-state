import { StateChangeSubscriptionsByUniqueId, StateEntry } from "types";

export interface GlobalState {
	readonly rootState: { [stateKey: string]: StateEntry<unknown> };
	readonly rootStateSubscriptions: StateChangeSubscriptionsByUniqueId<unknown>;
}
