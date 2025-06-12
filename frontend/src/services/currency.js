import api from './api';

export const convertCurrency = async (amount, from, to) => {
  const res = await api.get('/currency/convert', { params: { amount, from, to } });
  return res.data;
};
