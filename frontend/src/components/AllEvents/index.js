import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { eventsFetch } from '../../store/events';
import { Link } from 'react-router-dom';
import './index.css';

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
      <div id='body-container'>
        <div id='headings-container'>
          <h1>Events</h1>
          <Link id='groups-link' to='/groups'>
            <h1>Groups</h1>
          </Link>
        </div>
        <h2 id='subheading'>Events in Meetup</h2>
        <div id='upcoming-container' className='events-list-container'>
          {allUpcomingSort.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
              <div className='event-element'>
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
                    {!event.Venue && <p>Online</p>}
                  </div>
                </div>
                <p className='description'>{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div id='past-container' className='events-list-container'>
          {allPastSort.map(event => (
            <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
              <div className='event-element'>
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
                    {!event.Venue && <p>Online</p>}
                  </div>
                </div>
                <p className='description'>{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default GetAllEvents;
