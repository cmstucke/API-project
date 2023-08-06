import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { groupEventsFetch } from '../../store/events';
import './index.css';

const GroupEvents = () => {
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const events = useSelector(state => (state.events));


  useEffect(() => {
    dispatch(groupEventsFetch(groupId));
  }, [dispatch, groupId]);

  if (events.length) {
    for (const event of events) {
      const date = new Date(event.startDate).toLocaleDateString();
      const time = new Date(event.startDate).toLocaleTimeString();
      event.startDateStr = date;
      event.startTimeStr = time;
    }
  }

  console.log('EVENTS: ', events)

  // SHORT CIRCUIT
  if (!events.length) return null;

  return (
    <>
      <h1>Events ({events.length})</h1>
      <div>
        {events.length && events.map(event => (
          <Link to={`/events/${event.id}`} className='event-link-wrap'>
            <div>
              <div>
                <p>{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                <h2>{event.name}</h2>
                {event.Venue && <p>{`${event.Venue.city} ${event.Venue.state}`}</p>}
              </div>
              <p>{event.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
};

export default GroupEvents;
