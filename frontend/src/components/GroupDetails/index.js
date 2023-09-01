import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { groupDetailsFetch } from '../../store/groups';
import OpenModalButton from "../OpenModalButton";
import GroupDeleteModal from '../GroupDeleteModal';
import GroupEvents from '../GroupEvents';
import './index.css'

const GetGroupDetails = () => {
  // GET GROUP DETAILS
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const [imgUrl, setImgUrl] = useState('');
  const breadCrumb = '<';
  const group = useSelector(state => state.groups.singleGroup);

  useEffect(() => {
    dispatch(groupDetailsFetch(groupId));
  }, [dispatch, groupId]);

  // AUTHENTICATED USER
  const [join, setJoin] = useState(null);
  const sessionUser = useSelector(state => state.session.user);

  useEffect(() => {
    if (
      group &&
      sessionUser &&
      group.organizerId === sessionUser.id
    ) {
      setJoin(false)
    } else {
      setJoin(true)
    };
  }, [group, sessionUser]);

  // ORGANIZER LINKS
  let organizerLinks;
  if (group && sessionUser && group.organizerId === sessionUser.id) {
    organizerLinks = (
      <div className='session-buttons-container'>
        <Link
          to={`/groups/${groupId}/events/create`}
        >
          <button className='session-button'>Create event</button>
        </Link>
        <Link
          to={`/groups/${groupId}/update`}
        >
          <button className='session-button'>Update</button>
        </Link>
        <OpenModalButton
          className='session-button'
          buttonText='Delete Group'
          modalComponent={<GroupDeleteModal groupId={groupId} />}
        />
      </div>
    );
  };

  // SELECT PREVIEW IMAGE
  useEffect(() => {
    if (group && group.GroupImages) {
      for (const img of group.GroupImages) {
        if (img.preview) setImgUrl(img.url);
      };
    };
  }, [group]);

  // SHORT CIRCUIT
  if (!group) return null;

  return (
    <div className='group-details-container'>
      <div id='upper-background'>
        <label className='breadcrumb'>{breadCrumb}
          <Link
            className='breadcrumb'
            to={'/groups'}
          >
            Groups
          </Link>
        </label>
        <div id='upper-container'>
          {
            imgUrl &&
            imgUrl.startsWith('group-img-') &&
            <img
              id='group-img'
              src={require(`../../assets/images/${imgUrl}`)}
              alt='No group images'
            />
          }
          {
            imgUrl &&
            !imgUrl.startsWith('group-img-') &&
            <img
              id='group-img'
              src={imgUrl}
              alt='group'
            />
          }
          <div id='upper-container-info'>
            <div id='group-text'>
              <h1 id='group-details-heading'>{group.name}</h1>
              <p>{`${group.city}, ${group.state}`}</p>
              {
                group.Events &&
                <p>
                  {group.Events.length} Events · {group.private ? 'Private' : 'Public'}
                </p>
              }
              <div>
                <p>Organized by:
                  <span>
                    {
                      ` ${group.Organizer.firstName} ${group.Organizer.lastName}`
                    }
                  </span>
                </p>
              </div>
            </div>
            {
              join &&
              <button
                id='join-button'
                onClick={() => alert('Feature coming soon')}
              >
                Join this group
              </button>
            }
            {organizerLinks}
          </div>
        </div>
      </div>
      <div id='lower-background'>
        <div id='lower-container'>
          <h1>Organizer</h1>
          <p id='organizer-name'>{group.Organizer.firstName} {group.Organizer.lastName}</p>
          <div id='about-section'>
            <h2>What we're about</h2>
            <p id='about'>{group.about}</p>
          </div>
          {
            group.Events.length ?
              <GroupEvents
                id='group-events-component'
                groupEvents={group.Events}
                component={GroupEvents}
              /> :
              null
          }
          {
            !group.Events.length &&
            <div id='group-events-placeholder'></div>
          }
        </div>
      </div>
    </div>
  );
};

export default GetGroupDetails;
