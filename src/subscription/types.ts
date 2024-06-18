import { Guid } from "@react-simple/react-simple-util";

export interface GlobalStateChangeArgs<State> {
	fullQualifiedName: string;
	oldState: State | undefined; // during initialization by default value, we have no previous state
	newState: State;
}

export type GlobalStateUpdateCondition<State> =
	| true // always
	| false // never
	| ((changeArgs: GlobalStateChangeArgs<State>) => boolean);

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
	readonly subscribedState: GlobalStateUpdateConditions<State>;

	readonly onUpdate: (
		changeArgs: GlobalStateChangeArgs<State>, // the change state
		triggerFullQualifiedName: string // we can subscribe to parent and child state changes; this is the point of subscription
	) => void;

	readonly onUpdateSkipped?: (
		changeArgs: GlobalStateChangeArgs<State>, // the change state
		triggerFullQualifiedName: string // we can subscribe to parent and child state changes; this is the point of subscription
	) => void;
}
	
export interface GlobalStateUpdateConditions<State> {
	readonly thisState?: boolean; // default is true
	readonly parentState?: boolean; // default is true
	readonly childState?: boolean; // default is true
	readonly condition?: GlobalStateUpdateCondition<State>;
}
