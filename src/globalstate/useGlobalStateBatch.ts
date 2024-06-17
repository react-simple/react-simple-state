import { useEffect } from "react";
import { convertArrayToDictionary, logTrace, useForceUpdate, useUniqueId } from "@react-simple/react-simple-util";
import { getGlobalStateOrEmpty, setGlobalState } from "./functions";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeFilters, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according to the specified updateFilter value.
// useGlobalStateBatch() does not always return a state, the returned state can be undefined, if not yet set.

export interface UseGlobalStateBatchProps {
	stateFullQualifiedName: string[];
	
	stateChangeFilters: GlobalStateChangeFilters;

	// optional
	subscriberId?: string; // custom metadata for tracing info only
}

export type UseGlobalStateBatchReturn = [
	{ [stateKey: string]: unknown }, // state can be undefined
	typeof setGlobalState
];

export function useGlobalStateBatch(props: UseGlobalStateBatchProps): UseGlobalStateBatchReturn {
	const { stateFullQualifiedName, stateChangeFilters, subscriberId } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	// get current state (state can be undefined, if not yet set, but we subcribe anyway)
	const currentStates = convertArrayToDictionary(stateFullQualifiedName, t => [t, getGlobalStateOrEmpty(t)]);

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate = () => {
		logTrace(log => log(
			`[useGlobalStateBatch]: onUpdate stateFullQualifiedName=[${stateFullQualifiedName.join(", ")}]`,
			{ props, uniqueId, currentStates },
			REACT_SIMPLE_STATE.LOGGING.logLevel
		));

		forceUpdate();
	};

	logTrace(log => log(
		`[useGlobalStateBatch]: Rendering stateKestateFullQualifiedNameys=[${stateFullQualifiedName.join(", ")}]`,
		{ props, uniqueId, currentStates },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	));

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			stateFullQualifiedName.forEach(name => {
				subscribeToGlobalState(uniqueId, {
					fullQualifiedName: name,
					subscribedState: stateChangeFilters,
					onUpdate
				});
			});

			logTrace(log => log(
				`[useGlobalStateBatch]: Initialized stateFullQualifiedName=[${stateFullQualifiedName.join(", ")}]`,
				{ props, uniqueId, currentStates },
				REACT_SIMPLE_STATE.LOGGING.logLevel
			));

			return () => {
				// Finalize
				stateFullQualifiedName.forEach(name => {
					unsubscribeFromGlobalState(uniqueId, name);
				});
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[]);

	return [
		currentStates,
		setGlobalState
	];
}
