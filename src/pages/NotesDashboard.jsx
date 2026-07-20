import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import "./NotesDashboard.css";

function NotesDashboard() {
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Tracks which note (if any) is currently being edited
  const [editingNoteId, setEditingNoteId] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));

  // Runs once when the component first mounts, fetching the user's notes
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axiosInstance.get("/api/notes");
      setNotes(response.data);
    } catch (err) {
      setError("Failed to load notes.");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setContent("");
    setFormErrors({});
    setEditingNoteId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});
    setSubmitting(true);

    try {
      if (editingNoteId) {
        // Editing an existing note
        await axiosInstance.put(`/api/notes/${editingNoteId}`, {
          title,
          content,
        });
      } else {
        // Creating a new note
        await axiosInstance.post("/api/notes", { title, content });
      }
      resetForm();
      fetchNotes();
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setFormErrors(err.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditClick = (note) => {
    setEditingNoteId(note.id);
    setTitle(note.title);
    setContent(note.content);
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm("Delete this note?")) return;

    try {
      await axiosInstance.delete(`/api/notes/${noteId}`);
      fetchNotes();
    } catch (err) {
      setError("Failed to delete note.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>My Notes</h1>
        <div className="header-actions">
          <span className="welcome-text">Hi, {user?.username}</span>
          {user?.role === "ADMIN" && (
            <button className="logout-btn" onClick={() => navigate("/admin")}>
              Admin Panel
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <form className="note-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {formErrors.title && (
          <span className="field-error">{formErrors.title}</span>
        )}

        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
        />
        {formErrors.content && (
          <span className="field-error">{formErrors.content}</span>
        )}

        <div className="form-actions">
          <button type="submit" disabled={submitting}>
            {editingNoteId ? "Update Note" : "Add Note"}
          </button>
          {editingNoteId && (
            <button type="button" className="cancel-btn" onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && <div className="error-banner">{error}</div>}

      {loading ? (
        <p className="status-text">Loading notes...</p>
      ) : notes.length === 0 ? (
        <p className="status-text">
          No notes yet. Create your first one above.
        </p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div className="note-card" key={note.id}>
              <h3>{note.title}</h3>
              <p>{note.content}</p>
              <div className="note-actions">
                <button onClick={() => handleEditClick(note)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(note.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default NotesDashboard;
