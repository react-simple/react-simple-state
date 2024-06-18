import { useEffect } from "react";
import {
	convertArrayToDictionary, isArray, logTrace, mapDictionaryEntries, stringAppend, useForceUpdate, useUniqueId 
} from "@react-simple/react-simple-util";
import { getGlobalStateOrEmpty, setGlobalState } from "./functions";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateChangeArgs, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscription";
import { useGlobalStateContext } from "./context";
import { UseGlobalStateProps } from "./useGlobalState";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according to the specified updateFilter value.
// useGlobalStateBatch() does not always return a state, the returned state can be undefined, if not yet set.

export type UseGlobalStateBatchProps<State> = Omit<UseGlobalStateProps<State>, "fullQualifiedName" | "defaultState"> & {
	fullQualifiedNames: string[] | Record<string, string>; // names or [result key, name] mapping
}

export type UseGlobalStateBatchReturn<State> = [
	{ [fullQualifiedName: string]: State | undefined }, // state can be undefined
	typeof setGlobalState
];

export function useGlobalStateBatch<State>(props: UseGlobalStateBatchProps<State>): UseGlobalStateBatchReturn<State> {
	const { fullQualifiedNames, subscribedState, subscriberId, ignoreContexts, contextId, enabled = true, globalStateRoot } = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();

	const context = useGlobalStateContext(contextId);
	let currentStates: Record<string, State | undefined>;
	let names: string[];
	
		// get current state (state can be undefined, if not yet set, but we subcribe anyway)
	if (context.fullQualifiedNamePrefix && !ignoreContexts) {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, name => {
				const resolvedName = stringAppend(context.fullQualifiedNamePrefix, name, ".");
				return [resolvedName, getGlobalStateOrEmpty<State>(resolvedName, globalStateRoot)];
			})
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => {
				const resolvedName = stringAppend(context.fullQualifiedNamePrefix, name, ".");
				return [key, getGlobalStateOrEmpty<State>(resolvedName, globalStateRoot)];
			});

		names = Object.values(fullQualifiedNames).map(name => stringAppend(context.fullQualifiedNamePrefix, name, "."));
	} else {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, name => [name, getGlobalStateOrEmpty<State>(name, globalStateRoot)])
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => [key, getGlobalStateOrEmpty<State>(name, globalStateRoot)]);
		
		names = Object.values(fullQualifiedNames);
	}

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate = (changeArgs: GlobalStateChangeArgs<State>, triggerFullQualifiedName: string) => {
		logTrace(log => log(
			`[useGlobalStateBatch]: onUpdate fullQualifiedNames=[${names.join(", ")}]`,
			{ props, uniqueId, currentStates },
			REACT_SIMPLE_STATE.LOGGING.logLevel
		));

		forceUpdate();
		props.onUpdate?.(changeArgs, triggerFullQualifiedName);
	};

	const onUpdateSkipped = (changeArgs: GlobalStateChangeArgs<State>, triggerFullQualifiedName: string) => {
		props.onUpdateSkipped?.(changeArgs, triggerFullQualifiedName);
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
				names.forEach(name => subscribeToGlobalState(
					uniqueId,
					{ fullQualifiedName: name, subscribedState, onUpdate, onUpdateSkipped },
					globalStateRoot
				));
			}

			logTrace(log => log(
				`[useGlobalStateBatch]: Initialized fullQualifiedNames=[${names.join(", ")}]`,
				{ props, uniqueId, currentStates },
				REACT_SIMPLE_STATE.LOGGING.logLevel
			));

			return () => {
				// Finalize
				if (enabled) {
					names.forEach(name => unsubscribeFromGlobalState(uniqueId, name, globalStateRoot));
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[names.join(), enabled, subscriberId]);

	const setState: typeof setGlobalState = (t1, t2, t3, t4) => {
		return setGlobalState(t1, t2, t3, t4 || globalStateRoot);
	};

	return [
		currentStates,
		setState
	];
}
