import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { groupCreate } from '../../store/groups';
import './GroupCreateForm.css';

const GroupCreateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [name, setName] = useState('');
  const [about, setAbout] = useState('');
  const [type, setType] = useState('');
  const [isPrivate, setIsPrivate] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [errs, setErrs] = useState({});

  const updateCity = e => setCity(e.target.value);
  const updateState = e => setState(e.target.value);
  const updateName = e => setName(e.target.value);
  const updateAbout = e => setAbout(e.target.value);
  const updateType = e => setType(e.target.value);
  const updatePrivate = e => {
    console.log('INPUT VALUE: ', e.target.value);
    if (e.target.value === 'Private') setIsPrivate(true);
    if (e.target.value === 'Public') setIsPrivate(false);
  };

  let errRes;
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
    } catch (err) {
      errRes = await err.json();
      console.log('COMPONENT ERROR RESPONSE: ', errRes);
      setErrs(errRes.errors);
    }

    if (createdGroup) history.push(`/groups/${createdGroup.id}`);
  };

  console.log('ERROR STATE : ', errs);

  return (
    <>
      <h1>Start a New Group</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <section className='form-section'>
            <h2>Set your group's location</h2>
            <p>Meetup groups meet locally, in person, and online. We'll connect you with people in your area.</p>
            <div id='location-inputs'>
              <div>
                <input
                  type='text'
                  placeholder='City'
                  value={city}
                  onChange={updateCity} />
                {errs && errs.city &&
                  <p className='err-text'>City is required</p>
                }
              </div>
              <div>
                <input
                  type='text'
                  placeholder='State'
                  value={state}
                  onChange={updateState} />
                {errs && errs.state &&
                  <p className='err-text'>State is required</p>
                }
              </div>
            </div>
          </section>
          <section>
            <h2>What will your group's name be?</h2>
            <p>Choose a name that will give people a clear idea of what the group is about. Feel free to get creative! You can edit this later if you change your mind.</p>
            <input
              type='text'
              placeholder='What is your group name?'
              value={name}
              onChange={updateName} />
            {errs && errs.name &&
              <p className='err-text'>Name is required</p>
            }
          </section>
          <section>
            <h2>Describe the purpose of your group.</h2>
            <p>
              People will see this when we promote your group, but you'll be able to add to it later, too.
            </p>
            <p>1. What's the purpose of the group?</p>
            <p>2. Who should join?</p>
            <p>3. What will you do at your events?</p>
            <input
              type='textarea'
              placeholder='Please write at least 30 characters.'
              value={about}
              onChange={updateAbout} />
            {errs && errs.about &&
              <p className='err-text'>Description needs 30 or more characters</p>
            }
          </section>
          <section>
            <div>
              <p>Is this an in-person or online group?</p>
              <select
                onChange={updateType}
                value={type}
              >
                <option>(select one)</option>
                <option value='Online'>Online</option>
                <option value='In person'>In person</option>
              </select>
              {errs && errs.type &&
                <p className='err-text'>Group Type is required</p>
              }
            </div>
            <div>
              <p>Is this group private or public?</p>
              <select
                onChange={updatePrivate}
              >
                <option>(select one)</option>
                <option value={'Public'}>Public</option>
                <option value={'Private'}>Private</option>
              </select>
              {errs && errs.isPrivate &&
                <p className='err-text'>Visibility Type is required</p>
              }
            </div>
            <div>
              <input
                type='text'
                placeholder='Image Url'
                value={imgUrl}
              // onChange={updateImgUrl}
              />
              {errs && errs.city &&
                <p className='err-text'>Img url is required</p>
              }
            </div>
          </section>
          <button type="submit">Create Group</button>
        </form>
      </section>
    </>
  );
};

export default GroupCreateForm;
