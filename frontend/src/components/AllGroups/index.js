import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchGroups } from "../../store/groups";

const GetAllGroups = () => {
  const groupsObj = useSelector(state => state.groups ? state.groups : []);
  const groups = Object.values(groupsObj)

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  return (
    <>
      <h1>Groups in Meetup</h1>
      <div>
        <h2>Events</h2>
        <h2>Groups</h2>
      </div>
      <div>
        {groups.map(group => (
          <div>
            <h3>{group.name}</h3>
            <p>{group.about}</p>
            <p>{group.type}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default GetAllGroups;
