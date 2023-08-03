import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { groupDetailsFetch, groupUpdate } from '../../store/groups';

const GroupUpdateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const { groupId } = useParams();
  const group = useSelector((state) => (
    state.groups ? state.groups[groupId] : null
  ));

  useEffect(() => {
    dispatch(groupDetailsFetch(groupId));
  }, [dispatch, groupId]);

  const updateCity = e => setCity(e.target.value);
  const updateState = e => setState(e.target.value);
  const updateName = e => setName(e.target.value);
  const updateAbout = e => setAbout(e.target.value);
  const updateType = e => setType(e.target.value);
  const updatePrivate = e => setIsPrivate(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      city,
      state,
      name,
      about,
      type,
      isPrivate
    };

    let createdGroup;
    try {
      createdGroup = await dispatch(groupUpdate(groupId, payload));
    } catch (error) { throw new Error() }
    if (createdGroup) history.push(`/groups/${createdGroup.id}`);
  };

  // SHORT CIRCUIT
  if (!group) return null;

  return (
    <>
      <h1>Update your Group</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <section>
            <input
              type='text'
              placeholder={group.city}
              required
              value={city}
              onChange={updateCity} />
            <input
              type='text'
              placeholder={group.state}
              required
              value={state}
              onChange={updateState} />
          </section>
          <section>
            <input
              type='text'
              placeholder={group.name}
              required
              value={name}
              onChange={updateName} />
          </section>
          <section>
            <input
              type='textarea'
              placeholder={group.about}
              required
              value={about}
              onChange={updateAbout} />
          </section>
          <section>
            <select onChange={updateType} value={type} placeholder={group.type}>
              <option value='Online'>Online</option>
              <option value='In person'>In person</option>
            </select>
            <select onChange={updatePrivate} value={isPrivate} placeholder={group.private ? 'Private' : 'Public'}>
              <option value={false}>Public</option>
              <option value={true}>Private</option>
            </select>
          </section>
          <button type="submit">Create Group</button>
        </form>
      </section>
    </>
  );
};

export default GroupUpdateForm;
