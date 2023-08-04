import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { groupsFetch } from "../../store/groups";
import './index.css';
import { Link } from 'react-router-dom';

const GetAllGroups = () => {
  const dispatch = useDispatch();
  const groupsObj = useSelector(state => state.groups ? state.groups : []);
  const groups = Object.values(groupsObj)

  useEffect(() => {
    dispatch(groupsFetch());
  }, [dispatch]);

  return (
    <>
      <div id='all-groups-body'>
        <div id='all-groups-container'>
          <div id='headings-container'>
            <h1>Events</h1>
            <h1>Groups</h1>
          </div>
          <div>
            <h2>Groups in Meetup</h2>
          </div>
          <div>
            {groups.map(group => (
              <Link to={`/groups/${group.id}`} className='group-link-wrap'>
                <div className='group-element'>
                  <img src={
                    group.previewImage &&
                      group.previewImage !== 'No preview image' ?
                      require(`../../images/${group.previewImage}`) :
                      null
                  } alt={group.previewImage} className='group-img' />
                  <div className='group-text-elements'>
                    <h3>{group.name}</h3>
                    <p>{group.about}</p>
                    {group.Events && <p>{group.Events.length} Events · {group.private ? 'Private' : 'Public'}</p>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default GetAllGroups;
