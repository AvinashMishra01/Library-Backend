export const calculateEndDate = (startDate, durationInDays) => {
  let active= false;
  const start = new Date(startDate);   // e.g. "2025-10-05"
  const end = new Date(start);         // clone start date
  end.setDate(end.getDate() + durationInDays); 
if(end >= Date.now())
{
  active=true;
}else{
  active=false;
}

  return{ planEnd: end, planActive: active}; // will return "2025-11-04" if start is "2025-10-05" and duration 30
};