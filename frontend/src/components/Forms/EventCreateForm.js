import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useHistory, useParams } from 'react-router-dom';
import { eventCreate } from '../../store/events';

const EventCreateForm = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const { groupId } = useParams();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [price, setPrice] = useState('0');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [venueId, setvenueId] = useState(null);
  const [capacity, setCapacity] = useState(10);

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
    } catch (error) { throw error };
    if (createdEvent) history.push(`/events/${createdEvent.id}`);
  };

  return (
    <>
      <h1>Create a new event</h1>
      <section>
        <form onSubmit={handleSubmit}>
          <section>
            <input
              type='text'
              placeholder='Event name'
              required
              value={name}
              onChange={updateName} />
          </section>
          <select onChange={updateType} value={type} defaultValue={'Online'}>
            <option value='Online'>Online</option>
            <option value='In person'>In person</option>
          </select>
          <section>
            <input
              type='numeric'
              placeholder='0'
              required
              value={price}
              onChange={updatePrice} />
          </section>
          <section>
            <input
              type='text'
              placeholder='MM/DD/YYYY, HH/mm PM'
              required
              value={startDate}
              onChange={updateStartDate} />
          </section>
          <section>
            <input
              type='text'
              placeholder='MM/DD/YYYY, HH/mm PM'
              required
              value={endDate}
              onChange={updateEndDate} />
          </section>
          <section>
            <input
              type='textarea'
              placeholder='Please write at least 30 characters.'
              required
              value={description}
              onChange={updateDescription} />
          </section>
          <button type="submit">Create Group</button>
        </form>
      </section>
    </>
  );
};

export default EventCreateForm;
