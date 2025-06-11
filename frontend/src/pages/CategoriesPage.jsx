// frontend/src/pages/CategoriesPage.jsx
import React, { useState, useEffect, useCallback, useContext } from "react";
import api from "../services/api";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  ListGroup,
} from "react-bootstrap";
import { FaEdit, FaTrashAlt } from "react-icons/fa";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const CategoriesPage = () => {
  const { token } = useContext(AuthContext);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState("Gasto");
  const [editingCategory, setEditingCategory] = useState(null);

  // NUEVO ESTADO para errores del formulario de categorías
  const [categoryFormErrors, setCategoryFormErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      if (!token) {
        toast.error("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      // console.log("DEBUG: CategoriesPage - Enviando GET a /api/categories...");
      const res = await api.get(`/categories`);
      if (Array.isArray(res.data)) {
        setCategories(res.data);
      } else {
        console.error(
          "DEBUG: CategoriesPage - La respuesta de /api/categories NO es un array:",
          res.data
        );
        setCategories([]);
        toast.error("Formato de datos de categorías inesperado.");
      }
    } catch (err) {
      console.error(
        "DEBUG: CategoriesPage - Error al cargar categorías:",
        err.response?.data || err.message
      );
      toast.error(
        `Error al cargar categorías: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    }
  }, [token]);

  useEffect(() => {
    // console.log("DEBUG: CategoriesPage - Iniciando carga inicial de datos...");
    fetchCategories();
  }, [fetchCategories]);

  // NUEVA FUNCIÓN DE VALIDACIÓN PARA EL FORMULARIO DE CATEGORÍAS
  const validateCategoryForm = (isEditing = false) => {
    const errors = {};
    const data = isEditing
      ? editingCategory
      : { name: newCategoryName, type: newCategoryType };

    if (!data.name || data.name.trim() === "") {
      errors.name = "El nombre de la categoría es requerido.";
    }
    if (!data.type) {
      errors.type = "El tipo de categoría es requerido.";
    }

    setCategoryFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!validateCategoryForm(false)) {
      // Validar para añadir
      return;
    }
    try {
      // console.log("DEBUG: CategoriesPage - Enviando POST a /api/categories...");
      await api.post(`/categories`, {
        name: newCategoryName,
        type: newCategoryType,
      });
      toast.success("Category added successfully!");
      setNewCategoryName("");
      setNewCategoryType("Gasto");
      fetchCategories();
      setCategoryFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error adding category: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const startEditCategory = (category) => {
    setEditingCategory({ ...category });
    setCategoryFormErrors({}); // Limpiar errores al iniciar edición
  };

  const cancelEditCategory = () => {
    setEditingCategory(null);
    setCategoryFormErrors({}); // Limpiar errores al cancelar
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!validateCategoryForm(true)) {
      // Validar para editar
      return;
    }

    try {
      // console.log(
//         "DEBUG: CategoriesPage - Enviando PUT a /api/categories/:id..."
//       );
      await api.put(`/categories/${editingCategory._id}`, {
        name: editingCategory.name,
        type: editingCategory.type,
      });
      toast.success("Category updated successfully!");
      setEditingCategory(null);
      fetchCategories();
      setCategoryFormErrors({}); // Limpiar errores después del éxito
    } catch (err) {
      toast.error(
        `Error updating category: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        // console.log(
//           "DEBUG: CategoriesPage - Enviando DELETE a /api/categories/:id..."
//         );
        await api.delete(`/categories/${id}`);
        toast.success("Category deleted successfully!");
        fetchCategories();
      } catch (err) {
        toast.error(
          `Error deleting category: ${err.response?.data?.msg || err.message}`
        );
      }
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4 text-center page-title">Gestión de Categorías</h2>

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
                    onChange={(e) => {
                      if (editingCategory) {
                        setEditingCategory({
                          ...editingCategory,
                          name: e.target.value,
                        });
                      } else {
                        setNewCategoryName(e.target.value);
                      }
                      setCategoryFormErrors({
                        ...categoryFormErrors,
                        name: "",
                      }); // Limpiar error al escribir
                    }}
                    isInvalid={!!categoryFormErrors.name} // Marcar como inválido
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    {categoryFormErrors.name}
                  </Form.Control.Feedback>
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
                    onChange={(e) => {
                      if (editingCategory) {
                        setEditingCategory({
                          ...editingCategory,
                          type: e.target.value,
                        });
                      } else {
                        setNewCategoryType(e.target.value);
                      }
                      setCategoryFormErrors({
                        ...categoryFormErrors,
                        type: "",
                      }); // Limpiar error
                    }}
                    isInvalid={!!categoryFormErrors.type} // Marcar como inválido
                    required
                  >
                    <option value="Gasto">Gasto</option>
                    <option value="Ingreso">Ingreso</option>
                  </Form.Control>
                  <Form.Control.Feedback type="invalid">
                    {categoryFormErrors.type}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={3} className="d-grid gap-2">
                <Button
                  variant={editingCategory ? "warning" : "primary"}
                  type="submit"
                  className="fancy-btn"
                >
                  {editingCategory ? "Guardar Cambios" : "Añadir Categoría"}
                </Button>
                {editingCategory && (
                  <Button variant="secondary" onClick={cancelEditCategory} className="fancy-btn">
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
                      className="me-2 fancy-btn"
                      onClick={() => startEditCategory(category)}
                    >
                      <FaEdit /> Editar
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteCategory(category._id)}
                      className="fancy-btn"
                    >
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
