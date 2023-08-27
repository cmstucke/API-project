import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventsFetch } from '../../store/events';
import { Link } from 'react-router-dom';

const GetAllEvents = () => {
  const dispatch = useDispatch();
  const { allPastSort, allUpcomingSort } = useSelector(state => (
    state.events ? state.events : []
  ));

  if (allUpcomingSort) {
    for (const event of allUpcomingSort) {
      const date = new Date(event.startDate).toLocaleDateString();
      const time = new Date(event.startDate).toLocaleTimeString();
      event.startDateStr = date;
      event.startTimeStr = time;
    }
  }

  if (allPastSort) {
    for (const event of allPastSort) {
      const date = new Date(event.startDate).toLocaleDateString();
      const time = new Date(event.startDate).toLocaleTimeString();
      event.startDateStr = date;
      event.startTimeStr = time;
    }
  }

  useEffect(() => {
    dispatch(eventsFetch());
  }, [dispatch]);

  console.log('EVENTS: ', allUpcomingSort);

  // SHORT CIRCUIT
  if (!allUpcomingSort) return null;

  return (
    <>
      <div>
        <h1>Events</h1>
        <h1>Groups</h1>
      </div>
      <h2>Events in Meetup</h2>
      <div>
        {allUpcomingSort.map(event => (
          <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
            <div>
              <div className='event-upper'>
                {
                  event.previewImage.startsWith('event-img-') &&
                  <img
                    className='event-img'
                    src={require(`../../images/${event.previewImage}`)}
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
                  {!event.Venue && <p>Online</p>}
                </div>
              </div>
              <p>{event.description}</p>
            </div>
          </Link>
        ))}
      </div>
      <div>
        {allPastSort.map(event => (
          <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
            <div>
              <div className='event-upper'>
                {
                  event.previewImage.startsWith('event-img-') &&
                  <img
                    className='event-img'
                    src={require(`../../images/${event.previewImage}`)}
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
                  {!event.Venue && <p>Online</p>}
                </div>
              </div>
              <p>{event.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
};

export default GetAllEvents;
