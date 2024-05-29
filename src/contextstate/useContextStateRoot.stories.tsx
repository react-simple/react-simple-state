import * as React from "react";
import type { Meta } from '@storybook/react';
import { LOG_LEVELS, LogLevel, REACT_SIMPLE_UTIL, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { initGlobalContextState, removeGlobalContextState } from './functions';
import { useContextState } from './useContextState';
import { useContextStateRoot } from './useContextStateRoot';
import { useEffect } from 'react';
import { REACT_SIMPLE_STATE } from 'data';
import { getGlobalContextStateRoot } from './internal/functions';

const TITLE = "Context state / Root context only";
const DESC = <>
	If there is no &lt;StateContext&gt; used then the root context is used, which is the same like using global context (but it&apos;s a different state).
</>;

const STATE_KEY = "form_values";
type FormState = Record<string, string>;
const DEFAULT_FORM_STATE: FormState = {};

const { ROOT_CONTEXT_ID } = REACT_SIMPLE_STATE;

const ChildComponent = (props: {
	title: string;
	fieldNames: string[];
}) => {
	const { title, fieldNames } = props;
	const scope = `ChildComponent[title=${title}]`;

	const [formValues, setFormValues] = useContextState<FormState>({
		stateKey: STATE_KEY,
		defaultValue: DEFAULT_FORM_STATE,
		getUpdates: true,
		subscriberId: scope
	});

	logInfo(`[${scope}]: render`, { props, formValues });

	return (
		<Stack>
			<h4>{title}</h4>

			{fieldNames.map(fieldName => (
				<Cluster key={fieldName}>
					<label htmlFor={fieldName}>{fieldName}:</label>

					<input
						type="text"
						id={fieldName}
						name={fieldName}
						value={formValues[fieldName] || ""} // controlled input
						onChange={evt => setFormValues({ [fieldName]: evt.target.value })}
					/>
				</Cluster>
			))}
		</Stack>
	);
};

const Summary = () => {
	const scope = "Summary";

	const [formValues] = useContextState<FormState>({
		stateKey: STATE_KEY,
		defaultValue: DEFAULT_FORM_STATE,
		getUpdates: true,
		subscriberId: scope
	});

	// get this component updated if anything changes in global state
	const [contextStateRoot] = useContextStateRoot({
		subscriberId: "Component",
		getUpdates: true
	});

	logInfo(`[${scope}]: render`, { formValues, contextStateRoot });

	return (
		<Stack>
			<h3>Summary</h3>
			<ObjectRenderer obj={{
				formValues,
				contextStateRoot 
			}} />
		</Stack>
	);
};

interface ComponentProps {
	logLevel: LogLevel;
}

const Component = (props: ComponentProps) => {
	// this is not a state, in real app we only set it once at the beginning
	REACT_SIMPLE_UTIL.LOGGING.LOG_LEVEL = props.logLevel;

	logInfo("[Component]: render", props);

	// optional step: this is the root component, we initialize the state here and will remove it when finalizing
	useEffect(
		() => {
			// Initialize
			initGlobalContextState(ROOT_CONTEXT_ID, STATE_KEY, DEFAULT_FORM_STATE);

			return () => {
				// Finalize
				removeGlobalContextState(ROOT_CONTEXT_ID, STATE_KEY);
			};
		},
		[]);

	// this would return ROOT_CONTEXT_ID since we have no <StateContext> on the form
	// const contextId = useStateContextId(); 

	return (
		<Stack>
			<p>{DESC}</p>

			<Cluster>
				<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
					onClick={() => initGlobalContextState(ROOT_CONTEXT_ID, STATE_KEY, DEFAULT_FORM_STATE)} />

				<input type="button" value="Trace CONTEXT_STATE_ROOT" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("CONTEXT_STATE", getGlobalContextStateRoot())} />
			</Cluster>

			<ChildComponent title="Component 1" fieldNames={["field_a", "field_b"]} />
			<ChildComponent title="Component 2" fieldNames={["field_b", "field_c"]} />
			<ChildComponent title="Component 3" fieldNames={["field_a", "field_b", "field_c", "field_d"]} />

			<Summary />
		</Stack>
	);
};

type SC = StorybookComponent<ComponentProps>;
const Template: SC = args => <Component {...args} />;

export const Default: SC = Template.bind({});

const meta: Meta<typeof useContextState> = {
	component: Component,
	title: TITLE,
	args: {
		logLevel: "info"
	},
	argTypes: {
		logLevel: {
			title: "Log level",
			control: { type: "select" },
			options: Object.keys(LOG_LEVELS)
		}
	}
};

export default meta;
