import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { groupCreate } from '../../store/groups';

const GroupCreateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

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
      createdGroup = await dispatch(groupCreate(payload));
    } catch (error) { throw new Error() }
    if (createdGroup) history.push(`/groups/${createdGroup.id}`);
  };

  return (
    <>
      <h1>Start a New Group</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <section>
            <input
              type='text'
              placeholder='City'
              required
              value={city}
              onChange={updateCity} />
            <input
              type='text'
              placeholder='State'
              required
              value={state}
              onChange={updateState} />
          </section>
          <section>
            <input
              type='text'
              placeholder='What is your group name?'
              required
              value={name}
              onChange={updateName} />
          </section>
          <section>
            <input
              type='textarea'
              placeholder='Please write at least 30 characters.'
              required
              value={about}
              onChange={updateAbout} />
          </section>
          <section>
            <select onChange={updateType} value={type} defaultValue={'Online'}>
              <option value='Online'>Online</option>
              <option value='In person'>In person</option>
            </select>
            <select onChange={updatePrivate} value={isPrivate} defaultValue={false}>
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

export default GroupCreateForm;
