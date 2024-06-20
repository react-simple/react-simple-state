import { Guid, ObjectCompareOptions } from "@react-simple/react-simple-util";

export interface GlobalStateChangeArgs<State> {
	fullQualifiedName: string;
	oldState: State | undefined; // during initialization by default value, we have no previous state
	newState: State;
}

// Instead of a flat list we build a hieararchy of subscriptions following the full qualified path 
// using setChildMemberValue() from react-simple-mapping
export interface GlobalStateSubscriptionsEntry<State> {
	readonly fullQualifiedName: string;
	readonly subscriptions: { [uniqueId: Guid]: GlobalStateSubscription<State> };
	readonly children: { [name: string]: GlobalStateSubscriptionsEntry<unknown> };
}

export interface GlobalStateSubscription<State> {
	readonly fullQualifiedName: string;
	readonly updateFilter: GlobalStateUpdateFilterExt<State>;

	readonly onUpdate: (
		changeArgs: GlobalStateChangeArgs<State>, // the change state
		subscription: GlobalStateSubscription<State>
	) => void;

	// Callback to notify the subscribed component that it should have been updated according to the intentions of 
	// the set/initGlobalState() call, but it was filtered out by updateFilter conditions. 
	// So there was an update affecting this component subscription but the component was not subscribed to it intentionally.
	readonly onUpdateSkipped?: (
		changeArgs: GlobalStateChangeArgs<State>, // the change state
		subscription: GlobalStateSubscription<State>
	) => void;
}
	
export interface GlobalStateUpdateFilter<State> {
	readonly thisState?: boolean; // default is true
	readonly parentState?: boolean; // default is true
	readonly childState?: boolean; // default is true

	readonly fullQualifiedNames?: string[]; // if any of these are updated

	// update component if condition() returns true; 'true' by default
	readonly condition?: ((changeArgs: GlobalStateChangeArgs<State>) => boolean);
}

export type GlobalStateUpdateFilterExt<State> = false | GlobalStateUpdateFilter<State>;

export type GlobalStateUpdateFilterWithSelector<State> = false | GlobalStateUpdateFilterExt<State> & {
	// update component if the value returned by selector.getValue() changes; 'true' by default
	// uses sameObjects() from the 'react-simple-util' package
	readonly selector?: {
		readonly getValue: (state: State) => unknown; // selector will be called over state addressed by fullQualifiedName
		readonly objectCompareOptions?: ObjectCompareOptions<boolean>;
	};
};
