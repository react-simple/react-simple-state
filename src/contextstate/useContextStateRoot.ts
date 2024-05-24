import { useEffect } from "react";
import { ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { ContextGlobalState, ContextStateChangeArgs } from "./types";
import { GLOBAL_CONTEXT_STATE } from "internal/contextstate.data";
import { setGlobalContextState } from "./functions";

// By calling useContextStateRoot() the parent component subscribes to any changes within any contexts (regardless of stateKey); read-only access.
// By default the closest <StateContext> is used in the DOM hierarchy, but it can be overriden by specifying an exact contextId.

export interface UseContextStateRootProps {
	getUpdates: ValueOrCallbackWithArgs<ContextStateChangeArgs<unknown>, boolean>;

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseContextStateRootReturn = [ContextGlobalState, typeof setGlobalContextState];

// By calling useContextStateRoot() the parent component subscribes to state changes according to the specified getUpdates value.
// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
export function useContextStateRoot(props: UseContextStateRootProps): UseContextStateRootReturn {
	const { getUpdates, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace("[useContextStateRoot.handleStateUpdated]", { props, uniqueId, GLOBAL_CONTEXT_STATE });
		forceUpdate();
	};

	logTrace("[useContextStateRoot]", { props, uniqueId, GLOBAL_CONTEXT_STATE });

	// subscribe/unsubscribe
	useEffect(
		() => {
				// Initialize
				GLOBAL_CONTEXT_STATE.rootStateSubscriptions[uniqueId] = {
					getUpdates,
					onStateUpdated: handleStateUpdated
				};

				logTrace("[useContextStateRoot.initialize]", { props, uniqueId, GLOBAL_CONTEXT_STATE });

			return () => {
				// Finalize
				delete GLOBAL_CONTEXT_STATE!.rootStateSubscriptions[uniqueId];
			}
		},
		[]);

	return [
		GLOBAL_CONTEXT_STATE,
		setGlobalContextState
	];
}
