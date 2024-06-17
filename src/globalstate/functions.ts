import {
	ValueOrCallback, ValueOrCallbackWithArgs, getResolvedArray, getResolvedCallbackValue, getResolvedCallbackValueWithArgs, logTrace
} from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { GlobalStateRoot, InitStateOptions, SetStateOptions } from "types";
import { deleteChildMember, getChildMemberValue, setChildMemberValue } from "@react-simple/react-simple-mapping";
import { globalStateUpdateSubscribedComponents } from "subscription";

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getGlobalStateOrEmpty_default<State>(
	stateFullQualifiedName: string,
	globalStateRoot: GlobalStateRoot
): State | undefined {
	// get current state or default state
	return getChildMemberValue<State>(globalStateRoot.state, stateFullQualifiedName);
}

REACT_SIMPLE_STATE.DI.globalState.getGlobalStateOrEmpty = getGlobalStateOrEmpty_default;

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getGlobalStateOrEmpty<State>(
	stateFullQualifiedName: string,
	globalStateRoot?: GlobalStateRoot
): State | undefined {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.globalState.getGlobalStateOrEmpty<State>(
		stateFullQualifiedName,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		getGlobalStateOrEmpty_default
	);
}

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
function getGlobalState_default<State>(
	stateFullQualifiedName: string,
	defaultValue: ValueOrCallback<State>,
	globalStateRoot: GlobalStateRoot
): State {
	// get current state or default state
	return getGlobalStateOrEmpty<State>(stateFullQualifiedName, globalStateRoot) || getResolvedCallbackValue(defaultValue);
}

REACT_SIMPLE_STATE.DI.globalState.getGlobalState = getGlobalState_default;

// Gets the current global state, but the caller component/hook won't get updated on state changes. Suitable for event handlers.
// Use the useGlobalState() hook to get the parent component/hook updated on state changes.
export function getGlobalState<State>(
	stateFullQualifiedName: string,
	defaultValue: ValueOrCallback<State>,
	globalStateRoot?: GlobalStateRoot
): State {
	// get current state or default state
	return REACT_SIMPLE_STATE.DI.globalState.getGlobalState<State>(
		stateFullQualifiedName,
		defaultValue,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		getGlobalState_default
	);
}

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
const setGlobalState_default = <State>(
	stateFullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, State>,

	// update this state and child states by default
	options: SetStateOptions<State>,
	globalStateRoot: GlobalStateRoot
) => {
	// get current state, calculate new state
	const oldState = getGlobalStateOrEmpty<State>(stateFullQualifiedName, globalStateRoot);
	const stateToSet = getResolvedCallbackValueWithArgs(state, oldState);

	const newState = (
		!oldState ? stateToSet :
			options?.mergeState ? options.mergeState(oldState, stateToSet) :
				{ ...oldState, ...stateToSet }
	);

	// set new state
	if (!stateFullQualifiedName) {
		globalStateRoot.state = newState as object;
	}
	else {
		setChildMemberValue(globalStateRoot.state, stateFullQualifiedName, newState);
	}

	logTrace(log => log(
		`[setGlobalState] stateFullQualifiedName=${stateFullQualifiedName}`,
		{ stateFullQualifiedName, state, options, oldState, newState }
	), REACT_SIMPLE_STATE.LOGGING.logLevel);

	globalStateUpdateSubscribedComponents({ stateFullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.setGlobalState = setGlobalState_default;

// Sets global state and notifies all subscribed components. Accepts partial state which will be merged with the current state.
export const setGlobalState = <State = unknown>(
	stateFullQualifiedName: string,
	state: ValueOrCallbackWithArgs<State | undefined, State>,
	// update this state and child states by default
	options?: SetStateOptions<State>,
	globalStateRoot?: GlobalStateRoot
) => {
	return REACT_SIMPLE_STATE.DI.globalState.setGlobalState(
		stateFullQualifiedName,
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
	stateFullQualifiedName: string,
	state: ValueOrCallback<State>,
	// update this state and child states by default
	options: InitStateOptions<State>,
	globalStateRoot: GlobalStateRoot
) => {
	// get current state, calculate new state
	const newState = getResolvedCallbackValue(state); // no merging, it's a complete state
	const oldState = getGlobalState(stateFullQualifiedName, newState, globalStateRoot);

	// set new state
	setChildMemberValue(globalStateRoot.state, stateFullQualifiedName, newState);

	logTrace(log => log(
		`[initGlobalState] stateFullQualifiedName=${stateFullQualifiedName}`,
		{ stateFullQualifiedName, state, newState }
	), REACT_SIMPLE_STATE.LOGGING.logLevel);

	globalStateUpdateSubscribedComponents({ stateFullQualifiedName, oldState, newState }, options, globalStateRoot);
	return newState;
};

REACT_SIMPLE_STATE.DI.globalState.initGlobalState = initGlobalState_default;

// Sets global state and notifies all subscribed components. Requires complete state since no merging will occur.
export const initGlobalState = <State>(
	stateFullQualifiedName: string,
	state: ValueOrCallback<State>,
	// update this state and child states by default
	options?: InitStateOptions<State>,
	globalStateRoot?: GlobalStateRoot
) => {
	return REACT_SIMPLE_STATE.DI.globalState.initGlobalState(
		stateFullQualifiedName,
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
	globalStateRoot: GlobalStateRoot
) => {
	logTrace(log => log(
		`[removeGlobalState] statePaths=[${getResolvedArray(statePaths).join(", ")}]`,
		{ statePaths },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	));

	for (const stateFullQualifiedName of getResolvedArray(statePaths)) {
		// notifySubscribers() is not called intentionally here
		deleteChildMember(globalStateRoot.state, stateFullQualifiedName);
	}
};

REACT_SIMPLE_STATE.DI.globalState.removeGlobalState = removeGlobalState_default;

// Be careful, because removeGlobalState() will effectively kill all subscriptions so any existing components
// subscribed with useGlobalState() won't get state upates anymore.
// Use initGlobalState() to reset the state, but keep the subscriptions.
// (Also, unlike initContextState(), subscribers won't get notified on the state change; it's completely silent. It's for finalizers.)
export const removeGlobalState = (
	statePaths: string | string[],
	globalStateRoot?: GlobalStateRoot
) => {
	REACT_SIMPLE_STATE.DI.globalState.removeGlobalState(
		statePaths,
		globalStateRoot || REACT_SIMPLE_STATE.ROOT_STATE,
		removeGlobalState_default
	);
}
