import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Link, Route, Switch } from "react-router-dom";
import * as sessionActions from "./store/session";
import Navigation from "./components/Navigation";
import GetAllGroups from "./components/AllGroups";
import GetGroupDetails from "./components/GroupDetails";
import GetGroupEvents from "./components/GroupEvents";
import GetEventDetails from "./components/EventDetails";
import GetAllEvents from "./components/AllEvents";
import GroupCreateForm from "./components/Forms/GroupCreateForm";
import GroupUpdateForm from "./components/Forms/GroupUpdateForm";

function App() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => setIsLoaded(true));
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      <div>
        <Link to='/groups'>All Groups</Link>
      </div>
      {isLoaded &&
        <Switch>
          <Route path='/groups/create'>
            <GroupCreateForm />
          </Route>
          <Route path='/groups/:groupId/events'>
            <GetGroupEvents />
          </Route>
          <Route path='/groups/:groupId/update'>
            <GroupUpdateForm />
          </Route>
          <Route path='/groups/:groupId'>
            <GetGroupDetails />
          </Route>
          <Route path='/groups'>
            <GetAllGroups />
          </Route>
          <Route path='/events/:eventId'>
            <GetEventDetails />
          </Route>
          <Route path='/events'>
            <GetAllEvents />
          </Route>
        </Switch>}
    </>
  );
}

export default App;
