import * as React from 'react';
import { useEffect } from 'react';
import type { Meta } from '@storybook/react';
import { LOG_LEVELS, LogLevel, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { REACT_SIMPLE_STATE } from "data";
import { useGlobalState, useGlobalStateReadOnly, getGlobalState, initGlobalState, removeGlobalState, useGlobalStateBatch } from "globalstate";

const TITLE = "Update filter / Selector / Full qualified name";
const DESC = <>
	The form state is global, but when field values change <strong>only the affected components</strong> get updated.{" "}
	This is achieved by using the <strong>useGlobalStateSelector()</strong> hook and specifying the <strong>getValue()</strong> selector,{" "}
	which is automatically used to filter updates by comparing values (current vs previous).
</>;

type FormState = Record<string, string>;

const InputComponent = (props: {
	title: string;
	fieldName: string;
}) => {
	const { title, fieldName } = props;
	const scope = `InputComponent[title=${title}]`;

	const [formState, setFormState] = useGlobalState<FormState>({
		fullQualifiedName: "form_values", // base state object for the selectors
		defaultState: {},
		subscriberId: scope,
		updateFilter: { selector: { childMemberFullQualifiedName: fieldName } }
	});

	logInfo(
		`[${scope}]: render`,
		{
			args: { props, formValues: formState },
			logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
		}
	);

	return (
		<Cluster key={fieldName}>
			<label htmlFor={fieldName}>{fieldName}:</label>

			<input
				type="text"
				id={fieldName}
				name={fieldName}
				value={formState[fieldName] || ""} // controlled input
				onChange={evt => setFormState({ [fieldName]: evt.target.value })}
			/>

			<div>Updated: {new Date().toLocaleTimeString()}</div>
		</Cluster>
	);
};

const ReadOnlyComponent = (props: {
	title: string;
	fieldName: string;
}) => {
	const { title, fieldName } = props;
	const scope = `ReadOnlyComponent[title=${title}]`;

	const formState = useGlobalStateReadOnly<FormState>({
		fullQualifiedName: "form_values", // base object for the selectors
		defaultState: {},
		subscriberId: scope,
		updateFilter: { selector: { childMemberFullQualifiedName: fieldName } }
	});

	logInfo(
		`[${scope}]: render`,
		{
			args: { props, formValues: formState },
			logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
		}
	);

	return (
		<Cluster key={fieldName}>
			<label htmlFor={fieldName}>{fieldName}:</label>
			<input type="text" id={fieldName} name={fieldName} readOnly value={formState[fieldName] || ""} />
			<div>Updated: {new Date().toLocaleTimeString()}</div>
		</Cluster>
	);
};

const Summary = () => {
	const scope = "Summary";

	const { formValues, globalState } = useGlobalStateBatch({
		fullQualifiedNames: {
			formValues: "form_values",
			globalState: ""
		},
		subscriberId: scope
	});

	logInfo(
		`[${scope}]: render`,
		{
			args: { formValues, globalState },
			logLevel: REACT_SIMPLE_STATE.LOGGING.logLevel
		}
	);

	return (
		<Stack>
			<h2>Summary</h2>
			<ObjectRenderer obj={{ formValues, globalState }} />
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
			initGlobalState("form_values", {});

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

			<h2>Editable inputs</h2>
			<InputComponent title="Field 1" fieldName="field_a" />
			<InputComponent title="Field 2" fieldName="field_b" />
			<InputComponent title="Field 3" fieldName="field_c" />

			<h2>Read-only inputs</h2>
			<ReadOnlyComponent title="Field 1" fieldName="field_a" />
			<ReadOnlyComponent title="Field 2" fieldName="field_b" />
			<ReadOnlyComponent title="Field 3" fieldName="field_c" />

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
