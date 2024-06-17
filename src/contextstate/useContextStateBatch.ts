export { };

// import { useEffect } from "react";
// import { ValueOrCallbackWithArgs, convertArrayToDictionary2, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
// import { setGlobalContextState } from "./functions";
// import { ContextStateChangeArgs } from "./types";
// import { getGlobalContextEntry, getOrCreateGlobalContextEntry, getOrCreateGlobalContextStateEntry } from "./internal/functions";
// import { REACT_SIMPLE_STATE } from "data";

// // By calling useContextStateBatch() the parent component subscribes to multiple context state changes at once according to the specified updateFilter value.
// // useContextStateBatch() does not always return a state, the returned state can be undefined, if not yet set.
// // Context ids must be exactly specified in contextIds.

// export interface UseContextStateBatchProps {
// 	contextIds: string[];
// 	stateKeys?: string[];

// 	updateFilter: ValueOrCallbackWithArgs<ContextStateChangeArgs, boolean>;

// 	// optional
// 	subscriberId?: string; // custom metadata for tracing info only
// }

// export type UseContextStateBatchReturn = [
// 	{ [contextId: string]: { [stateKey: string]: unknown } },
// 	typeof setGlobalContextState
// ];

// // By calling useContextStateBatch() the parent component can subscribe to state changes of multiple contexts according to the specified updateFilter value.
// export function useContextStateBatch(props: UseContextStateBatchProps): UseContextStateBatchReturn {
// 	const { contextIds, stateKeys, updateFilter, subscriberId } = props;

// 	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
// 	const forceUpdate = useForceUpdate();

// 	// get current state
// 	const stateEntries = contextIds.flatMap(contextId => {
// 		return stateKeys
// 			? stateKeys.map(stateKey => getOrCreateGlobalContextStateEntry<unknown>(contextId, stateKey, undefined))
// 			: Object.values(getOrCreateGlobalContextEntry(contextId).contextState) // get all
// 	});

// 	// local function called by other hooks via subscription on state changes to update this hook and its parent component
// 	const handleStateUpdated = () => {
// 		logTrace(log => log(
// 			`[useContextStateBatch]: handleStateUpdated contextIds=[${props.contextIds.join(", ")}], stateKeys=[${props.stateKeys?.join?.(", ")}]`,
// 			{ props, uniqueId, stateEntries },
// 			REACT_SIMPLE_STATE.LOGGING.logLevel
// 		));

// 		forceUpdate();
// 	};

// 	logTrace(log => log(
// 		`[useContextStateBatch]: Rendering contextIds=[${props.contextIds.join(", ")}], stateKeys=[${props.stateKeys?.join?.(", ")}]`,
// 		{ props, uniqueId, stateEntries },
// 		REACT_SIMPLE_STATE.LOGGING.logLevel
// 	));

// 	// subscribe/unsubscribe
// 	useEffect(
// 		() => {
// 			// Initialize
// 			if (stateKeys) {
// 				// subscribe to these keys only
// 				stateEntries.forEach(stateEntry => {
// 					stateEntry.stateSubscriptions[uniqueId] = {
// 						updateFilter,
// 						onStateUpdated: handleStateUpdated
// 					};
// 				});
// 			}
// 			else {
// 				// subscribe at context level (for the entire context regardles of stateKey)
// 				contextIds.forEach(contextId => {
// 					const entry = getGlobalContextEntry(contextId);

// 					if (entry) {
// 						entry.contextStateSubscriptions[uniqueId] = {
// 							updateFilter,
// 							onStateUpdated: handleStateUpdated
// 						};
// 					}
// 				});
// 			}

// 			logTrace(log => log(
// 				`[useContextStateBatch]: Initialized contextIds=[${props.contextIds.join(", ")}], stateKeys=[${props.stateKeys?.join?.(", ")}]`,
// 				{ props, uniqueId, stateEntries },
// 				REACT_SIMPLE_STATE.LOGGING.logLevel
// 			));

// 			return () => {
// 				// Finalize
// 				if (stateKeys) {
// 					// unsubscribe from these keys only
// 					stateEntries.forEach(stateEntry => {
// 						delete stateEntry!.stateSubscriptions[uniqueId];
// 					});
// 				} else {
// 					// unsubscribe at context level (for the entire context regardles of stateKey)
// 					contextIds.forEach(contextId => {
// 						const entry = getGlobalContextEntry(contextId);

// 						if (entry) {
// 							delete entry.contextStateSubscriptions[uniqueId];
// 						}
// 					});
// 				}
// 			}
// 		},
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 		[]);

// 	const states = convertArrayToDictionary2(stateEntries, t => [t.contextId, t.stateKey, t.state]);

// 	return [
// 		states,
// 		setGlobalContextState
// 	];
// }
