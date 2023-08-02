// ACTION TYPE CONSTANTS:
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS';
export const LOAD_EVENT_DETAILS = 'events/LOAD_EVENT_DETAILS';

// ACTION
export const loadGroupEvents = groupEvents => ({
  type: LOAD_GROUP_EVENTS,
  groupEvents
});

export const loadEventDetails = event => ({
  type: LOAD_EVENT_DETAILS,
  event
});

// THUNK ACTION CREATORS
export const fetchGroupEvents = groupId => async dispatch => {
  const res = await fetch(`/api/groups/${groupId}/events`);
  if (res.ok) {
    const { Events } = await res.json();
    dispatch(loadGroupEvents(Events))
  };
};

export const fetchEventDetails = eventId => async dispatch => {
  const res = await fetch(`/api/events/${eventId}`);
  if (res.ok) {
    const event = await res.json();
    dispatch(loadEventDetails(event));
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
    case LOAD_EVENT_DETAILS:
      return { ...state, [action.event.id]: action.event };
    default:
      return state;
  }
};

export default eventsReducer;
