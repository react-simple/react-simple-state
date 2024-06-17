export { };

// import { useEffect } from "react";
// import { ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
// import { ContextGlobalState, ContextStateChangeArgs } from "./types";
// import { setGlobalContextState } from "./functions";
// import { getGlobalContextStateRoot } from "./internal/functions";
// import { REACT_SIMPLE_STATE } from "data";

// // By calling useContextStateRoot() the parent component subscribes to any changes within any contexts (regardless of stateKey); read-only access.
// // By default the closest <StateContext> is used in the DOM hierarchy, but it can be overriden by specifying an exact contextId.

// export interface UseContextStateRootProps {
// 	updateFilter: ValueOrCallbackWithArgs<ContextStateChangeArgs, boolean>;

// 	// optional
// 	subscriberId?: string; // custom metadata for tracing info only
// }

// export type UseContextStateRootReturn = [ContextGlobalState, typeof setGlobalContextState];

// // By calling useContextStateRoot() the parent component subscribes to state changes according to the specified updateFilter value.
// // By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
// export function useContextStateRoot(props: UseContextStateRootProps): UseContextStateRootReturn {
// 	const { updateFilter, subscriberId } = props;

// 	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
// 	const forceUpdate = useForceUpdate();

// 	const globalContextState = getGlobalContextStateRoot();

// 	// local function called by other hooks via subscription on state changes to update this hook and its parent component
// 	const handleStateUpdated = () => {
// 		logTrace("[useContextStateRoot]: handleStateUpdated", { props, uniqueId, globalContextState }, REACT_SIMPLE_STATE.LOGGING.logLevel);
// 		forceUpdate();
// 	};

// 	logTrace("[useContextStateRoot]: Rendering", { props, uniqueId, globalContextState }, REACT_SIMPLE_STATE.LOGGING.logLevel);

// 	// subscribe/unsubscribe
// 	useEffect(
// 		() => {
// 				// Initialize
// 			globalContextState.rootStateSubscriptions[uniqueId] = {
// 					updateFilter,
// 					onStateUpdated: handleStateUpdated
// 				};

// 			logTrace("[useContextStateRoot]: Initialized", { props, uniqueId, globalContextState }, REACT_SIMPLE_STATE.LOGGING.logLevel);

// 			return () => {
// 				// Finalize
// 				delete globalContextState!.rootStateSubscriptions[uniqueId];
// 			}
// 		},
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 		[]);

// 	return [
// 		globalContextState,
// 		setGlobalContextState
// 	];
// }
