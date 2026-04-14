import {
  format,
  isToday,
  isYesterday,
  differenceInCalendarDays,
} from "date-fns";

const formatMsgTime = (timestamp) => {
  const date = new Date(timestamp);

  if (isToday(date)) {
    return format(date, "h:mm a");
  }

  if (isYesterday(date)) {
    return "Yesterday";
  }

  const daysDiff = differenceInCalendarDays(new Date(), date);
  if (daysDiff < 7) {
    return format(date, "EEEE");
  }
  return format(date, "d MMM yyyy");
};

export { formatMsgTime };
