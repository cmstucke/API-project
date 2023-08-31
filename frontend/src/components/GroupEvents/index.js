import { Link } from 'react-router-dom';
import { eventSort, addDateStr } from '../../assets/helpers/event-sort-date';
import './index.css';

const GroupEvents = ({ groupEvents }) => {
  // const dispatch = useDispatch();
  // const { groupId } = useParams();
  // const upcomingEvents = useSelector(state => state.events.upcomingEvents);
  // const pastEvents = useSelector(state => state.events.pastEvents);
  console.log('GROUP EVENTS PROP: ', groupEvents);
  const { allUpcomingSort, allPastSort } = eventSort(groupEvents);
  const upcomingEvents = addDateStr(allUpcomingSort);
  const pastEvents = addDateStr(allPastSort);

  // useEffect(() => {
  //   dispatch(groupEventsFetch(groupId));
  // }, [dispatch, groupId]);

  // if (upcomingEvents) {
  //   for (const event of upcomingEvents) {
  //     const date = new Date(event.startDate).toLocaleDateString();
  //     const time = new Date(event.startDate).toLocaleTimeString();
  //     event.startDateStr = date;
  //     event.startTimeStr = time;
  //   }
  // }

  // if (pastEvents) {
  //   for (const event of pastEvents) {
  //     const date = new Date(event.startDate).toLocaleDateString();
  //     const time = new Date(event.startDate).toLocaleTimeString();
  //     event.startDateStr = date;
  //     event.startTimeStr = time;
  //   }
  // }


  // // SHORT CIRCUIT
  // if (!upcomingEvents) return null;
  // if (!pastEvents) return null;

  return (

    <div>
      {upcomingEvents.length > 0 &&
        <div id='upcoming-container'>
          <h1>Upcoming Events ({upcomingEvents.length})</h1>
          <div className='group-events-list'>
            {upcomingEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
                <div className='group-events-item'>
                  <div className='event-item-upper'>
                    {!event.previewImage && <img alt='No event img' />}
                    {
                      event.previewImage &&
                      event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={require(`../../assets/images/${event.previewImage}`)}
                        alt='No event img'
                      />
                    }
                    {
                      event.previewImage &&
                      !event.previewImage.startsWith('event-img-') &&
                      <img
                        className='event-img'
                        src={event.previewImage}
                        alt='No event img'
                      />
                    }
                    <div>
                      <p className='group-event-times'>{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                      <h2>{event.name}</h2>
                      {event.Venue && <p>{`${event.Venue.city}, ${event.Venue.state}`}</p>}
                    </div>
                  </div>
                  <p className='group-event-description'>{event.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      }
      {pastEvents.length > 0 &&
        <div id='past-container'>
          <h1>Past Events ({pastEvents.length})</h1>
          <div className='group-events-list'>
            {pastEvents.map(event => (
              <Link key={event.id} to={`/events/${event.id}`} className='event-link-wrap'>
                <div className='group-events-item'>
                  <div className='event-item-upper'>
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
                      <p className='group-event-times'>{`${event.startDateStr} · ${event.startTimeStr}`}</p>
                      <h2>{event.name}</h2>
                      {event.Venue && <p>{`${event.Venue.city}, ${event.Venue.state}`}</p>}
                    </div>
                  </div>
                  <p className='group-event-description'>{event.description}</p>
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
