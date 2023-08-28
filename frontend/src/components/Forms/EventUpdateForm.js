import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { eventDetailsFetch, eventUpdate } from '../../store/events';
import './EventUpdateForm.css';

const EventUpdateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { eventId } = useParams();
  const event = useSelector(state => (
    state.events ? state.events[eventId] : null
  ));
  const inputContainerClass = 'event-update-input-container';

  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setvenueId] = useState(null);
  const [capacity, setCapacity] = useState(10);
  const [errs, setErrs] = useState({});

  useEffect(() => {
    dispatch(eventDetailsFetch(eventId));
  }, [dispatch, eventId]);

  useEffect(() => {
    if (event) {
      setName(event.name);
      setType(event.type);
      setPrice(event.price);
      setStartDate(event.startDate);
      setEndDate(event.endDate);
      setDescription(event.description);
      setvenueId(event.venueId);
      setCapacity(event.capacity);
    };
  }, [event]);

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
      createdEvent = await dispatch(eventUpdate(eventId, payload));
    } catch (err) {
      const { errors } = await err.json();
      setErrs(errors);
    };
    if (createdEvent) history.push(`/events/${createdEvent.id}`);
  };

  // DATE AND TIME FORMAT
  if (event) {
    event.startDateStr = new Date(event.startDate)
      .toString()
      .split(', ')
      .join(' · ');
    event.endDateStr = new Date(event.endDate)
      .toLocaleString()
      .split(', ')
      .join(' · ');
  };

  console.log('START DATE', event.startDateStr)

  // SHORT CIRCUIT
  if (!event) return null;

  return (
    <>
      <div id='body-container'>
        <h1>Update Your Event</h1>
        <form
          id='event-update-form'
          onSubmit={handleSubmit}
        >
          <label className={inputContainerClass}>
            What is the name of your event?
            <input
              type='text'
              placeholder={event.name}
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </label>
          {errs.name && <p className='error-text'>Name must be at least 5 characters</p>}
          <label className={inputContainerClass}>
            Is this an in person or online event?
            <select
              value={type}
              placeholder={event.type}
              onChange={e => setType(e.target.value)}
            >
              <option value='Online'>Online</option>
              <option value='In person'>In person</option>
            </select>
          </label>
          <label className={inputContainerClass}>
            What is the price of your event?
            <input
              type='number'
              placeholder={event.price}
              value={price}
              onChange={e => setPrice(e.target.value)}
            />
          </label>
          {errs.price && <p className='error-text'>Price is required</p>}
          <label className={inputContainerClass}>
            When does your event start?
            <input
              type='datetime-local'
              placeholder={event.startDateStr}
              value={event.startDateStr}
              onChange={e => setStartDate(e.target.value)}
            />
          </label>
          {errs.startDate && <p className='error-text'>Start date is required</p>}
          <label className={inputContainerClass}>
            When does your event end?
            <input
              type='text'
              placeholder={event.endDateStr}
              value={event.endDate}
              onChange={e => setEndDate(e.target.value)}
            />
          </label>
          <label className={inputContainerClass}>
            Please describe your event.
            <input
              type='text'
              placeholder={event.description}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </label>
          <button className='form-submit-button' type="submit">Update Event</button>
        </form>
      </div>
    </>
  );
};

export default EventUpdateForm;
