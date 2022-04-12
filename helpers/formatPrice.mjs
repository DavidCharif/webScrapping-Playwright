const formatPrice = (price) => {
  let price2 = price.replace("$", "");
  let price3 = price2.replace(".", "");
  let price4 = parseInt(price3);
  return price4;
};
export default formatPrice;