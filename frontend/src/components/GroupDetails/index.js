import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { groupDetailsFetch } from '../../store/groups';
import OpenModalButton from "../OpenModalButton";
import GroupDeleteModal from '../GroupDeleteModal';

const GetGroupDetails = () => {
  // GET GROUP DETAILS
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const group = useSelector((state) => (
    state.groups ? state.groups[groupId] : null
  ));

  useEffect(() => {
    dispatch(groupDetailsFetch(groupId));
  }, [dispatch, groupId]);

  // AUTHENTICATED USER
  const [user, setUser] = useState(null);
  const [join, setJoin] = useState(false);
  const sessionUser = useSelector(state => state.session.user);
  useEffect(() => {
    if (!user && sessionUser) setUser(sessionUser)
    if (user && group && !join && user.id !== group.organizerId) setJoin(true);
  }, [user, group, join, sessionUser]);

  let sessionLinks;
  if (sessionUser && group && sessionUser.id === group.organizerId) {
    sessionLinks = (
      <div>
        <OpenModalButton
          buttonText='Delete Group'
          modalComponent={<GroupDeleteModal groupId={groupId} />}
        />
      </div>
    );
  };

  // SHORT CIRCUIT
  if (!group || !group.Organizer) return null;

  return (
    <>
      <div id='body-container'>
        <h1>{group.name}</h1>
        <p>{`${group.city}, ${group.state}`}</p>
        {group.Events && <p>{group.Events.length} Events · {group.private ? 'Private' : 'Public'}</p>}
        <div>
          <label>Organized by:
            <span>{` ${group.Organizer.firstName} ${group.Organizer.lastName}`}</span>
          </label>
        </div>
        {join && <button>Join this group</button>}
      </div>
      <div>
        <h2>What we're about</h2>
        <p>{group.about}</p>
      </div>
      {sessionLinks}
    </>
  );
};

export default GetGroupDetails;
