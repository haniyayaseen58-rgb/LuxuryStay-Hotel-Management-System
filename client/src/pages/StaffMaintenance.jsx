import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Wrench,
  Plus,
  X,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  Play,
  RefreshCw,
  DoorOpen,
  MapPin,
  Activity,
  ShieldCheck,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./StaffMaintenance.css";

function StaffMaintenance() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    roomId: "",
    issueTitle: "",
    description: "",
    priority: "medium",
  });

  const token = localStorage.getItem("token");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [roomsResponse, tasksResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/rooms`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${API_BASE_URL}/api/maintenance`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const roomsData = await roomsResponse.json();
      const tasksData = await tasksResponse.json();

      if (!roomsResponse.ok) {
        throw new Error(
          roomsData.message || "Unable to load rooms."
        );
      }

      if (!tasksResponse.ok) {
        throw new Error(
          tasksData.message || "Unable to load maintenance tasks."
        );
      }

      const roomList = Array.isArray(roomsData)
        ? roomsData
        : roomsData.rooms || [];

      setRooms(roomList.filter((room) => room.isActive));
      setTasks(tasksData.tasks || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeTasks = useMemo(
    () =>
      tasks.filter(
        (task) =>
          task.status === "pending" ||
          task.status === "in-progress"
      ),
    [tasks]
  );

  const completedTasks = useMemo(
    () => tasks.filter((task) => task.status === "completed"),
    [tasks]
  );

  const availableRooms = useMemo(
    () =>
      rooms.filter(
        (room) =>
          room.status !== "occupied" &&
          room.status !== "maintenance"
      ),
    [rooms]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to report maintenance issue."
        );
      }

      setTasks((previous) => [data.task, ...previous]);

      setRooms((previous) =>
        previous.map((room) =>
          room._id === formData.roomId
            ? { ...room, status: "maintenance" }
            : room
        )
      );

      setFormData({
        roomId: "",
        issueTitle: "",
        description: "",
        priority: "medium",
      });

      setShowForm(false);
      setMessage("Maintenance issue reported successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const startMaintenance = async (taskId) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/${taskId}/start`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to start maintenance."
        );
      }

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId ? data.task : task
        )
      );

      setMessage("Maintenance work is now in progress.");
    } catch (err) {
      setError(err.message);
    }
  };

  const completeMaintenance = async (taskId) => {
    try {
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/maintenance/${taskId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to complete maintenance."
        );
      }

      setTasks((previous) =>
        previous.map((task) =>
          task._id === taskId ? data.task : task
        )
      );

      if (data.task?.room?._id) {
        setRooms((previous) =>
          previous.map((room) =>
            room._id === data.task.room._id
              ? { ...room, status: "available" }
              : room
          )
        );
      }

      setMessage(
        `Room ${data.task?.room?.roomNumber || ""} is repaired and available.`
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not available";

    return new Date(date).toLocaleString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="maintenance-page">
      <div className="maintenance-shell">
        <header className="maintenance-header">
          <button
            className="maintenance-back"
            onClick={() => navigate("/staff")}
          >
            <ArrowLeft size={18} />
            Back to Manager Dashboard
          </button>

          <div className="maintenance-header-actions">
            <button
              className="maintenance-refresh"
              onClick={loadData}
            >
              <RefreshCw size={17} />
              Refresh
            </button>

            <button
              className="maintenance-report-button"
              onClick={() => setShowForm(true)}
            >
              <Plus size={18} />
              Report Issue
            </button>
          </div>
        </header>

        <section className="maintenance-hero">
          <div className="maintenance-hero-copy">
            <span className="maintenance-kicker">
              <Activity size={15} />
              ENGINEERING CONTROL
            </span>

            <h1>
              Maintenance
              <span> Command Center</span>
            </h1>

            <p>
              Track room faults, manage repair priorities and return
              serviced rooms safely back into hotel operations.
            </p>
          </div>

          <div className="maintenance-hero-symbol">
            <div className="maintenance-symbol-ring">
              <Wrench size={42} />
            </div>

            <span>LIVE OPERATIONS</span>
          </div>
        </section>

        <section className="maintenance-overview">
          <article>
            <div className="maintenance-stat-icon">
              <AlertTriangle size={20} />
            </div>

            <div>
              <span>Active Repairs</span>
              <strong>{activeTasks.length}</strong>
            </div>
          </article>

          <article>
            <div className="maintenance-stat-icon">
              <Clock3 size={20} />
            </div>

            <div>
              <span>Pending</span>
              <strong>
                {
                  tasks.filter(
                    (task) => task.status === "pending"
                  ).length
                }
              </strong>
            </div>
          </article>

          <article>
            <div className="maintenance-stat-icon">
              <Wrench size={20} />
            </div>

            <div>
              <span>In Progress</span>
              <strong>
                {
                  tasks.filter(
                    (task) => task.status === "in-progress"
                  ).length
                }
              </strong>
            </div>
          </article>

          <article>
            <div className="maintenance-stat-icon">
              <CheckCircle2 size={20} />
            </div>

            <div>
              <span>Completed</span>
              <strong>{completedTasks.length}</strong>
            </div>
          </article>
        </section>

        {message && (
          <div className="maintenance-message success">
            <CheckCircle2 size={18} />
            {message}
          </div>
        )}

        {error && (
          <div className="maintenance-message error">
            <AlertTriangle size={18} />
            {error}
          </div>
        )}

        <section className="maintenance-workspace">
          <div className="maintenance-section-heading">
            <div>
              <span>ACTIVE WORK ORDERS</span>
              <h2>Repair Queue</h2>
            </div>

            <div className="maintenance-live">
              <span></span>
              {activeTasks.length} Active
            </div>
          </div>

          {loading ? (
            <div className="maintenance-state">
              <RefreshCw
                className="maintenance-loading-icon"
                size={30}
              />
              <h3>Loading maintenance operations</h3>
              <p>Please wait while the repair queue is updated.</p>
            </div>
          ) : activeTasks.length === 0 ? (
            <div className="maintenance-state">
              <ShieldCheck size={36} />
              <h3>All rooms are operational</h3>
              <p>
                There are currently no active maintenance work
                orders.
              </p>
            </div>
          ) : (
            <div className="maintenance-grid">
              {activeTasks.map((task) => (
                <article
                  className={`maintenance-card priority-${task.priority}`}
                  key={task._id}
                >
                  <div className="maintenance-card-top">
                    <div className="maintenance-room-number">
                      <small>ROOM</small>
                      <strong>
                        {task.room?.roomNumber || "N/A"}
                      </strong>
                    </div>

                    <span
                      className={`maintenance-priority ${task.priority}`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="maintenance-card-body">
                    <span className="maintenance-room-name">
                      {task.room?.name || "Hotel Room"}
                    </span>

                    <h3>{task.issueTitle}</h3>

                    <p>{task.description}</p>

                    <div className="maintenance-meta">
                      <span>
                        <MapPin size={15} />
                        Floor {task.room?.floor || "N/A"}
                      </span>

                      <span>
                        <Clock3 size={15} />
                        {formatDate(task.createdAt)}
                      </span>
                    </div>
                  </div>

                  <div className="maintenance-card-footer">
                    <span
                      className={`maintenance-status ${task.status}`}
                    >
                      {task.status === "in-progress"
                        ? "In Progress"
                        : "Pending"}
                    </span>

                    <div className="maintenance-card-actions">
                      {task.status === "pending" && (
                        <button
                          className="maintenance-start"
                          onClick={() =>
                            startMaintenance(task._id)
                          }
                        >
                          <Play size={16} />
                          Start Work
                        </button>
                      )}

                      <button
                        className="maintenance-complete"
                        onClick={() =>
                          completeMaintenance(task._id)
                        }
                      >
                        <CheckCircle2 size={16} />
                        Complete Repair
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {completedTasks.length > 0 && (
          <section className="maintenance-history">
            <div className="maintenance-section-heading">
              <div>
                <span>SERVICE HISTORY</span>
                <h2>Recently Completed</h2>
              </div>
            </div>

            <div className="maintenance-history-list">
              {completedTasks.slice(0, 5).map((task) => (
                <div
                  className="maintenance-history-row"
                  key={task._id}
                >
                  <div className="maintenance-history-room">
                    <DoorOpen size={19} />
                    <div>
                      <strong>
                        Room {task.room?.roomNumber || "N/A"}
                      </strong>
                      <span>{task.room?.name}</span>
                    </div>
                  </div>

                  <div className="maintenance-history-issue">
                    <strong>{task.issueTitle}</strong>
                    <span>{task.priority} priority</span>
                  </div>

                  <div className="maintenance-history-date">
                    <CheckCircle2 size={16} />
                    {formatDate(task.completedAt)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {showForm && (
        <div className="maintenance-modal-backdrop">
          <div className="maintenance-modal">
            <div className="maintenance-modal-head">
              <div>
                <span>NEW WORK ORDER</span>
                <h2>Report Room Issue</h2>
              </div>

              <button
                type="button"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="maintenance-field">
                <label>Room</label>

                <select
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select room</option>

                  {availableRooms.map((room) => (
                    <option
                      key={room._id}
                      value={room._id}
                    >
                      Room {room.roomNumber} — {room.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="maintenance-field">
                <label>Issue Title</label>

                <input
                  type="text"
                  name="issueTitle"
                  value={formData.issueTitle}
                  onChange={handleChange}
                  placeholder="e.g. Air conditioner not working"
                  required
                />
              </div>

              <div className="maintenance-field">
                <label>Priority</label>

                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="maintenance-field">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the maintenance issue..."
                  rows="5"
                  required
                />
              </div>

              <div className="maintenance-modal-actions">
                <button
                  type="button"
                  className="maintenance-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="maintenance-submit"
                  disabled={submitting}
                >
                  <Wrench size={17} />
                  {submitting
                    ? "Creating..."
                    : "Create Work Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffMaintenance;