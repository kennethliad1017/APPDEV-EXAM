export const formatDateString = (dateString) => {
  const date = new Date(dateString);
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = date.toLocaleDateString("en-US", options);
  return formattedDate;
};

export const parseFormattedDate = (formattedDate) => {
  const date = new Date(formattedDate);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear() % 100;

  const formattedMonth = month < 10 ? `0${month}` : month;
  const formattedDay = day < 10 ? `0${day}` : day;
  const formattedYear = year < 10 ? `0${year}` : year;

  return `${formattedMonth}/${formattedDay}/${formattedYear}`;
};

export const parseNumberString = (numberString) => {
  const cleanedString = numberString.toString().replace(/,/g, "");
  return parseFloat(cleanedString);
};

export function formatNumberWithCommas(number) {
  return number.toLocaleString();
}
