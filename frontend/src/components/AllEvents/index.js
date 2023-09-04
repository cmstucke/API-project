import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from 'react-router-dom';
import { eventSort, addDateStr } from '../../assets/helpers/event-sort-date';
import { eventsFetch } from "../../store/events";
import './index.css';

const GetAllEvents = () => {
  const dispatch = useDispatch();

  const allEvents = useSelector(state => (
    state.events.allEvents ?
      state.events.allEvents :
      {}
  ));
  const events = Object.values(allEvents);
  const { allUpcomingSort, allPastSort } = eventSort(events);
  const upcomingEvents = addDateStr(allUpcomingSort);
  const pastEvents = addDateStr(allPastSort);

  useEffect(() => {
    dispatch(eventsFetch());
  }, [dispatch]);

  return (
    <div id="body-container">
      <div id='all-events-container'>
        <div id='headings-container'>
          <h1 id="active-list-heading">Events</h1>
          <Link id='groups-link' to='/groups'>
            <h1>Groups</h1>
          </Link>
        </div>
        <p id='subheading'>Events in Meetup</p>
        <div id='upcoming-container' className='events-list-container'>
          {upcomingEvents.map(event => (
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
                  <div className="all-events-info-container">
                    <p className="all-events-dates">{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                    <h2>{event.name}</h2>
                    {
                      event.venueId === null ?
                        <p>Online</p> :
                        <p>{`${event.Venue.city} ${event.Venue.state}`}</p>
                    }
                  </div>
                </div>
                <p className='all-events-description'>{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
        <div id='past-container' className='events-list-container'>
          {pastEvents.map(event => (
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
                  <div className="all-events-info-container">
                    <p className="all-events-dates">{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                    <h2>{event.name}</h2>
                    {
                      event.venueId === null ?
                        <p>Online</p> :
                        <p>{`${event.Venue.city} ${event.Venue.state}`}</p>
                    }
                  </div>
                </div>
                <p className='all-events-description'>{event.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GetAllEvents;
