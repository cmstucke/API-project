import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { useModal } from "../../context/Modal";
import { eventDelete } from "../../store/events";

function EventDeleteModal({ eventId }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleSubmit = e => {
    e.preventDefault();
    return dispatch(eventDelete(eventId))
      .then(closeModal)
      .then(history.push('/events'));
  };

  return (
    <>
      <h1>Confirm Delete</h1>
      <form onSubmit={handleSubmit}>
        <p>Are you sure you want to remove this event?</p>
        <div className="buttons-container">
          <button type='submit'>Yes (Delete Event)</button>
          <button onClick={closeModal}>No (Keep Event)</button>
        </div>
      </form>
    </>
  );

};

export default EventDeleteModal;
