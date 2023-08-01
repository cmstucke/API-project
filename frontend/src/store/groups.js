// ACTION TYPE CONSTANTS:
export const LOAD_GROUPS = 'groups/LOAD_GROUPS';
export const LOAD_GROUP_DETAILS = 'groups/LOAD_GROUP_DETAILS';

// ACTIONS
export const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups
});

export const loadGroupDetails = (group) => ({
  type: LOAD_GROUP_DETAILS,
  group
});

// THUNK ACTION CREATORS
export const fetchGroups = () => async (dispatch) => {
  const res = await fetch('/api/groups', {
    method: 'GET'
  });
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
    default:
      return state;
  };
};

export default groupsReducer;
