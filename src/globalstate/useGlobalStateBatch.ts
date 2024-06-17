import { useEffect } from "react";
import {
	convertArrayToDictionary, isArray, logTrace, mapDictionaryEntries, stringAppend, useForceUpdate, useUniqueId 
} from "@react-simple/react-simple-util";
import { getGlobalStateOrEmpty, setGlobalState } from "./functions";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeFilters, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";
import { useGlobalStateContext } from "./context";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according to the specified updateFilter value.
// useGlobalStateBatch() does not always return a state, the returned state can be undefined, if not yet set.

export interface UseGlobalStateBatchProps<State> {
	fullQualifiedNames: string[] | Record<string, string>; // names or [result key, name] mapping
	
	// default is REACT_SIMPLE_STATE.ROOT_STATE.defaults.changeFilters.defaultSubscribeFilters
	subscribedState?: GlobalStateChangeFilters<State>;  

	// optional
	subscriberId?: string; // custom metadata for tracing info only

	ignoreContexts?: boolean; // by default <StateContext> components are used to prefix the fullQualifiedName, but it can be disabled
	contextId?: string; // instead of using the closest React context of StateContext, the exact instance can be specified

	enabled?: boolean; // Default is true. If false, then no subscription will happen.
}

export type UseGlobalStateBatchReturn<State> = [
	{ [fullQualifiedName: string]: State | undefined }, // state can be undefined
	typeof setGlobalState
];

export function useGlobalStateBatch<State>(props: UseGlobalStateBatchProps<State>): UseGlobalStateBatchReturn<State> {
	const { fullQualifiedNames, subscribedState, subscriberId, ignoreContexts, contextId, enabled = true } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	const context = useGlobalStateContext(contextId);
	let currentStates: Record<string, State | undefined>;
	let names: string[];
	
		// get current state (state can be undefined, if not yet set, but we subcribe anyway)
	if (context && !ignoreContexts) {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, name => {
				const resolvedName = stringAppend(context.fullQualifiedName, name, ".");
				return [resolvedName, getGlobalStateOrEmpty<State>(resolvedName)];
			})
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => {
				const resolvedName = stringAppend(context.fullQualifiedName, name, ".");
				return [key, getGlobalStateOrEmpty<State>(resolvedName)];
			});

		names = Object.values(fullQualifiedNames).map(name => stringAppend(context.fullQualifiedName, name, "."));
	} else {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, t => [t, getGlobalStateOrEmpty<State>(t)])
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => [key, getGlobalStateOrEmpty<State>(name)]);
		
		names = Object.values(fullQualifiedNames);
	}

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate = () => {
		logTrace(log => log(
			`[useGlobalStateBatch]: onUpdate fullQualifiedNames=[${names.join(", ")}]`,
			{ props, uniqueId, currentStates },
			REACT_SIMPLE_STATE.LOGGING.logLevel
		));

		forceUpdate();
	};

	logTrace(log => log(
		`[useGlobalStateBatch]: Rendering fullQualifiedNames=[${names.join(", ")}]`,
		{ props, uniqueId, currentStates },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	));

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			if (enabled) {
				names.forEach(name => subscribeToGlobalState(uniqueId, { fullQualifiedName: name, subscribedState, onUpdate }));
			}

			logTrace(log => log(
				`[useGlobalStateBatch]: Initialized fullQualifiedNames=[${names.join(", ")}]`,
				{ props, uniqueId, currentStates },
				REACT_SIMPLE_STATE.LOGGING.logLevel
			));

			return () => {
				// Finalize
				if (enabled) {
					names.forEach(name => unsubscribeFromGlobalState(uniqueId, name));
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[names.join(), enabled, subscriberId]);

	return [
		currentStates,
		setGlobalState
	];
}
