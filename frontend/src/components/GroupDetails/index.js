import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchGroupDetails } from '../../store/groups';

const GetGroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(groupId);
  const groupObj = useSelector((state) =>
    state.groups ? state.groups[groupId] : null
  );
  console.log('GROUP OBJECT: ', groupObj);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroupDetails(groupId));
  }, [dispatch])

  if (!groupObj) return null;

  return (
    <>
      <h1>{groupObj.name}</h1>
      <p>{`${groupObj.city}, ${groupObj.state}`}</p>
      <p>{groupObj.type}</p>
      <div>
        <h2>What we're about</h2>
        <p>{groupObj.about}</p>
      </div>
    </>
  );
};

export default GetGroupDetails;
