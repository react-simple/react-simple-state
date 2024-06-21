export { };
	
// import { UseGlobalStateProps, useGlobalState } from "./useGlobalState";
// import { SetGlobalStateOptions } from "types";
// import {
// 	GlobalStateUpdateFilterSelector, GlobalStateUpdateFilterSelectorWritable, getGlobalStateUpdateFilterSelectorValue,
// 	setGlobalStateUpdateFilterSelectorValue
// } from "./selectors";

// // useGlobalStateSelector() is a shortcut to useGlobalState() when only a single value need to be selected and updates are
// // triggered by the change of that single value.
// // The useGlobalState() hook can actually filter state updates by selector, it just returns the whole state, while this hook
// // only returns the selected value.

// // Remove the updateFilter filter and move selector members to the root of props.
// export type UseGlobalStateReadOnlySelectorProps<State, Value> = Omit<UseGlobalStateProps<State>, "updateFilter" | "mergeState"> & {
// 	selector: GlobalStateUpdateFilterSelector<State, Value>;
// };

// export type UseGlobalStateSelectorProps<State, Value> = Omit<UseGlobalStateProps<State>, "updateFilter"> & {
// 	selector: GlobalStateUpdateFilterSelectorWritable<State, Value>;
// };

// export type UseGlobalStateSelectorReturn<State, Value> = [
// 	// value
// 	Value | undefined,
// 	// setValue	
// 	(value: Value, options?: SetGlobalStateOptions<State>) => void
// ];

// export function useGlobalStateSelector<State, Value>(
// 	props: UseGlobalStateSelectorProps<State, Value>
// ): UseGlobalStateSelectorReturn<State, Value> {
// 	const { selector, ...rest } = props;

// 	const [state, setState] = useGlobalState<State>({
// 		...rest,
// 		// the useGlobalState() hook can filter state updates by selector, it just returns the whole state
// 		updateFilter: { selector }
// 	});

// 	return [
// 		getGlobalStateUpdateFilterSelectorValue(selector, state),
// 		(value, options) => setGlobalStateUpdateFilterSelectorValue(
// 			selector, props.fullQualifiedName, setState, value, options, props.globalStateRoot
// 		)
// 	];
// }

// export const useGlobalStateSelectorReadOnly = <State, Value>(props: UseGlobalStateReadOnlySelectorProps<State, Value>) => {
// 	return useGlobalStateSelector({
// 		...props,
// 		selector: {
// 			...props.selector,
// 			setValue: () => ({})
// 		}
// 	})[0];
// };
