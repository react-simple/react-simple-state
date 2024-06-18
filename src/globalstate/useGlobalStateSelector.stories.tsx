import * as React from "react";
import { useEffect } from 'react';
import type { Meta } from '@storybook/react';
import { LOG_LEVELS, LogLevel, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { getGlobalState, initGlobalState, removeGlobalState } from './functions';
import { REACT_SIMPLE_STATE } from "data";
import { useGlobalStateBatch } from "./useGlobalStateBatch";
import { useGlobalStateReadOnlySelector, useGlobalStateSelector } from "./useGlobalStateSelector";

const TITLE = "Global state / Selector filter";
const DESC = <>
	The form state is global, but when field values change <strong>only the affected components</strong> get updated.{" "}
	This is achieved by using the <strong>useGlobalStateSelector()</strong> hook and specifying the <strong>getValue()</strong> selector,{" "}
	which is automatically used to filter updates by comparing values (current vs previous).
</>;

type FormState = Record<string, string>;
const DEFAULT_FORM_STATE: FormState = {};

const InputComponent = (props: {
	title: string;
	fieldName: string;
}) => {
	const { title, fieldName } = props;
	const scope = `InputComponent[title=${title}]`;

	const [fieldValue, setFieldValue] = useGlobalStateSelector<FormState, string>({
		fullQualifiedName: "form_values", // base state object for the selectors
		defaultState: DEFAULT_FORM_STATE,
		getValue: state => state[fieldName],
		setValue: value => ({ [fieldName]: value }),
		subscriberId: scope
	});

	logInfo(
		`[${scope}]: render`,
		{ props, formValues: fieldValue },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	);

	return (
		<Cluster key={fieldName}>
			<label htmlFor={fieldName}>{fieldName}:</label>

			<input
				type="text"
				id={fieldName}
				name={fieldName}
				value={fieldValue || ""} // controlled input
				onChange={evt => setFieldValue(evt.target.value)}
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

	const fieldValue = useGlobalStateReadOnlySelector<FormState, string>({
		fullQualifiedName: "form_values", // base object for the selectors
		defaultState: DEFAULT_FORM_STATE,
		getValue: state => state[fieldName],
		subscriberId: scope,
		onUpdateSkipped: () => console.log(`[${scope}]: Update skipped`)
	});

	logInfo(
		`[${scope}]: render`,
		{ props, formValues: fieldValue },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	);

	return (
		<Cluster key={fieldName}>
			<label htmlFor={fieldName}>{fieldName}:</label>
			<input type="text" id={fieldName} name={fieldName} readOnly value={fieldValue || ""} />
			<div>Updated: {new Date().toLocaleTimeString()}</div>
		</Cluster>
	);
};

const Summary = () => {
	const scope = "Summary";

	const [{ formValues, globalState }] = useGlobalStateBatch({
		fullQualifiedNames: {
			formValues: "form_values",
			globalState: ""
		},
		subscriberId: scope
	});

	logInfo(
		`[${scope}]: render`,
		{ formValues, globalState },
		REACT_SIMPLE_STATE.LOGGING.logLevel
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

	logInfo("[Component]: render", props, REACT_SIMPLE_STATE.LOGGING.logLevel);

	// optional step: this is the root component, we initialize the state here and will remove it when finalizing
	useEffect(
		() => {
			// Initialize
			initGlobalState("form_values", DEFAULT_FORM_STATE);

			return () => {
				// Finalize
				removeGlobalState("form_values");
			};
		},
		[]);

	return (
		<Stack>
			<p>{DESC}</p>

			<Cluster>
				<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
					onClick={() => initGlobalState("form_values", DEFAULT_FORM_STATE)} />

				<input type="button" value="Trace root state" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("state", getGlobalState("", {}))} />
				
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

const meta: Meta<typeof useGlobalStateSelector> = {
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
