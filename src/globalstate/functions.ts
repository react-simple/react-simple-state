import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logTrace
} from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateRoot, InitStateOptions, RemoveStateOptions, SetStateOptions } from "types";
import { deleteChildMember, getChildMemberValue, setChildMemberValue } from "@react-simple/react-simple-mapping";
import { getGlobalStateSubscriptionsMemberInfo, globalStateUpdateSubscribedComponents } from "subscription";
import { ROOT_STATE_DEFAULT } from "data.internal";

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getGlobalStateOrEmpty_default<State>(
	fullQualifiedName: string,
	globalStateRoot: GlobalStateRoot<unknown>
): State | undefined {
	// get current state or default state
	return getChildMemberValue<State>(globalStateRoot.state as object, fullQualifiedName);
}

REACT_SIMPLE_STATE.DI.globalState.getGlobalStateOrEmpty = getGlobalStateOrEmpty_default;

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getGlobalStateOrEmpty<State>(
	fullQualifiedName: string,
	globalStateRoot?: GlobalStateRoot<unknown>
): State | undefined {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.globalState.getGlobalStateOrEmpty<State>(
		fullQualifiedName,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		getGlobalStateOrEmpty_default
	);
}

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getGlobalState_default<State>(
	fullQualifiedName: string,
	defaultValue: ValueOrCallback<State>,
	globalStateRoot: GlobalStateRoot<unknown>
): State {
	// get current state or default state
	return getGlobalStateOrEmpty<State>(fullQualifiedName, globalStateRoot) || getResolvedCallbackValue(defaultValue);
}

REACT_SIMPLE_STATE.DI.globalState.getGlobalState = getGlobalState_default;

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getGlobalState<State>(
	fullQualifiedName: string,
	defaultValue: ValueOrCallback<State>,
	globalStateRoot?: GlobalStateRoot<unknown>
): State {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.globalState.getGlobalState<State>(
		fullQualifiedName,
		defaultValue,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		getGlobalState_default
	);
}

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
const setGlobalState_default = <State>(
	fullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, State>,

	// update this state and child states by default
	options: SetStateOptions<State>,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	// get current state, calculate new state
	const oldState = getGlobalStateOrEmpty<State>(fullQualifiedName, globalStateRoot);
	const stateToSet = getResolvedCallbackValueWithArgs(state, oldState);

	const newState = (
		!oldState ? stateToSet :
			options?.mergeState ? options.mergeState(oldState, stateToSet) :
				{ ...oldState, ...stateToSet }
	);

	// set new state
	if (!fullQualifiedName) {
		globalStateRoot.state = newState as object;
	}
	else {
		setChildMemberValue(globalStateRoot.state as object, fullQualifiedName, newState);
	}

	logTrace(log => log(
		`[setGlobalState] fullQualifiedName=${fullQualifiedName}`,
		{ fullQualifiedName, state, options, oldState, newState }
	), REACT_SIMPLE_STATE.LOGGING.logLevel);

	globalStateUpdateSubscribedComponents({ fullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.setGlobalState = setGlobalState_default;

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
export const setGlobalState = <State>(
	fullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, State>,
	// update this state and child states by default
	options?: SetStateOptions<State>,
	globalStateRoot?: GlobalStateRoot<unknown>
) => {
	return REACT_SIMPLE_STATE.DI.globalState.setGlobalState(
		fullQualifiedName,
		state,
		{
			...options,
			updateState: {
				...REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultUpdateFilters,
				...options?.updateState
			}
		},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		setGlobalState_default
	);
};

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
const initGlobalState_default = <State>(
	fullQualifiedName: string,
	state: ValueOrCallback<State>,
	// update this state and child states by default
	options: InitStateOptions<State>,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	// get current state, calculate new state
	const oldState = getGlobalStateOrEmpty<State>(fullQualifiedName, globalStateRoot);
	const newState = getResolvedCallbackValue(state); // no merging, it's a complete state

	// set new state
	if (!fullQualifiedName) {
		globalStateRoot.state = newState as object;
	}
	else {
		setChildMemberValue(globalStateRoot.state as object, fullQualifiedName, newState);
	}

	logTrace(log => log(
		`[initGlobalState] fullQualifiedName=${fullQualifiedName}`,
		{ fullQualifiedName, state, newState }
	), REACT_SIMPLE_STATE.LOGGING.logLevel);

	globalStateUpdateSubscribedComponents({ fullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.initGlobalState = initGlobalState_default;

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
export const initGlobalState = <State>(
	fullQualifiedName: string,
	state: ValueOrCallback<State>,
	// update this state and child states by default
	options?: InitStateOptions<State>,
	globalStateRoot?: GlobalStateRoot<unknown>
) => {
	return REACT_SIMPLE_STATE.DI.globalState.initGlobalState(
		fullQualifiedName,
		state,
		{
			...options,
			updateState: {
				...REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultUpdateFilters,
				...options?.updateState
			}
		},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		initGlobalState_default
	);
};

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
const removeGlobalState_default = (
	statePaths: string | string[],
	options: RemoveStateOptions,
	globalStateRoot: GlobalStateRoot<unknown>
) => {
	logTrace(log => log(
		`[removeGlobalState] statePaths=[${getResolvedArray(statePaths).join(", ")}]`,
		{ statePaths },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	));

	const { removeSubscriptions, removeEmptyParents } = options;

	if (statePaths === "") {
		globalStateRoot.state = ROOT_STATE_DEFAULT.state;

		if (removeSubscriptions) {
			globalStateRoot.subscriptions = ROOT_STATE_DEFAULT.subscriptions;
		}
	}
	else {
		// notifySubscribers() is not called intentionally here
		for (const fullQualifiedName of getResolvedArray(statePaths)) {
			if (!fullQualifiedName) {
				globalStateRoot.state = ROOT_STATE_DEFAULT.state;
			}
			else {
				deleteChildMember(globalStateRoot.state as object, fullQualifiedName, { deleteEmptyParents: removeEmptyParents });
			}

			if (removeSubscriptions) {
				if (!fullQualifiedName) {
					globalStateRoot.subscriptions = ROOT_STATE_DEFAULT.subscriptions;
				}
				else {
					getGlobalStateSubscriptionsMemberInfo(fullQualifiedName, false, globalStateRoot)?.deleteMember();
				}
			}
		}
	}
};

REACT_SIMPLE_STATE.DI.globalState.removeGlobalState = removeGlobalState_default;

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalState = (
	statePaths: string | string[],
	options?: RemoveStateOptions,
	globalStateRoot?: GlobalStateRoot<unknown>
) => {
	REACT_SIMPLE_STATE.DI.globalState.removeGlobalState(
		statePaths,
		options || {},
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		removeGlobalState_default
	);
}
