import { useEffect, useRef, useState } from "react";
import {
	convertArrayToDictionary, isArray, logTrace, mapDictionaryEntries, stringAppend, useForceUpdate, useUniqueId 
} from "@react-simple/react-simple-util";
import { getGlobalState, removeGlobalState } from "./functions";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateSubscription, GlobalStateUpdateFilter, subscribeToGlobalState, unsubscribeFromGlobalState } from "subscriptions";
import { useGlobalStateContext } from "./context";
import { UseGlobalStateProps } from "./useGlobalState";

// By calling useGlobalStateBatch() the parent component subscribes to state changes of multiple state keys according 
// to the specified updateFilter value.

export type UseGlobalStateBatchProps<InvariantState> =
	Omit<UseGlobalStateProps<InvariantState>, "fullQualifiedName" | "mergeState" | "updateFilter" | "defaultState">
	& {
		fullQualifiedNames: string[] | Record<string, string>; // names or [resultKey, fullQualifiedName] mapping
		updateFilter?: false | true | GlobalStateUpdateFilter<unknown>; // selectors are not supported here
	};

// state can be uninitialized
export type UseGlobalStateBatchReturn<InvariantState> = { [fullQualifiedName: string]: InvariantState | undefined };

export function useGlobalStateBatch<InvariantState>(
	props: UseGlobalStateBatchProps<InvariantState>
): UseGlobalStateBatchReturn<InvariantState> {
	const {
		fullQualifiedNames, updateFilter = false, subscriberId, ignoreContexts, contextId, enabled = true, globalStateRoot, removeStateOnUnload
	} = props;

	const uniqueId = useUniqueId({ prefix: subscriberId }); // generate permanent uniqueId for this hook instance
	const forceUpdate = useForceUpdate();
	const context = useGlobalStateContext(contextId);

	const [previousValue, setPreviousValue] = useState<{ [fullQualifiedName: string]: unknown }>({});
	const refPreviousValue = useRef<typeof previousValue>();
	refPreviousValue.current = previousValue;

	let currentStates: Record<string, InvariantState | undefined>;
	let resolvedFulLQualifiedNames: string[];
	
		// get current state (state can be uninitialized, if not yet set, but we subcribe anyway)
	if (context.fullQualifiedNamePrefix && !ignoreContexts) {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, name => {
				const resolvedName = stringAppend(context.fullQualifiedNamePrefix, name, ".");
				return [resolvedName, getGlobalState<InvariantState>(resolvedName, globalStateRoot)];
			})
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => {
				const resolvedName = stringAppend(context.fullQualifiedNamePrefix, name, ".");
				return [key, getGlobalState<InvariantState>(resolvedName, globalStateRoot)];
			});

		resolvedFulLQualifiedNames = Object.values(fullQualifiedNames).map(name => stringAppend(context.fullQualifiedNamePrefix, name, "."));
	} else {
		currentStates = isArray(fullQualifiedNames)
			? convertArrayToDictionary(fullQualifiedNames, name => [name, getGlobalState<InvariantState>(name, globalStateRoot)])
			: mapDictionaryEntries(fullQualifiedNames, ([key, name]) => [key, getGlobalState<InvariantState>(name, globalStateRoot)]);
		
		resolvedFulLQualifiedNames = Object.values(fullQualifiedNames);
	}

	// local function called by other hooks via subscription on state changes to update this hook and its parent component
	const onUpdate: GlobalStateSubscription<InvariantState>["onUpdate"] = (changeArgs, subscription) => {
		logTrace(log => log(
			`[useGlobalStateBatch]: onUpdate fullQualifiedNames=[${resolvedFulLQualifiedNames.join(", ")}]`,
			{ args: { props, uniqueId, currentStates, globalStateRoot } }
		), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

		forceUpdate();
		props.onUpdate?.(changeArgs, subscription);
	};

	const onUpdateSkipped: GlobalStateSubscription<InvariantState>["onUpdateSkipped"] = (changeArgs, subscription) => {
		props.onUpdateSkipped?.(changeArgs, subscription);
	};

	logTrace(log => log(
		`[useGlobalStateBatch]: Rendering fullQualifiedNames=[${resolvedFulLQualifiedNames.join(", ")}]`,
		{ args: { props, uniqueId, currentStates, globalStateRoot } },
	), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

	// subscribe/unsubscribe
	useEffect(
		() => {
			// Initialize
			if (enabled) {
				resolvedFulLQualifiedNames.forEach(fullQualifiedName => subscribeToGlobalState(
					uniqueId,
					{
						fullQualifiedName,
						updateFilter,
						onUpdate,
						onUpdateSkipped
					},
					globalStateRoot
				));
			}

			logTrace(log => log(
				`[useGlobalStateBatch]: Initialized fullQualifiedNames=[${resolvedFulLQualifiedNames.join(", ")}]`,
				{ args: { props, uniqueId, currentStates, globalStateRoot } }
			), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

			return () => {
				// Finalize
				if (enabled) {
					resolvedFulLQualifiedNames.forEach(fullQualifiedName => {
						unsubscribeFromGlobalState(uniqueId, fullQualifiedName, globalStateRoot);

						if (removeStateOnUnload) {
							removeGlobalState(fullQualifiedName, removeStateOnUnload !== true ? removeStateOnUnload : undefined);
						}
					});
				}
			}
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[resolvedFulLQualifiedNames.join(), enabled, subscriberId]);

	return currentStates;
}
