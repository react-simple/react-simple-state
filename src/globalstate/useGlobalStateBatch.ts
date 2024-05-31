import { useEffect } from "react";
import { ValueOrCallbackWithArgs, convertArrayToDictionary, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { setGlobalState } from "./functions";
import { StateChangeArgs } from "types";
import { getOrCreateGlobalStateEntry } from "./internal/functions";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according to the specified updateFilter value.
// useGlobalStateBatch() does not always return a state, the returned state can be undefined, if not yet set.

export interface UseGlobalStateBatchProps {
	stateKeys: string[];
	// true: always, false: never, function: selective
	updateFilter: ValueOrCallbackWithArgs<StateChangeArgs<unknown>, boolean>; 

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseGlobalStateWatchBatchReturn = [
	{ [stateKey: string]: unknown }, // state can be undefined
	typeof setGlobalState
];

export function useGlobalStateBatch(props: UseGlobalStateBatchProps): UseGlobalStateWatchBatchReturn {
	const { stateKeys, updateFilter, subscriberId } = props;
	const scope = `[react-simple-state] useGlobalStateBatch [${stateKeys.join(", ")}]`;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state (state can be undefined, if not yet set, but we subcribe anyway)
	const stateEntries = stateKeys.map(stateKey => getOrCreateGlobalStateEntry<unknown>(stateKey, undefined));

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace(`[${scope}]: handleStateUpdated`, { props, uniqueId, stateEntries });
		forceUpdate();
	};

	logTrace(`[${scope}]`, { props, uniqueId, stateEntries });

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			stateEntries.forEach(stateEntry => {
				stateEntry.stateSubscriptions[uniqueId] = {
					updateFilter,
					onStateUpdated: handleStateUpdated
				};
			});

			logTrace(`[${scope}]: initialize`, { props, uniqueId, stateEntries });

			return () => {
				// Finalize
				stateEntries.forEach(stateEntry => {
					delete stateEntry!.stateSubscriptions[uniqueId];
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]);

	const states = convertArrayToDictionary(stateEntries, t => [t.stateKey, t.state]);

	return [
		states,
		setGlobalState
	];
}
