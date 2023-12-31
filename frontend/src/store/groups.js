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

// THUNKS
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
      const allGroups = {};
      action.groups.forEach(group => {
        allGroups[group.id] = {
          ...group,
          Events: [...group.Events]
        };
      });
      return { ...state, allGroups: { ...allGroups } };
    case LOAD_GROUP_DETAILS:
      return {
        ...state,
        singleGroup: {
          ...action.group,
          Organizer: { ...action.group.Organizer },
          Events: [...action.group.Events],
          Venues: [...action.group.Venues],
          GroupImages: [...action.group.GroupImages]
        }
      }
    case ADD_GROUP:
      // console.log('STATE: ', state);
      // console.log('ACTION GROUP: ', action.group);
      if (state.allGroups[action.group.id]) {
        const newState = {
          ...state,
          singleGroup: {
            ...action.group,
            Organizer: { ...state.singleGroup.Organizer },
            Events: [...state.singleGroup.Events],
            Venues: [...state.singleGroup.Venues],
            GroupImages: [...state.singleGroup.GroupImages]
          },
          allGroups: {
            ...state.allGroups,
            [action.group.id]: {
              ...action.group,
              Organizer: { ...state.singleGroup.Organizer },
              Events: [...state.singleGroup.Events],
              Venues: [...state.singleGroup.Venues]
            }
          }
        };
        return newState;
      } else {
        const newState = {
          ...state,
          singleGroup: {
            ...action.group,
            Organizer: { ...action.group.user },
            Events: []
          },
          allGroups: {
            ...state.allGroups,
            [action.group.id]: {
              ...action.group,
              Organizer: { ...action.group.user },
              Events: []
            }
          }
        };
        return newState;
      };
    case REMOVE_GROUP:
      const newState = { ...state }
      delete newState.singleGroup;
      delete newState.allGroups[action.groupId];
      return newState;
    default:
      return state;
  };
};

export default groupsReducer;
