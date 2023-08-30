import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { groupEventsFetch } from '../../store/events';
import './index.css';

const GroupEvents = () => {
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const upcomingEvents = useSelector(state => state.events.upcomingEvents);
  const pastEvents = useSelector(state => state.events.pastEvents);
  // console.log('EVENTS: ', upcomingEvents);

  useEffect(() => {
    dispatch(groupEventsFetch(groupId));
  }, [dispatch, groupId]);

  if (upcomingEvents) {
    for (const event of upcomingEvents) {
      const date = new Date(event.startDate).toLocaleDateString();
      const time = new Date(event.startDate).toLocaleTimeString();
      event.startDateStr = date;
      event.startTimeStr = time;
    }
  }

  if (pastEvents) {
    for (const event of pastEvents) {
      const date = new Date(event.startDate).toLocaleDateString();
      const time = new Date(event.startDate).toLocaleTimeString();
      event.startDateStr = date;
      event.startTimeStr = time;
    }
  }


  // SHORT CIRCUIT
  if (!upcomingEvents) return null;
  if (!pastEvents) return null;

  return (

    <div>
      {upcomingEvents.length > 0 &&
        <div id='upcoming-container'>
          <h1>Upcoming Events ({upcomingEvents.length})</h1>
          <div>
            {upcomingEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
                <div>
                  <div className='event-upper'>
                    {
                      event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={require(`../../assets/images/${event.previewImage}`)}
                        alt='No event img'
                      />
                    }
                    {
                      !event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={event.previewImage}
                        alt='No event img'
                      />
                    }
                    <div>
                      <p>{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                      <h2>{event.name}</h2>
                      {event.Venue && <p>{`${event.Venue.city} ${event.Venue.state}`}</p>}
                    </div>
                  </div>
                  <p>{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      }
      {pastEvents.length > 0 &&
        <div id='past-container'>
          <h1>Past Events ({pastEvents.length})</h1>
          <div>
            {pastEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
                <div>
                  <div className='event-upper'>
                    {
                      event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={require(`../../assets/images/${event.previewImage}`)}
                        alt='No event img'
                      />
                    }
                    {
                      !event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={event.previewImage}
                        alt='No event img'
                      />
                    }
                    <div>
                      <p>{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                      <h2>{event.name}</h2>
                      {event.Venue && <p>{`${event.Venue.city} ${event.Venue.state}`}</p>}
                    </div>
                  </div>
                  <p>{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      }
    </div>

  )
};

export default GroupEvents;
