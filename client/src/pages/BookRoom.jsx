import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useLocation,
} from "react-router-dom";
import {
  ArrowLeft,
  BedDouble,
  CalendarDays,
  Users,
  UserRound,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  Car,
  MessageSquareText,
  Hotel,
  MoonStar,
} from "lucide-react";

import "./BookRoom.css";

function BookRoom() {
  const navigate = useNavigate();
  const location = useLocation();

  const getSavedSearch = () => {
    if (
      location.state?.checkIn &&
      location.state?.checkOut
    ) {
      return {
        checkIn: location.state.checkIn,
        checkOut: location.state.checkOut,
        guests:
          Number(location.state.guests) || 1,
      };
    }

    try {
      const saved = JSON.parse(
        sessionStorage.getItem(
          "luxurystaySearch"
        ) || "null"
      );

      if (
        saved?.checkIn &&
        saved?.checkOut
      ) {
        return {
          checkIn: saved.checkIn,
          checkOut: saved.checkOut,
          guests: Number(saved.guests) || 1,
        };
      }
    } catch {
      return null;
    }

    return null;
  };

  const savedSearch = getSavedSearch();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const formatDate = (date) =>
    date.toISOString().split("T")[0];

  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] =
    useState(false);
  const [submitting, setSubmitting] =
    useState(false);
  const [message, setMessage] =
    useState("");
  const [messageType, setMessageType] =
    useState("");
  const [
    documentFront,
    setDocumentFront,
  ] = useState(null);
  const [
    documentBack,
    setDocumentBack,
  ] = useState(null);

  const [formData, setFormData] =
    useState({
      room: "",
      checkInDate:
        savedSearch?.checkIn ||
        formatDate(today),
      checkOutDate:
        savedSearch?.checkOut ||
        formatDate(tomorrow),
      numberOfGuests: String(
        savedSearch?.guests || 1
      ),
      fullName: "",
      phone: "",
      email: "",
      address: "",
      nationality: "Pakistan",
      documentType: "cnic",
      documentNumber: "",
      emergencyContact: "",
      vehicleNumber: "",
      specialRequests: "",
    });

  const token =
    localStorage.getItem("token");

  const user = useMemo(() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") ||
          "null"
      );
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/auth", {
        replace: true,
        state: {
          from: "/guest/book-room",
        },
      });
      return;
    }

    if (user?.role !== "guest") {
      return;
    }

    setFormData((current) => ({
      ...current,
      fullName:
        current.fullName ||
        user?.name ||
        "",
      email:
        current.email ||
        user?.email ||
        "",
    }));
  }, [
    token,
    user,
    navigate,
  ]);

  useEffect(() => {
    const fetchAvailableRooms =
      async () => {
        if (
          !token ||
          !formData.checkInDate ||
          !formData.checkOutDate ||
          !formData.numberOfGuests
        ) {
          setRooms([]);
          return;
        }

        const checkIn = new Date(
          `${formData.checkInDate}T00:00:00`
        );

        const checkOut = new Date(
          `${formData.checkOutDate}T00:00:00`
        );

        const guestCount = Number(
          formData.numberOfGuests
        );

        if (
          Number.isNaN(
            checkIn.getTime()
          ) ||
          Number.isNaN(
            checkOut.getTime()
          ) ||
          checkOut <= checkIn ||
          !Number.isInteger(guestCount) ||
          guestCount < 1
        ) {
          setRooms([]);
          setFormData((current) => ({
            ...current,
            room: "",
          }));
          return;
        }

        try {
          setLoadingRooms(true);

          const params =
            new URLSearchParams({
              checkInDate:
                formData.checkInDate,
              checkOutDate:
                formData.checkOutDate,
              guests:
                formData.numberOfGuests,
            });

          const response = await fetch(
            `http://localhost:5000/api/bookings/availability?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const data =
            await response.json();

          if (!response.ok) {
            setRooms([]);

            setFormData((current) => ({
              ...current,
              room: "",
            }));

            setMessage(
              data.message ||
                "Unable to check room availability."
            );
            setMessageType("error");
            return;
          }

          const availableRooms =
            data.rooms || [];

          setRooms(availableRooms);

          setFormData((current) => {
            const roomStillAvailable =
              availableRooms.some(
                (room) =>
                  room._id ===
                  current.room
              );

            return {
              ...current,
              room: roomStillAvailable
                ? current.room
                : "",
            };
          });

          if (
            availableRooms.length === 0
          ) {
            setMessage(
              "No rooms are available for the selected dates and number of guests."
            );
            setMessageType("error");
          } else {
            setMessage("");
            setMessageType("");
          }
        } catch (error) {
          console.error(
            "Room Availability Error:",
            error
          );

          setRooms([]);

          setMessage(
            "Unable to connect to the server."
          );
          setMessageType("error");
        } finally {
          setLoadingRooms(false);
        }
      };

    const timer = setTimeout(() => {
      fetchAvailableRooms();
    }, 250);

    return () => {
      clearTimeout(timer);
    };
  }, [
    token,
    formData.checkInDate,
    formData.checkOutDate,
    formData.numberOfGuests,
  ]);

  const selectedRoom = useMemo(
    () =>
      rooms.find(
        (room) =>
          room._id === formData.room
      ),
    [rooms, formData.room]
  );

  const totalNights = useMemo(() => {
    if (
      !formData.checkInDate ||
      !formData.checkOutDate
    ) {
      return 0;
    }

    const checkIn = new Date(
      `${formData.checkInDate}T00:00:00`
    );

    const checkOut = new Date(
      `${formData.checkOutDate}T00:00:00`
    );

    const difference =
      checkOut.getTime() -
      checkIn.getTime();

    if (difference <= 0) {
      return 0;
    }

    return Math.ceil(
      difference /
        (1000 * 60 * 60 * 24)
    );
  }, [
    formData.checkInDate,
    formData.checkOutDate,
  ]);

  const estimatedTotal =
    selectedRoom && totalNights > 0
      ? selectedRoom.pricePerNight *
        totalNights
      : 0;

  const handleChange = (event) => {
    const { name, value } =
      event.target;

    if (
      name === "documentType"
    ) {
      setDocumentFront(null);
      setDocumentBack(null);
    }

    setFormData((current) => ({
      ...current,
      [name]: value,
      ...(name ===
      "documentType"
        ? {
            documentNumber: "",
          }
        : {}),
    }));

    setMessage("");
    setMessageType("");
  };

  const handleFileChange = (
    event,
    side
  ) => {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf",
    ];

    if (
      !allowedTypes.includes(file.type)
    ) {
      setMessage(
        "Only JPG, JPEG, PNG, WEBP and PDF files are allowed."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (
      file.size >
      5 * 1024 * 1024
    ) {
      setMessage(
        "Document file must be 5MB or smaller."
      );
      setMessageType("error");
      event.target.value = "";
      return;
    }

    if (side === "front") {
      setDocumentFront(file);
    } else {
      setDocumentBack(file);
    }

    setMessage("");
    setMessageType("");
  };

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!formData.room) {
      setMessage(
        "Please select an available room."
      );
      setMessageType("error");
      return;
    }

    if (
      !formData.checkInDate ||
      !formData.checkOutDate
    ) {
      setMessage(
        "Please select check-in and check-out dates."
      );
      setMessageType("error");
      return;
    }

    const checkInDate = new Date(
      `${formData.checkInDate}T00:00:00`
    );

    const currentDate = new Date();
    currentDate.setHours(
      0,
      0,
      0,
      0
    );

    if (
      checkInDate < currentDate
    ) {
      setMessage(
        "Check-in date cannot be in the past."
      );
      setMessageType("error");
      return;
    }

    if (totalNights < 1) {
      setMessage(
        "Check-out date must be after check-in date."
      );
      setMessageType("error");
      return;
    }

    if (
      selectedRoom &&
      Number(
        formData.numberOfGuests
      ) > selectedRoom.capacity
    ) {
      setMessage(
        `This room allows maximum ${selectedRoom.capacity} guests.`
      );
      setMessageType("error");
      return;
    }

    if (!documentFront) {
      setMessage(
        formData.documentType ===
          "cnic"
          ? "Please upload CNIC front."
          : "Please upload passport copy."
      );
      setMessageType("error");
      return;
    }

    if (
      formData.documentType ===
        "cnic" &&
      !documentBack
    ) {
      setMessage(
        "Please upload CNIC back."
      );
      setMessageType("error");
      return;
    }

    try {
      setSubmitting(true);
      setMessage("");

      const payload =
        new FormData();

      payload.append(
        "roomId",
        formData.room
      );

      payload.append(
        "checkInDate",
        formData.checkInDate
      );

      payload.append(
        "checkOutDate",
        formData.checkOutDate
      );

      payload.append(
        "numberOfGuests",
        formData.numberOfGuests
      );

      payload.append(
        "specialRequests",
        formData.specialRequests
      );

      payload.append(
        "guestDetails",
        JSON.stringify({
          fullName:
            formData.fullName,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          nationality:
            formData.nationality,
          documentType:
            formData.documentType,
          documentNumber:
            formData.documentNumber,
          emergencyContact:
            formData.emergencyContact,
          vehicleNumber:
            formData.vehicleNumber,
        })
      );

      payload.append(
        "documentFront",
        documentFront
      );

      if (
        formData.documentType ===
          "cnic" &&
        documentBack
      ) {
        payload.append(
          "documentBack",
          documentBack
        );
      }

      const response = await fetch(
        "http://localhost:5000/api/bookings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        setMessage(
          data.message ||
            "Unable to create booking."
        );
        setMessageType("error");

        if (
          response.status === 409
        ) {
          setFormData(
            (current) => ({
              ...current,
              room: "",
            })
          );
        }

        return;
      }

      sessionStorage.removeItem(
        "luxurystaySearch"
      );

      setMessage(
        "Booking request submitted successfully!"
      );
      setMessageType("success");

      setTimeout(() => {
        navigate(
          "/guest/my-bookings",
          {
            replace: true,
          }
        );
      }, 1600);
    } catch (error) {
      console.error(
        "Create Booking Error:",
        error
      );

      setMessage(
        "Unable to connect to the server."
      );
      setMessageType("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="book-room-page">
      <div className="book-room-background">
        <span></span>
        <span></span>
        <span></span>
      </div>

      <div className="book-room-container">
        <button
          type="button"
          className="book-room-back"
          onClick={() =>
            navigate("/guest")
          }
        >
          <ArrowLeft size={18} />
          Guest Dashboard
        </button>

        <section className="book-room-hero">
          <div>
            <span className="book-room-eyebrow">
              YOUR NEXT STAY
            </span>

            <h1>
              Reserve Your Room
            </h1>

            <p>
              Choose your LuxuryStay
              room and complete your
              reservation details.
            </p>
          </div>

          <div className="book-room-hero-icon">
            <Hotel size={34} />
          </div>
        </section>

        {message && (
          <div
            className={`book-room-message ${messageType}`}
          >
            {message}
          </div>
        )}

        <form
          className="book-room-layout"
          onSubmit={handleSubmit}
        >
          <div className="book-room-form">
            <section className="booking-section">
              <div className="booking-section-heading">
                <BedDouble
                  size={20}
                />

                <div>
                  <span>STEP 01</span>
                  <h2>
                    Choose Your Room
                  </h2>
                </div>
              </div>

              {loadingRooms ? (
                <div className="room-loading">
                  Checking room
                  availability...
                </div>
              ) : rooms.length > 0 ? (
                <div className="room-choice-grid">
                  {rooms.map(
                    (room) => (
                      <button
                        key={room._id}
                        type="button"
                        className={`room-choice-card ${
                          formData.room ===
                          room._id
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => {
                          setFormData(
                            (
                              current
                            ) => ({
                              ...current,
                              room: room._id,
                            })
                          );

                          setMessage(
                            ""
                          );
                        }}
                      >
                        <div className="room-choice-top">
                          <span>
                            Room{" "}
                            {
                              room.roomNumber
                            }
                          </span>

                          <strong>
                            Available
                          </strong>
                        </div>

                        <h3>
                          {room.name}
                        </h3>

                        <p>
                          {room.type}
                        </p>

                        <div className="room-choice-details">
                          <span>
                            <Users
                              size={
                                15
                              }
                            />
                            {
                              room.capacity
                            }{" "}
                            Guests
                          </span>

                          <span>
                            <BedDouble
                              size={
                                15
                              }
                            />
                            {
                              room.bedType
                            }
                          </span>
                        </div>

                        <div className="room-choice-price">
                          <strong>
                            Rs.{" "}
                            {Number(
                              room.pricePerNight
                            ).toLocaleString()}
                          </strong>

                          <span>
                            / night
                          </span>
                        </div>
                      </button>
                    )
                  )}
                </div>
              ) : (
                <div className="room-loading">
                  No rooms available
                  for these dates and
                  guest count. Change
                  your stay details
                  below to search again.
                </div>
              )}
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <CalendarDays
                  size={20}
                />

                <div>
                  <span>STEP 02</span>
                  <h2>
                    Stay Details
                  </h2>
                </div>
              </div>

              <div className="booking-fields two-column">
                <label>
                  <span>
                    Check-In Date
                  </span>

                  <input
                    type="date"
                    name="checkInDate"
                    min={formatDate(
                      today
                    )}
                    value={
                      formData.checkInDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Check-Out Date
                  </span>

                  <input
                    type="date"
                    name="checkOutDate"
                    min={
                      formData.checkInDate ||
                      formatDate(
                        today
                      )
                    }
                    value={
                      formData.checkOutDate
                    }
                    onChange={
                      handleChange
                    }
                    required
                  />
                </label>

                <label>
                  <span>
                    Number of Guests
                  </span>

                  <div className="input-with-icon">
                    <Users
                      size={17}
                    />

                    <input
                      type="number"
                      name="numberOfGuests"
                      min="1"
                      max="10"
                      value={
                        formData.numberOfGuests
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <UserRound
                  size={20}
                />

                <div>
                  <span>STEP 03</span>
                  <h2>
                    Guest Information
                  </h2>
                </div>
              </div>

              <div className="booking-fields two-column">
                <label>
                  <span>
                    Full Name
                  </span>

                  <div className="input-with-icon">
                    <UserRound
                      size={17}
                    />

                    <input
                      type="text"
                      name="fullName"
                      value={
                        formData.fullName
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter full name"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Email Address
                  </span>

                  <div className="input-with-icon">
                    <Mail
                      size={17}
                    />

                    <input
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter email"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Phone Number
                  </span>

                  <div className="input-with-icon">
                    <Phone
                      size={17}
                    />

                    <input
                      type="tel"
                      name="phone"
                      value={
                        formData.phone
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="+92..."
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Nationality
                  </span>

                  <div className="input-with-icon">
                    <MapPin
                      size={17}
                    />

                    <input
                      type="text"
                      name="nationality"
                      value={
                        formData.nationality
                      }
                      onChange={
                        handleChange
                      }
                      required
                    />
                  </div>
                </label>

                <label className="full-field">
                  <span>
                    Address
                  </span>

                  <div className="input-with-icon">
                    <MapPin
                      size={17}
                    />

                    <input
                      type="text"
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Enter complete address"
                      required
                    />
                  </div>
                </label>
              </div>
            </section>

            <section className="booking-section">
              <div className="booking-section-heading">
                <ShieldCheck
                  size={20}
                />

                <div>
                  <span>STEP 04</span>
                  <h2>
                    Identity &
                    Verification
                  </h2>
                </div>
              </div>

              <div className="booking-fields two-column">
                <label>
                  <span>
                    Document Type
                  </span>

                  <select
                    name="documentType"
                    value={
                      formData.documentType
                    }
                    onChange={
                      handleChange
                    }
                    required
                  >
                    <option value="cnic">
                      CNIC
                    </option>

                    <option value="passport">
                      Passport
                    </option>
                  </select>
                </label>

                <label>
                  <span>
                    {formData.documentType ===
                    "cnic"
                      ? "CNIC Number"
                      : "Passport Number"}
                  </span>

                  <div className="input-with-icon">
                    <CreditCard
                      size={17}
                    />

                    <input
                      type="text"
                      name="documentNumber"
                      value={
                        formData.documentNumber
                      }
                      onChange={
                        handleChange
                      }
                      placeholder={
                        formData.documentType ===
                        "cnic"
                          ? "42101-1234567-1"
                          : "Passport number"
                      }
                      required
                    />
                  </div>
                </label>

                <label className="full-field">
                  <span>
                    {formData.documentType ===
                    "cnic"
                      ? "CNIC Front"
                      : "Passport Copy"}
                  </span>

                  <input
                    key={`front-${formData.documentType}`}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={(
                      event
                    ) =>
                      handleFileChange(
                        event,
                        "front"
                      )
                    }
                    required
                  />

                  {documentFront && (
                    <small>
                      {
                        documentFront.name
                      }
                    </small>
                  )}
                </label>

                {formData.documentType ===
                  "cnic" && (
                  <label className="full-field">
                    <span>
                      CNIC Back
                    </span>

                    <input
                      key={`back-${formData.documentType}`}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      onChange={(
                        event
                      ) =>
                        handleFileChange(
                          event,
                          "back"
                        )
                      }
                      required
                    />

                    {documentBack && (
                      <small>
                        {
                          documentBack.name
                        }
                      </small>
                    )}
                  </label>
                )}

                <label>
                  <span>
                    Emergency Contact
                  </span>

                  <div className="input-with-icon">
                    <Phone
                      size={17}
                    />

                    <input
                      type="tel"
                      name="emergencyContact"
                      value={
                        formData.emergencyContact
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Emergency phone number"
                      required
                    />
                  </div>
                </label>

                <label>
                  <span>
                    Vehicle Number
                  </span>

                  <div className="input-with-icon">
                    <Car
                      size={17}
                    />

                    <input
                      type="text"
                      name="vehicleNumber"
                      value={
                        formData.vehicleNumber
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Optional"
                    />
                  </div>
                </label>

                <label className="full-field">
                  <span>
                    Special Requests
                  </span>

                  <div className="textarea-with-icon">
                    <MessageSquareText
                      size={17}
                    />

                    <textarea
                      name="specialRequests"
                      value={
                        formData.specialRequests
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Any special requests for your stay?"
                      rows="4"
                    ></textarea>
                  </div>
                </label>
              </div>
            </section>
          </div>

          <aside className="booking-summary-card">
            <span className="summary-label">
              RESERVATION SUMMARY
            </span>

            <h2>Your Stay</h2>

            <div className="summary-room-icon">
              <MoonStar
                size={27}
              />
            </div>

            {selectedRoom ? (
              <>
                <div className="summary-room">
                  <span>
                    Room{" "}
                    {
                      selectedRoom.roomNumber
                    }
                  </span>

                  <h3>
                    {
                      selectedRoom.name
                    }
                  </h3>

                  <p>
                    {
                      selectedRoom.type
                    }
                  </p>
                </div>

                <div className="summary-lines">
                  <div>
                    <span>
                      Check-In
                    </span>

                    <strong>
                      {
                        formData.checkInDate
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Check-Out
                    </span>

                    <strong>
                      {
                        formData.checkOutDate
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Price per night
                    </span>

                    <strong>
                      Rs.{" "}
                      {Number(
                        selectedRoom.pricePerNight
                      ).toLocaleString()}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Total nights
                    </span>

                    <strong>
                      {totalNights}
                    </strong>
                  </div>

                  <div>
                    <span>
                      Guests
                    </span>

                    <strong>
                      {
                        formData.numberOfGuests
                      }
                    </strong>
                  </div>
                </div>

                <div className="summary-total">
                  <span>
                    Estimated Total
                  </span>

                  <strong>
                    Rs.{" "}
                    {Number(
                      estimatedTotal
                    ).toLocaleString()}
                  </strong>
                </div>
              </>
            ) : (
              <div className="summary-empty">
                Select an available
                room to see your
                reservation summary.
              </div>
            )}

            <button
              type="submit"
              className="booking-submit-btn"
              disabled={
                submitting ||
                loadingRooms ||
                !selectedRoom
              }
            >
              {submitting
                ? "Submitting..."
                : "Request Reservation"}
            </button>

            <p className="booking-note">
              Your reservation will
              remain pending until it
              is reviewed and verified
              by LuxuryStay.
            </p>
          </aside>
        </form>
      </div>
    </main>
  );
}

export default BookRoom;