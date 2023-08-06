import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { useModal } from "../../context/Modal";
import { eventDelete } from "../../store/events";

function EventDeleteModal({ event }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  console.log('PROP: ', event)

  const handleSubmit = e => {
    e.preventDefault();
    return dispatch(eventDelete(event.id))
      .then(closeModal)
      .then(history.push(`/groups/${event.groupId}`));
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
