import React from "react";
import { useDispatch } from "react-redux";
import { groupDelete } from '../../store/groups'
import { useHistory } from 'react-router-dom';
import { useModal } from "../../context/Modal";


function GroupDeleteModal({ groupId }) {
  const history = useHistory();
  const dispatch = useDispatch();
  const { closeModal } = useModal();

  const handleSubmit = e => {
    e.preventDefault();
    return dispatch(groupDelete(groupId))
      .then(closeModal)
      .then(history.push('/groups'));
  };

  return (
    <>
      <h1>Confirm Delete</h1>
      <form onSubmit={handleSubmit}>
        <p>Are you sure you want to remove this group?</p>
        <div className="buttons-container">
          <button type='submit'>Yes (Delete Group)</button>
          <button onClick={closeModal}>No (Keep Group)</button>
        </div>
      </form>
    </>
  );
};

export default GroupDeleteModal;
