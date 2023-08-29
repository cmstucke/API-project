const getTimeHelper = dateData => {
  const date = new Date(dateData);
  return date.getTime();
};

export const eventSort = events => {
  // console.log('ALL EVENTS: ', allEvents)
  const allUpcoming = [];
  const allPast = [];
  for (const event of events) {
    const now = Date.now();
    const start = new Date(event.startDate).getTime();
    if (now < start) {
      allUpcoming.push(event);
    } else {
      allPast.push(event);
    };
  };
  const allUpcomingSort = allUpcoming.sort((a, b) => (
    getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
  ));
  const allPastSort = allPast.sort((a, b) => (
    getTimeHelper(a.startDate) - getTimeHelper(b.startDate)
  ));
  return ({ allUpcomingSort, allPastSort });
};

export const addDateStr = events => {
  for (const event of events) {
    const date = new Date(event.startDate).toLocaleDateString();
    const time = new Date(event.startDate).toLocaleTimeString();
    event.startDateStr = date;
    event.startTimeStr = time;
  };
  return events;
};
