import { useEffect } from "react";
import { ValueOrCallbackWithArgs, convertArrayToDictionary2, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { setGlobalContextState } from "./functions";
import { ContextStateChangeArgs } from "./types";
import { getGlobalContextEntry, getOrCreateGlobalContextEntry, getOrCreateGlobalContextStateEntry } from "./internal/functions";

// By calling useContextStateBatch() the parent component subscribes to multiple context state changes at once according to the specified getUpdates value.
// useContextStateBatch() does not always return a state, the returned state can be undefined, if not yet set.
// Context ids must be exactly specified in contextIds.

export interface UseContextStateBatchProps {
	contextIds: string[];
	stateKeys?: string[];

	// true: always, false: never, function: selective
	getUpdates: ValueOrCallbackWithArgs<ContextStateChangeArgs<unknown>, boolean>;

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseContextStateBatchReturn = [
	{ [contextId: string]: { [stateKey: string]: unknown } },
	typeof setGlobalContextState
];

// By calling useContextStateBatch() the parent component can subscribe to state changes of multiple contexts according to the specified getUpdates value.
export function useContextStateBatch(props: UseContextStateBatchProps): UseContextStateBatchReturn {
	const { contextIds, stateKeys, getUpdates, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state
	const stateEntries = contextIds.flatMap(contextId => {
		return stateKeys
			? stateKeys.map(stateKey => getOrCreateGlobalContextStateEntry<unknown>(contextId, stateKey, undefined))
			: Object.values(getOrCreateGlobalContextEntry(contextId).contextState) // get all
	});

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace("[useContextStateBatch.handleStateUpdated]", { props, uniqueId, stateEntries });
		forceUpdate();
	};

	logTrace("[useContextStateBatch]", { props, uniqueId, stateEntries });

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			if (stateKeys) {
				// subscribe to these keys only
				stateEntries.forEach(stateEntry => {
					stateEntry.stateSubscriptions[uniqueId] = {
						getUpdates,
						onStateUpdated: handleStateUpdated
					};
				});
			}
			else {
				// subscribe at context level (for the entire context regardles of stateKey)
				contextIds.forEach(contextId => {
					getGlobalContextEntry(contextId).contextStateSubscriptions[uniqueId] = {
						getUpdates,
						onStateUpdated: handleStateUpdated
					}
				});
			}

			logTrace("[useContextStateBatch.initialize]", { props, uniqueId, stateEntries });

			return () => {
				// Finalize
				if (stateKeys) {
					// unsubscribe from these keys only
					stateEntries.forEach(stateEntry => {
						delete stateEntry!.stateSubscriptions[uniqueId];
					});
				} else {
					// unsubscribe at context level (for the entire context regardles of stateKey)
					contextIds.forEach(contextId => {
						delete getGlobalContextEntry(contextId).contextStateSubscriptions[uniqueId];
					});
				}
			}
		},
		[]);

	const states = convertArrayToDictionary2(stateEntries, t => [t.contextId, t.stateKey, t.state]);

	return [
		states,
		setGlobalContextState
	];
}
