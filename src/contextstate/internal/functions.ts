export { };

// import { ValueOrCallback, getResolvedCallbackValue } from "@react-simple/react-simple-util";
// import { ContextStateEntry } from "contextstate/types";
// import { GLOBAL_CONTEXT_STATE } from "internal/contextstate.data";

// export const getGlobalContextStateRoot = () => {
// 	return GLOBAL_CONTEXT_STATE;
// }

// export const getGlobalContextEntry = (contextId: string) => {
// 	return getGlobalContextStateRoot().rootState[contextId];
// };

// export const getOrCreateGlobalContextEntry = (contextId: string) => {
// 	let context = getGlobalContextEntry(contextId);

// 	if (!context) {
// 		context = { contextId, contextState: {}, contextStateSubscriptions: {} };
// 		getGlobalContextStateRoot().rootState[contextId] = context;
// 	}

// 	return context;
// };

// // Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// // Use the useContextState() hook to get the parent component/hook updated on state changes.
// export const getGlobalContextStateEntry = <State = unknown>(contextId: string, stateKey: string) => {
// 	const context = getGlobalContextEntry(contextId);
// 	const stateEntry = context?.contextState?.[stateKey] as ContextStateEntry<State> | undefined;

// 	return { context, stateEntry };
// };

// // Gets the current context state as it is (nullable), but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// // Use the useContextState() hook to get the parent component/hook updated on state changes.
// export const getOrCreateGlobalContextStateEntry = <State = unknown>(
// 	contextId: string,
// 	stateKey: string,
// 	defaultValue: ValueOrCallback<State>
// ) => {
// 	const context = getOrCreateGlobalContextEntry(contextId);
// 	let stateEntry = context?.contextState[stateKey] as ContextStateEntry | undefined;

// 	if (!stateEntry) {
// 		stateEntry = {
// 			contextId,
// 			stateKey,
// 			state: getResolvedCallbackValue(defaultValue),
// 			stateSubscriptions: {}
// 		};

// 		context.contextState[stateKey] = stateEntry;
// 	}

// 	return stateEntry;
// };
