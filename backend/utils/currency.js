const rates = {
  USD: { USD: 1, EUR: 0.9, COP: 4000, MXN: 17 },
  EUR: { USD: 1.11, EUR: 1, COP: 4400, MXN: 18.8 },
  COP: { USD: 0.00025, EUR: 0.00023, COP: 1, MXN: 0.0043 },
  MXN: { USD: 0.059, EUR: 0.053, COP: 232, MXN: 1 },
};

function convert(amount, from, to) {
  if (!rates[from] || !rates[from][to]) {
    throw new Error('Tipo de moneda no soportado');
  }
  return amount * rates[from][to];
}

module.exports = { convert, rates };
