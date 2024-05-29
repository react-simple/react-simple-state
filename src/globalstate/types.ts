import { Nullable } from "@react-simple/react-simple-util";
import { StateChangeArgs, StateChangeSubscription, StateEntry } from "types";

export interface GlobalState {
	readonly rootState: { [stateKey: string]: StateEntry<unknown> };
	readonly rootStateSubscriptions: { [uniqueId: string]: Nullable<StateChangeSubscription<StateChangeArgs<unknown>>> };
}
