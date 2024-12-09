import { Badge, Calendar, HStack, List, Stack, VStack } from "rsuite";
import InfoIcon from "@mui/icons-material/Info";

export function getEventsDays(date, events) {
  if (!date) return [];

  let formattedDate = date.toLocaleDateString();

  // Filter the events that match the input date
  const matchingEvents = events.filter((event) => {
    const eventDate = new Date(event.date).toLocaleDateString();
    return eventDate === formattedDate;
  });

  // Map the matching events to extract their titles and times
  return matchingEvents.map((event) => ({
    title: event.title,
    time: formatTime(event.date),
  }));
}

/**
 * Formats time from a date object in this form: (2024-09-29T22:00:00.000Z) and returns
 * the {hour minutes and am/pm format}
 * @returns the hour, minutes and am/pm from date object
 */
export function formatTime(dateString) {
  const date = new Date(dateString);
  let hours = date.getHours(); // Get hours (0-23)
  const minutes = date.getMinutes().toString().padStart(2, "0"); // Get minutes (pad single digits)

  // Determine AM or PM and adjust hours for 12-hour format
  const amPm = hours >= 12 ? "pm" : "am";
  hours = hours % 12 || 12; // Convert 0 to 12 for midnight

  return `${hours}:${minutes} ${amPm}`;
}

export function renderCells(date, events) {
  const list = getEventsDays(date, events);

  if (list.length) {
    return <Badge className="calendar-todo-item-badge" color="orange" />;
  }

  return null;
}

export const TodoList = ({ date, events}) => {
  const list = getEventsDays(date, events);

  if (!list.length) {
    return (
      <div className="tw-text-dark-sky-blue tw-flex tw-flex-1 tw-items-center tw-p-4 tw-ml-2 tw-gap-2">
        <InfoIcon />
        <p>No events scheduled</p>
      </div>
    );
  }

  return (
    <List bordered>
      {list.map((item, index) => (
        <List.Item key={index} index={index}>
          <div className="tw-text-light-sky-blue">{item.time}</div>
          <div className="tw-text-dark-sky-blue">{item.title}</div>
        </List.Item>
      ))}
    </List>
  );
};

/**
 * Convert from database date format to greek style format (DD/MM/YYYY)
 * @param {string} dateString
 **/
export function convertToGreekDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB"); // "30/10/2024"
}
