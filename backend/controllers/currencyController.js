const { convert } = require('../utils/currency');

exports.convertCurrency = (req, res) => {
  const { amount, from, to } = req.query;

  if (!amount || !from || !to) {
    return res.status(400).json({ msg: 'Parámetros incompletos' });
  }

  const num = parseFloat(amount);
  if (isNaN(num)) {
    return res.status(400).json({ msg: 'Cantidad inválida' });
  }

  try {
    const converted = convert(num, from, to);
    res.json({ amount: num, from, to, convertedAmount: converted });
  } catch (err) {
    res.status(400).json({ msg: err.message });
  }
};
