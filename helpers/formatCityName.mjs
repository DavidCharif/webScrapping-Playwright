const formatCityName = (name) => {
  name = name.toLowerCase();
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};
export default formatCityName;
