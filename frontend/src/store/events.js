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
  } catch (err) { throw err }
};

export const eventDelete = eventId => async dispatch => {
  const res = await csrfFetch(`/api/events/${eventId}/delete`, {
    method: 'DELETE'
  });
  const resJSON = await res.json();
  dispatch(removeEvent(eventId));
  return resJSON;
};

// const getTimeHelper = dateData => {
//   const date = new Date(dateData);
//   return date.getTime();
// };

// EVENTS REDUCER
const eventsReducer = (state = {}, action) => {
  switch (action.type) {
    case LOAD_EVENTS:
      // console.log('EVENTS STATE: ', action.events);
      const { Events } = action.events
      // console.log('ALL EVENTS: ', allEvents)
      // const allUpcoming = [];
      // const allPast = [];
      // for (const event of Events) {
      //   const now = Date.now();
      //   const start = new Date(event.startDate).getTime();
      //   if (now < start) {
      //     allUpcoming.push(event);
      //   } else {
      //     allPast.push(event);
      //   };
      // };
      // const allUpcomingSort = allUpcoming.sort((a, b) => (
      //   getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
      // ));
      // const allPastSort = allPast.sort((a, b) => (
      //   getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
      // ));
      const allEvents = {};
      Events.forEach(event => allEvents[event.id] = { ...event });
      return { ...state, allEvents: { ...allEvents } }
    // case LOAD_GROUP_EVENTS:
    //   const groupEventsState = { allEvents: [...action.groupEvents] };
    //   const past = [];
    //   const upcoming = [];
    //   for (const i in groupEventsState.allEvents) {
    //     const event = groupEventsState.allEvents[i];
    //     const now = Date.now();
    //     const start = new Date(event.startDate).getTime();
    //     if (now < start) {
    //       upcoming.push(event);
    //     } else {
    //       past.push(event);
    //     };
    //   };
    //   const orderedUpcoming = upcoming.sort((a, b) => (
    //     getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
    //   ));
    //   const orderedPast = past.sort((a, b) => (
    //     getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
    //   ));
    //   groupEventsState.upcomingEvents = orderedUpcoming;
    //   groupEventsState.pastEvents = orderedPast;
    //   return groupEventsState;
    case LOAD_EVENT_DETAILS:
      return { ...state, singleEvent: { ...action.event } };
    case ADD_EVENT:
      console.log('STATE: ', state)
      console.log('SINGLE EVENT: ', action.event);
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
    case REMOVE_EVENT:
      const newState = { ...state }
      delete newState[action.eventId]
      return newState;
    default:
      return state;
  }
};

export default eventsReducer;
