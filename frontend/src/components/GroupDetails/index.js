import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchGroupDetails } from '../../store/groups';

const GetGroupDetails = () => {
  // GET GROUP DETAILS
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const group = useSelector((state) =>
    state.groups ? state.groups[groupId] : null
  );

  useEffect(() => {
    dispatch(fetchGroupDetails(groupId));
  }, [dispatch, groupId])

  // AUTHENTICATED USER
  const [user, setUser] = useState(null);
  const [join, setJoin] = useState(false);
  const userObj = useSelector(state => state.session.user);
  useEffect(() => {
    if (!user && userObj) setUser(userObj)
    if (user && group && !join && user.id !== group.organizerId) setJoin(true);
  }, [user, group, join, userObj]);

  // SHORT CIRCUIT
  if (!group) return null;

  return (
    <>
      <h1>{group.name}</h1>
      <p>{`${group.city}, ${group.state}`}</p>
      <p>{group.type}</p>
      <div>
        <label>Organized by:
          <span>{` ${group.Organizer.firstName} ${group.Organizer.lastName}`}</span>
        </label>
      </div>
      {join && <button>Join this group</button>}
      <div>
        <h2>What we're about</h2>
        <p>{group.about}</p>
      </div>
    </>
  );
};

export default GetGroupDetails;
