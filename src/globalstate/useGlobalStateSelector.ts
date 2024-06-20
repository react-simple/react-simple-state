import { ObjectCompareOptions, ValueOrCallbackWithArgs, getResolvedCallbackValueWithArgs } from "@react-simple/react-simple-util";
import { UseGlobalStateProps, useGlobalState } from "./useGlobalState";

// useGlobalStateSelector() is a shortcut to useGlobalState() when only a single value need to be selected and updates are
// triggered by the change of that single value.
// The useGlobalState() hook can actually filter state updates by selector, it just returns the whole state, while this hook
// only returns the selected value.

// Remove the updateFilter filter and move selector members to the root of props.
export type UseGlobalStateReadOnlySelectorProps<State, Value> = Omit<UseGlobalStateProps<State>, "updateFilter" | "mergeState"> & {
	getValue: (state: State) => Value, // selector will be called over state addressed by fullQualifiedName
	objectCompareOptions?: ObjectCompareOptions<boolean>;
};

export type UseGlobalStateSelectorProps<State, Value> = Omit<UseGlobalStateProps<State>, "updateFilter"> & {
	getValue: (state: State) => Value, // selector will be called over state addressed by fullQualifiedName
	setValue: (value: Value, state: State | undefined) => Partial<State>
	objectCompareOptions?: ObjectCompareOptions<boolean>;
};

export type UseGlobalStateSelectorReturn<State, Value> = [
	// value
	Value | undefined,
	// setValue	
	(value: ValueOrCallbackWithArgs<State | undefined, Value>) => Partial<State>
];

export function useGlobalStateSelector<State, Value>(
	props: UseGlobalStateSelectorProps<State, Value>
): UseGlobalStateSelectorReturn<State, Value> {
	const { getValue, setValue, objectCompareOptions, ...rest } = props;

	const [state, setState] = useGlobalState<State>({
		...rest,
		// the useGlobalState() hook can filter state updates by selector, it just returns the whole state
		updateFilter: { selector: { getValue, objectCompareOptions } }
	});

	return [
		state && getValue(state),
		value => setState(setValue(getResolvedCallbackValueWithArgs(value, state), state))
	];
}

export const useGlobalStateSelectorReadOnly = <State, Value>(props: UseGlobalStateReadOnlySelectorProps<State, Value>) => {
	return useGlobalStateSelector({
		...props,
		setValue: () => ({})
	})[0];
};
