import { useEffect } from "react";
import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logTrace, stringAppend, useForceUpdate, useUniqueId
 } from "@react-simple/react-simple-util";
import { getGlobalState, setGlobalState } from "./functions";
import { SetStateOptions, StateReturn } from "types";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeFilters, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";
import { useGlobalStateContext } from "./context";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified updateFilter value.
// useGlobalState() always returns a state, either the existing one or the default value.

export interface UseGlobalStateProps<State> {
	fullQualifiedName: string;
	defaultValue: ValueOrCallback<State>;

	// default is REACT_SIMPLE_STATE.ROOT_STATE.defaults.changeFilters.defaultSubscribeFilters
	subscribedState?: GlobalStateChangeFilters<State>;  

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	merge?: (oldState: State, newState: Partial<State>) => State;

	ignoreContexts?: boolean; // by default <StateContext> components are used to prefix the fullQualifiedName, but it can be disabled
	contextId?: string; // instead of using the closest React context of StateContext, the exact instance can be specified

	enabled?: boolean; // Default is true. If false, then no subscription will happen.
}

export function useGlobalState<State>(props: UseGlobalStateProps<State>): StateReturn<State> {
	const { subscribedState, subscriberId, ignoreContexts, contextId, enabled = true } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	const context = useGlobalStateContext(contextId);
	
	const fullQualifiedName = context && !ignoreContexts
		? stringAppend(context?.fullQualifiedName, props.fullQualifiedName, ".")
		: props.fullQualifiedName;

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
			if (enabled) {
				subscribeToGlobalState(uniqueId, { fullQualifiedName, subscribedState, onUpdate });
			}

			logTrace(log => log(
				`[useGlobaState]: Initialized fullQualifiedName=${fullQualifiedName}`,
				{ props, uniqueId, stateValue: currentState }
			), REACT_SIMPLE_STATE.LOGGING.logLevel);
			
			return () => {				
				// Finalize
				if (enabled) {
					unsubscribeFromGlobalState(uniqueId, fullQualifiedName);
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fullQualifiedName, enabled, subscriberId]);
	
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
