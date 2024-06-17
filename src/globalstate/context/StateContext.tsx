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
	fullQualifiedName: "",
	uniqueId: "",
	parentContexts: []
});

export type StateContextProps = PropsWithChildren & {
	readonly contextId: string;

	// any useGlobalState() calls within the context will be prefixed with this path
	// nested contexts will also be prefixed
	readonly fullQualifiedName: string;

	readonly ignoreParentContexts?: boolean; // by default <StateContext> components are used to prefix the fullQualifiedName, but it can be disabled
	readonly parentContextId?: string; // instead of using the closest React context of StateContext, the exact instance can be specified
};

export const StateContext = (props: StateContextProps) => {
	const { contextId, children, ignoreParentContexts, parentContextId } = props;
	const parentContext = useGlobalStateContext(parentContextId);

	const fullQualifiedName = parentContext && !ignoreParentContexts
		? stringAppend(parentContext.fullQualifiedName, props.fullQualifiedName, ".")
		: props.fullQualifiedName;
	
	const uniqueId = useUniqueId({ prefix: contextId, suffix: fullQualifiedName });

	const contextData: GlobalStateContextData = {
		contextId,
		fullQualifiedName,
		uniqueId,
		parentContexts: parentContext
			? [...parentContext.parentContexts, parentContext]
			: []
	};

	useEffect(
		() => {
			// Initialize
			const registeredContext = getGlobalStateContextData(contextId);

			if (registeredContext && registeredContext.uniqueId !== uniqueId) {
				logWarning(
					`[StateContext]: StateContext with contextId='${contextId}' is already registed.`,
					{ props, registeredContext },
					REACT_SIMPLE_STATE.LOGGING.logLevel
				);
			}

			REACT_SIMPLE_STATE.CONTEXTS[contextId] = contextData;

			return () => {
				// Finalize
				delete REACT_SIMPLE_STATE.CONTEXTS[contextId];
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[contextId, fullQualifiedName]
	);

	return (
		<StateContextObj.Provider value={contextData}>
			{children}
		</StateContextObj.Provider>
	);
};

// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
export function useGlobalStateContext(contextId?: string): GlobalStateContextData | undefined {
	const context = useContext(StateContextObj); // get closest context
	const contextIdResolved = contextId || context?.contextId;

	// return the specified context (if any) or return the closes context or the root context if there is no closest
	return context || (contextIdResolved && getGlobalStateContextData(contextIdResolved));
}
