import React from "react";
import { useDispatch } from "react-redux";
import { useHistory } from 'react-router-dom';
import { useModal } from "../../context/Modal";
import { eventDelete, eventsFetch, groupEventsFetch } from "../../store/events";

function EventDeleteModal({ event }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleSubmit = e => {
    e.preventDefault();
    return dispatch(eventDelete(event.id))
      .then(dispatch(eventsFetch()))
      .then(dispatch(groupEventsFetch(event.groupId)))
      .then(closeModal)
      .then(history.push(`/groups/${event.groupId}`));
  };

  return (
    <div className="modal-form-body">
      <h1 className="modal-heading">Confirm Delete</h1>
      <form
        className="modal-delete-form"
        onSubmit={handleSubmit}
      >
        <p className="modal-p">Are you sure you want to remove this event?</p>
        <div className="modal-buttons-container">
          <button
            className='modal-submit'
            type='submit'
          >Yes (Delete Event)</button>
          <button
            className='modal-submit'
            onClick={closeModal}
          >No (Keep Event)</button>
        </div>
      </form>
    </div>
  );

};

export default EventDeleteModal;
