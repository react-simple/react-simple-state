export { };

// import { useEffect } from "react";
// import { ValueOrCallback, ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
// import { removeGlobalContextState, setGlobalContextState } from "./functions";
// import { useStateContextId } from "./StateContext";
// import { ContextStateChangeArgs } from "./types";
// import { getOrCreateGlobalContextStateEntry } from "./internal/functions";
// import { SetStateOptions, StateReturn } from "types";
// import { REACT_SIMPLE_STATE } from "data";

// // By calling useContextState() the parent component subscribes to context state changes according to the specified updateFilter value.
// // useContextState() always returns a state, either the existing one or the default value.
// // By default the closest <StateContext> is used in the DOM hierarchy, but it can be overriden by specifying an exact contextId.

// export interface UseContextStateProps<State> {
// 	stateKey: string;
// 	updateFilter: ValueOrCallbackWithArgs<ContextStateChangeArgs<State>, boolean>;
// 	defaultValue: ValueOrCallback<State>;

// 	// optional
// 	contextId?: string; // by default the closest StateContext is used in the DOM hierarchy, but it can be overriden
// 	subscriberId?: string; // custom metadata for tracing info only

// 	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
// 	merge?: (oldState: State, newState: Partial<State>) => State;
// }

// // By calling useContextState() the parent component subscribes to state changes according to the specified updateFilter value.
// // By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
// export function useContextState<State>(props: UseContextStateProps<State>): StateReturn<State> {
// 	const { stateKey, updateFilter, defaultValue, merge, subscriberId } = props;

// 	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
// 	const forceUpdate = useForceUpdate();

// 	// we use the closest context or the root context, but if contextId is specified and is invalid, we can have no context
// 	const contextId = useStateContextId(props.contextId);

// 	// get current state
// 	const stateEntry = getOrCreateGlobalContextStateEntry<State>(contextId, stateKey, defaultValue);

// 	// local function called by other hooks via subscription on state changes to update this hook and its parent component
// 	const handleStateUpdated = () => {
// 		logTrace(
// 			`[useContextState]: handleStateUpdated contextId=${props.contextId}`,
// 			{ props, uniqueId, contextId, stateEntry },
// 			REACT_SIMPLE_STATE.LOGGING.logLevel);
		
// 		forceUpdate();
// 	};

// 	logTrace(
// 		`[useContextState]: Rendering contextId=${props.contextId}`,
// 		{ props, uniqueId, contextId, stateEntry },
// 		REACT_SIMPLE_STATE.LOGGING.logLevel
// 	);

// 	// subscribe/unsubscribe
// 	useEffect(
// 		() => {
// 			// Initialize
// 			stateEntry.stateSubscriptions[uniqueId] = {
// 				updateFilter,
// 				onStateUpdated: handleStateUpdated
// 			};

// 			logTrace(
// 				`[useContextState]: Initialized contextId=${props.contextId}`,
// 				{ props, uniqueId, contextId, stateEntry },
// 				REACT_SIMPLE_STATE.LOGGING.logLevel
// 			);

// 			return () => {
// 				// Finalize
// 				delete stateEntry!.stateSubscriptions[uniqueId];

// 				// delete the entire state entry with all subscriptions
// 				removeGlobalContextState(contextId, stateKey);
// 			}
// 		},
// 		// eslint-disable-next-line react-hooks/exhaustive-deps
// 		[]);

// 	const setState = (
// 		state: ValueOrCallbackWithArgs<State, Partial<State>>,
// 		options?: SetStateOptions<State>
// 	) => {
// 		return setGlobalContextState(
// 			{
// 				contextId,
// 				stateKey,
// 				state,
// 				defaultValue
// 			},
// 			{
// 				...options,
// 				customMerge: options?.customMerge || merge
// 			}
// 		);
// 	};

// 	return [
// 		stateEntry.state,
// 		setState
// 	];
// }
