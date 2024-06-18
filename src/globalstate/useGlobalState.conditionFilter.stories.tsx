import * as React from "react";
import { useEffect } from 'react';
import type { Meta } from '@storybook/react';
import { LOG_LEVELS, LogLevel, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { useGlobalState } from './useGlobalState';
import { getGlobalState, initGlobalState, removeGlobalState } from './functions';
import { REACT_SIMPLE_STATE } from "data";
import { useGlobalStateBatch } from "./useGlobalStateBatch";

const TITLE = "Global state / Condition filter";
const DESC = <>
	The form state is global, but when field values change <strong>only the affected components</strong> get updated.{" "}
	This is achieved by specifying <strong>subscribedState.condition()</strong> to compare field values (<em>oldState</em> vs <em>newState</em>).{" "}
	The <strong>useGlobalStateBatch()</strong> hook is used. See console log for details.
</>;

type FormState = Record<string, string>;
const DEFAULT_FORM_STATE: FormState = {};

const ChildComponent = (props: {
	title: string;
	fieldNames: string[];
}) => {
	const { title, fieldNames } = props;
	const scope = `ChildComponent[title=${title}]`;

	const [formValues, setFormValues] = useGlobalState<FormState>({
		fullQualifiedName: "form_values",
		defaultState: DEFAULT_FORM_STATE,
		subscribedState: {
			condition: ({ oldState, newState }) => {
				const result = fieldNames.some(t => oldState?.[t] !== newState[t]);

				logInfo(
					`[${scope}]: updateFilter -> ${result}`,
					{ fieldNames, oldState, newState, result },
					REACT_SIMPLE_STATE.LOGGING.logLevel);

				return result;
			}
		},
		subscriberId: scope
	});

	logInfo(
		`[${scope}]: render`,
		{ props, formValues },
		REACT_SIMPLE_STATE.LOGGING.logLevel
	);

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
						value={formValues[fieldName] || ""} // controlled input
						onChange={evt => setFormValues({ [fieldName]: evt.target.value })} // it's important that we only pass the values changed
					/>

					<div>Updated: {new Date().toLocaleTimeString()}</div>
				</Cluster>
			))}
		</Stack>
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
				removeGlobalState("form_values", { removeSubscriptions: true });
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
