import { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Circle,
  Clock3,
  ListTodo,
  Pencil,
  Trash2,
  X,
  CalendarDays,
  Filter,
} from "lucide-react";

const emptyForm = {
  title: "",
  description: "",
  status: "Todo",
  priority: "Medium",
  dueDate: "",
};

const statuses = ["Todo", "In Progress", "Completed"];
const priorities = ["Low", "Medium", "High"];
const dateLabel = (date) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "No due date";

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function loadTasks() {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (statusFilter !== "All") params.set("status", statusFilter);
      if (priorityFilter !== "All") params.set("priority", priorityFilter);
      const response = await fetch(`/api/tasks?${params}`);
      if (!response.ok) throw new Error("Unable to load tasks");
      setTasks(await response.json());
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    loadTasks();
  }, [search, statusFilter, priorityFilter]);

  const counts = useMemo(
    () => ({
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "Todo").length,
      progress: tasks.filter((t) => t.status === "In Progress").length,
      completed: tasks.filter((t) => t.status === "Completed").length,
    }),
    [tasks],
  );

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }
  function openEdit(task) {
    setEditing(task);
    setForm({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate
        ? new Date(task.dueDate).toISOString().slice(0, 10)
        : "",
    });
    setModalOpen(true);
  }
  async function saveTask(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch(
        editing ? `/api/tasks/${editing._id}` : "/api/tasks",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            title: form.title.trim(),
            dueDate: form.dueDate || null,
          }),
        },
      );
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Could not save task");
      setModalOpen(false);
      await loadTasks();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }
  async function deleteTask(id) {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    try {
      const response = await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Could not delete task");
      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }
  async function cycleStatus(task) {
    const next =
      statuses[(statuses.indexOf(task.status) + 1) % statuses.length];
    try {
      const response = await fetch(`/api/tasks/${task._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!response.ok) throw new Error("Could not update status");
      await loadTasks();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-icon">
            <ListTodo size={21} />
          </div>
          <span>
            task<span className="brand-accent">flow</span>
          </span>
        </div>
        <div className="top-note">A clearer day starts here.</div>
      </header>
      <main className="main">
        <section className="welcome">
          <div>
            <p className="eyebrow">YOUR WORKSPACE</p>
            <h1>
              Good things get done
              <br />
              <span>one task at a time.</span>
            </h1>
            <p className="subheading">
              Plan your work, track your progress, and keep moving.
            </p>
          </div>
          <button className="primary-btn" onClick={openCreate}>
            <Plus size={18} /> Add task
          </button>
        </section>
        <section className="stats">
          <Stat
            icon={<ListTodo />}
            label="Total tasks"
            value={counts.total}
            tone="blue"
          />
          <Stat
            icon={<Circle />}
            label="To do"
            value={counts.todo}
            tone="slate"
          />
          <Stat
            icon={<Clock3 />}
            label="In progress"
            value={counts.progress}
            tone="amber"
          />
          <Stat
            icon={<CheckCircle2 />}
            label="Completed"
            value={counts.completed}
            tone="green"
          />
        </section>
        <section className="toolbar">
          <div className="search-box">
            <Search size={17} />
            <input
              aria-label="Search tasks"
              placeholder="Search tasks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                className="icon-btn"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>
          <div className="filter-group">
            <Filter size={16} />
            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            <select
              aria-label="Filter by priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option>All</option>
              {priorities.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </section>
        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError("")}>
              <X size={15} />
            </button>
          </div>
        )}
        <section className="task-section">
          <div className="section-heading">
            <div>
              <h2>Your tasks</h2>
              <span>
                {tasks.length} {tasks.length === 1 ? "task" : "tasks"} shown
              </span>
            </div>
            <button className="mobile-add" onClick={openCreate}>
              <Plus size={17} />
            </button>
          </div>
          {loading ? (
            <div className="state-card">Loading your tasks...</div>
          ) : tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CheckCircle2 size={27} />
              </div>
              <h3>
                {search || statusFilter !== "All" || priorityFilter !== "All"
                  ? "No matching tasks"
                  : "Your list is a blank canvas"}
              </h3>
              <p>
                {search || statusFilter !== "All" || priorityFilter !== "All"
                  ? "Try changing your search or filters."
                  : "Add your first task and make today count."}
              </p>
              {!search &&
                statusFilter === "All" &&
                priorityFilter === "All" && (
                  <button className="primary-btn" onClick={openCreate}>
                    <Plus size={17} /> Create a task
                  </button>
                )}
            </div>
          ) : (
            <div className="task-grid">
              {tasks.map((task) => (
                <article
                  className={`task-card ${task.status === "Completed" ? "is-complete" : ""}`}
                  key={task._id}
                >
                  <div className="task-card-top">
                    <span
                      className={`priority priority-${task.priority.toLowerCase()}`}
                    >
                      {task.priority} priority
                    </span>
                    <div className="task-actions">
                      <button
                        className="icon-btn"
                        title="Edit task"
                        onClick={() => openEdit(task)}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="icon-btn danger-hover"
                        title="Delete task"
                        onClick={() => deleteTask(task._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3>{task.title}</h3>
                  <p className="task-description">
                    {task.description || "No description added."}
                  </p>
                  <div className="task-card-bottom">
                    <span
                      className={`status status-${task.status.toLowerCase().replace(" ", "-")}`}
                    >
                      <span /> {task.status}
                    </span>
                    <span className="due-date">
                      <CalendarDays size={14} />
                      {dateLabel(task.dueDate)}
                    </span>
                  </div>
                  <button
                    className="status-action"
                    onClick={() => cycleStatus(task)}
                  >
                    {task.status === "Completed"
                      ? "Move to To do"
                      : "Update status"}{" "}
                    <span>→</span>
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
        <footer>
          Small steps. Real progress. <span>TaskFlow</span>
        </footer>
      </main>
      {modalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) =>
            e.target === e.currentTarget && setModalOpen(false)
          }
        >
          <form className="modal" onSubmit={saveTask}>
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editing ? "MAKE AN UPDATE" : "NEW ITEM"}
                </p>
                <h2>{editing ? "Edit task" : "Create a task"}</h2>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close"
              >
                <X />
              </button>
            </div>
            <label>
              Task title <span className="required">*</span>
              <input
                autoFocus
                maxLength="100"
                required
                placeholder="e.g. Prepare project proposal"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label>
              Description{" "}
              <textarea
                maxLength="1000"
                rows="3"
                placeholder="Add a few details (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <div className="form-row">
              <label>
                Priority
                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {priorities.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </label>
              <label>
                Status
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Due date
              <input
                type="date"
                value={form.dueDate}
                min={new Date().toLocaleDateString("en-CA")}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
            </label>
            <div className="modal-footer">
              <button
                type="button"
                className="secondary-btn"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                disabled={saving || !form.title.trim()}
              >
                {saving
                  ? "Saving..."
                  : editing
                    ? "Save changes"
                    : "Create task"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}>{icon}</div>
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}
export default App;
