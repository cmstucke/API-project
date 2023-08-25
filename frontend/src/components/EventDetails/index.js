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
  const sessionUser = useSelector(state => state.session.user);
  const event = useSelector(state => (
    state.events ? state.events[eventId] : null
  ));

  // console.log('EVENT STATE: ', event)

  useEffect(() => {
    dispatch(eventDetailsFetch(eventId));
  }, [dispatch, eventId]);


  let sessionLinks;
  if (sessionUser) {
    sessionLinks = (
      <div>
        <OpenModalButton
          buttonText='Delete Event'
          modalComponent={<EventDeleteModal event={event} />}
        />
      </div>
    );
  };

  // SHORT CIRCUIT
  if (!event || !event.user) return null;

  // DATE AND TIME FORMAT
  event.startDateStr = new Date(event.startDate).toLocaleString()
    .split(', ')
    .join(' · ');
  event.endDateStr = new Date(event.endDate).toLocaleString()
    .split(', ')
    .join(' · ');

  // JSX
  return (
    <>
      <div id='body-container'>
        <label>{breadCrumbLabelVal}
          <Link to={'/events'} id='groups-bread-crumb'> Events</Link>
        </label>
        <h1>{event.name}</h1>
        <p>Hosted by {event.user.firstName} {event.user.lastName}</p>
        <div id='upper-container'>
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
          <div id='upper-info'>

            <p>START {event.startDateStr}</p>
            <p>END {event.endDateStr}</p>
            {event.price !== 0 && <p>{event.price}</p>}
            {event.price === 0 && <p>FREE</p>}
            <p>{event.type}</p>
            {sessionLinks}
          </div>
        </div>
        <div>
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>
      </div>
    </>
  );
};

export default GetEventDetails;
