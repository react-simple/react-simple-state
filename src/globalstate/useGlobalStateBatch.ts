import { useEffect } from "react";
import { convertArrayToDictionary, isArray, logTrace, mapDictionaryEntries, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { getGlobalStateOrEmpty, setGlobalState } from "./functions";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeFilters, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according to the specified updateFilter value.
// useGlobalStateBatch() does not always return a state, the returned state can be undefined, if not yet set.

export interface UseGlobalStateBatchProps {
	fullQualifiedNames: string[] | Record<string, string>; // names or [result key, name] mapping
	
	// default is REACT_SIMPLE_STATE.ROOT_STATE.defaults.changeFilters.defaultSubscribeFilters
	// default is { thisState: "always", parentState: "always" }, subscribe to changes of this state or parent state
	subscribedState?: GlobalStateChangeFilters<unknown>;  

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseGlobalStateBatchReturn = [
	{ [stateKey: string]: unknown }, // state can be undefined
	typeof setGlobalState
];

export function useGlobalStateBatch(props: UseGlobalStateBatchProps): UseGlobalStateBatchReturn {
	const { fullQualifiedNames, subscribedState, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state (state can be undefined, if not yet set, but we subcribe anyway)
	const currentStates = isArray(fullQualifiedNames)
		? convertArrayToDictionary(fullQualifiedNames, t => [t, getGlobalStateOrEmpty(t)])
		: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => [key, getGlobalStateOrEmpty(name)]);

	const names = Object.values(fullQualifiedNames);

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
			names.forEach(name => subscribeToGlobalState(uniqueId, { fullQualifiedName: name, subscribedState, onUpdate }));

			logTrace(log => log(
				`[useGlobalStateBatch]: Initialized fullQualifiedNames=[${names.join(", ")}]`,
				{ props, uniqueId, currentStates },
				REACT_SIMPLE_STATE.LOGGING.logLevel
			));

			return () => {
				// Finalize
				names.forEach(name => unsubscribeFromGlobalState(uniqueId, name));
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]);

	return [
		currentStates,
		setGlobalState
	];
}
