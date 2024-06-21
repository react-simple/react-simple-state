import { UseGlobalStateProps, useGlobalState } from "./useGlobalState";

// By calling useGlobalState() the parent component subscribes to state changes according to the specified updateFilter value.

// Returns state only, but no setter
export const useGlobalStateReadOnly = <State>(props: Omit<UseGlobalStateProps<State>, "mergeState">) => {
	return useGlobalState(props)[0];
};
