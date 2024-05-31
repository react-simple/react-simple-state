import { ReactSimpleState } from "types";

// For depndency injection references. All stub references are set by the respective util files.
const stub: any = () => { };

export const REACT_SIMPLE_STATE: ReactSimpleState = {
	ROOT_CONTEXT_ID: "ROOT_CONTEXT",

	LOGGING: {
		logLevel: "error" // for functions in react-simple-state
	},

	// stubs are replaced by the corresponding functions.ts files
	DI: {
		globalState: {
			getGlobalState: stub,
			setGlobalState: stub,
			initGlobalState: stub,
			removeGlobalState: stub,

			internal: {
				getGlobalStateRoot: stub,
				getGlobalStateEntry: stub,
				getOrCreateGlobalStateEntry: stub
			}
		},
		contextState: {
			getGlobalContextState: stub,
			setGlobalContextState: stub,
			initGlobalContextState: stub,
			removeGlobalContextState: stub,

			internal: {
				getGlobalContextStateRoot: stub,
				getGlobalContextEntry: stub,
				getOrCreateGlobalContextEntry: stub,
				getGlobalContextStateEntry: stub,
				getOrCreateGlobalContextStateEntry: stub
			}
		}
	}
};
