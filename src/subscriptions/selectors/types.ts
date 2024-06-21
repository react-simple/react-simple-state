// update component if the value returned by selector.getValue() changes; 'true' by default

import { ValueOrArray } from "@react-simple/react-simple-util";

// uses sameObjects() from the 'react-simple-util' package
export interface GlobalStateUpdateFilterGetValueSelector<State, Value> {
	readonly getValue: (state: State) => ValueOrArray<Value | undefined>; // selector will be called over state addressed by fullQualifiedName
}

// export interface GlobalStateUpdateFilterGetValueSelectorWritable<State, Value>
// 	extends GlobalStateUpdateFilterGetValueSelector<State, Value> {
	
// 	// selector will be called over state addressed by fullQualifiedName
// 	readonly setValue: (value: Value, state: State) => Partial<State>; 
// }

export interface GlobalStateUpdateFilterFullQualifiedNameSelector {
	readonly childMemberFullQualifiedName: ValueOrArray<string>;
}

export type GlobalStateUpdateFilterSelector<State, Value> =
	| GlobalStateUpdateFilterGetValueSelector<State, Value>
	| GlobalStateUpdateFilterFullQualifiedNameSelector;

// export type GlobalStateUpdateFilterSelectorWritable<State, Value> =
// 	| GlobalStateUpdateFilterGetValueSelectorWritable<State, Value>
// 	| GlobalStateUpdateFilterFullQualifiedNameSelector;
