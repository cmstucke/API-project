import { Link } from 'react-router-dom';
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { groupsFetch } from '../../store/groups';
import GroupImages from '../ImageComponents/group-images';
import './index.css';

const GetAllGroups = () => {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const allGroups = useSelector(state => (
    state.groups.allGroups ?
      state.groups.allGroups :
      {}
  ));
  const groups = Object.values(allGroups);

  useEffect(() => {
    dispatch(groupsFetch())
      .then(() => setIsLoaded(true));
  }, [dispatch]);

  if (!isLoaded) return null;

  return (
    <>
      <div id='all-groups-body'>
        <div id='all-groups-container'>
          <div id='headings-container'>
            <Link id='events-link' to='/events'>
              <h1>Events</h1>
            </Link>
            <h1 id='active-list-heading'>Groups</h1>
          </div>
          <div>
            <p id='subheading'>Groups in Meetup</p>
          </div>
          <div>
            {groups.map(group => (
              <Link
                key={group.id}
                to={`/groups/${group.id}`}
                className='group-link-wrap'
              >
                <div className='group-element'>
                  <GroupImages group={group} />
                  <div className='group-text-elements'>
                    <h2 className='group-heading'>{group.name}</h2>
                    <p className='group-location'>{group.city}, {group.state}</p>
                    <p className='group-about'>{group.about}</p>
                    {
                      group.Events &&
                      <p>{group.Events.length} Events · {group.private ? 'Private' : 'Public'}</p>
                    }
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
