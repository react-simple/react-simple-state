import { SetStateOptions, StateChangeArgs, StateChangeSubscriptionsByUniqueId, StateEntry } from "types";
import { logTrace } from "@react-simple/react-simple-util";
import { ContextStateChangeArgs, ContextStateEntry } from "contextstate/types";
import { getGlobalStateRoot } from "globalstate/internal/functions";
import { getGlobalContextStateRoot } from "contextstate/internal/functions";
import { REACT_SIMPLE_STATE } from "data";
import { fullQualifiedMemberNameMatchSubTree } from "@react-simple/react-simple-mapping";

// Internal artifacts are not exported

// calls customMerge() or performs a shallow merge (only the list of root member is merged)
export function mergeState<State>(
	oldState: State,
	newState: Partial<State>,
	customMerge?: (oldState: State, newState: Partial<State>) => State
): State {
	return customMerge ? customMerge(oldState, newState) : { ...oldState, ...newState };
}

const invokeSubscriptions = <State, TStateChangeArgs extends StateChangeArgs<State> = StateChangeArgs<State>>(
	subscriptions: StateChangeSubscriptionsByUniqueId<State, TStateChangeArgs>,
	args: TStateChangeArgs
) => {
	for (const sub of Object.values(subscriptions)) {
		if (sub && sub.updateFilter !== false && (sub.updateFilter === true || sub.updateFilter(args))) {
			sub.onStateUpdated(args);
		}
	}
};

export const notifySubscribers = <State, TStateChangeArgs extends StateChangeArgs<State> = StateChangeArgs<State>>(
	stateEntry: StateEntry<State, TStateChangeArgs>,
	args: TStateChangeArgs,
	options?: SetStateOptions<State>
) => {
	const { stateKey, stateSubscriptions } = stateEntry;
	logTrace(`[notifySubscribers] stateKey=${stateKey}`, { stateEntry, args }, REACT_SIMPLE_STATE.LOGGING.logLevel);

	// state key level subscriptions
	invokeSubscriptions(stateSubscriptions, args);

	// root subscriptions
	const rootState = getGlobalStateRoot();
	invokeSubscriptions(rootState.rootStateSubscriptions, args);

	// state key level subscriptions of child/parent states (using "name.name.name" full qualified name format)
	if (options?.notifyParents || options?.notifyChildren) {
		for (const otherState of Object.values(rootState.rootState)) {
			if (otherState && otherState.stateKey !== stateKey &&
				(
					(options?.notifyParents && fullQualifiedMemberNameMatchSubTree(otherState.stateKey, stateKey)) ||
					(options?.notifyChildren && fullQualifiedMemberNameMatchSubTree(stateKey, otherState.stateKey))
				)
			) {
				invokeSubscriptions(otherState.stateSubscriptions, args);
			}
		}
	}
};

export const notifyContextSubscribers = <State>(
	stateEntry: ContextStateEntry<State>,
	args: ContextStateChangeArgs<State>,
	options?: SetStateOptions<State>
) => {
	const { contextId, stateKey, stateSubscriptions } = stateEntry;
	const context = getGlobalContextStateRoot().rootState[contextId];
	logTrace(
		`[notifyContextSubscribers]: contextId=${contextId}, stateKey=${stateKey}`,
		{ stateEntry, args, context },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	);

	// state key level subscriptions
	if (context) {
		invokeSubscriptions(context.contextStateSubscriptions, args);
	}

	// context level subscriptions
	invokeSubscriptions(stateSubscriptions, args);

	// root subscriptions
	const rootState = getGlobalContextStateRoot();
	invokeSubscriptions(rootState.rootStateSubscriptions, args);

	// context and state key level subscriptions of child/parent context states (using "name.name.name" full qualified name format)
	if (options?.notifyParents || options?.notifyChildren) {
		for (const otherState of Object.values(rootState.rootState)) {
			if (otherState && otherState.contextId !== contextId && otherState.contextId !== REACT_SIMPLE_STATE.ROOT_CONTEXT_ID &&
				(
					(options?.notifyParents && fullQualifiedMemberNameMatchSubTree(otherState.contextId, contextId)) ||
					(options?.notifyChildren && fullQualifiedMemberNameMatchSubTree(contextId, otherState.contextId))
				)
			) {
				// state key level subscriptions of child/parent context states				
				for (const subState of Object.values(otherState.contextState)) {
					if (subState && subState.stateKey !== stateKey &&
						(
							(options?.notifyParents && fullQualifiedMemberNameMatchSubTree(subState.stateKey, stateKey)) ||
							(options?.notifyChildren && fullQualifiedMemberNameMatchSubTree(stateKey, subState.stateKey))
						)
					) {
						invokeSubscriptions(subState.stateSubscriptions, args);
					}
				}

				// context level subscriptions of child/parent context states
				invokeSubscriptions(otherState.contextStateSubscriptions, args);
			}
		}
	}
};
