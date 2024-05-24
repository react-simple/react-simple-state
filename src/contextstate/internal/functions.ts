import { ValueOrCallback, getResolvedCallbackValue } from "@react-simple/react-simple-util";
import { ContextStateEntry } from "contextstate/types";
import { REACT_SIMPLE_STATE } from "data";
import { GLOBAL_CONTEXT_STATE } from "internal/contextstate.data";

const getGlobalContextStateRoot_default = () => {
	return GLOBAL_CONTEXT_STATE;
}

REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextStateRoot = getGlobalContextStateRoot_default;

export const getGlobalContextStateRoot = () => {
	return REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextStateRoot(GLOBAL_CONTEXT_STATE, getGlobalContextStateRoot_default);
}

const getGlobalContextEntry_default = (contextId: string) => {
	return getGlobalContextStateRoot().rootState[contextId];
};

REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextEntry = getGlobalContextEntry_default;

export const getGlobalContextEntry = (contextId: string) => {
	return REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextEntry(
		contextId, getGlobalContextStateRoot(), getGlobalContextEntry_default
	);
};

export const getOrCreateGlobalContextEntry = (contextId: string) => {
	let context = getGlobalContextEntry(contextId);

	if (!context) {
		context = { contextId, contextState: {}, contextStateSubscriptions: {} };
		getGlobalContextStateRoot().rootState[contextId] = context;
	}

	return context;
};

// Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
const getGlobalContextStateEntry_default = <State>(contextId: string, stateKey: string) => {
	const context = getGlobalContextEntry(contextId);
	const stateEntry = context?.contextState?.[stateKey] as ContextStateEntry<State> | undefined;

	return { context, stateEntry };
};

REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextStateEntry = getGlobalContextStateEntry_default;

// Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
export const getGlobalContextStateEntry = <State>(contextId: string, stateKey: string) => {
	return REACT_SIMPLE_STATE.DI.contextState.internal.getGlobalContextStateEntry<State>(
		contextId, stateKey, getGlobalContextStateRoot(), getGlobalContextStateEntry_default
	);
};

// Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
const getOrCreateGlobalContextStateEntry_default = <State>(contextId: string, stateKey: string, defaultValue: ValueOrCallback<State>) => {
	const context = getOrCreateGlobalContextEntry(contextId);
	let stateEntry = context?.contextState[stateKey] as ContextStateEntry<State> | undefined;

	if (!stateEntry) {
		stateEntry = {
			contextId,
			stateKey,
			state: getResolvedCallbackValue(defaultValue),
			stateSubscriptions: {}
		};

		context.contextState[stateKey] = stateEntry as ContextStateEntry<unknown>;
	}

	return stateEntry;
};

REACT_SIMPLE_STATE.DI.contextState.internal.getOrCreateGlobalContextStateEntry = getOrCreateGlobalContextStateEntry_default;

// Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useContextState() hook to get the parent component/hook updated on state changes.
export const getOrCreateGlobalContextStateEntry = <State>(contextId: string, stateKey: string, defaultValue: ValueOrCallback<State>) => {
	return REACT_SIMPLE_STATE.DI.contextState.internal.getOrCreateGlobalContextStateEntry(
		contextId, stateKey, defaultValue, getGlobalContextStateRoot(), getOrCreateGlobalContextStateEntry_default
	);
};
