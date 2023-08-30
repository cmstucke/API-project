import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './index.css';

const LandingPage = () => {
  const sessionUser = useSelector(state => state.session.user);

  const startGroupElement = (
    <div
      id={sessionUser ? "start-group-linked" : "start-group-static"}
      className='lower-container'
    >
      <img
        className="lower-img"
        alt="Start a new group"
        src="https://thumbs.dreamstime.com/b/online-meetup-abstract-concept-vector-illustration-conference-call-join-group-video-service-distance-communication-informal-267314906.jpg"
      />
      <h3>Start a new group</h3>
      <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
    </div>
  );

  const sessionLink = (
    <Link to='/groups/create' className='lower-link'>
      {startGroupElement}
    </Link>
  );

  return (
    <>
      <div id="body-container">
        <div id="intro-container">
          <div id="intro-text">
            <h1 id="intro-title">The people platform—<br />Where interests<br />become friendships</h1>
            <p id='intro-description'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
          </div>
          <img
            id="intro-img"
            alt="Where interests become friedships"
            src="https://cdni.iconscout.com/illustration/premium/thumb/online-business-meetup-4217552-3524790.png"
          />
        </div>
        <div id="how-to-container">
          <h2>How Meetup Works</h2>
          <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
        </div>
        <div id='lower-body'>
          <Link to='/groups' className='lower-link'>
            <div id="see-groups-container" className='lower-container'>
              <img
                className="lower-img"
                alt="See all groups"
                src="https://img.freepik.com/premium-vector/online-meetup-concept-virtual-meeting-meetup-group-vector-illustration-flat_186332-879.jpg?w=2000"
              />
              <h3>See all groups</h3>
              <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
            </div>
          </Link>
          <Link to='/events' className='lower-link'>
            <div id="find-event-container" className='lower-container'>
              <img
                className="lower-img"
                alt="Find an event"
                src="https://cdni.iconscout.com/illustration/premium/thumb/friends-meetup-4769989-3972613.png"
              />
              <h3>Find an event</h3>
              <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.</p>
            </div>
          </Link>
          {sessionUser ? sessionLink : startGroupElement}
        </div>
        {!sessionUser && <button id='join-meetup-button'>Join Meetup</button>}
      </div >
    </>
  );
};

export default LandingPage;
