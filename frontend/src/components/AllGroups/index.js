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
      <h1>Groups</h1>
      <div>
        {groups.map(group => (
          <div>
            <h2>{group.name}</h2>
            <p>{group.about}</p>
            <p>{group.type}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default GetAllGroups;
