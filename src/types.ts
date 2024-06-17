import { LogLevel, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { GlobalStateChangeFilters, GlobalStateSubscriptionsEntry } from "subscription/types";
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
	DI: ReactSimpleStateDependencyInjection;

	readonly DEFAULTS: {
		changeFilters: {
			always: GlobalStateChangeFilters<unknown>; // always update all subscribed components (parent, children, this state)
			never: GlobalStateChangeFilters<unknown>; // never update any subscribed components
			defaultSubscribeFilters: GlobalStateChangeFilters<unknown>; // default for subscribeToChanges when using useGlobalState()
			defaultUpdateFilters: GlobalStateChangeFilters<unknown>; // default for updateStates when using setGlobalState()
		};
	}
}

export type StateSetter<State> = (
	state: ValueOrCallbackWithArgs<State | undefined, Partial<State>>,
	options?: SetStateOptions<State>
) => State;

export type StateReturn<State> = [State, StateSetter<State>];

export interface InitStateOptions<State> {
	// default is REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultUpdateFilters
	readonly updateState?: GlobalStateChangeFilters<State>;
}

export interface SetStateOptions<State> extends InitStateOptions<State>  {
	readonly mergeState?: (oldState: State, newState: Partial<State>) => State;
}

export interface RemoveStateOptions {
	readonly removeSubscriptions?: boolean;
	readonly removeEmptyParents?: boolean;
}
