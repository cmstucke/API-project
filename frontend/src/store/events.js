import { csrfFetch } from "./csrf";

// ACTION TYPE CONSTANTS:
export const LOAD_EVENTS = 'events/LOAD_EVENTS';
export const LOAD_GROUP_EVENTS = 'groups/LOAD_GROUP_EVENTS';
export const LOAD_EVENT_DETAILS = 'events/LOAD_EVENT_DETAILS';
export const ADD_EVENT = 'events/ADD_EVENT';
export const REMOVE_EVENT = 'events/REMOVE_EVENT';

// ACTION
const loadEvents = events => ({
  type: LOAD_EVENTS,
  events
});

const loadGroupEvents = groupEvents => ({
  type: LOAD_GROUP_EVENTS,
  groupEvents
});

const loadEventDetails = event => ({
  type: LOAD_EVENT_DETAILS,
  event
});

const addEvent = event => ({
  type: ADD_EVENT,
  event
});

const removeEvent = eventId => ({
  type: REMOVE_EVENT,
  eventId
});

// THUNKS
export const eventsFetch = () => async dispatch => {
  const res = await fetch('/api/events');
  if (res.ok) {
    const events = await res.json();
    dispatch(loadEvents(events));
  };
};

export const groupEventsFetch = groupId => async dispatch => {
  const res = await fetch(`/api/groups/${groupId}/events`);
  if (res.ok) {
    const { Events } = await res.json();
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

export const eventCreate = (groupId, data) => async dispatch => {
  try {
    const res = await csrfFetch(`/api/groups/${groupId}/events/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const event = await res.json();
    dispatch(addEvent(event));
    return event;
  }
  catch (error) { throw error };
};

export const eventUpdate = (eventId, data) => async dispatch => {
  console.log('REQUEST BODY: ', data);
  try {
    const res = await csrfFetch(`/api/events/${eventId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const event = await res.json();
    console.log('RESPONSE: ', event);
    dispatch(addEvent(event));
    return event;
  } catch (err) { throw err };
};

export const eventDelete = eventId => async dispatch => {
  const res = await csrfFetch(`/api/events/${eventId}/delete`, {
    method: 'DELETE'
  });
  const resJSON = await res.json();
  dispatch(removeEvent(eventId));
  return resJSON;
};

// EVENTS REDUCER
const eventsReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_EVENTS:
      const { Events } = action.events
      const allEvents = {};
      Events.forEach(event => {
        allEvents[event.id] = {
          ...event,
          Group: { ...event.Group },
          Venue: { ...event.Venue }
        }
      });
      return { ...state, allEvents: { ...allEvents } }
    case LOAD_GROUP_EVENTS:
      // console.log('ACTION GROUP EVENTS', action.groupEvents);
      const groupEventsArr = [...action.groupEvents];
      const groupEvents = {};
      groupEventsArr.forEach(event => {
        groupEvents[event.id] = {
          ...event,
          Group: { ...event.Group },
          Venue: { ...event.Venue }
        }
      });
      return { ...state, groupEvents: groupEvents };
    case LOAD_EVENT_DETAILS:
      return { ...state, singleEvent: { ...action.event } };
    case ADD_EVENT:
      const addEventState = {
        ...state,
        singleEvent: { ...action.event },
        allEvents: {
          ...state.allEvents,
          [action.event.id]: { ...action.event }
        }
      };
      return addEventState;
    case REMOVE_EVENT:
      const deleteState = { ...state }
      delete deleteState.singleEvent;
      delete deleteState.allEvents[action.eventId];
      return deleteState;
    default:
      return state;
  }
};

export default eventsReducer;
