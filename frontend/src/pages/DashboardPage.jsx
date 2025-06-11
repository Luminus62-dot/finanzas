// frontend/src/pages/DashboardPage.jsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import api from '../services/api';
import { Container, Row, Col, Card, Alert, ListGroup, Image, ProgressBar } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';

const DashboardPage = () => {
  const { token } = useContext(AuthContext);
  const [totalBalance, setTotalBalance] = useState(0);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [savingGoals, setSavingGoals] = useState([]);
  const [upcomingSubs, setUpcomingSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Función para cargar los datos del perfil del usuario
  const fetchUserProfile = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado para el perfil. Por favor, inicia sesión de nuevo.');
        return;
      }
      // console.log('DEBUG: DashboardPage - Enviando GET a /api/auth para perfil...'); // Debug
      const res = await api.get('/auth');
      // console.log('DEBUG: DashboardPage - Respuesta de /api/auth:', res.data); // Debug
      setUserProfile(res.data);
    } catch (err) {
      console.error('DEBUG: DashboardPage - Error al cargar perfil de usuario:', err.response?.data || err.message); // Debug
      setError('Error al cargar el perfil de usuario.');
      toast.error(`Error al cargar el perfil: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  // Función para cargar el saldo total de las cuentas
  const fetchTotalBalance = useCallback(async () => {
    try {
      if (!token) return;
      // console.log('DEBUG: DashboardPage - Enviando GET a /api/accounts para balance...'); // Debug
      const res = await api.get('/accounts');
      // console.log('DEBUG: DashboardPage - Respuesta de /api/accounts (balance):', res.data); // Debug
      // Asegurarse de que res.data sea un array antes de reducir
      if (Array.isArray(res.data)) {
        const sum = res.data.reduce((acc, account) => acc + account.balance, 0);
        setTotalBalance(sum);
      } else {
        console.error('DEBUG: DashboardPage - La respuesta de /api/accounts NO es un array:', res.data);
        setTotalBalance(0); // Establecer 0 si no es array
        toast.error('Formato de datos de balance inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: DashboardPage - Error al cargar balance total:', err.response?.data || err.message); // Debug
      setError('Error al cargar el balance total.');
      toast.error(`Error al cargar balance total: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  // Función para cargar las transacciones recientes
  const fetchRecentTransactions = useCallback(async () => {
    try {
      if (!token) return;
      // console.log('DEBUG: DashboardPage - Enviando GET a /api/transactions para recientes...'); // Debug
      const res = await api.get('/transactions');
      // console.log('DEBUG: DashboardPage - Respuesta de /api/transactions (recientes):', res.data); // Debug
      // Asegurarse de que res.data sea un array
      if (Array.isArray(res.data)) {
        setRecentTransactions(res.data.slice(0, 5)); // Mostrar solo las 5 más recientes
      } else {
        console.error('DEBUG: DashboardPage - La respuesta de /api/transactions NO es un array:', res.data);
        setRecentTransactions([]); // Establecer array vacío
        toast.error('Formato de datos de transacciones recientes inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: DashboardPage - Error al cargar transacciones recientes:', err.response?.data || err.message); // Debug
      setError('Error al cargar las transacciones recientes.');
      toast.error(`Error al cargar transacciones recientes: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  // Función para cargar las metas de ahorro
  const fetchSavingGoals = useCallback(async () => {
    try {
      if (!token) return;
      const res = await api.get('/savinggoals');
      if (Array.isArray(res.data)) {
        setSavingGoals(res.data);
      } else {
        console.error('DEBUG: DashboardPage - La respuesta de /api/savinggoals NO es un array:', res.data);
        setSavingGoals([]);
        toast.error('Formato de datos de metas de ahorro inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: DashboardPage - Error al cargar metas de ahorro:', err.response?.data || err.message);
      setError('Error al cargar las metas de ahorro.');
      toast.error(`Error al cargar metas de ahorro: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  // Suscripciones próximas a vencer (siguientes 7 días)
  const fetchUpcomingSubs = useCallback(async () => {
    try {
      if (!token) return;
      const res = await api.get('/subscriptions');
      if (Array.isArray(res.data)) {
        const today = new Date();
        const inSeven = new Date();
        inSeven.setDate(today.getDate() + 7);
        const upcoming = res.data.filter(sub => {
          const date = new Date(sub.nextBillingDate);
          return date >= today && date <= inSeven;
        }).slice(0, 5);
        setUpcomingSubs(upcoming);
      } else {
        console.error('DEBUG: DashboardPage - La respuesta de /subscriptions NO es un array:', res.data);
        setUpcomingSubs([]);
      }
    } catch (err) {
      console.error('DEBUG: DashboardPage - Error al cargar suscripciones próximas:', err.response?.data || err.message);
      toast.error(`Error al cargar suscripciones: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      setError('');
      // console.log('DEBUG: DashboardPage - Iniciando carga de datos...'); // Debug
      await Promise.all([
        fetchUserProfile(),
        fetchTotalBalance(),
        fetchRecentTransactions(),
        fetchSavingGoals(),
        fetchUpcomingSubs(),
      ]);
      setLoading(false);
      // console.log('DEBUG: DashboardPage - Carga de datos finalizada.'); // Debug
    };

    loadDashboardData();
  }, [
    fetchUserProfile,
    fetchTotalBalance,
    fetchRecentTransactions,
    fetchSavingGoals,
    fetchUpcomingSubs,
  ]);

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Dashboard de Mi Dinero Hoy</h2>

      {error && <Alert variant="danger" className="text-center">{error}</Alert>}

      {loading ? (
        <p className="text-center">Cargando datos del dashboard...</p>
      ) : (
        <Row className="g-4">
          {/* Sección de Perfil (Banner y Foto) */}
          <Col xs={12}>
            <Card className="shadow-sm overflow-hidden">
              {/* Área del Banner */}
              <div
                style={{
                  height: '150px',
                  backgroundColor: '#3498db',
                  backgroundImage: userProfile?.bannerUrl
                    ? `url(${process.env.REACT_APP_API_URL}${userProfile.bannerUrl})`
                    : 'url(https://picsum.photos/800/150)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  position: 'relative'
                }}
              >
                {/* Foto de Perfil */}
                <Image
                  src={userProfile?.profilePictureUrl
                    ? `${process.env.REACT_APP_API_URL}${userProfile.profilePictureUrl}`
                    : 'https://picsum.photos/100'}
                  roundedCircle
                  className="border border-white border-3"
                  style={{
                    position: 'absolute',
                    bottom: '-50px',
                    left: '20px',
                    width: '100px',
                    height: '100px',
                    objectFit: 'cover'
                  }}
                />
              </div>
              <Card.Body className="pt-5 pb-3 ps-4">
                <Card.Title className="mb-1">
                  {userProfile ? `${userProfile.firstName} ${userProfile.lastName}` : 'Usuario Desconocido'}
                </Card.Title>
                <Card.Text className="text-muted small">
                  {userProfile ? userProfile.email : ''}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta de Balance Total */}
          <Col md={6} lg={4}>
            <Card className="shadow-sm h-100 bg-primary text-white">
              <Card.Body className="text-center d-flex flex-column justify-content-center">
                <Card.Title className="mb-2 fs-4">Balance Total de Cuentas</Card.Title>
                <Card.Text className="display-4 fw-bold">
                  {totalBalance.toFixed(2)} USD
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta de Últimas Transacciones */}
          <Col md={6} lg={8}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="mb-3 text-center">Últimas Transacciones</Card.Title>
                {recentTransactions.length === 0 ? (
                  <p className="text-center text-muted">No hay transacciones recientes.</p>
                ) : (
                  <ListGroup variant="flush">
                    {/* El .slice(0,5) garantiza que siempre es un array en este punto, el check de Array.isArray está en fetchRecentTransactions */}
                    {recentTransactions.map(trans => (
                      <ListGroup.Item key={trans._id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong className={trans.type === 'Ingreso' ? 'text-success' : trans.type === 'Gasto' ? 'text-danger' : 'text-info'}>
                            {trans.type}: {trans.amount.toFixed(2)} {trans.account?.currency || 'USD'}
                          </strong>
                          <div className="text-muted" style={{ fontSize: '0.85em' }}>
                            {trans.description || trans.category || 'Sin descripción'}
                          </div>
                        </div>
                        <small className="text-muted">{new Date(trans.date).toLocaleDateString()}</small>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Tarjeta de Metas de Ahorro */}
          <Col xs={12}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="mb-3 text-center">Progreso de Metas de Ahorro</Card.Title>
                {savingGoals.length === 0 ? (
                  <p className="text-center text-muted">No tienes metas de ahorro.</p>
                ) : (
                  <ListGroup variant="flush">
                    {savingGoals.slice(0, 3).map(goal => {
                      const progress = (goal.currentAmount / goal.targetAmount) * 100;
                      return (
                        <ListGroup.Item key={goal._id}>
                          <div className="d-flex justify-content-between">
                            <strong>{goal.name}</strong>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                          <ProgressBar
                            now={Math.min(100, progress)}
                            variant={progress >= 100 ? 'success' : 'primary'}
                            className="mt-1"
                            style={{ height: '8px' }}
                          />
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Suscripciones próximas a pagar */}
          <Col xs={12}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                <Card.Title className="mb-3 text-center">Suscripciones por vencer</Card.Title>
                {upcomingSubs.length === 0 ? (
                  <p className="text-center text-muted">Sin pagos próximos.</p>
                ) : (
                  <ListGroup variant="flush">
                    {upcomingSubs.map(sub => (
                      <ListGroup.Item key={sub._id} className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{sub.name}</strong>
                          <div className="text-muted" style={{ fontSize: '0.85em' }}>
                            {new Date(sub.nextBillingDate).toLocaleDateString()} - ${sub.amount.toFixed(2)}
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default DashboardPage;
