import { useEffect } from "react";
import { ValueOrCallback, ValueOrCallbackWithArgs, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { setGlobalState } from "./functions";
import { StateChangeArgs, StateReturn } from "types";
import { getOrCreateGlobalStateEntry } from "./internal/functions";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified updateFilter value.
// useGlobalState() always returns a state, either the existing one or the default value.

export interface UseGlobalStateProps<State> {
	stateKey: string;
	// true: always, false: never, function: selective
	updateFilter: ValueOrCallbackWithArgs<StateChangeArgs<State>, boolean>; 
	defaultValue: ValueOrCallback<State>;

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	merge?: (oldState: State, newState: Partial<State>) => State;
}

export function useGlobalState<State>(props: UseGlobalStateProps<State>): StateReturn<State> {
	const { stateKey, updateFilter, defaultValue, merge, subscriberId } = props;
	const scope = `[react-simple-state] useGlobalState ${stateKey}`;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state
	const stateEntry = getOrCreateGlobalStateEntry<State>(stateKey, defaultValue);

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const handleStateUpdated = () => {
		logTrace(`[${scope}]: handleStateUpdated`, { props, uniqueId, stateEntry });
		forceUpdate();
	};

	logTrace(`[${scope}]`, { props, uniqueId, stateEntry });

	// subscribe/unsubscribe
	useEffect(
		() => {
				// Initialize
				stateEntry.stateSubscriptions[uniqueId] = {
					updateFilter,
					onStateUpdated: handleStateUpdated
				};

				logTrace(`[${scope}]: initialize`, { props, uniqueId, stateEntry });

			return () => {
				// Finalize
				delete stateEntry!.stateSubscriptions[uniqueId];
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
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
