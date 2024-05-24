import { StateChangeArgs, StateEntry } from "types";
import { logTrace } from "@react-simple/react-simple-util";
import { GLOBAL_STATE } from "./globalstate.data";
import { GLOBAL_CONTEXT_STATE } from "./contextstate.data";
import { ContextStateChangeArgs, ContextStateEntry } from "contextstate/types";

// Internal artifacts are not exported

// calls customMerge() or performs a shallow merge (only the list of root member is merged)
export function mergeState<State>(
	oldState: State,
	newState: Partial<State>,
	customMerge?: (oldState: State, newState: Partial<State>) => State
): State {
	return customMerge ? customMerge(oldState, newState) : { ...oldState, ...newState };
}

export const notifySubscribers = <State>(stateEntry: StateEntry<State>, args: StateChangeArgs<State>) => {
	logTrace("[notifySubscribers]", { stateEntry, args });

	// state key level subscriptions
	for (const sub of Object.values(stateEntry.stateSubscriptions)) {
		if (sub && sub.getUpdates !== false && (sub.getUpdates === true || sub.getUpdates(args))) {
			sub.onStateUpdated(args);
		}
	}

	// GLOBAL_STATE subscriptions
	for (const sub of Object.values(GLOBAL_STATE.rootStateSubscriptions)) {
		if (sub && sub.getUpdates !== false && (sub.getUpdates === true || sub.getUpdates(args))) {
			sub.onStateUpdated(args);
		}
	}
};

export const notifyContextSubscribers = <State>(stateEntry: ContextStateEntry<State>, args: ContextStateChangeArgs<State>) => {
	const context = GLOBAL_CONTEXT_STATE.rootState[stateEntry.contextId];
	logTrace("[notifyContextSubscribers]", { stateEntry, args, context });

	// state key level subscriptions
	for (const sub of Object.values(stateEntry.stateSubscriptions)) {
		if (sub && sub.getUpdates !== false && (sub.getUpdates === true || sub.getUpdates(args))) {
			sub.onStateUpdated(args);
		}
	}

	// context level subscriptions
	if (context) {
		for (const sub of Object.values(context.contextStateSubscriptions)) {
			if (sub && sub.getUpdates !== false && (sub.getUpdates === true || sub.getUpdates(args))) {
				sub.onStateUpdated(args);
			}
		}
	}

	// GLOBAL_CONTEXT_STATE subscriptions
	for (const sub of Object.values(GLOBAL_CONTEXT_STATE.rootStateSubscriptions)) {
		if (sub && sub.getUpdates !== false && (sub.getUpdates === true || sub.getUpdates(args))) {
			sub.onStateUpdated(args);
		}
	}
};
