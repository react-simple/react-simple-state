import { useEffect } from "react";
import { ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { StateChangeArgs } from "types";
import { GlobalState } from "./types";
import { setGlobalState } from "./functions";
import { getGlobalStateRoot } from "./internal/functions";
import { REACT_SIMPLE_STATE } from "data";

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
	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	const globalState = getGlobalStateRoot();

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace("[useGlobalStateRoot]: handleStateUpdated", { props, uniqueId, globalState }, REACT_SIMPLE_STATE.LOGGING.logLevel);
		forceUpdate();
	};

	logTrace("[useGlobalStateRoot]: Rendering", { props, uniqueId, globalState }, REACT_SIMPLE_STATE.LOGGING.logLevel);

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			globalState.rootStateSubscriptions[uniqueId] = {
				updateFilter,
				onStateUpdated: handleStateUpdated
			};

			logTrace("[useGlobalStateRoot]: Initialized", { props, uniqueId, globalState }, REACT_SIMPLE_STATE.LOGGING.logLevel);

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
