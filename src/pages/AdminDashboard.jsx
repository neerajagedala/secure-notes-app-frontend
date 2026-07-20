import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [allNotes, setAllNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      // NEW: fetch both resources in parallel rather than one after another
      const [usersResponse, notesResponse] = await Promise.all([
        axiosInstance.get("/api/users"),
        axiosInstance.get("/api/notes/all"),
      ]);
      setUsers(usersResponse.data);
      setAllNotes(notesResponse.data);
    } catch (err) {
      setError("Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (
      !window.confirm(
        "Delete this user? This will also delete all their notes.",
      )
    )
      return;

    try {
      await axiosInstance.delete(`/api/users/${userId}`);
      fetchData();
    } catch (err) {
      setError("Failed to delete user.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) return <p className="status-text">Loading admin dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="header-actions">
          <span className="welcome-text">Hi, {user?.username} (Admin)</span>
          <button className="logout-btn" onClick={() => navigate("/notes")}>
            My Notes
          </button>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className="error-banner">{error}</div>}

      <section className="admin-section">
        <h2>All Users ({users.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.username}</td>
                <td>{u.email}</td>
                <td>
                  <span
                    className={`role-badge ${u.role === "ADMIN" ? "role-admin" : "role-user"}`}
                  >
                    {u.role}
                  </span>
                </td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(u.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>All Notes ({allNotes.length})</h2>
        <div className="notes-grid">
          {allNotes.map((note) => (
            <div className="note-card" key={note.id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AdminDashboard;
