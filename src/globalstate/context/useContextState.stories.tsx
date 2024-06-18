import * as React from "react";
import type { Meta } from '@storybook/react';
import { LOG_LEVELS, LogLevel,  StorybookComponent, logInfo } from '@react-simple/react-simple-util';
import { Stack, Cluster, ObjectRenderer } from '@react-simple/react-simple-ui';
import { REACT_SIMPLE_STATE } from 'data';
import { useEffect } from 'react';
import { useGlobalState } from "globalstate/useGlobalState";
import { useGlobalStateBatch } from "globalstate/useGlobalStateBatch";
import { getGlobalState, initGlobalState, removeGlobalState } from "globalstate/functions";
import { StateContext, useGlobalStateContext } from "./StateContext";
import { getGlobalStateContextDataAll } from "./functions";

const TITLE = "Context state / Multiple contexts";
const DESC = <>
	Components can have their own &lt;StateContext&gt; scopes which separate their states by prefixing the state path used in{" "}
	<strong>useGlobalState()</strong>. &lt;StateContext&gt;-s can be embedded.
</>;

type FormState = Record<string, string>;
const DEFAULT_FORM_STATE: FormState = {};

// Child components will be embedded into StateContexts
const ChildComponent = (props: {
	title: string;
	fieldNames: string[];
}) => {
	const { title, fieldNames } = props;
	const scope = `ChildComponent title=${title}`;

	const [formValues, setFormValues] = useGlobalState<FormState>({
		fullQualifiedName: "form_values", // this path will be prefixed with the path coming from the context
		defaultState: DEFAULT_FORM_STATE,
		subscriberId: scope
	});

	logInfo(`[${scope}]: render`, { props, formValues }, REACT_SIMPLE_STATE.LOGGING.logLevel);

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

					<div>Updated: {new Date().toLocaleTimeString()}</div>
				</Cluster>
			))}
		</Stack>
	);
};

const ContextSummary = ({ title }: { title: string; }) => {
	const context = useGlobalStateContext();
	const scope = `Context Summary ${context.contextId}`;

	// this is not root the state, we are within a context, so the fullQualifiedName of the context is used as a prefix
	const [contextValues] = useGlobalState({
    fullQualifiedName: "",
    defaultState: {},
		subscriberId: scope
	});

	logInfo(`[${scope}]: render`, { contextValues }, REACT_SIMPLE_STATE.LOGGING.logLevel);

  return (
    <Stack>
      <h4>{title}</h4>
			<ObjectRenderer obj={{ contextValues }} />
			<div>Updated: {new Date().toLocaleTimeString()}</div>
    </Stack>
  );
};

const Summary = () => {
	const scope = "Summary";
	const contexts = getGlobalStateContextDataAll();

	// Get the state of all existing contexts.
	// At first render we won't have any since contexts register themselves during render, so in that case we subscribe
	// to the root state; so this component will be updated on any changes and re-subscribe itself to the contexts' path.
	const [allContextStates] = useGlobalStateBatch<FormState>({
		fullQualifiedNames: contexts.length ? contexts.map(t => t.fullQualifiedNamePrefix) : [""],
		subscriberId: "Summary"
	});

  logInfo(`[${scope}]: render`, { allContextStates }, REACT_SIMPLE_STATE.LOGGING.logLevel)

  return (
    <Stack>
      <h3>Summary</h3>

      <h4>Formatted</h4>
      {Object.entries(allContextStates).map(([contextId, formValues]) => (
        <div key={contextId}>{contextId}: {JSON.stringify(formValues)}</div>
      ))}

      <h4>Trace</h4>
      <ObjectRenderer obj={{ allContextStates }} />
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
			initGlobalState("context_1", DEFAULT_FORM_STATE);
			initGlobalState("context_2", DEFAULT_FORM_STATE);

			return () => {
				// Finalize
				removeGlobalState(["context_1", "context_2"], { removeSubscriptions: true });
			};
		},
		[]);

	// child components can use the following call to get the contextId they are within:
	// const contextId = useStateContextId();

	return (
		<Stack>
			<p>{DESC}</p>
			<Cluster>
				<input type="button" value="Trace root state" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("state", getGlobalState("", {}))} />
				
				<input type="button" value="Trace subscriptions" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("subscriptions", REACT_SIMPLE_STATE.ROOT_STATE.subscriptions)} />

				<input type="button" value="Trace contexts" style={{ padding: "0.5em 1em" }}
					onClick={() => console.log("contexts", REACT_SIMPLE_STATE.CONTEXTS)} />
			</Cluster>

			<StateContext contextId="context_1" fullQualifiedNamePrefix="context_1">
				<h3>Context 1</h3>

				<Cluster>
					<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
						onClick={() => initGlobalState("context_1", DEFAULT_FORM_STATE)} />
				</Cluster>

				<ChildComponent title="Component 1" fieldNames={["field_a", "field_b"]} />
				<ChildComponent title="Component 2" fieldNames={["field_b", "field_c"]} />
				<ContextSummary title="Context 1 Summary" />
			</StateContext>

			<StateContext contextId="context_2" fullQualifiedNamePrefix="context_2">
				<h3>Context 2</h3>

				<StateContext contextId="context_2-2" fullQualifiedNamePrefix="context_2-2">
					<h3>Context 2.2</h3>
					<Cluster>
						<input type="button" value="Reset state" style={{ padding: "0.5em 1em" }}
							onClick={() => initGlobalState("context_2.context_2-2", DEFAULT_FORM_STATE)} />
					</Cluster>

					<ChildComponent title="Component 3" fieldNames={["field_a", "field_b", "field_c", "field_d"]} />
					<ContextSummary title="Context 2.2 Summary" />
				</StateContext>
				<ContextSummary title="Context 2 Summary" />
			</StateContext>

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
