import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import LandingPage from "./components/Landing";
import Navigation from "./components/Navigation";
import GetAllGroups from "./components/AllGroups";
import GetGroupDetails from "./components/GroupDetails";
import GetGroupEvents from "./components/GroupEvents";
import GetEventDetails from "./components/EventDetails";
import GetAllEvents from "./components/AllEvents";
import GroupCreateForm from "./components/Forms/GroupCreateForm";
import GroupUpdateForm from "./components/Forms/GroupUpdateForm";
import EventCreateForm from "./components/Forms/EventCreateForm";
import EventUpdateForm from "./components/Forms/EventUpdateForm";
import { groupsFetch } from "./store/groups";


function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  const allGroups = useSelector(state => (
    state.groups.allGroups ?
      state.groups.allGroups :
      {}
  ));

  const store = useSelector(store => store);
  console.log('STORE: ', store);

  useEffect(() => {
    dispatch(sessionActions.restoreUser());
    dispatch(groupsFetch()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded &&
        <Switch>
          <Route path='/groups/create'>
            <GroupCreateForm />
          </Route>
          <Route path='/groups/:groupId/events/create'>
            <EventCreateForm />
          </Route>
          <Route path='/groups/:groupId/events'>
            <GetGroupEvents />
          </Route>
          <Route path='/groups/:groupId/update'>
            <GroupUpdateForm />
          </Route>
          <Route path='/groups/:groupId'>
            <GetGroupDetails allGroups={allGroups} />
          </Route>
          <Route path='/groups'>
            <GetAllGroups allGroups={allGroups} />
          </Route>
          <Route path='/events/:eventId/update'>
            <EventUpdateForm />
          </Route>
          <Route path='/events/:eventId'>
            <GetEventDetails />
          </Route>
          <Route path='/events'>
            <GetAllEvents />
          </Route>
          <Route exact path='/'>
            <LandingPage />
          </Route>
        </Switch>}
    </>
  );
}

export default App;
