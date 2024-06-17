import { deepCopyObject, newGuid, sameObjects } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { resetGlobalState } from "functions";
import { getGlobalState, initGlobalState } from "globalstate/functions";
import { TEST_DATA } from "globalstate/test.data";
import { GlobalStateChangeArgs, subscribeToGlobalState } from "subscription";

it('initGlobalState.rootState', () => {
  // clear global state
  resetGlobalState();
  const copy = deepCopyObject(TEST_DATA);
  initGlobalState("", TEST_DATA, {});

  expect(sameObjects(REACT_SIMPLE_STATE.ROOT_STATE.state, TEST_DATA)).toBe(true);

  const state = getGlobalState("", {});
  expect(state).toBeDefined();
  expect(sameObjects(state, TEST_DATA)).toBe(true);
});

it('initGlobalState.childState.value', () => {
  // clear global state
  resetGlobalState();
  initGlobalState("a.b.c", 2, {});

  const value = (REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c;
  expect(value).toBe(2);

  const value2 = getGlobalState("a.b.c", {});
  expect(value2).toBe(2);
});

it('initGlobalState.childState.update.thisState', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  
  let changeArgs: GlobalStateChangeArgs | undefined;
  let triggerPath: string | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    triggerPath = t2;
  });

  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate });
  initGlobalState("a.b.c", 2, {});

  expect(onUpdate).toHaveBeenCalledTimes(1);

  expect(changeArgs).toBeDefined();  
  expect(changeArgs?.fullQualifiedName).toBe("a.b.c");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(changeArgs?.newState).toBe(2);
  
  expect(triggerPath).toBeDefined();
  expect(triggerPath).toBe("a.b.c");
});

// components subscribed to parent states are not updated by default
it('initGlobalState.childState.update.parentState.notCalled', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  let args: GlobalStateChangeArgs | undefined;
  const onUpdate = jest.fn(t => { args = t; });

  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a", onUpdate });
  initGlobalState("a.b.c", 2, {});

  expect(onUpdate).toHaveBeenCalledTimes(0);
});

// components subscribed to parent states can be updated if the component subscription and the initGlobalState() call specify it both
it('initGlobalState.childState.update.parentState.called', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();

  let changeArgs: GlobalStateChangeArgs | undefined;
  let triggerPath: string | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    triggerPath = t2;
  });

  // by default we don't subscribe to child state changes, so we have to manually override
  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "a",    
    subscribedState: { childState: "always" }, 
    onUpdate
  });

  // by default we don't notify components subscribed to parent state, so we have to manually override
  initGlobalState("a.b.c", 2, {
    updateState: { parentState: "always" } 
  });

  expect(onUpdate).toHaveBeenCalledTimes(1);

  expect(changeArgs).toBeDefined();
  expect(changeArgs?.fullQualifiedName).toBe("a.b.c");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(changeArgs?.newState).toBe(2);

  expect(triggerPath).toBeDefined();
  expect(triggerPath).toBe("a");
});

it('initGlobalState.childState.update.childState.called', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();

  let changeArgs: GlobalStateChangeArgs | undefined;
  let triggerPath: string | undefined;

  const onUpdate = jest.fn((t1, t2) => {
    changeArgs = t1;
    triggerPath = t2;
  });

  // by default components subscribed to child states are updated
  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate });
  initGlobalState("a.b", { c: 2 }, {});

  expect(onUpdate).toHaveBeenCalledTimes(1);

  expect(changeArgs).toBeDefined();
  expect(changeArgs?.fullQualifiedName).toBe("a.b");
  expect(changeArgs?.oldState).toBeUndefined();
  expect(sameObjects(changeArgs?.newState, { c: 2 })).toBe(true);

  expect(triggerPath).toBeDefined();
  expect(triggerPath).toBe("a.b.c");
});

it('initGlobalState.childState.update.childState.called.conditional.triggerPath', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate1 = jest.fn();
  const onUpdate2 = jest.fn();

  // without condition it's called twice
  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate: onUpdate2 });

  initGlobalState("a", { b: { c: 2 } }, {});
  initGlobalState("a.b", { c: 3 }, {});

  expect(onUpdate2).toHaveBeenCalledTimes(2);

  // with condition it's called once only (subscribing again with the same uniqeId will overwrite the previous subscription)
  subscribeToGlobalState(uniqueId, {
    fullQualifiedName: "a.b.c",
    subscribedState: {
      parentState: {
        condition: t => t.fullQualifiedName === "a.b"
      }
    },
    onUpdate: onUpdate1
  });

  initGlobalState("a", { b: { c: 2 } }, {});
  initGlobalState("a.b", { c: 3 }, {});

  expect(onUpdate1).toHaveBeenCalledTimes(1);
});

it('initGlobalState.childState.update.childState.called.conditional.value', () => {
  // clear global state
  resetGlobalState();
  const uniqueId = newGuid();
  const onUpdate1 = jest.fn();
  const onUpdate2 = jest.fn();

  // without condition it's called twice
  subscribeToGlobalState(uniqueId, { fullQualifiedName: "a.b.c", onUpdate: onUpdate2 });

  initGlobalState("a", { b: { c: 2 } }, {});
  initGlobalState("a.b", { c: 3 }, {});

  expect(onUpdate2).toHaveBeenCalledTimes(2);

  // with condition it's called once only (subscribing again with the same uniqeId will overwrite the previous subscription)
  subscribeToGlobalState<typeof TEST_DATA.a.b>(uniqueId, {
    fullQualifiedName: "a.b.c",
    subscribedState: {
      parentState: {
        condition: t => t.oldState?.c !== t.newState.c
      }
    },
    onUpdate: onUpdate1
  });

  initGlobalState("a", { b: { c: 2 } }, {});
  initGlobalState("a.b", { c: 3 }, {});

  expect(onUpdate1).toHaveBeenCalledTimes(1);
});
