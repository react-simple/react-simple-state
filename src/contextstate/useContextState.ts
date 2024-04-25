import { useEffect } from "react";
import { StateReturn, ValueOrCallback, ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { getOrCreateGlobalContextStateEntry, removeGlobalContextState, setGlobalContextState } from "./functions";
import { useStateContextId } from "./StateContext";
import { ContextStateChangeArgs } from "./types";

// By calling useContextState() the parent component subscribes to context state changes according to the specified getUpdates value.
// useContextState() always returns a state, either the existing one or the default value.
// By default the closest <StateContext> is used in the DOM hierarchy, but it can be overriden by specifying an exact contextId.

export interface UseContextStateProps<State> {
	stateKey: string;
	getUpdates: ValueOrCallbackWithArgs<ContextStateChangeArgs<State>, boolean>; // true: always, false: never, function: selective
	defaultValue: ValueOrCallback<State>;

	// optional
	contextId?: string; // by default the closest StateContext is used in the DOM hierarchy, but it can be overriden
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	merge?: (oldState: State, newState: Partial<State>) => State;
}

// By calling useContextState() the parent component subscribes to state changes according to the specified getUpdates value.
// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
export function useContextState<State>(props: UseContextStateProps<State>): StateReturn<State> {
	const { stateKey, getUpdates, defaultValue, merge, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// we use the closest context or the root context, but if contextId is specified and is invalid, we can have no context
	const contextId = useStateContextId(props.contextId);

	// get current state
	const stateEntry = getOrCreateGlobalContextStateEntry<State>(contextId, stateKey, defaultValue);

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace("react-simple-state: useContextState.handleStateUpdated", { props, uniqueId, contextId, stateEntry });
		forceUpdate();
	};

	logTrace("react-simple-state: useContextState", { props, uniqueId, contextId, stateEntry });

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			stateEntry.stateSubscriptions[uniqueId] = {
				getUpdates,
				onStateUpdated: handleStateUpdated
			};

			logTrace("react-simple-state: useContextState.initialize", { props, uniqueId, contextId, stateEntry });

			return () => {
				// Finalize
				delete stateEntry!.stateSubscriptions[uniqueId];

				// delete the entire state entry with all subscriptions
				removeGlobalContextState(contextId, stateKey);
			}
		},
		[]);

	const setState = (
		state: ValueOrCallbackWithArgs<State, Partial<State>>,
		customMerge?: (oldState: State, newState: Partial<State>) => State
	) => {
		return setGlobalContextState({
			contextId,
			stateKey,
			state,
			defaultValue,
			customMerge: customMerge || merge
		});
	};

	return [
		stateEntry.state,
		setState
	];
}
