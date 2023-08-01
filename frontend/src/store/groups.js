// ACTION TYPE CONSTANTS:
export const LOAD_GROUPS = 'groups/LOAD_GROUPS';

// ACTION CREATORS
export const loadGroups = (groups) => ({
  type: LOAD_GROUPS,
  groups
})

// THUNK ACTION CREATORS
export const fetchGroups = () => async (dispatch) => {
  const res = await fetch('/api/groups', {
    method: 'GET'
  });
  // console.log('RES: ', res)
  if (res.ok) {
    // const resJson = await res.json();
    // console.log('RES JSON', resJson);
    const { Groups } = await res.json();
    // console.log('RES DESTRUCTURE: ', Groups);
    dispatch(loadGroups(Groups));
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
    default:
      return state;
  }
};

export default groupsReducer;
