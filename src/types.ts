import { LogLevel, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { GlobalStateContextData } from "globalstate/context/types";
import { GlobalStateUpdateConditions, GlobalStateSubscriptionsEntry } from "subscription/types";
import { ReactSimpleStateDependencyInjection } from "types.di";

export interface GlobalStateRoot<State> {
	// recursive object fullQualifiedName is passed to getChildMemberValue() from react-simple-mapping as full qualified child name
	state: State;
	subscriptions: GlobalStateSubscriptionsEntry<State>;
}

export interface ReactSimpleState {
	LOGGING: {
		logLevel: LogLevel; // for functions in react-simple-state
	};

	ROOT_STATE: GlobalStateRoot<unknown>;
	CONTEXTS: { [contextId: string]: GlobalStateContextData };

	DI: ReactSimpleStateDependencyInjection;

	DEFAULTS: {
		// if specified deepCopyObject() will be called for the existing state in setGlobalState() and initGlobalState()
		immutableSetState: boolean;
	};
}

export type StateSetter<State> = (state: ValueOrCallbackWithArgs<State, Partial<State>>, options?: SetStateOptions<State>) => State;
export type StateMerger<State> = (oldState: State, newState: Partial<State>) => State;

export type StateReturn<State, TStateSetter = StateSetter<State>> = [State, TStateSetter];

export interface InitStateOptions<State> {
	// if specified deepCopyObject() will be called for the existing state
	// default value is REACT_SIMPLE_STATE.DEFAULTS.immutableSetState
	readonly immutableUpdate?: boolean; 
	readonly updateState?: GlobalStateUpdateConditions<State>;
}

export interface SetStateOptions<State> extends InitStateOptions<State>  {
	readonly mergeState?: StateMerger<State>;
}

export interface RemoveStateOptions {
	readonly removeSubscriptions?: boolean;
	readonly removeEmptyParents?: boolean;
}
