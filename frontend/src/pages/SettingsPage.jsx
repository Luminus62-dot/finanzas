// frontend/src/pages/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Card, Form, Button, Alert, Image } from 'react-bootstrap';
import { toast } from 'react-toastify';

const SettingsPage = ({ token }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [formError, setFormError] = useState('');

  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  const fetchUserProfile = useCallback(async () => {
    try {
      if (!token) {
        toast.error('Token no encontrado para el perfil. Por favor, inicia sesión de nuevo.');
        return;
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('DEBUG: SettingsPage - Enviando GET a /api/auth para perfil...'); // Debug
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/auth`);
      console.log('DEBUG: SettingsPage - Respuesta de /api/auth:', res.data); // Debug
      setUserProfile(res.data);
    } catch (err) {
      console.error('DEBUG: SettingsPage - Error al cargar perfil de usuario en Settings:', err.response?.data || err.message); // Debug
      toast.error(`Error al cargar el perfil: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);


  const handleChangePassword = async (e) => {
    e.preventDefault();
    setFormError('');

    if (newPassword !== confirmNewPassword) {
      setFormError('La nueva contraseña y la confirmación no coinciden.');
      return;
    }
    if (newPassword.length < 6) {
      setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      if (!token) {
        toast.error('No autenticado. Por favor, inicia sesión de nuevo.');
        return;
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('DEBUG: SettingsPage - Enviando PUT a /api/auth/change-password...'); // Debug
      const res = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/change-password`, {
        currentPassword,
        newPassword
      });
      console.log('DEBUG: SettingsPage - Respuesta de cambio de contraseña:', res.data); // Debug
      toast.success(res.data.msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      console.error('DEBUG: SettingsPage - Error al cambiar contraseña:', err.response?.data || err.message); // Debug
      const errorMsg = err.response?.data?.msg || 'Error al cambiar la contraseña.';
      setFormError(errorMsg);
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleProfilePictureUpload = async (e) => {
    e.preventDefault();
    if (!profilePictureFile) {
      toast.error('Por favor, selecciona una imagen para tu foto de perfil.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePicture', profilePictureFile);

    try {
      if (!token) {
        toast.error('No autenticado. Por favor, inicia sesión de nuevo.');
        return;
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('DEBUG: SettingsPage - Enviando PUT a /api/auth/profile-picture...'); // Debug
      const res = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/profile-picture`, formData);
      console.log('DEBUG: SettingsPage - Respuesta de subida de foto:', res.data); // Debug
      toast.success(res.data.msg);
      setProfilePictureFile(null);
      fetchUserProfile(); // Recargar el perfil para mostrar la nueva imagen
    } catch (err) {
      console.error('DEBUG: SettingsPage - Error al subir foto de perfil:', err.response?.data || err.message); // Debug
      const errorMsg = err.response?.data?.msg || 'Error al subir la foto de perfil.';
      toast.error(`Error: ${errorMsg}`);
    }
  };

  const handleBannerUpload = async (e) => {
    e.preventDefault();
    if (!bannerFile) {
      toast.error('Por favor, selecciona una imagen para tu banner.');
      return;
    }

    const formData = new FormData();
    formData.append('banner', bannerFile);

    try {
      if (!token) {
        toast.error('No autenticado. Por favor, inicia sesión de nuevo.');
        return;
      }
      axios.defaults.headers.common['x-auth-token'] = token;
      console.log('DEBUG: SettingsPage - Enviando PUT a /api/auth/banner...'); // Debug
      const res = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/auth/banner`, formData);
      console.log('DEBUG: SettingsPage - Respuesta de subida de banner:', res.data); // Debug
      toast.success(res.data.msg);
      setBannerFile(null);
      fetchUserProfile(); // Recargar el perfil para mostrar la nueva imagen
    } catch (err) {
      console.error('DEBUG: SettingsPage - Error al subir banner:', err.response?.data || err.message); // Debug
      const errorMsg = err.response?.data?.msg || 'Error al subir el banner.';
      toast.error(`Error: ${errorMsg}`);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Configuración de Usuario</h2>

      {formError && <Alert variant="danger">{formError}</Alert>}

      {/* Tarjeta para Cambiar Contraseña */}
      <Card className="shadow-sm mx-auto mb-4" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-3">Cambiar Contraseña</Card.Title>
          <Form onSubmit={handleChangePassword}>
            <Form.Group className="mb-3" controlId="currentPassword">
              <Form.Label>Contraseña Actual:</Form.Label>
              <Form.Control
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>Nueva Contraseña:</Form.Label>
              <Form.Control
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="confirmNewPassword">
              <Form.Label>Confirmar Nueva Contraseña:</Form.Label>
              <Form.Control
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-grid gap-2">
              <Button variant="primary" type="submit">
                Cambiar Contraseña
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Tarjeta para Subir Foto de Perfil */}
      <Card className="shadow-sm mx-auto mb-4" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-3">Foto de Perfil</Card.Title>
          <div className="text-center mb-3">
            {userProfile?.profilePictureUrl ? (
              <Image src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.profilePictureUrl}`} roundedCircle style={{ width: '120px', height: '120px', objectFit: 'cover', border: '2px solid #ddd' }} />
            ) : (
              <Image src="https://via.placeholder.com/120/ecf0f1/2c3e50?text=NP" roundedCircle style={{ width: '120px', height: '120px', objectFit: 'cover', border: '2px solid #ddd' }} />
            )}
          </div>
          <Form onSubmit={handleProfilePictureUpload}>
            <Form.Group controlId="profilePictureFile" className="mb-3">
              <Form.Label>Seleccionar nueva foto:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePictureFile(e.target.files[0])}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="success" type="submit" disabled={!profilePictureFile}>
                Subir Foto de Perfil
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Tarjeta para Subir Banner */}
      <Card className="shadow-sm mx-auto mb-4" style={{ maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-3">Banner del Perfil</Card.Title>
          <div className="text-center mb-3">
            {userProfile?.bannerUrl ? (
              <Image src={`${process.env.REACT_APP_BACKEND_URL}${userProfile.bannerUrl}`} fluid style={{ maxHeight: '150px', objectFit: 'cover', width: '100%', border: '2px solid #ddd' }} />
            ) : (
              <Image src="https://via.placeholder.com/500x150/f8f9fa/6c757d?text=Sin+Banner" fluid style={{ maxHeight: '150px', objectFit: 'cover', width: '100%', border: '2px solid #ddd' }} />
            )}
          </div>
          <Form onSubmit={handleBannerUpload}>
            <Form.Group controlId="bannerFile" className="mb-3">
              <Form.Label>Seleccionar nuevo banner:</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={(e) => setBannerFile(e.target.files[0])}
              />
            </Form.Group>
            <div className="d-grid gap-2">
              <Button variant="success" type="submit" disabled={!bannerFile}>
                Subir Banner
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

    </Container>
  );
};

export default SettingsPage;
