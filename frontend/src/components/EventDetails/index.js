import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { eventDetailsFetch } from '../../store/events';
import OpenModalButton from "../OpenModalButton";
import EventDeleteModal from '../EventDeleteModal';
import './index.css';

const GetEventDetails = () => {
  //GET EVENT DETAILS
  const dispatch = useDispatch();
  const { eventId } = useParams();
  const breadCrumbLabelVal = '<';
  const sessionUser = useSelector(state => (
    state.session.user
  ));
  const event = useSelector(state => (
    state.events ? state.events[eventId] : null
  ));

  useEffect(() => {
    dispatch(eventDetailsFetch(eventId));
  }, [dispatch, eventId]);


  let sessionLinks;
  if (sessionUser && event) {
    sessionLinks = (
      <div id='session-buttons-container'>
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
    <>
      <div id='body-container'>
        <label id='events-bread-crumb'>{breadCrumbLabelVal}
          <Link to={'/events'}> Events</Link>
        </label>
        <div id='heading-container'>
          <h1>{event.name}</h1>
          <p>Hosted by {event.user.firstName} {event.user.lastName}</p>
        </div>
        <div id='upper-container'>
          {
            !event.previewImage &&
            <img
              id='event-img'
              alt='No event img'
            />
          }
          {
            event.previewImage &&
            event.previewImage.startsWith('event-img-') &&
            <img
              id='event-img'
              src={require(`../../assets/images/${event.previewImage}`)}
              alt='No event img'
            />
          }
          {
            event.previewImage &&
            !event.previewImage.startsWith('event-img-') &&
            <img
              id='event-img'
              src={event.previewImage}
              alt='No event img'
            />
          }
          <div id='upper-info'>

            <p>START {event.startDateStr}</p>
            <p>END {event.endDateStr}</p>
            {event.price !== 0 && <p>{event.price}</p>}
            {event.price === 0 && <p>FREE</p>}
            <section id='type-session-buttons'>
              <p>{event.type}</p>
              {sessionLinks}
            </section>
          </div>
        </div>
        <div>
          <h2>Description</h2>
          <p id='description'>{event.description}</p>
        </div>
      </div>
    </>
  );
};

export default GetEventDetails;
