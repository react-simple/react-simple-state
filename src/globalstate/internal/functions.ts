import { ValueOrCallback, getResolvedCallbackValue } from "@react-simple/react-simple-util";
import { StateEntry } from "types";
import { REACT_SIMPLE_STATE } from "data";
import { GLOBAL_STATE } from "internal/globalstate.data";

// These assets are not exported by the package.

const getGlobalStateRoot_default = () => {
	return GLOBAL_STATE;
};

REACT_SIMPLE_STATE.DI.globalState.internal.getGlobalStateRoot = getGlobalStateRoot_default;

export const getGlobalStateRoot = () => {
	return REACT_SIMPLE_STATE.DI.globalState.internal.getGlobalStateRoot(GLOBAL_STATE, getGlobalStateRoot_default);
};

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
const getGlobalStateEntry_default = <State>(stateKey: string) => {
	return getGlobalStateRoot().rootState[stateKey] as StateEntry<State | undefined> | undefined;
};

REACT_SIMPLE_STATE.DI.globalState.internal.getGlobalStateEntry = getGlobalStateEntry_default;

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export const getGlobalStateEntry = <State>(stateKey: string) => {
	return REACT_SIMPLE_STATE.DI.globalState.internal.getGlobalStateEntry<State>(stateKey, getGlobalStateRoot(), getGlobalStateEntry_default);
};

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getOrCreateGlobalStateEntry_default<State>(stateKey: string, defaultValue: ValueOrCallback<State>): StateEntry<State> {
	let stateEntry = getGlobalStateEntry<State>(stateKey);

	if (!stateEntry) {
		stateEntry = {
			stateKey,
			state: getResolvedCallbackValue(defaultValue),
			stateSubscriptions: {}
		};

		getGlobalStateRoot().rootState[stateKey] = stateEntry as StateEntry<unknown>;
	}
	else if (!stateEntry.state) {
		stateEntry.state = getResolvedCallbackValue(defaultValue);
	}

	return stateEntry as StateEntry<State>;
}

REACT_SIMPLE_STATE.DI.globalState.internal.getOrCreateGlobalStateEntry = getOrCreateGlobalStateEntry_default;

// Gets the current global state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getOrCreateGlobalStateEntry<State>(stateKey: string, defaultValue: ValueOrCallback<State>): StateEntry<State> {
	return REACT_SIMPLE_STATE.DI.globalState.internal.getOrCreateGlobalStateEntry(
		stateKey, defaultValue, getGlobalStateRoot(), getOrCreateGlobalStateEntry_default
	);
}
