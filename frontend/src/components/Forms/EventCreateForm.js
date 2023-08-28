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
  // const [groupState, setGroupState] = useState('');
  const group = useSelector((state) => (
    state.groups ? state.groups[groupId] : null
  ));

  useEffect(() => {
    dispatch(groupDetailsFetch(groupId));
  }, [dispatch, groupId]);

  console.log('GROUP STATE: ', group);

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setvenueId] = useState(null);
  const [capacity, setCapacity] = useState(10);
  const [errs, setErrs] = useState({});

  const updateName = e => setName(e.target.value);
  const updateType = e => setType(e.target.value);
  const updatePrice = e => setPrice(e.target.value);
  const updateStartDate = e => setStartDate(e.target.value);
  const updateEndDate = e => setEndDate(e.target.value);
  const updateDescription = e => setDescription(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      type,
      price,
      startDate,
      endDate,
      description,
      venueId,
      capacity,
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

  console.log('ERRORS STATE: ', errs);

  // // SHORT CIRCUIT
  // if (!group) return null;

  return (
    <>
      {group && <h1>Create a new event for {group.name}</h1>}
      <section>
        <form onSubmit={handleSubmit}>
          <section>
            <p>What is the name of your event?</p>
            <input
              type='text'
              placeholder='Event name'
              value={name}
              onChange={updateName}
            />
            {errs && errs.name &&
              <p className='error-text'>Name is required</p>
            }
          </section>
          <p>Is this an in person or online group?</p>
          <select
            onChange={updateType}
            value={type}
          >
            <option>(select one)</option>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
          {errs && errs.type &&
            <p className='error-text'>Event Type is required</p>
          }
          <section>
            <p>What is the price for your event?</p>
            <input
              type='numeric'
              placeholder='0.00'
              value={price}
              onChange={updatePrice} />
            {errs && errs.price &&
              <p className='error-text'>Price is required</p>
            }
          </section>
          <section>
            <p>When does your event start?</p>
            <input
              type='text'
              placeholder='MM/DD/YYYY, HH/mm PM'
              value={startDate}
              onChange={updateStartDate}
            />
            {errs && errs.startDate &&
              <p className='error-text'>Event start date and time required</p>
            }
          </section>
          <section>
            <p>When does your event end?</p>
            <input
              type='text'
              placeholder='MM/DD/YYYY, HH/mm PM'
              value={endDate}
              onChange={updateEndDate} />
            {errs && errs.endDate &&
              <p className='error-text'>Event end date and time required</p>
            }
          </section>
          <section>
            <p>Please describe your event</p>
            <input
              type='textarea'
              placeholder='Please write at least 30 characters.'
              value={description}
              onChange={updateDescription}
            />
            {errs && errs.description &&
              <p className='error-text'>Description needs 30 or more characters</p>
            }
          </section>
          <button type="submit">Create Event</button>
        </form>
      </section>
    </>
  );
};

export default EventCreateForm;
