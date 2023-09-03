import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { eventCreate } from '../../store/events';
import { groupDetailsFetch } from '../../store/groups';
import './EventCreateForm.css';

const EventCreateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();
  const group = useSelector((state) => (
    state.groups.singleGroup ? state.groups.singleGroup : null
  ));

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [errs, setErrs] = useState({});
  // const venueId = null;
  const capacity = 10;

  let startDateTime;
  if (startDate) {
    const startDateStr = new Date(startDate);
    startDateTime = startDateStr.getTime();
  }
  // console.log('START DATE TIME', startDateTime)

  let endDateTime;
  if (endDate) {
    const endDateStr = new Date(endDate);
    endDateTime = endDateStr.getTime();
  }
  // console.log('START DATE TIME', startDateTime)

  useEffect(() => {
    dispatch(groupDetailsFetch(groupId));
  }, [dispatch, groupId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      type,
      price,
      startDate: new Date(startDate),
      startDateTime,
      endDate: new Date(endDate),
      endDateTime,
      description,
      venueId: null,
      capacity,
      url: imgUrl
    };

    let createdEvent;
    try {
      createdEvent = await dispatch(eventCreate(groupId, payload));
    } catch (err) {
      const { errors } = await err.json();
      setErrs(errors);
    };
    if (createdEvent) history.push(`/events/${createdEvent.id}`);
  };

  // SHORT CIRCUIT
  if (!group) return null;

  return (
    <>
      <div id='group-form-body-container'>
        <div id='group-form-container'>
          {group && <h1>Create a new event for {group.name}</h1>}
          <section>
            <form onSubmit={handleSubmit}>
              <section>
                <p className='group-form-p'>What is the name of your event?</p>
                <input
                  type='text'
                  placeholder='Event name'
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
                {errs && errs.name &&
                  <p className='error-text'>Name is required</p>
                }
              </section>
              <section className='group-form-section'>
                <p className='group-form-p'>Is this an in person or online group?</p>
                <select
                  onChange={e => setType(e.target.value)}
                  value={type}
                >
                  <option>(select one)</option>
                  <option value='Online'>Online</option>
                  <option value='In person'>In person</option>
                </select>
                {errs && errs.type &&
                  <p className='error-text'>Event Type is required</p>
                }
                <p className='group-form-p'>What is the price for your event?</p>
                <div id='price-input-container'>
                  <span id='price-input-currency'>$</span>
                  <input
                    id='price-input'
                    type='number'
                    min={0}
                    max={999.99}
                    step={.01}
                    placeholder={0.00}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                  />
                </div>
                {errs && errs.price &&
                  <p className='error-text'>Price is required</p>
                }
              </section>
              <section className='group-form-section'>
                <p className='group-form-p'>When does your event start?</p>
                <input
                  type='text'
                  placeholder='MM/DD/YYYY, HH/mm PM'
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                />
                {errs && errs.startDate &&
                  <p className='error-text'>{errs.startDate}</p>
                }
                <p className='group-form-p'>When does your event end?</p>
                <input
                  type='text'
                  placeholder='MM/DD/YYYY, HH/mm PM'
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                />
                {errs && errs.endDate &&
                  <p className='error-text'>{errs.endDate}</p>
                }
              </section>
              <section className='group-form-section'>
                <p className='group-form-p'>Please add an image url for your event below:</p>
                <input
                  type='url'
                  placeholder='Image URL'
                  value={imgUrl}
                  onChange={e => setImgUrl(e.target.value)}
                />
                {errs && errs.url &&
                  <p className='error-text'>{errs.url}</p>
                }
              </section>
              <section className='group-form-section'>
                <p className='group-form-p'>Please describe your event</p>
                <input
                  type='textarea'
                  placeholder='Please write at least 30 characters.'
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
                {errs && errs.description &&
                  <p className='error-text'>Description needs 30 or more characters</p>
                }
              </section>
              <button
                type="submit"
                className='group-submit-button'
              >Create Event</button>
            </form>
          </section>
        </div>
      </div>
    </>
  );
};

export default EventCreateForm;
