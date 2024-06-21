import { ValueOrArray, isArray, isEmpty } from "@react-simple/react-simple-util";
import {
	GlobalStateUpdateFilterFullQualifiedNameSelector, GlobalStateUpdateFilterGetValueSelector, GlobalStateUpdateFilterSelector
} from "./types";
import { getChildMemberValue } from "@react-simple/react-simple-mapping";

// sameObject() from the 'react-simple-util' package will be used to compare selector values (deep comparison)
export function getGlobalStateUpdateFilterSelectorValue<State, Value>(
	selector: GlobalStateUpdateFilterSelector<State, Value>,
	state: State // used for GlobalStateUpdateFilterFullQualifiedNameSelector
): ValueOrArray<Value | undefined> {
	const { childMemberFullQualifiedName } = selector as GlobalStateUpdateFilterFullQualifiedNameSelector;

	if (!isEmpty(childMemberFullQualifiedName)) {
		return isArray(childMemberFullQualifiedName)
			? childMemberFullQualifiedName.map(name => getChildMemberValue(state as object, name) as Value | undefined)
			: getChildMemberValue(state as object, childMemberFullQualifiedName) as Value | undefined;
	}
	else if ((selector as GlobalStateUpdateFilterGetValueSelector<State, Value>).getValue) {
		return (selector as GlobalStateUpdateFilterGetValueSelector<State, Value>).getValue(state);
	}
	else {
		return undefined;
	}
}

// export const setGlobalStateUpdateFilterSelectorValue = <State, Value>(
// 	selector: GlobalStateUpdateFilterSelectorWritable<State, Value>,

// 	// used for GlobalStateUpdateFilterFullQualifiedNameSelector
// 	stateFullQualifiedName: string, 

// 	// used for GlobalStateUpdateFilterGetValueSelectorWritable
// 	setState: (state: ValueOrCallbackWithArgs<State, Partial<State>>, options?: SetGlobalStateOptions<State>) => void,

// 	value: Value,
// 	options?: SetGlobalStateOptions<State>,

// 	// used for GlobalStateUpdateFilterFullQualifiedNameSelector
// 	globalStateRoot?: GlobalStateRoot<unknown>
// ) => {
// 	if ((selector as GlobalStateUpdateFilterFullQualifiedNameSelector).fullQualifiedName) {
// 		setGlobalState(
// 			stringAppend(stateFullQualifiedName, (selector as GlobalStateUpdateFilterFullQualifiedNameSelector).fullQualifiedName, "."),
// 			value as any,
// 			options,
// 			globalStateRoot);
// 	}
// 	else if ((selector as GlobalStateUpdateFilterGetValueSelectorWritable<State, Value>).setValue) {
// 		setState(
// 			state => (selector as GlobalStateUpdateFilterGetValueSelectorWritable<State, Value>).setValue(value, state),
// 			options);
// 	}
// };
