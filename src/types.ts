import { LogLevel } from "@react-simple/react-simple-util";
import { GlobalStateContextData } from "globalstate/context/types";
import { GlobalStateSubscriptionsEntry, GlobalStateUpdateFilter } from "subscriptions/types";
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

export interface InitGlobalStateOptions<State> {
	// if specified deepCopyObject() will be called for the existing state
	// default value is REACT_SIMPLE_STATE.DEFAULTS.immutableSetState
	readonly immutableUpdate?: boolean; 
	readonly updateStates?:
	| false // update nothing
	| true // update all (this, parent, child states); same as undefined
	| GlobalStateUpdateFilter<State>;
}

export interface SetGlobalStateOptions<State> extends InitGlobalStateOptions<State>  {
	readonly mergeState?: (oldState: State | undefined, newState: Partial<State>) => Partial<State>;
}

export interface RemoveGlobalStateOptions {
	readonly removeSubscriptions?: boolean;
	readonly removeEmptyParents?: boolean;
}
