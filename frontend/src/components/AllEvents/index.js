import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventsFetch } from '../../store/events';

const GetAllEvents = () => {
  const dispatch = useDispatch();
  const { Events } = useSelector(state => (
    state.events ? state.events : []
  ));

  useEffect(() => {
    dispatch(eventsFetch());
  }, [dispatch]);

  console.log('EVENTS: ', Events);

  return (
    <>
      <h1>Events in Meetup</h1>
      <div>
        <h2>Events</h2>
        <h2>Groups</h2>
      </div>
      <div>
        {Events.map(event => (
          <div>
            <h3>{event.name}</h3>
            <p>{event.about}</p>
            <p>{event.type}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default GetAllEvents;
