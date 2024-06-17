import { useEffect } from "react";
import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logTrace, useForceUpdate, useUniqueId
 } from "@react-simple/react-simple-util";
import { getGlobalState, setGlobalState } from "./functions";
import { SetStateOptions, StateReturn } from "types";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeFilters, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified updateFilter value.
// useGlobalState() always returns a state, either the existing one or the default value.

export interface UseGlobalStateProps<State> {
	fullQualifiedName: string;
	defaultValue: ValueOrCallback<State>;

	// default is REACT_SIMPLE_STATE.ROOT_STATE.defaults.changeFilters.defaultSubscribeFilters
	// default is { thisState: "always", parentState: "always" }, subscribe to changes of this state or parent state
	subscribedState?: GlobalStateChangeFilters<State>;  

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	merge?: (oldState: State, newState: Partial<State>) => State;
}

export function useGlobalState<State>(props: UseGlobalStateProps<State>): StateReturn<State> {
	const { fullQualifiedName, subscribedState, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state
	const defaultValue = getResolvedCallbackValue(props.defaultValue);
	const currentState = getGlobalState(fullQualifiedName, defaultValue);

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate = () => {
		logTrace(log => log(
			`[useGlobaState]: onUpdate fullQualifiedName=${fullQualifiedName}`,
			{ props, uniqueId, currentState }
		), REACT_SIMPLE_STATE.LOGGING.logLevel);
		
		forceUpdate();
	};

	logTrace(log => log(
		`[useGlobaState]: Rendering fullQualifiedName=${fullQualifiedName}`,
		{ props, uniqueId, currentState }
	), REACT_SIMPLE_STATE.LOGGING.logLevel);

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			subscribeToGlobalState(uniqueId, { fullQualifiedName, subscribedState, onUpdate });

			logTrace(log => log(
				`[useGlobaState]: Initialized fullQualifiedName=${fullQualifiedName}`,
				{ props, uniqueId, stateValue: currentState }
			), REACT_SIMPLE_STATE.LOGGING.logLevel);
			
			return () => {
				// Finalize
				unsubscribeFromGlobalState(uniqueId, fullQualifiedName);
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]);
	
	const setState = (
		newState: ValueOrCallbackWithArgs<State, Partial<State>>,
		options?: SetStateOptions<State>
	) => {
		const mergeState = options?.mergeState || props.merge || ((t1, t2) => ({ ...t1, ...t2 }));

		return setGlobalState<State>(
			fullQualifiedName,
			(oldState: State | undefined) => mergeState(
				oldState || defaultValue,
				getResolvedCallbackValueWithArgs(newState, oldState || defaultValue)
			),
			{
				...options,
				mergeState
			}
		);
	};

	return [
		currentState,
		setState
	];
}
