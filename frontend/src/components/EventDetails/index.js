import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
// import { useModal } from "../../context/Modal";
import { eventDetailsFetch } from '../../store/events';
import OpenModalButton from "../OpenModalButton";
import EventDeleteModal from '../EventDeleteModal';

const GetEventDetails = () => {
  //GET EVENT DETAILS
  const dispatch = useDispatch();
  const { eventId } = useParams();
  // const { closeModal } = useModal();
  const sessionUser = useSelector(state => state.session.user);
  const event = useSelector(state => (
    state.events ? state.events[eventId] : null
  ));

  // console.log('EVENT STATE: ', event)

  useEffect(() => {
    dispatch(eventDetailsFetch(eventId));
  }, [dispatch, eventId]);

  // SHORT CIRCUIT
  if (!event) return null;

  // DATE AND TIME FORMAT
  event.startDateStr = new Date(event.startDate).toLocaleString();
  event.endDateStr = new Date(event.endDate).toLocaleString();


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

  // JSX
  return (
    <>
      <h1>{event.name}</h1>
      <div>
        <p>START {event.startDateStr}</p>
        <p>END {event.endDateStr}</p>
        <p>{event.price}</p>
        <p>{event.type}</p>
        <div>
          <h2>Description</h2>
          <p>{event.description}</p>
        </div>
      </div>
      {sessionLinks}
    </>
  );
};

export default GetEventDetails;
