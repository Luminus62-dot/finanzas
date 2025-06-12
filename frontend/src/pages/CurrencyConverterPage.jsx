import React, { useState } from 'react';
import { Container, Form, Button, Card } from 'react-bootstrap';
import { convertCurrency } from '../services/currency';

const CurrencyConverterPage = () => {
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('EUR');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    if (!amount) return setError('Ingresa un monto');
    try {
      const data = await convertCurrency(amount, from, to);
      setResult(data.convertedAmount);
    } catch (err) {
      setError('Error al convertir moneda');
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Convertidor de Monedas</h2>
      <Card className="p-4 mx-auto" style={{ maxWidth: '400px' }}>
        <Form onSubmit={handleConvert}>
          <Form.Group className="mb-3">
            <Form.Label>Monto</Form.Label>
            <Form.Control
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>De</Form.Label>
            <Form.Select value={from} onChange={(e) => setFrom(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="COP">COP</option>
              <option value="MXN">MXN</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>A</Form.Label>
            <Form.Select value={to} onChange={(e) => setTo(e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="COP">COP</option>
              <option value="MXN">MXN</option>
            </Form.Select>
          </Form.Group>
          <div className="d-grid">
            <Button type="submit" variant="primary">
              Convertir
            </Button>
          </div>
        </Form>
        {error && <p className="text-danger mt-3">{error}</p>}
        {result !== null && (
          <p className="mt-3 text-center">
            Resultado: {parseFloat(result).toFixed(2)} {to}
          </p>
        )}
      </Card>
    </Container>
  );
};

export default CurrencyConverterPage;
