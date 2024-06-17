import { Guid, ObjectCompareOptions } from "@react-simple/react-simple-util";

export interface GlobalStateChangeArgs<State> {
	stateFullQualifiedName: string;
	oldState: State | undefined; // during initialization by default value, we have no previous state
	newState: State;
}

export interface GlobalStateConditionalChangeFilter<State> {
	readonly condition: (changeArgs: GlobalStateChangeArgs<State>) => boolean;
}

export type GlobalStateChangeFilter<State> =
	| "always"
	| "never"
	| GlobalStateConditionalChangeFilter<State>;

// Instead of a flat list we build a hieararchy of subscriptions following the full qualified path 
// using setChildMemberValue() from react-simple-mapping
export interface GlobalStateSubscriptionsEntry<State> {
	readonly fullQualifiedName: string;
	readonly subscriptions: { [uniqueId: Guid]: GlobalStateSubscription<State> };
	readonly children: { [name: string]: GlobalStateSubscriptionsEntry<unknown> };
}

export interface GlobalStateSubscription<State> {
	readonly fullQualifiedName: string;

	// true to get all update, false to get no updates, function to get updates selectively
	readonly subscribedState: GlobalStateChangeFilters<State>;

	readonly onUpdate: (
		changeArgs: GlobalStateChangeArgs<State>, // the change state
		triggerFullQualifiedName: string // we can subscribe to parent and child state changes; this is the point of subscription
	) => void;
}
	
// default is REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultUpdateFilters for initGlobalState() and setGlobalState() and
// REACT_SIMPLE_STATE.DEFAULTS.changeFilters.defaultSubscribeFilters for subscribeToGlobalState() or useGlobalState()
export interface GlobalStateChangeFilters<State> {
	readonly thisState?: GlobalStateChangeFilter<State>; // required, but if not, then default is "always"
	readonly parentState?: GlobalStateChangeFilter<State>; // default is "never" when updating and "always" when subscribing
	readonly childState?: GlobalStateChangeFilter<State>; // default is "always" when updating and "never" when subscribing
}
