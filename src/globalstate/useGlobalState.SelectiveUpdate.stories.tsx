import type { Meta } from '@storybook/react';
import { useGlobalState } from './useGlobalState';
import { LOG_LEVELS, LogLevel, REACT_SIMPLE_UTIL, StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { getGlobalStateRoot, initGlobalState, removeGlobalState } from './functions';
import { useGlobalStateRoot } from './useGlobalStateRoot';
import { useEffect } from 'react';

const TITLE = "Global state / Selective update";
const DESC = <>The form state is global. When field values change <strong>only the affected components</strong> get updated. (See console log.)</>;

const STATE_KEY = "form_values";
type FormState = Record<string, string>;
const DEFAULT_FORM_STATE: FormState = {};

const ChildComponent = (props: {
	title: string;
	fieldNames: string[];
}) => {
	const { title, fieldNames } = props;
	const scope = `ChildComponent[title=${title}]`;

	const [formValues, setFormValues] = useGlobalState<FormState>({
		stateKey: STATE_KEY,
		defaultValue: DEFAULT_FORM_STATE,
		getUpdates: ({ oldState, newState }) => {
			const result = fieldNames.some(t => oldState[t] !== newState[t]);
			logInfo(`${scope}: getUpdates`, { fieldNames, oldState, newState, result });
			return result;
		},
		subscriberId: scope
	});

	logInfo(`${scope}: render`, { props, formValues });

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
				</Cluster>
			))}
		</Stack>
	);
};

const Summary = () => {
	const scope = "Summary";

	const [formValues] = useGlobalState<FormState>({
		stateKey: STATE_KEY,
		defaultValue: DEFAULT_FORM_STATE,
		getUpdates: true,
		subscriberId: scope
	});

	const [globalState] = useGlobalStateRoot({
		subscriberId: "Component",
		getUpdates: true
	});

	logInfo(`${scope}: render`, { formValues, globalState });

	return (
		<Stack>
			<h2>Summary</h2>
			<ObjectRenderer obj={{
				formValues,
				globalState
			}} />
		</Stack>
	);
};

interface ComponentProps {
	logLevel: LogLevel;
}

const Component = (props: ComponentProps) => {
	// this is not a state, in real app we only set it once at the beginning
	REACT_SIMPLE_UTIL.LOG_LEVEL = props.logLevel;

	logInfo("Component: render", props);

	// optional step: this is the root component, we initialize the state here and will remove it when finalizing
	useEffect(
		() => {
			// Initialize
			initGlobalState(STATE_KEY, DEFAULT_FORM_STATE);

			return () => {
				// Finalize
				removeGlobalState(STATE_KEY);
			};
		},
		[]);

	return (
		<Stack>
			<p>{DESC}</p>

			<Cluster>
				<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
					onClick={() => initGlobalState(STATE_KEY, DEFAULT_FORM_STATE)} />

				<input type="button" value="Trace GLOBAL_STATE" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("GLOBAL_STATE", getGlobalStateRoot())} />
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
