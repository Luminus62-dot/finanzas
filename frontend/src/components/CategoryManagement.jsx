// frontend/src/components/CategoryManagement.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";

const CategoryManagement = ({ token, setMessage }) => {
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
        // Handle token absence, though App.js should catch this
        // For robustness, you might want to call onLogout() here if token is explicitly missing
        return;
      }
      const res = await axios.get("http://localhost:5000/api/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(
        "Error fetching categories:",
        err.response?.data?.msg || err.message
      );
      setMessage(
        `Error fetching categories: ${
          err.response?.data?.msg || "Network error"
        }`
      );
      // If unauthorized, you might want to force logout here as well
      if (err.response && err.response.status === 401) {
        // This component doesn't have direct access to onLogout from App.js,
        // but you could emit an event or pass onLogout down from AccountDashboard
        // For now, AccountDashboard's useEffect will catch expired tokens on its fetches.
      }
    }
  }, [token, setMessage]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Handle adding a new category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/categories", {
        name: newCategoryName,
        type: newCategoryType,
      });
      setMessage("Category added successfully!");
      setNewCategoryName("");
      setNewCategoryType("Gasto"); // Reset default
      fetchCategories(); // Refresh categories list
    } catch (err) {
      setMessage(
        `Error adding category: ${err.response?.data?.msg || err.message}`
      );
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
        `http://localhost:5000/api/categories/${editingCategory._id}`,
        {
          name: editingCategory.name,
          type: editingCategory.type,
        }
      );
      setMessage("Category updated successfully!");
      setEditingCategory(null); // Exit edit mode
      fetchCategories(); // Refresh categories list
    } catch (err) {
      setMessage(
        `Error updating category: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  // Handle deleting a category
  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await axios.delete(`http://localhost:5000/api/categories/${id}`);
        setMessage("Category deleted successfully!");
        fetchCategories(); // Refresh categories list
      } catch (err) {
        setMessage(
          `Error deleting category: ${err.response?.data?.msg || err.message}`
        );
      }
    }
  };

  return (
    <div
      style={{
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        marginTop: "30px",
      }}
    >
      <h3
        style={{
          borderBottom: "1px solid #eee",
          paddingBottom: "10px",
          marginBottom: "20px",
        }}
      >
        Manage Categories
      </h3>

      {/* Form for Add/Edit Category */}
      <div style={{ marginBottom: "30px" }}>
        <h4>{editingCategory ? "Edit Category" : "Add New Category"}</h4>
        <form
          onSubmit={editingCategory ? handleUpdateCategory : handleAddCategory}
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "flex-end",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                textAlign: "left",
              }}
            >
              Name:
            </label>
            <input
              type="text"
              value={editingCategory ? editingCategory.name : newCategoryName}
              onChange={(e) =>
                editingCategory
                  ? setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  : setNewCategoryName(e.target.value)
              }
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minWidth: "150px",
              }}
            />
          </div>
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                textAlign: "left",
              }}
            >
              Type:
            </label>
            <select
              value={editingCategory ? editingCategory.type : newCategoryType}
              onChange={(e) =>
                editingCategory
                  ? setEditingCategory({
                      ...editingCategory,
                      type: e.target.value,
                    })
                  : setNewCategoryType(e.target.value)
              }
              required
              style={{
                padding: "8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                minWidth: "150px",
              }}
            >
              <option value="Gasto">Gasto</option>
              <option value="Ingreso">Ingreso</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: "8px 15px",
              backgroundColor: editingCategory ? "#ffc107" : "#007bff",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            {editingCategory ? "Save Changes" : "Add Category"}
          </button>
          {editingCategory && (
            <button
              type="button"
              onClick={cancelEditCategory}
              style={{
                padding: "8px 15px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* List of Categories */}
      <div>
        <h4>Your Categories</h4>
        {categories.length === 0 ? (
          <p>No custom categories yet. Add one!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {categories.map((category) => (
              <li
                key={category._id}
                style={{
                  border: "1px solid #eee",
                  padding: "10px",
                  marginBottom: "8px",
                  borderRadius: "6px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  backgroundColor: "#f8f8f8",
                  boxShadow: "0 1px 1px rgba(0,0,0,0.03)",
                }}
              >
                <span>
                  **{category.name}** ({category.type})
                </span>
                <div>
                  <button
                    onClick={() => startEditCategory(category)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#17a2b8",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      marginRight: "5px",
                      fontSize: "0.8em",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category._id)}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "3px",
                      cursor: "pointer",
                      fontSize: "0.8em",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
