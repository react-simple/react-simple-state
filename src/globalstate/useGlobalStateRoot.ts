import { useEffect } from "react";
import { ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { StateChangeArgs } from "types";
import { GlobalState } from "./types";
import { setGlobalState } from "./functions";
import { getGlobalStateRoot } from "./internal/functions";

// By calling useGlobalStateRoot() the parent component subscribes to any global state changes (root level) according to the specified updateFilter value.

export interface UseGlobalStateRootProps {
	// true: always, false: never, function: selective
	updateFilter: ValueOrCallbackWithArgs<StateChangeArgs<unknown>, boolean>; 

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseGlobalStateReturn = [GlobalState, typeof setGlobalState];

export function useGlobalStateRoot(props: UseGlobalStateRootProps): UseGlobalStateReturn {
	const { updateFilter, subscriberId } = props;
	const scope = "[react-simple-state] useGlobalStateRoot";

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	const globalState = getGlobalStateRoot();

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace(`[${scope}]: handleStateUpdated`, { props, uniqueId, globalState });
		forceUpdate();
	};

	logTrace(`[${scope}]`, { props, uniqueId, globalState });

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			globalState.rootStateSubscriptions[uniqueId] = {
				updateFilter,
				onStateUpdated: handleStateUpdated
			};

			logTrace(`[${scope}]: initialize`, { props, uniqueId, globalState });

			return () => {
				// Finalize
				delete globalState.rootStateSubscriptions[uniqueId];
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]);

	return [
		globalState,
		setGlobalState
	];
}
