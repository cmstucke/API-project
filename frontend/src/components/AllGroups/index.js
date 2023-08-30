import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { groupsFetch } from "../../store/groups";
import { Link } from 'react-router-dom';
import './index.css';

const GetAllGroups = () => {
  const dispatch = useDispatch();
  const groups = Object.values(
    useSelector(state => state.groups ? state.groups : [])
  );

  useEffect(() => {
    dispatch(groupsFetch());
  }, [dispatch]);

  return (
    <>
      <div id='all-groups-body'>
        <div id='all-groups-container'>
          <div id='headings-container'>
            <Link id='events-link' to='/events'>
              <h1>Events</h1>
            </Link>
            <h1>Groups</h1>
          </div>
          <div>
            <h2>Groups in Meetup</h2>
          </div>
          <div>
            {groups.map(group => (
              <Link key={group.id} to={`/groups/${group.id}`} className='group-link-wrap'>
                <div className='group-element'>
                  <div className='img-container'>
                    {
                      group.previewImage &&
                      group.previewImage.startsWith('group-img-') &&
                      <img
                        src={require(`../../assets/images/${group.previewImage}`)}
                        alt={group.previewImage}
                        className='group-img'
                      />
                    }
                    {
                      group.previewImage &&
                      !group.previewImage.startsWith('group-img-') &&
                      <img
                        src={group.previewImage}
                        alt={group.previewImage}
                        className='group-img'
                      />
                    }
                  </div>
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
