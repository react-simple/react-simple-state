import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logDebug, logTrace
} from "@react-simple/react-simple-util";
import { mergeState, notifyContextSubscribers } from "internal/functions";
import { getGlobalContextEntry, getGlobalContextStateEntry, getGlobalContextStateRoot, getOrCreateGlobalContextStateEntry } from "./internal/functions";
import { REACT_SIMPLE_STATE } from "data";
import { GLOBAL_CONTEXT_STATE } from "internal/contextstate.data";

// Gets the current context state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
const getGlobalContextState_default = <State>(contextId: string, stateKey: string, defaultValue: ValueOrCallback<State>) => {
	// get current state or default state
	return getGlobalContextStateEntry<State>(contextId, stateKey)?.stateEntry?.state || getResolvedCallbackValue(defaultValue);
};

REACT_SIMPLE_STATE.DI.contextState.getGlobalContextState = getGlobalContextState_default;

// Gets the current context state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
export const getGlobalContextState = <State>(contextId: string, stateKey: string, defaultValue: ValueOrCallback<State>) => {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.contextState.getGlobalContextState<State>(
		contextId, stateKey, defaultValue, GLOBAL_CONTEXT_STATE, getGlobalContextState_default
	);
};

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
const setGlobalContextState_default = <State>(
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

REACT_SIMPLE_STATE.DI.contextState.setGlobalContextState = setGlobalContextState_default;

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
	return REACT_SIMPLE_STATE.DI.contextState.setGlobalContextState(args, GLOBAL_CONTEXT_STATE, setGlobalContextState_default);
}

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
const initGlobalContextState_default = <State>(contextId: string, stateKey: string, state: ValueOrCallback<State>) => {
	const existing = getGlobalContextStateEntry<State>(contextId, stateKey);
	const stateEntry = getOrCreateGlobalContextStateEntry(contextId, stateKey, state);

	// calculate new state
	const oldState: State | undefined = existing?.stateEntry?.state || undefined; // we don't ask for defaultValue just for this
	const newState = getResolvedCallbackValue(state); // no merging, it's a complete state

	// set new state
	stateEntry.state = newState;

	logDebug(`[initGlobalContextState] ${contextId} ${stateKey}`, { contextId, stateKey, state, stateEntry, oldState, newState });
	notifyContextSubscribers(stateEntry!, { contextId, stateKey, oldState, newState }); // notify context subscribers too
	return newState;
};

REACT_SIMPLE_STATE.DI.contextState.initGlobalContextState = initGlobalContextState_default;

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
export const initGlobalContextState = <State>(contextId: string, stateKey: string, state: ValueOrCallback<State>) => {
	return REACT_SIMPLE_STATE.DI.contextState.initGlobalContextState(
		contextId, stateKey, state, GLOBAL_CONTEXT_STATE, initGlobalContextState_default
	);
}

// Be careful, because removeContextState() will effectively kill all subscriptions so any existing components
// subscribed with useContextState() won't get state upates anymore.
// Use initContextState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
const removeGlobalContextState_default = (contextIds: string | string[], stateKeys?: string | string[]) => {
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

				delete getGlobalContextStateRoot().rootState[contextId];
			}
		}
	}
};

REACT_SIMPLE_STATE.DI.contextState.removeGlobalContextState = removeGlobalContextState_default;

// Be careful, because removeContextState() will effectively kill all subscriptions so any existing components
// subscribed with useContextState() won't get state upates anymore.
// Use initContextState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalContextState = (contextIds: string | string[], stateKeys?: string | string[]) => {
	REACT_SIMPLE_STATE.DI.contextState.removeGlobalContextState(contextIds, stateKeys, GLOBAL_CONTEXT_STATE, removeGlobalContextState_default);
}
