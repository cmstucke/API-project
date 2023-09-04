import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useHistory, useParams } from 'react-router-dom';
import { eventDetailsFetch } from '../../store/events';
import OpenModalButton from "../OpenModalButton";
import EventDeleteModal from '../EventDeleteModal';
import './index.css';

const GetEventDetails = ({ allEvents }) => {
  //GET EVENT DETAILS
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const history = useHistory();
  const breadCrumbLabelVal = '<';
  const sessionUser = useSelector(state => (
    state.session.user
  ));
  const event = useSelector(state => (
    state.events.singleEvent ? state.events.singleEvent : null
  ));

  useEffect(() => {
    if (!allEvents[eventId]) history.push('/');
  }, [allEvents, eventId, history])

  useEffect(() => {
    dispatch(eventDetailsFetch(eventId));
  }, [dispatch, eventId]);


  let sessionLinks;
  if (sessionUser && event) {
    sessionLinks = (
      <div className='session-buttons-container'>
        <Link
          to={`/events/${eventId}/update`}
        >
          <button
            className='session-button'
            event={event}
          >
            Update
          </button>
        </Link>
        <OpenModalButton
          className='management-modal'
          buttonText='Delete'
          modalComponent={<EventDeleteModal event={event} />}
        />
      </div>
    );
  };

  // SHORT CIRCUIT
  if (!event || !event.user) return null;

  // DATE AND TIME FORMAT
  event.startDateStr = new Date(event.startDate)
    .toLocaleString()
    .split(', ')
    .join(' · ');
  event.endDateStr = new Date(event.endDate)
    .toLocaleString()
    .split(', ')
    .join(' · ');

  // JSX
  return (
    <div id='body-container'>
      <div id='heading-container'>
        <label className='breadcrumb'>{breadCrumbLabelVal}
          <Link
            to={'/events'}
            className='breadcrumb'
          > Events</Link>
        </label>
        <h1>{event.name}</h1>
        <p>Hosted by {event.user.firstName} {event.user.lastName}</p>
      </div>
      <div id='event-details-background'>
        <div id='event-details-upper-container'>
          {
            !event.previewImage &&
            <img
              id='event-details-img'
              alt='No event img'
            />
          }
          {
            event.previewImage &&
            event.previewImage.startsWith('event-img-') &&
            <img
              id='event-details-img'
              src={require(`../../assets/images/${event.previewImage}`)}
              alt='No event img'
            />
          }
          {
            event.previewImage &&
            !event.previewImage.startsWith('event-img-') &&
            <img
              id='event-details-img'
              src={event.previewImage}
              alt='No event img'
            />
          }
          <div id='event-details-upper-info'>
            <div className='event-details-container'>
              <i id="event-details-calendar-days" className="fas fa-clock" />
              <div id='event-details-date-text'>
                <p className='event-details-date'>START <span
                  className='event-details-date-str'
                >{event.startDateStr}</span></p>
                <p className='event-details-date'>END <span
                  className='event-details-date-str'
                >{event.endDateStr}</span></p>
              </div>
            </div>
            <div className='event-details-container'>
              <i id="event-details-dollar" className="fas fa-dollar-sign" />
              {
                event.price === 0 ?
                  <p className='event-details-price-text'>FREE</p> :
                  <p className='event-details-price-text'>$ {event.price}</p>
              }
            </div>
            <section id='type-session-buttons'>
              <div className='event-details-container'>
                <i id="event-details-pin" className="fas fa-map-pin" />
                <p className='event-details-type-text'>{event.type}</p>
              </div>
              {sessionLinks}
            </section>
          </div>
        </div>
        <div id='event-details-description-container'>
          <h2>Details</h2>
          <p id='event-details-description'>{event.description}</p>
        </div>
      </div>
    </div>
  );
};

export default GetEventDetails;
