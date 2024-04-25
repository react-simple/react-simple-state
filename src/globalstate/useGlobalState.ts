import { useEffect } from "react";
import { StateReturn, ValueOrCallback, ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { getOrCreateGlobalStateEntry, setGlobalState } from "./functions";
import { StateChangeArgs } from "types";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified getUpdates value.
// useGlobalState() always returns a state, either the existing one or the default value.

export interface UseGlobalStateProps<State> {
	stateKey: string;
	// true: always, false: never, function: selective
	getUpdates: ValueOrCallbackWithArgs<StateChangeArgs<State>, boolean>; 
	defaultValue: ValueOrCallback<State>;

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	merge?: (oldState: State, newState: Partial<State>) => State;
}

export function useGlobalState<State>(props: UseGlobalStateProps<State>): StateReturn<State> {
	const { stateKey, getUpdates, defaultValue, merge, subscriberId } = props;
	const scope = `[react-simple-state] useGlobalState ${stateKey}`;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state
	const stateEntry = getOrCreateGlobalStateEntry<State>(stateKey, defaultValue);

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace(`${scope}: handleStateUpdated`, { props, uniqueId, stateEntry });
		forceUpdate();
	};

	logTrace(scope, { props, uniqueId, stateEntry });

	// subscribe/unsubscribe
	useEffect(
		() => {
				// Initialize
				stateEntry.stateSubscriptions[uniqueId] = {
					getUpdates,
					onStateUpdated: handleStateUpdated
				};

				logTrace(`${scope}: initialize`, { props, uniqueId, stateEntry });

			return () => {
				// Finalize
				delete stateEntry!.stateSubscriptions[uniqueId];
			}
		},
		[]);

	const setState = (
		state: ValueOrCallbackWithArgs<State, Partial<State>>,
		customMerge?: (oldState: State, newState: Partial<State>) => State
	) => {
		return setGlobalState({ stateKey, state, defaultValue, customMerge: customMerge || merge });
	};

	return [
		stateEntry.state,
		setState
	];
}
