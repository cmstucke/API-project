import { csrfFetch } from "./csrf";

// ACTION TYPE CONSTANTS:
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS';
export const LOAD_EVENT_DETAILS = 'events/LOAD_EVENT_DETAILS';
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const ADD_EVENT = 'events/ADD_EVENT';

// ACTION
export const loadGroupEvents = groupEvents => ({
  type: LOAD_GROUP_EVENTS,
  groupEvents
});

export const loadEventDetails = event => ({
  type: LOAD_EVENT_DETAILS,
  event
});

export const loadEvents = events => ({
  type: LOAD_EVENTS,
  events
});

export const addEvent = event => ({
  type: ADD_EVENT,
  event
});

// THUNK ACTION CREATORS
export const groupEventsFetch = groupId => async dispatch => {
  const res = await fetch(`/api/groups/${groupId}/events`);
  if (res.ok) {
    const { Events } = await res.json();
    console.log('EVENTS FETCH: ', Events);
    dispatch(loadGroupEvents(Events))
  };
};

export const eventDetailsFetch = eventId => async dispatch => {
  const res = await fetch(`/api/events/${eventId}`);
  if (res.ok) {
    const event = await res.json();
    dispatch(loadEventDetails(event));
  };
};

export const eventsFetch = () => async dispatch => {
  const res = await fetch('/api/events');
  if (res.ok) {
    const events = await res.json();
    dispatch(loadEvents(events));
  };
};

export const eventCreate = (groupId, data) => async dispatch => {
  try {
    const res = await csrfFetch(`/api/groups/${groupId}/events/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const event = await res.json();
    console.log('EVENT FETCH', event)
    dispatch(addEvent(event));
    return event;
  }
  catch (error) { throw error };
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
    case LOAD_EVENTS:
      return { ...state, ...action.events };
    case ADD_EVENT:
      if (!state[action.event.id]) {
        const newState = {
          ...state,
          [action.event.id]: action.event
        };
        return newState;
      };
      return {
        ...state,
        [action.event.id]: {
          ...state[action.event.id],
          ...action.event
        }
      };
    default:
      return state;
  }
};

export default eventsReducer;
