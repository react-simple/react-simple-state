import { ValueOrCallback, ValueOrCallbackWithArgs } from "@react-simple/react-simple-util";
import { ContextGlobalState, ContextState, ContextStateEntry } from "contextstate/types";
import { GlobalState } from "globalstate/types";
import { StateEntry } from "types";

export interface ReactSimpleStateDependencyInjection {
	globalState: {
		getGlobalState: <State>(
			stateKey: string,
			defaultValue: ValueOrCallback<State>,
			globalState: GlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["getGlobalState"]
		) => State;
		setGlobalState: <State>(
			args: {
				stateKey: string;
				state: ValueOrCallbackWithArgs<State, Partial<State>>;
				defaultValue: ValueOrCallback<State>;
				customMerge?: (oldState: State, newState: Partial<State>) => State;
			},
			globalState: GlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["setGlobalState"]
		) => State;

		initGlobalState: <State>(
			stateKey: string,
			state: ValueOrCallback<State>,
			globalState: GlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["initGlobalState"]
		) => State;

		removeGlobalState: (
			stateKeys: string | string[],
			globalState: GlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["removeGlobalState"]
		) => void;

		internal: {
			getGlobalStateRoot: (
				globalState: GlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["internal"]["getGlobalStateRoot"]
			) => GlobalState;

			getGlobalStateEntry: <State>(
				stateKey: string,
				globalState: GlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["internal"]["getGlobalStateEntry"]
			) => StateEntry<State | undefined> | undefined;

			getOrCreateGlobalStateEntry: <State>(
				stateKey: string,
				defaultValue: ValueOrCallback<State>,
				globalState: GlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["globalState"]["internal"]["getOrCreateGlobalStateEntry"]
			) => StateEntry<State>;
		};
	};

	contextState: {
		getGlobalContextState: <State>(
			contextId: string,
			stateKey: string, defaultValue: ValueOrCallback<State>,
			contextState: ContextGlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["getGlobalContextState"]
		) => State;

		setGlobalContextState: <State>(
			args: {
				contextId: string;
				stateKey: string;
				state: ValueOrCallbackWithArgs<State, Partial<State>>;
				defaultValue: ValueOrCallback<State>;
				customMerge?: (oldState: State, newState: Partial<State>) => State;
			},
			contextState: ContextGlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["setGlobalContextState"]
		) => State; 

		initGlobalContextState: <State>(
			contextId: string,
			stateKey: string,
			state: ValueOrCallback<State>,
			contextState: ContextGlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["initGlobalContextState"]
		) => State;
		
		removeGlobalContextState: (
			contextIds: string | string[],
			stateKeys: string | string[] | undefined,
			contextState: ContextGlobalState,
			defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["removeGlobalContextState"]
		) => void;

		internal: {
			getGlobalContextStateRoot: (
				contextState: ContextGlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["internal"]["getGlobalContextStateRoot"]
			) => ContextGlobalState;

			getGlobalContextEntry: (
				contextId: string,
				contextState: ContextGlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["internal"]["getGlobalContextEntry"]
			) => ContextState | undefined;

			getOrCreateGlobalContextEntry: (
				contextId: string,
				contextState: ContextGlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["internal"]["getOrCreateGlobalContextEntry"]
			) => ContextState;

			getGlobalContextStateEntry: <State>(
				contextId: string,
				stateKey: string,
				contextState: ContextGlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["internal"]["getGlobalContextStateEntry"]
			) => {
				context: ContextState | undefined;
				stateEntry: ContextStateEntry<State> | undefined;
			};

			getOrCreateGlobalContextStateEntry: <State>(
				contextId: string,
				stateKey: string,
				defaultValue: ValueOrCallback<State>,
				contextState: ContextGlobalState,
				defaultImpl: ReactSimpleStateDependencyInjection["contextState"]["internal"]["getOrCreateGlobalContextStateEntry"]
			) => ContextStateEntry<State>;
		};
	};
}
