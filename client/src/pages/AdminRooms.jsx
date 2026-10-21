
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  Plus,
  DoorOpen,
  Users,
  Layers3,
  Banknote,
  Trash2,
  Pencil,
  RefreshCw,
  Hotel,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./AdminRooms.css";

function AdminRooms() {
  const navigate = useNavigate();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [editingRoomId, setEditingRoomId] = useState(null);

  const [formData, setFormData] = useState({
    roomNumber: "",
    name: "",
    type: "Serene Room",
    pricePerNight: "",
    capacity: "",
    bedType: "",
    floor: "",
    status: "available",
  });

  const token = localStorage.getItem("token");

  const fetchRooms = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_BASE_URL}/api/rooms`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to load rooms.");
        return;
      }

      setRooms(data.rooms || []);
    } catch (error) {
      console.error("Load Rooms Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData({
      roomNumber: "",
      name: "",
      type: "Serene Room",
      pricePerNight: "",
      capacity: "",
      bedType: "",
      floor: "",
      status: "available",
    });

    setEditingRoomId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSubmitting(true);

    try {
      const roomData = {
        ...formData,
        pricePerNight: Number(formData.pricePerNight),
        capacity: Number(formData.capacity),
        floor: Number(formData.floor),
      };

      const url = editingRoomId
        ? `${API_BASE_URL}/api/rooms/${editingRoomId}`
        : `${API_BASE_URL}/api/rooms`;

      const response = await fetch(url, {
        method: editingRoomId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(roomData),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to save room.");
        return;
      }

      setMessage(
        editingRoomId
          ? "Room updated successfully!"
          : "Room added successfully!"
      );

      resetForm();
      await fetchRooms();
    } catch (error) {
      console.error("Save Room Error:", error);
      setMessage("Unable to connect to the server.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (room) => {
    setEditingRoomId(room._id);

    setFormData({
      roomNumber: room.roomNumber,
      name: room.name,
      type: room.type,
      pricePerNight: room.pricePerNight,
      capacity: room.capacity,
      bedType: room.bedType,
      floor: room.floor,
      status: room.status,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleDelete = async (roomId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this room?"
    );

    if (!confirmed) return;

    try {
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/rooms/${roomId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Unable to delete room.");
        return;
      }

      setMessage("Room deleted successfully!");
      await fetchRooms();
    } catch (error) {
      console.error("Delete Room Error:", error);
      setMessage("Unable to connect to the server.");
    }
  };

  return (
    <main className="admin-rooms-page">
      <div className="rooms-page-header">
        <button
          type="button"
          className="rooms-back-btn"
          onClick={() => navigate("/admin")}
        >
          <ArrowLeft size={18} />
          Back to Admin Dashboard
        </button>

        <div className="rooms-header-content">
          <div>
            <span>ROOM MANAGEMENT</span>
            <h1>Manage Hotel Rooms</h1>
            <p>
              Add and manage LuxuryStay rooms from one place.
            </p>
          </div>

          <div className="rooms-header-icon">
            <Hotel size={27} />
          </div>
        </div>
      </div>

      <section className="room-form-card">
        <div className="room-section-heading">
          <div className="room-heading-icon">
            {editingRoomId ? (
              <Pencil size={21} />
            ) : (
              <Plus size={21} />
            )}
          </div>

          <div>
            <span>
              {editingRoomId ? "EDIT ROOM" : "NEW ROOM"}
            </span>
            <h2>
              {editingRoomId
                ? "Update Room Details"
                : "Add a New Room"}
            </h2>
          </div>
        </div>

        <form className="room-form" onSubmit={handleSubmit}>
          <div className="room-form-grid">
            <div className="room-field">
              <label>ROOM NUMBER</label>
              <div className="room-input">
                <DoorOpen size={17} />
                <input
                  type="text"
                  name="roomNumber"
                  placeholder="e.g. 201"
                  value={formData.roomNumber}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>ROOM NAME</label>
              <div className="room-input">
                <BedDouble size={17} />
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Serene Garden Room"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>ROOM TYPE</label>
              <div className="room-input">
                <Hotel size={17} />
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                >
                  <option value="Serene Room">Serene Room</option>
                  <option value="Signature Suite">Signature Suite</option>
                  <option value="Royal Residence">Royal Residence</option>
                </select>
              </div>
            </div>

            <div className="room-field">
              <label>PRICE PER NIGHT</label>
              <div className="room-input">
                <Banknote size={17} />
                <input
                  type="number"
                  name="pricePerNight"
                  placeholder="e.g. 25000"
                  min="0"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>GUEST CAPACITY</label>
              <div className="room-input">
                <Users size={17} />
                <input
                  type="number"
                  name="capacity"
                  placeholder="e.g. 2"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>BED TYPE</label>
              <div className="room-input">
                <BedDouble size={17} />
                <input
                  type="text"
                  name="bedType"
                  placeholder="e.g. King Bed"
                  value={formData.bedType}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>FLOOR</label>
              <div className="room-input">
                <Layers3 size={17} />
                <input
                  type="number"
                  name="floor"
                  placeholder="e.g. 2"
                  min="1"
                  value={formData.floor}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="room-field">
              <label>ROOM STATUS</label>
              <div className="room-input">
                <RefreshCw size={17} />
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="available">Available</option>
                  <option value="reserved">Reserved</option>
                  <option value="occupied">Occupied</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>
            </div>
          </div>

          {message && (
            <p className="rooms-message">{message}</p>
          )}

          <div className="room-form-actions">
            {editingRoomId && (
              <button
                type="button"
                className="room-cancel-btn"
                onClick={resetForm}
              >
                Cancel Editing
              </button>
            )}

            <button
              type="submit"
              className="room-save-btn"
              disabled={submitting}
            >
              {editingRoomId ? (
                <Pencil size={18} />
              ) : (
                <Plus size={18} />
              )}
              {submitting
                ? "Saving..."
                : editingRoomId
                  ? "Update Room"
                  : "Add Room"}
            </button>
          </div>
        </form>
      </section>

      <section className="rooms-list-card">
        <div className="rooms-list-heading">
          <div>
            <span>HOTEL INVENTORY</span>
            <h2>All Rooms</h2>
          </div>

          <div className="rooms-total">
            <BedDouble size={17} />
            <strong>{rooms.length}</strong>
            <span>Rooms</span>
          </div>
        </div>

        {loading ? (
          <div className="rooms-empty">
            <RefreshCw size={25} />
            <strong>Loading rooms...</strong>
          </div>
        ) : rooms.length === 0 ? (
          <div className="rooms-empty">
            <div className="rooms-empty-icon">
              <BedDouble size={30} />
            </div>
            <strong>No rooms added yet</strong>
            <p>
              Add your first LuxuryStay room using the form above.
            </p>
          </div>
        ) : (
          <div className="rooms-table-wrapper">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room</th>
                  <th>Type</th>
                  <th>Floor</th>
                  <th>Capacity</th>
                  <th>Price / Night</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id}>
                    <td>
                      <div className="room-number-cell">
                        <div>
                          <BedDouble size={17} />
                        </div>
                        <span>
                          <strong>Room {room.roomNumber}</strong>
                          <small>{room.name}</small>
                        </span>
                      </div>
                    </td>
                    <td>{room.type}</td>
                    <td>Floor {room.floor}</td>
                    <td>
                      {room.capacity}{" "}
                      {room.capacity === 1 ? "Guest" : "Guests"}
                    </td>
                    <td>
                      Rs.{" "}
                      {Number(room.pricePerNight).toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`room-status room-status-${room.status}`}
                      >
                        {room.status}
                      </span>
                    </td>
                    <td>
                      <div className="room-actions">
                        <button
                          type="button"
                          className="room-edit-btn"
                          onClick={() => handleEdit(room)}
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          className="room-delete-btn"
                          onClick={() => handleDelete(room._id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminRooms;
