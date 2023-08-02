// ACTION TYPE CONSTANTS:
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS';

// ACTION
export const loadGroupEvents = groupEvents => ({
  type: LOAD_GROUP_EVENTS,
  groupEvents
});

// THUNK ACTION CREATORS
export const fetchGroupEvents = groupId => async dispatch => {
  const res = await fetch(`/api/groups/${groupId}/events`);
  if (res.ok) {
    const { Events } = await res.json();
    dispatch(loadGroupEvents(Events))
  };
};

// EVENTS REDUCER
const eventsReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_GROUP_EVENTS:
      const groupEventsState = [];
      action.groupEvents.forEach(groupEvent => {
        groupEventsState.push(groupEvent);
      });
      return groupEventsState;
    default:
      return state;
  }
};

export default eventsReducer;
