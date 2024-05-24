import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logDebug, logTrace
} from "@react-simple/react-simple-util";
import { mergeState, notifySubscribers } from "internal/functions";
import { GLOBAL_STATE } from "internal/globalstate.data";
import { getGlobalStateEntry, getOrCreateGlobalStateEntry } from "./internal/functions";

export const getGlobalStateRoot = () => {
	return GLOBAL_STATE;
};

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export const getGlobalState = <State>(stateKey: string, defaultValue: ValueOrCallback<State>) => {
	// get current state or default state
	return getGlobalStateEntry<State>(stateKey)?.state || getResolvedCallbackValue(defaultValue);
};

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
export const setGlobalState = <State>(
	args: {
		stateKey: string;
		state: ValueOrCallbackWithArgs<State, Partial<State>>;
		defaultValue: ValueOrCallback<State>;
		customMerge?: (oldState: State, newState: Partial<State>) => State;
	}
) => {
	const { stateKey, state, defaultValue, customMerge } = args;

	// get current state
	const stateEntry = getOrCreateGlobalStateEntry<State>(stateKey, defaultValue);

	// calculate new state
	const oldState = stateEntry.state;
	const setStateArgs = getResolvedCallbackValueWithArgs(state, oldState);

	// priority: custom merge from actual set state call, custom merge from use hook props or default shallow merge
	const newState = mergeState(oldState, setStateArgs, customMerge);

	// set new state
	stateEntry.state = newState;

	logDebug(`[setGlobalState] ${stateKey}`, { args, oldState, newState, stateEntry });
	notifySubscribers(stateEntry, { stateKey, oldState, newState });
	return newState;
};

// Sets global state and notifies all subscribed components. Requires complet state since no merging will occur.
export const initGlobalState = <State>(stateKey: string, state: ValueOrCallback<State>) => {
	const existingStateEntry = getGlobalStateEntry<State>(stateKey);
	const oldState: Partial<State> = existingStateEntry?.state || {}; // we don't ask for defaultValue just for this

	// calculate new state
	const newState = getResolvedCallbackValue(state); // no merging, it's a complete state
	const stateEntry = getOrCreateGlobalStateEntry<State>(stateKey, newState);

	// set new state
	stateEntry.state = newState;

	logDebug(`[initGlobalState] ${stateKey}`, { stateKey, state, oldState, newState, stateEntry });
	notifySubscribers(stateEntry!, { stateKey, oldState, newState });
	return newState;
};

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalState = (stateKeys: string | string[]) => {
	logDebug("[removeGlobalState]", { stateKeys });

	for (const stateKey of getResolvedArray(stateKeys)) {
		if (getGlobalStateEntry(stateKey)) {
			logTrace(`[removeGlobalState] ${stateKey}`, { stateKey });

			// notifySubscribers() is not called intentionally here

			delete GLOBAL_STATE.rootState[stateKey];
		}
	}
};
