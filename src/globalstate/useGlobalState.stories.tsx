import * as React from "react";
import type { Meta } from '@storybook/react';
import { useGlobalState, useGlobalStateReadOnly } from './useGlobalState';
import { LOG_LEVELS, LogLevel, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { getGlobalState, initGlobalState, removeGlobalState } from './functions';
import { useEffect } from 'react';
import { REACT_SIMPLE_STATE } from "data";

const TITLE = "Global state / Simple global state";
const DESC = <>
	The form state is global. When field values change <strong>all components</strong> get updated.
	The <strong>useGlobalState()</strong> hook is used. See console log for details.
</>;

type FormState = Record<string, string>;

const ChildComponent = (props: {
	title: string;
	fieldNames: string[];
}) => {
	const { title, fieldNames } = props;
	const scope = `ChildComponent[title=${title}]`;

	const [formValues, setFormValues] = useGlobalState<FormState>({
		fullQualifiedName: "form_values",
		subscriberId: scope,
		defaultState: {}
	});

	logInfo(`[${scope}]: render`, { args: { props, formValues }, logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

	return (
		<Stack>
			<h3>{title}</h3>

			{fieldNames.map(fieldName => (
				<Cluster key={fieldName}>
					<label htmlFor={fieldName}>{fieldName}:</label>

					<input
						type="text"
						id={fieldName}
						name={fieldName}
						value={formValues?.[fieldName] || ""} // controlled input
						onChange={evt => setFormValues({ [fieldName]: evt.target.value })}
					/>

					<div>Updated: {new Date().toLocaleTimeString()}</div>
				</Cluster>
			))}
		</Stack>
	);
};

const Summary = () => {
	const scope = "Summary";

	// get this component updated if anything changes in global state
	const { form_values: formValues } = useGlobalStateReadOnly<{ form_values: FormState }>({
		fullQualifiedName: "", // root
		subscriberId: scope,
		defaultState: { form_values: {} }
	});

	logInfo(
		`[${scope}]: render`,
		{
			args: { formValues, subscriptions: REACT_SIMPLE_STATE.ROOT_STATE.subscriptions },
			logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
		}
	);

	return (
		<Stack>
			<h2>Summary</h2>
			<ObjectRenderer obj={{ formValues }} />
			<div>Updated: {new Date().toLocaleTimeString()}</div>
		</Stack>
	);
};

interface ComponentProps {
	logLevel: LogLevel;
}

const Component = (props: ComponentProps) => {
	// this is not a state, in real app we only set it once at the beginning
	REACT_SIMPLE_STATE.LOGGING.logLevel = props.logLevel;

	logInfo("[Component]: render", { args: props, logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel });

	// optional step: this is the root component, we initialize the state here and will remove it when finalizing
	useEffect(
		() => {
			// Initialize
			initGlobalState("form_values", {}, { immutableUpdate: true });

			return () => {
				// Finalize
				removeGlobalState("form_values", { removeSubscriptions: true });
			};
		},
		[]);

	return (
		<Stack>
			<p>{DESC}</p>

			<Cluster>
				<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
					onClick={() => initGlobalState("form_values", {})} />

				<input type="button" value="Trace root state" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("state", getGlobalState(""))} />

				<input type="button" value="Trace subscriptions" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("subscriptions", REACT_SIMPLE_STATE.ROOT_STATE.subscriptions)} />
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

const meta: Meta<typeof useGlobalState> = {
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
