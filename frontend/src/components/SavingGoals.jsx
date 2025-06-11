// frontend/src/components/SavingGoals.jsx
import React, { useState, useEffect, useCallback } from "react";
import api from "../services/api";

const SavingGoals = ({ token, setMessage }) => {
  const [goals, setGoals] = useState([]);
  const [newGoalName, setNewGoalName] = useState("");
  const [newGoalTargetAmount, setNewGoalTargetAmount] = useState("");
  const [newGoalDueDate, setNewGoalDueDate] = useState("");
  const [newGoalDescription, setNewGoalDescription] = useState("");
  const [editingGoal, setEditingGoal] = useState(null); // Para editar una meta existente
  const [addAmount, setAddAmount] = useState(""); // Para añadir monto a una meta

  // Fetch saving goals from backend
  const fetchSavingGoals = useCallback(async () => {
    try {
      if (!token) {
        setMessage("Token no encontrado. Por favor, inicia sesión de nuevo.");
        return;
      }
      api.defaults.headers.common["x-auth-token"] = token;
      const res = await api.get("/api/savinggoals");
      setGoals(res.data);
      setMessage(""); // Clear any previous messages
    } catch (err) {
      console.error(
        "Error fetching saving goals:",
        err.response?.data?.msg || err.message
      );
      setMessage(
        `Error al cargar metas de ahorro: ${
          err.response?.data?.msg || "Error de red"
        }`
      );
    }
  }, [token, setMessage]);

  useEffect(() => {
    fetchSavingGoals();
  }, [fetchSavingGoals]);

  // Handle adding a new saving goal
  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      const goalData = {
        name: newGoalName,
        targetAmount: parseFloat(newGoalTargetAmount),
        dueDate: newGoalDueDate || undefined, // Send as undefined if empty
        description: newGoalDescription,
      };
      await api.post("/api/savinggoals", goalData);
      setMessage("Meta de ahorro creada exitosamente!");
      // Clear form
      setNewGoalName("");
      setNewGoalTargetAmount("");
      setNewGoalDueDate("");
      setNewGoalDescription("");
      fetchSavingGoals(); // Refresh goals list
    } catch (err) {
      setMessage(
        `Error al crear meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  // Start editing an existing goal
  const startEditGoal = (goal) => {
    setEditingGoal({
      ...goal,
      dueDate: goal.dueDate
        ? new Date(goal.dueDate).toISOString().slice(0, 10)
        : "", // Format date for input type="date"
    });
  };

  // Cancel editing
  const cancelEditGoal = () => {
    setEditingGoal(null);
  };

  // Handle updating an existing goal
  const handleUpdateGoal = async (e) => {
    e.preventDefault();
    if (!editingGoal) return;

    try {
      const updatedGoalData = {
        name: editingGoal.name,
        targetAmount: parseFloat(editingGoal.targetAmount),
        currentAmount: parseFloat(editingGoal.currentAmount),
        dueDate: editingGoal.dueDate || undefined,
        description: editingGoal.description,
        isCompleted: editingGoal.isCompleted,
      };
      await api.put(
        `/api/savinggoals/${editingGoal._id}`,
        updatedGoalData
      );
      setMessage("Meta de ahorro actualizada exitosamente!");
      setEditingGoal(null); // Exit edit mode
      fetchSavingGoals(); // Refresh goals list
    } catch (err) {
      setMessage(
        `Error al actualizar meta de ahorro: ${
          err.response?.data?.msg || err.message
        }`
      );
    }
  };

  // Handle adding amount to a goal
  const handleAddAmountToGoal = async (goalId, currentAmount) => {
    if (!addAmount || parseFloat(addAmount) <= 0) {
      setMessage("Por favor, ingresa un monto válido para añadir.");
      return;
    }
    try {
      const goalToUpdate = goals.find((g) => g._id === goalId);
      if (!goalToUpdate) return;

      const newCurrentAmount = currentAmount + parseFloat(addAmount);
      await api.put(`/api/savinggoals/${goalId}`, {
        currentAmount: newCurrentAmount,
        isCompleted: newCurrentAmount >= goalToUpdate.targetAmount, // Update completion status
      });
      setMessage(
        `Monto de ${parseFloat(addAmount).toFixed(2)} añadido a la meta!`
      );
      setAddAmount(""); // Clear add amount input
      fetchSavingGoals(); // Refresh goals list
    } catch (err) {
      setMessage(
        `Error al añadir monto: ${err.response?.data?.msg || err.message}`
      );
    }
  };

  // Handle deleting a goal
  const handleDeleteGoal = async (id) => {
    if (
      window.confirm(
        "¿Estás seguro de que quieres eliminar esta meta de ahorro?"
      )
    ) {
      try {
        await api.delete(`/api/savinggoals/${id}`);
        setMessage("Meta de ahorro eliminada exitosamente!");
        fetchSavingGoals(); // Refresh goals list
      } catch (err) {
        setMessage(
          `Error al eliminar meta de ahorro: ${
            err.response?.data?.msg || err.message
          }`
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
        Mis Metas de Ahorro
      </h3>

      {/* Form for Add/Edit Saving Goal */}
      <div style={{ marginBottom: "30px" }}>
        <h4>{editingGoal ? "Editar Meta de Ahorro" : "Crear Nueva Meta"}</h4>
        <form
          onSubmit={editingGoal ? handleUpdateGoal : handleAddGoal}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "15px",
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
              Nombre:
            </label>
            <input
              type="text"
              value={editingGoal ? editingGoal.name : newGoalName}
              onChange={(e) =>
                editingGoal
                  ? setEditingGoal({ ...editingGoal, name: e.target.value })
                  : setNewGoalName(e.target.value)
              }
              required
              style={{
                width: "95%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
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
              Monto Objetivo:
            </label>
            <input
              type="number"
              value={
                editingGoal ? editingGoal.targetAmount : newGoalTargetAmount
              }
              onChange={(e) =>
                editingGoal
                  ? setEditingGoal({
                      ...editingGoal,
                      targetAmount: e.target.value,
                    })
                  : setNewGoalTargetAmount(e.target.value)
              }
              required
              step="0.01"
              min="0.01"
              style={{
                width: "95%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          {editingGoal && ( // Solo para edición
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "5px",
                  textAlign: "left",
                }}
              >
                Monto Actual:
              </label>
              <input
                type="number"
                value={editingGoal.currentAmount}
                onChange={(e) =>
                  setEditingGoal({
                    ...editingGoal,
                    currentAmount: e.target.value,
                  })
                }
                step="0.01"
                min="0"
                style={{
                  width: "95%",
                  padding: "10px",
                  borderRadius: "4px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          )}
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                textAlign: "left",
              }}
            >
              Fecha Límite (opcional):
            </label>
            <input
              type="date"
              value={editingGoal ? editingGoal.dueDate : newGoalDueDate}
              onChange={(e) =>
                editingGoal
                  ? setEditingGoal({ ...editingGoal, dueDate: e.target.value })
                  : setNewGoalDueDate(e.target.value)
              }
              style={{
                width: "95%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
              }}
            />
          </div>
          <div style={{ gridColumn: "span 2" }}>
            <label
              style={{
                display: "block",
                marginBottom: "5px",
                textAlign: "left",
              }}
            >
              Descripción (opcional):
            </label>
            <textarea
              value={editingGoal ? editingGoal.description : newGoalDescription}
              onChange={(e) =>
                editingGoal
                  ? setEditingGoal({
                      ...editingGoal,
                      description: e.target.value,
                    })
                  : setNewGoalDescription(e.target.value)
              }
              rows="2"
              style={{
                width: "98%",
                padding: "10px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                resize: "vertical",
              }}
            ></textarea>
          </div>
          <div
            style={{
              gridColumn: "span 2",
              textAlign: "center",
              marginTop: "10px",
            }}
          >
            <button
              type="submit"
              style={{
                padding: "10px 20px",
                backgroundColor: editingGoal ? "#ffc107" : "#28a745",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                marginRight: "10px",
              }}
            >
              {editingGoal ? "Guardar Cambios" : "Crear Meta"}
            </button>
            {editingGoal && (
              <button
                type="button"
                onClick={cancelEditGoal}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                }}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* List of Saving Goals */}
      <div>
        <h4>Tus Metas</h4>
        {goals.length === 0 ? (
          <p>No tienes metas de ahorro. ¡Crea una para empezar a ahorrar!</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              const isOverdue =
                goal.dueDate &&
                new Date(goal.dueDate) < new Date() &&
                !goal.isCompleted;

              return (
                <li
                  key={goal._id}
                  style={{
                    border: `1px solid ${
                      goal.isCompleted
                        ? "#28a745"
                        : isOverdue
                        ? "#dc3545"
                        : "#eee"
                    }`, // Color based on completion/overdue
                    padding: "15px",
                    marginBottom: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#f8f8f8",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    position: "relative",
                  }}
                >
                  {goal.isCompleted && (
                    <span
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        color: "green",
                        fontWeight: "bold",
                      }}
                    >
                      ¡Completada!
                    </span>
                  )}
                  <h4>{goal.name}</h4>
                  <p style={{ margin: "5px 0" }}>
                    Objetivo:{" "}
                    <strong>{goal.targetAmount.toFixed(2)} USD</strong> |
                    Actual: <strong>{goal.currentAmount.toFixed(2)} USD</strong>
                  </p>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#e0e0e0",
                      borderRadius: "5px",
                      height: "15px",
                      overflow: "hidden",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        width: `${Math.min(100, progress)}%`,
                        backgroundColor: goal.isCompleted
                          ? "#28a745"
                          : "#007bff",
                        height: "100%",
                        borderRadius: "5px",
                        transition: "width 0.5s ease-in-out",
                      }}
                    ></div>
                  </div>
                  <p
                    style={{
                      margin: "0 0 10px 0",
                      fontSize: "0.9em",
                      color: "#555",
                    }}
                  >
                    Progreso: {progress.toFixed(2)}%
                    {goal.dueDate && (
                      <span
                        style={{
                          marginLeft: "10px",
                          color: isOverdue ? "red" : "#555",
                        }}
                      >
                        Fecha Límite:{" "}
                        {new Date(goal.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                  {goal.description && (
                    <p
                      style={{
                        fontSize: "0.85em",
                        color: "#777",
                        fontStyle: "italic",
                      }}
                    >
                      {goal.description}
                    </p>
                  )}

                  {/* Add amount input and button */}
                  <div
                    style={{ display: "flex", gap: "10px", marginTop: "10px" }}
                  >
                    <input
                      type="number"
                      placeholder="Añadir monto"
                      value={addAmount} // Use the addAmount state
                      onChange={(e) => setAddAmount(e.target.value)}
                      step="0.01"
                      min="0.01"
                      style={{
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                        width: "120px",
                      }}
                    />
                    <button
                      onClick={() =>
                        handleAddAmountToGoal(goal._id, goal.currentAmount)
                      }
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#17a2b8",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Añadir
                    </button>
                    <button
                      onClick={() => startEditGoal(goal)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginLeft: "auto", // Push to the right
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      style={{
                        padding: "8px 15px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                      }}
                    >
                      Eliminar
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SavingGoals;
