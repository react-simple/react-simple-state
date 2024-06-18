import { ObjectCompareOptions, sameObjects, stringAppend } from "@react-simple/react-simple-util";
import { UseGlobalStateProps, useGlobalState } from "./useGlobalState";
import { useRef, useState } from "react";
import { getGlobalState } from "./functions";
import { useGlobalStateContext } from "./context";

// useGlobalStateSelector() is a shortcut to useGlobalState() when only a single value need to be selected and updates are
// triggered by the change of that single value.

export type UseGlobalStateReadOnlySelectorProps<State, Value> = Omit<UseGlobalStateProps<State>, "subscribedState"> & {
	getValue: (state: State) => Value, // selector will be called over state addressed by fullQualifiedName
	objectCompareOptions?: ObjectCompareOptions<boolean>;
};

export interface UseGlobalStateSelectorProps<State, Value> extends UseGlobalStateReadOnlySelectorProps<State, Value> {
	setValue: (value: Value, state: State) => Partial<State>,
}

export type UseGlobalStateSelectorReturn<State, Value> = [Value, (value: Value) => State];

export function useGlobalStateSelector<State, Value>(
	props: UseGlobalStateSelectorProps<State, Value>
): UseGlobalStateSelectorReturn<State, Value> {
	const { getValue, setValue, ignoreContexts, contextId, objectCompareOptions, ...rest } = props;

	const context = useGlobalStateContext(contextId);

	const fullQualifiedName = !ignoreContexts
		? stringAppend(context.fullQualifiedNamePrefix, props.fullQualifiedName, ".")
		: props.fullQualifiedName;

	const [previousValue, setPreviousValue] = useState<{ value: Value } | undefined>();
	const refPreviousValue = useRef<typeof previousValue>();
	refPreviousValue.current = previousValue;
	
	const [state, setState] = useGlobalState<State>({
		...rest,
		fullQualifiedName, // already contains context prefix
		ignoreContexts: true,
		subscribedState: {
			condition: () => {
				const currState = getGlobalState<State>(fullQualifiedName, props.defaultState, props.globalStateRoot);
				const currValue = getValue(currState);
				const prevValue = refPreviousValue.current;

				if (!prevValue || !sameObjects(currValue, prevValue.value, objectCompareOptions)) {
					setPreviousValue({ value: currValue });
					return true;
				}
				else {
					return false;
				}
			}
		}
	});

	return [
		getValue(state),
		value => setState(setValue(value, state))
	];
}

export function useGlobalStateReadOnlySelector<State, Value>(props: UseGlobalStateReadOnlySelectorProps<State, Value>): Value {
	return useGlobalStateSelector({
		...props,
		setValue: () => ({})
	})[0];
}
