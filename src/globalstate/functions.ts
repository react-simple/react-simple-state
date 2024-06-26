import {
	ValueOrCallback, ValueOrCallbackWithArgs, deepCopyObject, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs,
	isObject, logTrace, resolveEmpty
} from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateRoot, InitGlobalStateOptions, RemoveGlobalStateOptions, SetGlobalStateOptions } from "types";
import { deleteChildMember, getChildMemberValue, setChildMemberValue } from "@react-simple/react-simple-mapping";
import { getGlobalStateSubscriptionsMemberInfo, updateGlobalStateSubscribedComponents } from "subscriptions";
import { ROOT_STATE_DEFAULT } from "data.internal";

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getGlobalState_default<State>(
	fullQualifiedName: string,
	globalStateRoot: GlobalStateRoot<unknown>
): State | undefined {
	// get current state or default state
	return getChildMemberValue<State>(globalStateRoot.state as object, fullQualifiedName);
}

REACT_SIMPLE_STATE.DI.globalState.getGlobalState = getGlobalState_default;

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getGlobalState<State>(
	fullQualifiedName: string,
	globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
): State | undefined {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.globalState.getGlobalState<State>(
		fullQualifiedName,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		getGlobalState_default
	);
}

function mergeGlobalState_default<State>(
	oldState: State | undefined,
	newState: Partial<State>,
	mergeState?: (oldState: State | undefined, newState: Partial<State>) => Partial<State>
): Partial<State> {
	return (
		oldState === undefined ? newState :
			mergeState ? mergeState(oldState, newState) :
				isObject(oldState) && isObject(newState) ? { ...oldState, ...newState } :
					newState
	);
}

REACT_SIMPLE_STATE.DI.globalState.mergeGlobalState = mergeGlobalState_default;

export function mergeGlobalState<State>(
	oldState: State | undefined,
	newState: Partial<State>,
	mergeState?: (oldState: State | undefined, newState: Partial<State>) => Partial<State>
): Partial<State> {
	return REACT_SIMPLE_STATE.DI.globalState.mergeGlobalState(oldState, newState, mergeState, mergeGlobalState_default);
}

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
const setGlobalState_default = <State>(
	fullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, Partial<State>>,
	options: SetGlobalStateOptions<State>,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	const immutableSetState = resolveEmpty(options.immutableUpdate, REACT_SIMPLE_STATE.DEFAULTS.immutableSetState);

	// get current state, calculate new state
	const oldState = getGlobalState<State>(fullQualifiedName, globalStateRoot);
	const stateToSet = getResolvedCallbackValueWithArgs(state, oldState);

	let newState = mergeGlobalState(oldState, stateToSet, options?.mergeState) as State; // cheating here

	if (immutableSetState) {
		newState = deepCopyObject(newState as object) as State;
	}

	// set new state
	if (!fullQualifiedName) {
		globalStateRoot.state = newState as object;
	}
	else {
		setChildMemberValue(globalStateRoot.state as object, fullQualifiedName, newState);
	}

	logTrace(log => log(
		`[setGlobalState] fullQualifiedName=${fullQualifiedName}`,
		{
			args: { fullQualifiedName, state, options, oldState, newState, globalStateRoot }
		}
	), {
		logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
	});

	updateGlobalStateSubscribedComponents({ fullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.setGlobalState = setGlobalState_default;

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
export const setGlobalState = <State>(
	fullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, Partial<State>>,
	options?: SetGlobalStateOptions<State>,
	globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
	return REACT_SIMPLE_STATE.DI.globalState.setGlobalState(
		fullQualifiedName,
		state,
		options || {},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		setGlobalState_default
	);
};

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
const initGlobalState_default = <State>(
	fullQualifiedName: string,
	state: ValueOrCallback<State>,
	options: InitGlobalStateOptions<State>,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	// get current state, calculate new state
	const oldState = getGlobalState<State>(fullQualifiedName, globalStateRoot);
	let newState = getResolvedCallbackValue(state); // no merging, it's a complete state

	if (resolveEmpty(options.immutableUpdate, REACT_SIMPLE_STATE.DEFAULTS.immutableSetState)) {
		newState = deepCopyObject(newState as object) as State;
	}

	// set new state
	if (!fullQualifiedName) {
		globalStateRoot.state = newState as object;
	}
	else {
		setChildMemberValue(globalStateRoot.state as object, fullQualifiedName, newState);
	}

	logTrace(log => log(
		`[initGlobalState] fullQualifiedName=${fullQualifiedName}`,
		{ args: { fullQualifiedName, state, newState, globalStateRoot } }
	), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

	updateGlobalStateSubscribedComponents({ fullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.initGlobalState = initGlobalState_default;

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
export const initGlobalState = <State>(
	fullQualifiedName: string,
	state: ValueOrCallback<State>,
	options?: InitGlobalStateOptions<State>,
	globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
	return REACT_SIMPLE_STATE.DI.globalState.initGlobalState(
		fullQualifiedName,
		state,
		options || {},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		initGlobalState_default
	);
};

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
const removeGlobalState_default = (
	fullQualifiedNames: string | string[],
	options: RemoveGlobalStateOptions,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	const { removeSubscriptions, removeEmptyParents } = options;

	if (fullQualifiedNames === "") {
		globalStateRoot.state = ROOT_STATE_DEFAULT.state;

		if (removeSubscriptions) {
			globalStateRoot.subscriptions = ROOT_STATE_DEFAULT.subscriptions;
		}
	}
	else {
		// notifySubscribers() is not called intentionally here
		for (const fullQualifiedName of getResolvedArray(fullQualifiedNames)) {
			if (!fullQualifiedName) {
				globalStateRoot.state = ROOT_STATE_DEFAULT.state;
			}
			else {
				deleteChildMember(globalStateRoot.state as object, fullQualifiedName, !!removeEmptyParents);
			}

			if (removeSubscriptions) {
				if (!fullQualifiedName) {
					globalStateRoot.subscriptions = ROOT_STATE_DEFAULT.subscriptions;
				}
				else {
					getGlobalStateSubscriptionsMemberInfo(fullQualifiedName, false, globalStateRoot)?.deleteMember(!!removeEmptyParents);
				}
			}
		}
	}

	logTrace(log => log(
		`[removeGlobalState] fullQualifiedNames=[${getResolvedArray(fullQualifiedNames).join(", ")}]`,
		{ args: { fullQualifiedNames, globalStateRoot } }
	), { logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });
};

REACT_SIMPLE_STATE.DI.globalState.removeGlobalState = removeGlobalState_default;

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalState = (
	fullQualifiedNames: string | string[],
	options?: RemoveGlobalStateOptions,
	globalStateRoot?: GlobalStateRoot<unknown> // default is REACT_SIMPLE_STATE.ROOT_STATE
) => {
	REACT_SIMPLE_STATE.DI.globalState.removeGlobalState(
		fullQualifiedNames,
		options || {},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		removeGlobalState_default
	);
}
