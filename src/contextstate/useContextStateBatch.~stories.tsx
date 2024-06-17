export { };

// import * as React from "react";
// import type { Meta } from '@storybook/react';
// import { LOG_LEVELS, LogLevel,  StorybookComponent, logInfo } from '@react-simple/react-simple-util';
// import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
// import { initGlobalContextState, removeGlobalContextState } from './functions';
// import { useContextState } from './useContextState';
// import { StateContext } from './StateContext';
// import { REACT_SIMPLE_STATE } from 'data';
// import { useEffect } from 'react';
// import { useContextStateBatch } from './useContextStateBatch';
// import { useContextStateRoot } from './useContextStateRoot';
// import { getGlobalContextStateRoot } from './internal/functions';

// const TITLE = "Context state / Multiple contexts";
// const DESC = <>Components have their own &lt;StateContext&gt;.scope which separates their shared states.</>;

// const STATE_KEY = "form_values";
// type FormState = Record<string, string>;
// const DEFAULT_FORM_STATE: FormState = {};

// const { ROOT_CONTEXT_ID } = REACT_SIMPLE_STATE;

// const ChildComponent = (props: {
// 	title: string;
// 	fieldNames: string[];
// }) => {
// 	const { title, fieldNames } = props;
// 	const scope = `ChildComponent title=${title}`;

// 	const [formValues, setFormValues] = useContextState<FormState>({
// 		stateKey: STATE_KEY,
// 		defaultValue: DEFAULT_FORM_STATE,
// 		updateFilter: true,
// 		subscriberId: scope
// 	});

// 	logInfo(`[${scope}]: render`, { props, formValues }, REACT_SIMPLE_STATE.LOGGING.logLevel);

// 	return (
// 		<Stack>
// 			<h4>{title}</h4>

// 			{fieldNames.map(fieldName => (
// 				<Cluster key={fieldName}>
// 					<label htmlFor={fieldName}>{fieldName}:</label>

// 					<input
// 						type="text"
// 						id={fieldName}
// 						name={fieldName}
// 						value={formValues[fieldName] || ""} // controlled input
// 						onChange={evt => setFormValues({ [fieldName]: evt.target.value })}
// 					/>
// 				</Cluster>
// 			))}
// 		</Stack>
// 	);
// };

// const ContextSummary = ({ contextId }: { contextId: string }) => {
// 	const scope = `Context Summary ${contextId}`;

// 	const [contextValues] = useContextStateBatch({
// 		contextIds: [contextId],
// 		// stateKeys: [STATE_KEY], // optional, it can subscribe to particular states or anything inside this context
// 		updateFilter: true,
// 		subscriberId: scope
// 	});

// 	logInfo(`[${scope}]: render`, { contextValues }, REACT_SIMPLE_STATE.LOGGING.logLevel);

// 	return (
// 		<Stack>
// 			<h4>Context Summary</h4>
// 			<ObjectRenderer obj={{
// 				contextValues,
// 			}} />
// 		</Stack>
// 	);
// };

// const Summary = () => {
// 	const scope = "Summary";

// 	// update summary on changes
// 	const [contextStateRoot] = useContextStateRoot({
// 		subscriberId: "Component",
// 		updateFilter: true
// 	});

// 	logInfo(`[${scope}]: render`, { contextStateRoot }, REACT_SIMPLE_STATE.LOGGING.logLevel)

// 	return (
// 		<Stack>
// 			<h3>Summary</h3>

// 			<h4>Formatted</h4>
// 			{Object.values(contextStateRoot.rootState).map(({ contextId, contextState }) => (
// 				<div key={contextId}>{contextId}: {JSON.stringify(contextState[STATE_KEY]?.state)}</div>
// 			))}

// 			<h4>Trace</h4>
// 			<ObjectRenderer obj={{
// 				contextStateRoot
// 			}} />
// 		</Stack>
// 	);
// };

// interface ComponentProps {
// 	logLevel: LogLevel;
// }

// const Component = (props: ComponentProps) => {
// 	// this is not a state, in real app we only set it once at the beginning
// 	REACT_SIMPLE_STATE.LOGGING.logLevel = props.logLevel;

// 	logInfo("[Component]: render", props, undefined, REACT_SIMPLE_STATE.LOGGING.logLevel);

// 	// optional step: this is the root component, we initialize the state here and will remove it when finalizing
// 	useEffect(
// 		() => {
// 			// Initialize
// 			initGlobalContextState({
// 				contextId: ROOT_CONTEXT_ID,
// 				stateKey: STATE_KEY,
// 				state: DEFAULT_FORM_STATE
// 			});

// 			return () => {
// 				// Finalize
// 				removeGlobalContextState(["context_1", "context_2"], STATE_KEY);
// 			};
// 		},
// 		[]);

// 	// child components can use the following call to get the contextId they are within:
// 	// const contextId = useStateContextId();

// 	return (
// 		<Stack>
// 			<p>{DESC}</p>
// 			<Cluster>
// 				<input type="button" value="Trace CONTEXT_STATE_ROOT" style={{ padding: "0.5em 1em" }}
// 					onClick={() => console.log("CONTEXT_STATE_ROOT", getGlobalContextStateRoot())} />
// 			</Cluster>

// 			<StateContext contextId="context_1">
// 				<h3>Context 1</h3>

// 				<Cluster>
// 					<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
// 						onClick={() => {
// 							initGlobalContextState({
// 								contextId: "context_1",
// 								stateKey: STATE_KEY,
// 								state: DEFAULT_FORM_STATE
// 							});
// 						}} />
// 				</Cluster>

// 				<ChildComponent title="Component 1" fieldNames={["field_a", "field_b"]} />
// 				<ChildComponent title="Component 2" fieldNames={["field_b", "field_c"]} />
// 				<ContextSummary contextId="context_1" />
// 			</StateContext>

// 			<StateContext contextId="context_2">
// 				<h3>Context 2</h3>

// 				<Cluster>
// 					<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
// 						onClick={() => {
// 							initGlobalContextState({
// 								contextId: "context_2",
// 								stateKey: STATE_KEY,
// 								state: DEFAULT_FORM_STATE
// 							});
// 						}} />
// 				</Cluster>

// 				<ChildComponent title="Component 3" fieldNames={["field_a", "field_b", "field_c", "field_d"]} />
// 				<ContextSummary contextId="context_2" />
// 			</StateContext>

// 			<Summary />
// 		</Stack>
// 	);
// };

// type SC = StorybookComponent<ComponentProps>;
// const Template: SC = args => <Component {...args} />;

// export const Default: SC = Template.bind({});

// const meta: Meta<typeof useContextState> = {
// 	component: Component,
// 	title: TITLE,
// 	args: {
// 		logLevel: "info"
// 	},
// 	argTypes: {
// 		logLevel: {
// 			title: "Log level",
// 			control: { type: "select" },
// 			options: Object.keys(LOG_LEVELS)
// 		}
// 	}
// };

// export default meta;
