import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logDebug, logTrace
} from "@react-simple/react-simple-util";
import { mergeState, notifyContextSubscribers } from "internal/functions";
import { GLOBAL_CONTEXT_STATE } from "internal/contextstate.data";
import { getGlobalContextEntry, getGlobalContextStateEntry, getOrCreateGlobalContextStateEntry } from "./internal/functions";

export const getGlobalContextStateRoot = () => {
	return GLOBAL_CONTEXT_STATE;
}

// Gets the current context state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
export const getGlobalContextState = <State>(contextId: string, stateKey: string, defaultValue: ValueOrCallback<State>) => {
	// get current state or default state
	return getGlobalContextStateEntry<State>(contextId, stateKey)?.stateEntry?.state || getResolvedCallbackValue(defaultValue);
};

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
export const setGlobalContextState = <State>(
	args: {
		contextId: string;
		stateKey: string;
		state: ValueOrCallbackWithArgs<State, Partial<State>>;
		defaultValue: ValueOrCallback<State>;
		customMerge?: (oldState: State, newState: Partial<State>) => State;
	}
) => {
	const { contextId, stateKey, state, defaultValue, customMerge } = args;

	// get current state
	const stateEntry = getOrCreateGlobalContextStateEntry(contextId, stateKey, defaultValue);

	// calculate new state
	const oldState = stateEntry.state;
	const setStateArgs = getResolvedCallbackValueWithArgs(state, oldState);

	// priority: custom merge from actual set state call, custom merge from use hook props or default shallow merge
	const newState = mergeState(oldState, setStateArgs, customMerge);

	// set new state
	stateEntry.state = newState;

	logDebug(`[setGlobalContextState] ${contextId} ${stateKey}`, { args, contextId, stateEntry, oldState, newState });
	notifyContextSubscribers(stateEntry, { contextId, stateKey, oldState, newState }); // notify context subscribers too

	return newState;
};

// Sets global state and notifies all subscribed components. Requires complet state since no merging will occur.
export const initGlobalContextState = <State>(contextId: string, stateKey: string, state: ValueOrCallback<State>) => {
	const existing = getGlobalContextStateEntry(contextId, stateKey);
	const stateEntry = getOrCreateGlobalContextStateEntry(contextId, stateKey, state);

	// calculate new state
	const oldState: Partial<State> = existing?.stateEntry?.state || {}; // we don't ask for defaultValue just for this
	const newState = getResolvedCallbackValue(state); // no merging, it's a complete state

	// set new state
	stateEntry.state = newState;

	logDebug(`[initGlobalContextState] ${contextId} ${stateKey}`, { contextId, stateKey, state, stateEntry, oldState, newState });
	notifyContextSubscribers(stateEntry!, { contextId, stateKey, oldState, newState }); // notify context subscribers too
	return newState;
};

// Be careful, because removeContextState() will effectively kill all subscriptions so any existing components
// subscribed with useContextState() won't get state upates anymore.
// Use initContextState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalContextState = (contextIds: string | string[], stateKeys?: string | string[]) => {
	const scope = "removeGlobalContextState";
	logDebug(`[${scope}]`, { contextIds, stateKeys });

	for (const contextId of getResolvedArray(contextIds)) {
		if (stateKeys) {
			for (const stateKey of getResolvedArray(stateKeys)) {
				if (getGlobalContextStateEntry(contextId, stateKey)) {
					logTrace(`[${scope}] ${contextId} ${stateKey}`, { contextId, stateKey });

					// notifySubscribers() is not called intentionally here

					delete getGlobalContextEntry(contextId)!.contextState[stateKey];
				}
			}
		}
		else {
			if (getGlobalContextEntry(contextId)) {
				logTrace(`[${scope}] ${contextId}`, { contextId });

				// notifySubscribers() is not called intentionally here

				delete GLOBAL_CONTEXT_STATE.rootState[contextId];
			}
		}
	}
};
