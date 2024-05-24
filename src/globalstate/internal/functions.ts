import { Nullable, ValueOrCallback, getResolvedCallbackValue } from "@react-simple/react-simple-util";
import { StateEntry } from "types";
import { GLOBAL_STATE } from "internal/globalstate.data";

// These assets are not exported by the package.

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export const getGlobalStateEntry = <State>(stateKey: string) => {
	return GLOBAL_STATE.rootState[stateKey] as Nullable<StateEntry<State | undefined>>;
};

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getOrCreateGlobalStateEntry<State>(stateKey: string, defaultValue: ValueOrCallback<State>): StateEntry<State> {
	let stateEntry = getGlobalStateEntry<State>(stateKey);

	if (!stateEntry) {
		stateEntry = {
			stateKey,
			state: getResolvedCallbackValue(defaultValue),
			stateSubscriptions: {}
		};

		GLOBAL_STATE.rootState[stateKey] = stateEntry as StateEntry<unknown>;
	}
	else if (!stateEntry.state) {
		stateEntry.state = getResolvedCallbackValue(defaultValue);
	}

	return stateEntry as StateEntry<State>;
}
