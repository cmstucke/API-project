import React from "react";
import { useDispatch } from "react-redux";
import { groupDelete, groupsFetch } from '../../store/groups'
import { useHistory } from 'react-router-dom';
import { useModal } from "../../context/Modal";


function GroupDeleteModal({ groupId }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleSubmit = e => {
    e.preventDefault();
    return dispatch(groupDelete(groupId))
      .then(dispatch(groupsFetch()))
      .then(closeModal)
      .then(history.push('/groups'));
  };

  return (
    <div className="modal-form-body">
      <h1 className="modal-heading">Confirm Delete</h1>
      <form
        className="modal-delete-form"
        onSubmit={handleSubmit}
      >
        <p className="modal-p">Are you sure you want to remove this group?</p>
        <div className="modal-buttons-container">
          <button
            type='submit'
            className='modal-submit'
          >Yes (Delete Group)</button>
          <button
            className='modal-delete-no'
            onClick={closeModal}
          >No (Keep Group)</button>
        </div>
      </form>
    </div>
  );
};

export default GroupDeleteModal;
