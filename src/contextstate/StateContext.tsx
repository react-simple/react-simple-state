import * as React from "react";
import { PropsWithChildren, createContext, useContext, useEffect, useState } from "react";
import { StateContextData } from "./types";
import { logWarning, newGuid } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { getOrCreateGlobalContextEntry } from "./internal/functions";

// By default global state is used, but StateContext can be used to create local state bags in the DOM.
// Specify contextId if local state bag is requested. Global state is under the "" key.
// This is implemented by using React context, not state. Consumers are not getting updated automatically on context changes.

const StateContextObj = createContext<StateContextData>({ contextId: "" });

const REGISTERED_STATE_CONTEXT_UNIQUE_IDS: { [contextId: string]: string } = {};

export interface StateContextProviderProps extends PropsWithChildren {
	contextId: string;
}

export const StateContext = ({ contextId, children }: StateContextProviderProps) => {
	const uniqueId = `${contextId}_${useState(newGuid)[0]}`;

	useEffect(
		() => {
			// Initialize
			const registeredUniqueId = REGISTERED_STATE_CONTEXT_UNIQUE_IDS[contextId];

			if (registeredUniqueId && registeredUniqueId !== uniqueId) {
				logWarning(
					`[StateContext]: StateContext with contextId='${contextId}' is already registed.`,
					undefined,
					REACT_SIMPLE_STATE.LOGGING.logLevel
				);
			}

			REGISTERED_STATE_CONTEXT_UNIQUE_IDS[contextId] = uniqueId;

			return () => {
				// Finalize
				delete REGISTERED_STATE_CONTEXT_UNIQUE_IDS[contextId];
			};
		},
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[contextId]
	);

	return (
		<StateContextObj.Provider value={{ contextId }}>
			{children}
		</StateContextObj.Provider>
	);
};

// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
export const useStateContextId = (contextId?: string) => {
	const closestContext = useContext(StateContextObj); // get closest context

	// we always have a contextId, either a custom specified one or the closet one or ROOT_CONTEXT
	return contextId || closestContext?.contextId || REACT_SIMPLE_STATE.ROOT_CONTEXT_ID;
};

// By default state from the closes StateContext is used from the DOM hierarchy, but it can be overridden by specifying contextId.
export const useStateContext = (contextId?: string) => {
	const contextIdResolved = useStateContextId(contextId);

	// return the specified context (if any) or return the closes context or the root context if there is no closest
	return {
		// we always have a contextId, either a custom specified one or the closet one or ROOT_CONTEXT
		contextId: contextIdResolved,
		context: getOrCreateGlobalContextEntry(contextIdResolved)
	};
};
