import { LogLevel, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { GlobalStateChangeFilters, GlobalStateSubscriptionsEntry } from "subscription/types";
import { ReactSimpleStateDependencyInjection } from "types.di";

export interface GlobalStateRoot {
	// recursive object stateFullQualifiedName is passed to getChildMemberValue() from react-simple-mapping as full qualified child name
	state: object;
	subscriptions: GlobalStateSubscriptionsEntry;
}

export interface ReactSimpleState {
	LOGGING: {
		logLevel: LogLevel; // for functions in react-simple-state
	};

	ROOT_STATE: GlobalStateRoot;
	DI: ReactSimpleStateDependencyInjection;

	readonly DEFAULTS: {
		changeFilters: {
			always: GlobalStateChangeFilters; // always update all subscribed components (parent, children, this state)
			never: GlobalStateChangeFilters; // never update any subscribed components
			defaultSubscribeFilters: GlobalStateChangeFilters; // default for subscribeToChanges when using useGlobalState()
			defaultUpdateFilters: GlobalStateChangeFilters; // default for updateStates when using setGlobalState()
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
