const dateInputFormat = dateProp => {
  const dateStr = new Date(dateProp).toLocaleDateString();
  const timeStr = new Date(dateProp).toLocaleTimeString();
  const dateInfo = dateStr.split('/');
  const newDateInfo = [];
  for (const str of dateInfo) {
    if (str.length < 2) {
      newDateInfo.push(`0${str}`);
    } else if (str.length > 2) {
      newDateInfo.unshift(str);
    } else newDateInfo.push(str);
  };
  const newDateStr = newDateInfo.join('-');
  const timeInfo = timeStr.split(':');
  const newTimeInfo = []
  for (let i = 0; i < 2; i++) {
    const str = timeInfo[i];
    if (str.length < 2) {
      newTimeInfo.push(`0${str}`);
    } else newTimeInfo.push(str);
  };
  const newTimeStr = newTimeInfo.join(':');
  return `${newDateStr}T${newTimeStr}`;
};

export default dateInputFormat;
