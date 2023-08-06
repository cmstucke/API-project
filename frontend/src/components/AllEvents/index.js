import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventsFetch } from '../../store/events';
import { Link } from 'react-router-dom';

const GetAllEvents = () => {
  const dispatch = useDispatch();
  const { Events } = useSelector(state => (
    state.events ? state.events : []
  ));

  useEffect(() => {
    dispatch(eventsFetch());
  }, [dispatch]);

  console.log('EVENTS: ', Events);

  // SHORT CIRCUIT
  if (!Events) return null;

  return (
    <>
      <div>
        <h1>Events</h1>
        <h1>Groups</h1>
      </div>
      <h2>Events in Meetup</h2>
      <div>
        {Events.map(event => (
          <Link to={`/events/${event.id}`} className='event-link-wrap'>
            <div>
              <h3>{event.name}</h3>
              <p>{event.about}</p>
              <p>{event.type}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default GetAllEvents;
