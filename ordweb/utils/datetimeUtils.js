import React, { useEffect, useState } from 'react';
import moment from 'moment-timezone';

function convertToElapsedTime(postgresqlDatetime, userTimezone) {
  const createdDatetime = moment.tz(postgresqlDatetime, 'UTC'); // Parse datetime as UTC
  const now = moment().tz(userTimezone); // Use user's time zone

  // Calculate elapsed time
  const diff = now.diff(createdDatetime, 'seconds');

  if (diff < 60) {
    return `${diff}s`;
  } else if (diff < 3600) {
    return `${Math.ceil(diff / 60)}m`;
  } else if (diff < 86400) {
    return `${Math.ceil(diff / 3600)}h`;
  } else if (now.year() === createdDatetime.year()) {
    return createdDatetime.format('MMM D').toLowerCase();
  } else {
    return createdDatetime.format('MMM D YYYY').toLowerCase();
  }
}

function convertElapsedTime(postgresqlDatetime) {
  const [elapsedTime, setElapsedTime] = useState('');

  useEffect(() => {
    // Detect the user's time zone
    const userTimezone = moment.tz.guess();
    // const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // Replace with your PostgreSQL datetime
    const elapsedTime = convertToElapsedTime(postgresqlDatetime, userTimezone);
    setElapsedTime(elapsedTime);
  }, []);
  return elapsedTime;
}

export default convertElapsedTime;

