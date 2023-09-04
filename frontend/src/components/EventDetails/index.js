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
          <div id='upper-info'>

            <p className='event-details-text'>START {event.startDateStr}</p>
            <p className='event-details-text'>END {event.endDateStr}</p>
            {
              event.price === 0 ?
                <p className='event-details-text'>FREE</p> :
                <p className='event-details-text'>$ {event.price}</p>
            }
            <section id='type-session-buttons'>
              <p className='event-details-text'>{event.type}</p>
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
