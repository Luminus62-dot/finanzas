// frontend/src/pages/CategoriesPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
  Alert,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa"; // <-- NUEVA LÍNEA: Importar íconos
import { toast } from "react-toastify"; // <-- NUEVA LÍNEA: Importar toast

const CategoriesPage = ({ token }) => {
  // <-- ELIMINADO 'message' y 'setMessage' de props
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Gasto"); // Default to Gasto
  const [editingCategory, setEditingCategory] = useState(null); // For editing existing categories

  // Fetch categories from backend
  const fetchCategories = useCallback(async () => {
    try {
      if (token) {
        axios.defaults.headers.common["x-auth-token"] = token;
      } else {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo."); // <-- USANDO TOAST
        return;
      }
      const res = await axios.get("${process.env.REACT_APP_BACKEND_URL}/api/categories");
      setCategories(res.data);
      // setMessage(''); // <-- ELIMINADO
    } catch (err) {
      console.error(
        "Error fetching categories:",
        err.response?.data?.msg || err.message
      );
      toast.error(
        `Error fetching categories: ${
          err.response?.data?.msg || "Network error"
        }`
      ); // <-- USANDO TOAST
    }
  }, [token]); // <-- Eliminado 'setMessage' de dependencias

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("${process.env.REACT_APP_BACKEND_URL}/api/categories", {
        name: newCategoryName,
        type: newCategoryType,
      });
      toast.success("Category added successfully!"); // <-- USANDO TOAST
      setNewCategoryName("");
      setNewCategoryType("Gasto"); // Reset default
      fetchCategories(); // Refresh categories list
    } catch (err) {
      toast.error(
        `Error adding category: ${err.response?.data?.msg || err.message}`
      ); // <-- USANDO TOAST
    }
  };

  // Start editing an existing category
  const startEditCategory = (category) => {
    setEditingCategory({ ...category }); // Set category to edit
  };

  // Cancel editing
  const cancelEditCategory = () => {
    setEditingCategory(null);
  };

  // Handle updating an existing category
  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;

    try {
      await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/categories/${editingCategory._id}`,
        {
          name: editingCategory.name,
          type: editingCategory.type,
        }
      );
      toast.success("Category updated successfully!"); // <-- USANDO TOAST
      setEditingCategory(null); // Exit edit mode
      fetchCategories(); // Refresh categories list
    } catch (err) {
      toast.error(
        `Error updating category: ${err.response?.data?.msg || err.message}`
      ); // <-- USANDO TOAST
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/categories/${id}`);
        toast.success("Category deleted successfully!"); // <-- USANDO TOAST
        fetchCategories(); // Refresh categories list
      } catch (err) {
        toast.error(
          `Error deleting category: ${err.response?.data?.msg || err.message}`
        ); // <-- USANDO TOAST
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center">Gestión de Categorías</h2>

      {/* Mensajes de éxito/error - ELIMINADO EL COMPONENTE ALERT */}
      {/* {message && (
        <Alert variant={message.includes('Error') ? 'danger' : 'success'} className="mb-4">
          {message}
        </Alert>
      )} */}

      {/* Formulario para Añadir/Editar Categoría */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">
            {editingCategory ? "Editar Categoría" : "Añadir Nueva Categoría"}
          </Card.Title>
          <Form
            onSubmit={
              editingCategory ? handleUpdateCategory : handleAddCategory
            }
          >
            <Row className="mb-3 g-3 align-items-end">
              <Col md={5}>
                <Form.Group controlId="categoryName">
                  <Form.Label>Nombre:</Form.Label>
                  <Form.Control
                    type="text"
                    value={
                      editingCategory ? editingCategory.name : newCategoryName
                    }
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            name: e.target.value,
                          })
                        : setNewCategoryName(e.target.value)
                    }
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group controlId="categoryType">
                  <Form.Label>Tipo:</Form.Label>
                  <Form.Control
                    as="select"
                    value={
                      editingCategory ? editingCategory.type : newCategoryType
                    }
                    onChange={(e) =>
                      editingCategory
                        ? setEditingCategory({
                            ...editingCategory,
                            type: e.target.value,
                          })
                        : setNewCategoryType(e.target.value)
                    }
                    required
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3} className="d-grid gap-2">
                <Button
                  variant={editingCategory ? "warning" : "primary"}
                  type="submit"
                >
                  {editingCategory ? "Guardar Cambios" : "Añadir Categoría"}
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

      {/* Listado de Categorías */}
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="text-center mb-3">Tus Categorías</Card.Title>
          {categories.length === 0 ? (
            <p className="text-center">
              No tienes categorías personalizadas. ¡Añade una!
            </p>
          ) : (
            <ListGroup variant="flush">
              {categories.map((category) => (
                <ListGroup.Item
                  key={category._id}
                  className="d-flex justify-content-between align-items-center"
                >
                  <span>
                    <strong>{category.name}</strong> ({category.type})
                  </span>
                  <div>
                    <Button
                      variant="info"
                      size="sm"
                      className="me-2"
                      onClick={() => startEditCategory(category)}
                    >
                      <FaEdit /> Editar {/* <-- ÍCONO */}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCategory(category._id)}
                    >
                      <FaTrashAlt /> Eliminar {/* <-- ÍCONO */}
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
