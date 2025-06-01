// frontend/src/pages/CategoriesPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Container, Row, Col, Form, Button, Card, ListGroup } from 'react-bootstrap';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CategoriesPage = ({ token }) => {
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryType, setNewCategoryType] = useState('Gasto');
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
      } else {
        toast.error('Token no encontrado. Por favor, inicia sesión de nuevo.');
        return;
      }
      console.log('DEBUG: CategoriesPage - Enviando GET a /api/categories...'); // Debug
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/categories`);
      console.log('DEBUG: CategoriesPage - Respuesta de /api/categories:', res.data); // Debug
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.error('DEBUG: CategoriesPage - La respuesta de /api/categories NO es un array:', res.data);
        setCategories([]);
        toast.error('Formato de datos de categorías inesperado.');
      }
    } catch (err) {
      console.error('DEBUG: CategoriesPage - Error al cargar categorías:', err.response?.data || err.message); // Debug
      toast.error(`Error al cargar categorías: ${err.response?.data?.msg || 'Error de red'}`);
    }
  }, [token]);

  useEffect(() => {
    console.log('DEBUG: CategoriesPage - Iniciando carga inicial de datos...'); // Debug
    fetchCategories();
  }, [fetchCategories]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      console.log('DEBUG: CategoriesPage - Enviando POST a /api/categories...'); // Debug
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/categories`, {
        name: newCategoryName,
        type: newCategoryType,
      });
      toast.success('Category added successfully!');
      setNewCategoryName('');
      setNewCategoryType('Gasto');
      fetchCategories();
    } catch (err) {
      console.error('DEBUG: CategoriesPage - Error al añadir categoría:', err.response?.data || err.message); // Debug
      toast.error(`Error adding category: ${err.response?.data?.msg || err.message}`);
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory({ ...category });
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      console.log('DEBUG: CategoriesPage - Enviando PUT a /api/categories/:id...'); // Debug
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${editingCategory._id}`, {
        name: editingCategory.name,
        type: editingCategory.type,
      });
      toast.success('Category updated successfully!');
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('DEBUG: CategoriesPage - Error al actualizar categoría:', err.response?.data || err.message); // Debug
      toast.error(`Error updating category: ${err.response?.data?.msg || err.message}`);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        console.log('DEBUG: CategoriesPage - Enviando DELETE a /api/categories/:id...'); // Debug
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${id}`);
        toast.success('Category deleted successfully!');
        fetchCategories();
      } catch (err) {
        console.error('DEBUG: CategoriesPage - Error al eliminar categoría:', err.response?.data || err.message); // Debug
        toast.error(`Error deleting category: ${err.response?.data?.msg || err.message}`);
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Categorías</h2>

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingCategory ? 'Editar Categoría' : 'Añadir Nueva Categoría'}
          </Card.Title>
          <Form onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}>
            <Row className="mb-3 g-3 align-items-end">
              <Col md={5}>
                <Form.Group controlId="categoryName">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingCategory ? editingCategory.name : newCategoryName}
                    onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, name: e.target.value }) : setNewCategoryName(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="categoryType">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={editingCategory ? editingCategory.type : newCategoryType}
                    onChange={(e) => editingCategory ? setEditingCategory({ ...editingCategory, type: e.target.value }) : setNewCategoryType(e.target.value)}
                    required
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3} className="d-grid gap-2">
                <Button variant={editingCategory ? 'warning' : 'primary'} type="submit">
                  {editingCategory ? 'Guardar Cambios' : 'Añadir Categoría'}
                </Button>
                {editingCategory && (
                  <Button variant="secondary" onClick={cancelEditCategory}>
                    Cancelar
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Tus Categorías</Card.Title>
          {console.log('DEBUG: CategoriesPage - Estado de categories ANTES del map:', categories)}
          {categories.length === 0 ? (
            <p className="text-center">No tienes categorías personalizadas. ¡Añade una!</p>
          ) : (
            <ListGroup variant="flush">
              {categories.map(category => (
                <ListGroup.Item key={category._id} className="d-flex justify-content-between align-items-center">
                  <span>
                    <strong>{category.name}</strong> ({category.type})
                  </span>
                  <div>
                    <Button variant="info" size="sm" className="me-2" onClick={() => startEditCategory(category)}>
                      <FaEdit /> Editar
                    </Button>
                    <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(category._id)}>
                      <FaTrashAlt /> Eliminar
                    </Button>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CategoriesPage;
