import { csrfFetch } from "./csrf";

// ACTION TYPE CONSTANTS:
const LOAD_GROUPS = 'groups/LOAD_GROUPS';
const LOAD_GROUP_DETAILS = 'groups/LOAD_GROUP_DETAILS';
const ADD_GROUP = 'groups/ADD_GROUP';
const REMOVE_GROUP = 'groups/REMOVE_GROUP';
const ADD_IMG = 'groups/ADD_IMG';


// ACTIONS
const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups
});

const loadGroupDetails = (group) => ({
  type: LOAD_GROUP_DETAILS,
  group
});

const addGroup = group => ({
  type: ADD_GROUP,
  group
});

const removeGroup = groupId => ({
  type: REMOVE_GROUP,
  groupId
});

const addImage = groupId => ({
  type: ADD_IMG,
  groupId
});

// THUNK ACTION CREATORS
export const groupsFetch = () => async (dispatch) => {
  const res = await fetch('/api/groups');
  if (res.ok) {
    const { Groups } = await res.json();
    dispatch(loadGroups(Groups));
  };
};

export const groupDetailsFetch = (groupId) => async (dispatch) => {
  const res = await fetch(`/api/groups/${groupId}`);
  if (res.ok) {
    const group = await res.json();
    dispatch(loadGroupDetails(group));
  };
};

export const groupCreate = data => async dispatch => {
  const res = await csrfFetch('/api/groups/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const group = await res.json();
  dispatch(addGroup(group));
  return group;
};

export const groupUpdate = (groupId, data) => async dispatch => {
  console.log('REQUEST BODY: ', data)
  try {
    const res = await csrfFetch(`/api/groups/${groupId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const group = await res.json();
    dispatch(addGroup(group));
    return group;
  }
  catch (error) { throw error };
};

export const groupImage = (groupId, data) => async dispatch => {
  console.log('DATA: ', !data.url);
  const res = await csrfFetch(`/api/groups/${groupId}/images`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const img = await res.json();
  dispatch(addImage(img));
  return img;
};

export const groupDelete = groupId => async dispatch => {
  const res = await csrfFetch(`/api/groups/${groupId}/delete`, {
    method: 'DELETE'
  });
  const resJSON = await res.json();
  dispatch(removeGroup(groupId));
  return resJSON;
};

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
      if (!state[action.group.id]) {
        const newState = {
          ...state,
          [action.group.id]: action.group
        };
        return newState;
      };
      return {
        ...state,
        [action.group.id]: {
          ...state[action.group.id],
          ...action.group
        }
      };
    case REMOVE_GROUP:
      const newState = { ...state }
      delete newState[action.groupId]
      return newState;
    default:
      return state;
  };
};

export default groupsReducer;
