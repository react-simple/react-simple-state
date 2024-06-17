import { deepCopyObject, sameObjects } from "@react-simple/react-simple-util";
import { REACT_SIMPLE_STATE } from "data";
import { resetGlobalState } from "functions";
import { removeGlobalState, setGlobalState } from "globalstate/functions";
import { TEST_DATA } from "globalstate/test.data";

it('removeGlobalState.rootState', () => {
  // clear global state
  resetGlobalState();
  const copy = deepCopyObject(TEST_DATA);
  setGlobalState("", TEST_DATA, {});

  expect(sameObjects(REACT_SIMPLE_STATE.ROOT_STATE.state, TEST_DATA)).toBe(true);

  removeGlobalState("");
  expect(sameObjects(REACT_SIMPLE_STATE.ROOT_STATE.state, {})).toBe(true);  
});

it('removeGlobalState.childState', () => {
  // clear global state
  resetGlobalState();
  const copy = deepCopyObject(TEST_DATA);
  setGlobalState("a.b.c", 2, {});

  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c).toBe(2);

  removeGlobalState("a.b.c");
  
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c).toBeUndefined();
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b).toBeDefined();
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a).toBeDefined();
});

it('removeGlobalState.childState.removeEmptyParents', () => {
  // clear global state
  resetGlobalState();
  const copy = deepCopyObject(TEST_DATA);
  setGlobalState("a.b.c", 2, {});

  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c).toBe(2);

  removeGlobalState("a.b.c", { removeEmptyParents: true });
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b?.c).toBeUndefined();
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a?.b).toBeUndefined();
  expect((REACT_SIMPLE_STATE.ROOT_STATE.state as typeof TEST_DATA)?.a).toBeUndefined();
});
