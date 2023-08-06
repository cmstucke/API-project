import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { groupDetailsFetch } from '../../store/groups';
import OpenModalButton from "../OpenModalButton";
import GroupDeleteModal from '../GroupDeleteModal';
import './index.css'
import GroupEvents from '../GroupEvents';

const GetGroupDetails = () => {
  // GET GROUP DETAILS
  const dispatch = useDispatch();
  const { groupId } = useParams();
  const [imgUrl, setImgUrl] = useState();
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
        <Link
          to={`/groups/${groupId}/events/create`}
        >
          <button group={group}>
            Create event
          </button>
        </Link>
        <Link to={`/groups/${groupId}/update`}>
          <button>
            Update
          </button>
        </Link>
        <OpenModalButton
          buttonText='Delete Group'
          modalComponent={<GroupDeleteModal groupId={groupId} />}
        />
      </div>
    );
  };

  // // SELECT PREVIEW IMAGE
  useEffect(() => {
    if (group && group.GroupImages) {
      // console.log('GROUP IMAGES: ', group.GroupImages)
      for (const img of group.GroupImages) {
        if (img.preview) {
          setImgUrl(img.url)
        };
      };
    }
  }, [group]);

  // console.log('IMG URL: ', imgUrl);

  // SHORT CIRCUIT
  if (!group || !group.Organizer) return null;

  return (
    <>
      <div id='body'>
        <div id='body-container'>
          <div id='upper-container'>
            {imgUrl && <img
              id='group-img'
              src={require(`../../images/${imgUrl}`)}
              alt='No group images' />}
            <div id='upper-container-info'>
              <div id='group-text'>
                <h1>{group.name}</h1>
                <p>{`${group.city}, ${group.state}`}</p>
                {
                  group.Events &&
                  <p>
                    {group.Events.length} Events · {group.private ? 'Private' : 'Public'}
                  </p>
                }
                <div>
                  <label>Organized by:
                    <span>
                      {
                        ` ${group.Organizer.firstName} ${group.Organizer.lastName}`
                      }
                    </span>
                  </label>
                </div>
              </div>
              {join && <button >Join this group</button>}
            </div>
          </div>
          <div id='about-section'>
            <h2>What we're about</h2>
            <p>{group.about}</p>
            {sessionLinks}
          </div>
          <div>
            <GroupEvents component={GroupEvents} />
          </div>
        </div>
      </div>
    </>
  );
};

export default GetGroupDetails;
