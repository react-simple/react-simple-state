import * as React from "react";
import { PropsWithChildren, createContext, useContext, useEffect } from "react";
import { GlobalStateContextData } from "./types";
import { logWarning, stringAppend, useUniqueId } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { getGlobalStateContextData } from "./functions";

// By default global state is used, but StateContext can be used to create local state bags in the DOM.
// Specify contextId if local state bag is requested. Global state is under the "" key.
// This is implemented by using React context, not state. Consumers are not getting updated automatically on context changes.

const StateContextObj = createContext<GlobalStateContextData>({
	contextId: "",
	fullQualifiedNamePrefix: "",
	uniqueId: "",
	parentContexts: []
});

export type StateContextProps = PropsWithChildren & {
	readonly contextId: string;

	// any useGlobalState() calls within the context will be prefixed with this path
	// nested contexts will also be prefixed
	readonly fullQualifiedNamePrefix: string;

	readonly ignoreParentContexts?: boolean; // by default <StateContext> components are used to prefix the fullQualifiedName, but it can be disabled
	readonly parentContextId?: string; // instead of using the closest React context of StateContext, the exact instance can be specified
};

export const StateContext = (props: StateContextProps) => {
	const { contextId, children, ignoreParentContexts, parentContextId } = props;
	const parentContext = useGlobalStateContext(parentContextId);

	const fullQualifiedNamePrefix = parentContext.fullQualifiedNamePrefix && !ignoreParentContexts
		? stringAppend(parentContext.fullQualifiedNamePrefix, props.fullQualifiedNamePrefix, ".")
		: props.fullQualifiedNamePrefix;
	
	const uniqueId = useUniqueId({ prefix: contextId, suffix: fullQualifiedNamePrefix });

	const contextData: GlobalStateContextData = {
		contextId,
		fullQualifiedNamePrefix,
		uniqueId,
		parentContexts: [...parentContext.parentContexts, parentContext]
	};

	useEffect(
		() => {
			// Initialize
			const registeredContext = getGlobalStateContextData(contextId);

			if (registeredContext && registeredContext.uniqueId !== uniqueId) {
				logWarning(
					`[StateContext]: StateContext with contextId='${contextId}' is already registed.`,
					{
						args: { props, registeredContext },
						logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
					}
				);
			}

			REACT_SIMPLE_STATE.CONTEXTS[contextId] = contextData;

			return () => {
				// Finalize
				delete REACT_SIMPLE_STATE.CONTEXTS[contextId];
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[contextId, fullQualifiedNamePrefix]
	);

	return (
		<StateContextObj.Provider value={contextData}>
			{children}
		</StateContextObj.Provider>
	);
};

// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
// If no context is found it returns the default, empty context (contextId: "", fullQualifiedPath: "").
export const useGlobalStateContext = (contextId?: string) => {
	const context = useContext(StateContextObj); // get closest context

	return contextId
		? getGlobalStateContextData(contextId) || context
		: context;
};
