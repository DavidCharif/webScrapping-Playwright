const formatDate = (date) => {
  date = date.toLocaleDateString();        
  date = date.replace(/\//g, "-");
  return date;
}
export default formatDate;