import { useEffect, useRef, useState } from "react";
import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedCallbackValue, isFunction, logTrace, sameObjects, stringAppend,
	useForceUpdate, useUniqueId
 } from "@react-simple/react-simple-util";
import { getGlobalState, removeGlobalState, setGlobalState } from "./functions";
import { GlobalStateRoot, RemoveGlobalStateOptions, SetGlobalStateOptions } from "types";
import { REACT_SIMPLE_STATE } from "data";
import {
	GlobalStateSubscription, GlobalStateUpdateFilter, GlobalStateUpdateFilterWithSelector, subscribeToGlobalState, unsubscribeFromGlobalState
 } from "subscriptions";
import { useGlobalStateContext } from "./context";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified updateFilter value.

// Returns state or undefined, if it was not yet initialized
export interface UseGlobalStateProps<State> {
	fullQualifiedName: string;
	defaultState: ValueOrCallback<State>;

	// default is unconditional true for all (this, parents, children)
	updateFilter?: GlobalStateUpdateFilterWithSelector<State>;

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	// custom merge function, if not specified shallow object merge is used using the spread operator (root members are merged)
	mergeState?: (oldState: State | undefined, newState: Partial<State>) => Partial<State>;

	ignoreContexts?: boolean; // by default <StateContext> components are used to prefix the fullQualifiedName, but it can be disabled
	contextId?: string; // instead of using the closest React context of StateContext, the exact instance can be specified

	enabled?: boolean; // Default is true. If false, then no subscription will happen.
	removeStateOnUnload?: boolean | RemoveGlobalStateOptions;
	globalStateRoot?: GlobalStateRoot<unknown>; // default is REACT_SIMPLE_STATE.ROOT_STATE	

	onUpdate?: GlobalStateSubscription<State>["onUpdate"];
	onUpdateSkipped?: GlobalStateSubscription<State>["onUpdateSkipped"];
}

export type UseGlobalStateReturn<State> = [
	// state
	State,
	// setState
	(
		newState: ValueOrCallbackWithArgs<State, Partial<State>>,
		options?: SetGlobalStateOptions<State>
	) => State
];

export function useGlobalState<State>(props: UseGlobalStateProps<State>): UseGlobalStateReturn<State> {
	const {
		updateFilter, subscriberId, ignoreContexts, contextId, enabled = true, globalStateRoot, removeStateOnUnload
	} = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();
	const context = useGlobalStateContext(contextId);

	const [previousValue, setPreviousValue] = useState<unknown>();
	const refPreviousValue = useRef<unknown>();
	refPreviousValue.current = previousValue;
	
	const fullQualifiedName = context.fullQualifiedNamePrefix && !ignoreContexts
		? stringAppend(context?.fullQualifiedNamePrefix, props.fullQualifiedName, ".")
		: props.fullQualifiedName;

	// get current state
	const defaultState = getResolvedCallbackValue(props.defaultState);
	const currentState = getGlobalState<State>(fullQualifiedName, globalStateRoot) || defaultState;

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate: GlobalStateSubscription<State>["onUpdate"] = (changeArgs, subscription) => {
		logTrace(log => log(
			`[useGlobalState]: onUpdate fullQualifiedName=${fullQualifiedName}`,
			{ args: { props, uniqueId, currentState, globalStateRoot } }
		), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });
		
		forceUpdate();
		props.onUpdate?.(changeArgs, subscription);
	};

	const onUpdateSkipped: GlobalStateSubscription<State>["onUpdateSkipped"] = (changeArgs, subscription) => {
		props.onUpdateSkipped?.(changeArgs, subscription);
	};

	logTrace(log => log(
		`[useGlobalState]: Rendering fullQualifiedName=${fullQualifiedName}`,
		{ args: { props, uniqueId, currentState, globalStateRoot } }
	), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

	const calculateGlobalStateHooksUpdateFilter: () => GlobalStateUpdateFilter<State> | undefined = () => {
		if (!updateFilter) {
			return undefined;
		}
		else if (updateFilter.condition || updateFilter.selector) {
			return {
				...updateFilter,
				condition: changeArgs => {
					// check condition
					if (updateFilter.condition?.(changeArgs) === false) {
						return false;
					}

					// check selector
					if (updateFilter.selector) {
						const state = getGlobalState<State>(fullQualifiedName, globalStateRoot) || defaultState;
						const value = updateFilter.selector.getValue(state);
						
						if (!sameObjects(value, refPreviousValue.current, updateFilter.selector.objectCompareOptions)) {
							setPreviousValue(value);
							return true;
						}
						else {
							return false;
						}
					}

					return true;
				}
			};
		}
		else {
			const { selector: _, ...rest } = updateFilter; // remove selector
			return rest;
		}
	};

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize			
			if (enabled) {
				subscribeToGlobalState(
					uniqueId,
					{
						fullQualifiedName,
						updateFilter: calculateGlobalStateHooksUpdateFilter(),
						onUpdate,
						onUpdateSkipped
					},
					globalStateRoot);
			}

			logTrace(log => log(
				`[useGlobalState]: Initialized fullQualifiedName=${fullQualifiedName}`,
				{ args: { props, uniqueId, currentState, globalStateRoot } }
			), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });
			
			return () => {				
				// Finalize
				if (enabled) {
					unsubscribeFromGlobalState(uniqueId, fullQualifiedName, globalStateRoot);

					if (removeStateOnUnload) {
						removeGlobalState(fullQualifiedName, removeStateOnUnload !== true ? removeStateOnUnload : undefined);
					}
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[fullQualifiedName, enabled, subscriberId, globalStateRoot]);
	
	const setState: UseGlobalStateReturn<State>[1] = (newState, options) => {
		// Since defaultValue is a complete state, the returned value will be a complete state too.
		return setGlobalState(
			fullQualifiedName,
			(isFunction(newState) ? (t: State | undefined) => newState(t || defaultState) : newState) as Partial<State>,
			options,
			globalStateRoot) as State;
	};

	return [
		currentState,
		setState
	];
}

// Returns state only, but no setter
export const useGlobalStateReadOnly = <State>(props: Omit<UseGlobalStateProps<State>, "mergeState">) => {
	return useGlobalState(props)[0];
};
