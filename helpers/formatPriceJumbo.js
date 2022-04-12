const formatPriceJumbo = (price) => {
  price = price.replace(/(\COP)/g, "");
  price = price.replace(/(\$)/g, "");
  price = price.replace(/(\,)/g, "");
  price = parseInt(price);
  return price;
}

export default formatPriceJumbo;