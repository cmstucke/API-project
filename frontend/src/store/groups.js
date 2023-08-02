import { csrfFetch } from "./csrf";

// ACTION TYPE CONSTANTS:
export const LOAD_GROUPS = 'groups/LOAD_GROUPS';
export const LOAD_GROUP_DETAILS = 'groups/LOAD_GROUP_DETAILS';
export const ADD_GROUP = 'groups/ADD_GROUP';

// ACTIONS
export const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups
});

export const loadGroupDetails = (group) => ({
  type: LOAD_GROUP_DETAILS,
  group
});

export const addGroup = group => ({
  type: ADD_GROUP,
  group
});

// THUNK ACTION CREATORS
export const fetchGroups = () => async (dispatch) => {
  const res = await fetch('/api/groups');
  if (res.ok) {
    const { Groups } = await res.json();
    dispatch(loadGroups(Groups));
  };
};

export const fetchGroupDetails = (groupId) => async (dispatch) => {
  const res = await fetch(`/api/groups/${groupId}`);
  if (res.ok) {
    const group = await res.json();
    dispatch(loadGroupDetails(group));
  };
};

export const createGroup = data => async dispatch => {
  try {
    const res = await csrfFetch('/api/groups/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const group = await res.json();
    dispatch(addGroup(group));
    return group;
  }
  catch (error) { throw error };
}

// GROUPS REDUCER
const groupsReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_GROUPS:
      const groupsState = {};
      action.groups.forEach((group) => {
        groupsState[group.id] = group;
      });
      return groupsState;
    case LOAD_GROUP_DETAILS:
      return { ...state, [action.group.id]: action.group }
    case ADD_GROUP:
      const newState = {
        ...state,
        [action.group.id]: action.group
      };
      return newState;
    default:
      return state;
  };
};

export default groupsReducer;
