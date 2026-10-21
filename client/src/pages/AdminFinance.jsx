import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Banknote,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Hotel,
  Landmark,
  LoaderCircle,
  LockKeyhole,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import API_BASE_URL from "../config/api";
import "./AdminFinance.css";

function AdminFinance() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalBilled: 0,
    totalRevenue: 0,
    totalOutstanding: 0,
    paidBookings: 0,
    partialBookings: 0,
    unpaidBookings: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const [paymentForm, setPaymentForm] = useState({
    amount: "",
    paymentMethod: "cash",
    transactionReference: "",
  });

  const formatMoney = (amount) =>
    `Rs. ${Number(amount || 0).toLocaleString()}`;

  const formatDate = (date) => {
    if (!date) return "Not recorded";

    return new Date(date).toLocaleDateString("en-PK", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const fetchFinance = async (showRefresh = false) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/admin/finance`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to load finance records."
        );
      }

      setBookings(data.bookings || []);

      setSummary({
        totalBilled: data.summary?.totalBilled || 0,
        totalRevenue: data.summary?.totalRevenue || 0,
        totalOutstanding: data.summary?.totalOutstanding || 0,
        paidBookings: data.summary?.paidBookings || 0,
        partialBookings: data.summary?.partialBookings || 0,
        unpaidBookings: data.summary?.unpaidBookings || 0,
      });
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const collectionPercentage =
    summary.totalBilled > 0
      ? Math.min(
          Math.round(
            (summary.totalRevenue / summary.totalBilled) * 100
          ),
          100
        )
      : 0;

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const guestName =
        booking.guestDetails?.fullName ||
        booking.guest?.name ||
        "";

      const guestEmail =
        booking.guestDetails?.email ||
        booking.guest?.email ||
        "";

      const roomNumber = booking.room?.roomNumber || "";

      const invoiceNumber = `LS-${booking._id
        ?.slice(-6)
        .toUpperCase()}`;

      const value = search.toLowerCase().trim();

      const matchesSearch =
        !value ||
        guestName.toLowerCase().includes(value) ||
        guestEmail.toLowerCase().includes(value) ||
        String(roomNumber).toLowerCase().includes(value) ||
        invoiceNumber.toLowerCase().includes(value);

      const status = booking.paymentStatus || "unpaid";

      const matchesFilter =
        filter === "all" || status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [bookings, search, filter]);

  const openPayment = (booking) => {
    const remaining =
      Number(booking.totalAmount || 0) -
      Number(booking.amountPaid || 0);

    setSelectedBooking({
      ...booking,
      remainingAmount: Math.max(remaining, 0),
    });

    setPaymentForm({
      amount: "",
      paymentMethod: "cash",
      transactionReference: "",
    });

    setMessage("");
  };

  const closePayment = () => {
    if (saving) return;

    setSelectedBooking(null);
    setMessage("");

    setPaymentForm({
      amount: "",
      paymentMethod: "cash",
      transactionReference: "",
    });
  };

  const handlePaymentChange = (event) => {
    const { name, value } = event.target;

    setPaymentForm((current) => ({
      ...current,
      [name]: value,
      ...(name === "paymentMethod"
        ? { transactionReference: "" }
        : {}),
    }));
  };

  const setFullBalance = () => {
    if (!selectedBooking) return;

    setPaymentForm((current) => ({
      ...current,
      amount: String(selectedBooking.remainingAmount),
    }));
  };

  const handlePayment = async (event) => {
    event.preventDefault();

    if (!selectedBooking) return;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/bookings/admin/${selectedBooking._id}/payment`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(paymentForm),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Unable to record payment."
        );
      }

      setMessage(data.message);
      setMessageType("success");

      await fetchFinance();

      setTimeout(() => {
        setSelectedBooking(null);
        setMessage("");
      }, 1000);
    } catch (error) {
      setMessage(error.message);
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const paymentMethodInfo = {
    cash: {
      title: "Cash",
      subtitle: "Front desk collection",
      icon: Banknote,
    },
    card: {
      title: "Card",
      subtitle: "Debit or credit card",
      icon: CreditCard,
    },
    "bank-transfer": {
      title: "Bank Transfer",
      subtitle: "Direct bank payment",
      icon: Landmark,
    },
  };

  return (
    <main className="finance-page">
      <div className="finance-ambient ambient-one"></div>
      <div className="finance-ambient ambient-two"></div>
      <div className="finance-ambient ambient-three"></div>

      <div className="finance-shell">
        <header className="finance-topbar">
          <button
            type="button"
            className="finance-back"
            onClick={() => navigate("/admin")}
          >
            <ArrowLeft size={18} />
            <span>Control Center</span>
          </button>

          <div className="finance-brand">
            <div className="finance-brand-mark">
              <Hotel size={21} />
            </div>

            <div>
              <strong>LuxuryStay</strong>
              <span>Financial Operations</span>
            </div>
          </div>

          <button
            type="button"
            className="finance-refresh"
            onClick={() => fetchFinance(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "finance-spin" : ""}
            />
            <span>
              {refreshing ? "Syncing" : "Sync Ledger"}
            </span>
          </button>
        </header>

        <section className="finance-hero">
          <div className="finance-hero-copy">
            <div className="finance-eyebrow">
              <Sparkles size={14} />
              LUXURYSTAY PAYMENT COMMAND CENTER
            </div>
<h1>
  Where every
  <span> payment </span>
  finds its place.
</h1>

            <p>
              A live financial workspace for hotel billing,
              collections and outstanding guest balances.
            </p>

            <div className="finance-security-row">
              <span>
                <ShieldCheck size={15} />
                Admin secured
              </span>

              <span>
                <LockKeyhole size={15} />
                Protected ledger
              </span>

              <span>
                <CircleDollarSign size={15} />
                Live collections
              </span>
            </div>
          </div>

          <div className="finance-vault">
            <div className="vault-glow"></div>

            <div className="vault-header">
              <div>
                <span>COLLECTION VAULT</span>
                <strong>Revenue Pulse</strong>
              </div>

              <div className="vault-live">
                <i></i>
                LIVE
              </div>
            </div>

            <div className="vault-body">
              <div
                className="collection-ring"
                style={{
                  "--collection": `${collectionPercentage * 3.6}deg`,
                }}
              >
                <div className="collection-ring-inner">
                  <span>{collectionPercentage}%</span>
                  <small>COLLECTED</small>
                </div>
              </div>

              <div className="vault-amount">
                <span>RECEIVED</span>
                <strong>
                  {formatMoney(summary.totalRevenue)}
                </strong>
                <small>
                  of {formatMoney(summary.totalBilled)}
                </small>
              </div>
            </div>

            <div className="vault-footer">
              <div>
                <span>Outstanding</span>
                <strong>
                  {formatMoney(summary.totalOutstanding)}
                </strong>
              </div>

              <div>
                <span>Settled Folios</span>
                <strong>{summary.paidBookings}</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="finance-metrics">
          <article className="metric-card metric-billed">
            <div className="metric-number">01</div>

            <div className="metric-icon">
              <ReceiptText size={22} />
            </div>

            <span>Total Portfolio</span>
            <strong>{formatMoney(summary.totalBilled)}</strong>
            <small>Value of active hotel bills</small>
          </article>

          <article className="metric-card">
            <div className="metric-number">02</div>

            <div className="metric-icon">
              <WalletCards size={22} />
            </div>

            <span>Collected</span>
            <strong>
              {formatMoney(summary.totalRevenue)}
            </strong>
            <small>Payments successfully received</small>
          </article>

          <article className="metric-card">
            <div className="metric-number">03</div>

            <div className="metric-icon">
              <CircleDollarSign size={22} />
            </div>

            <span>Receivable</span>
            <strong>
              {formatMoney(summary.totalOutstanding)}
            </strong>
            <small>Balance awaiting collection</small>
          </article>
        </section>

        <section className="payment-dock">
          <div className="payment-dock-heading">
            <div>
              <span>PAYMENT GATEWAY</span>
              <h2>Collection Channels</h2>
            </div>

            <p>
              Three payment channels connected to your
              billing workflow.
            </p>
          </div>

          <div className="payment-channel-grid">
            <article className="payment-channel cash-channel">
              <div className="channel-top">
                <div className="channel-icon">
                  <Banknote size={31} />
                </div>

                <span>01</span>
              </div>

              <h3>Cash</h3>
              <p>Front Desk Collection</p>

              <div className="channel-line">
                <span></span>
              </div>

              <small>
                Instant manual payment recording
              </small>
            </article>

            <article className="payment-channel card-channel">
              <div className="channel-card-visual">
                <div className="card-chip">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

                <CreditCard size={25} />

                <div className="card-dots">
                  •••• &nbsp; •••• &nbsp; LS26
                </div>
              </div>

              <div className="channel-top">
                <div className="channel-icon">
                  <CreditCard size={31} />
                </div>

                <span>02</span>
              </div>

              <h3>Card</h3>
              <p>Debit / Credit Collection</p>

              <div className="channel-line">
                <span></span>
              </div>

              <small>
                Transaction reference protected
              </small>
            </article>

            <article className="payment-channel bank-channel">
              <div className="channel-top">
                <div className="channel-icon">
                  <Building2 size={31} />
                </div>

                <span>03</span>
              </div>

              <h3>Bank Transfer</h3>
              <p>Direct Account Settlement</p>

              <div className="channel-line">
                <span></span>
              </div>

              <small>
                Reference-based bank collection
              </small>
            </article>
          </div>
        </section>

        <section className="ledger-section">
          <div className="ledger-heading">
            <div>
              <span>THE FOLIO ARCHIVE</span>
              <h2>Guest Billing Ledger</h2>
            </div>

            <div className="ledger-controls">
              <label className="ledger-search">
                <Search size={18} />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Guest, room or folio..."
                />
              </label>

              <select
                value={filter}
                onChange={(event) =>
                  setFilter(event.target.value)
                }
              >
                <option value="all">All Folios</option>
                <option value="unpaid">Unpaid</option>
                <option value="partial">Partial</option>
                <option value="paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="ledger-status-rail">
            <button
              type="button"
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              <span>All</span>
              <strong>{bookings.length}</strong>
            </button>

            <button
              type="button"
              className={filter === "unpaid" ? "active" : ""}
              onClick={() => setFilter("unpaid")}
            >
              <i className="unpaid-dot"></i>
              <span>Unpaid</span>
              <strong>{summary.unpaidBookings}</strong>
            </button>

            <button
              type="button"
              className={filter === "partial" ? "active" : ""}
              onClick={() => setFilter("partial")}
            >
              <i className="partial-dot"></i>
              <span>Partial</span>
              <strong>{summary.partialBookings}</strong>
            </button>

            <button
              type="button"
              className={filter === "paid" ? "active" : ""}
              onClick={() => setFilter("paid")}
            >
              <i className="paid-dot"></i>
              <span>Paid</span>
              <strong>{summary.paidBookings}</strong>
            </button>
          </div>

          {loading ? (
            <div className="finance-empty">
              <LoaderCircle
                size={34}
                className="finance-spin"
              />
              <h3>Opening financial vault...</h3>
              <p>Your live billing records are being prepared.</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="finance-empty">
              <ReceiptText size={38} />
              <h3>No folios found</h3>
              <p>
                Confirmed bookings will automatically enter
                the finance ledger.
              </p>
            </div>
          ) : (
            <div className="folio-grid">
              {filteredBookings.map((booking, index) => {
                const guestName =
                  booking.guestDetails?.fullName ||
                  booking.guest?.name ||
                  "Guest";

                const guestEmail =
                  booking.guestDetails?.email ||
                  booking.guest?.email ||
                  "No email";

                const status =
                  booking.paymentStatus || "unpaid";

                const paid = Number(
                  booking.amountPaid || 0
                );

                const total = Number(
                  booking.totalAmount || 0
                );

                const remaining = Math.max(
                  total - paid,
                  0
                );

                const paidPercent =
                  total > 0
                    ? Math.min(
                        Math.round((paid / total) * 100),
                        100
                      )
                    : 0;

                const invoiceNumber = `LS-${booking._id
                  ?.slice(-6)
                  .toUpperCase()}`;

                return (
                  <article
                    className={`folio-card ${status}`}
                    key={booking._id}
                  >
                    <div className="folio-edge">
                      <span>{String(index + 1).padStart(2, "0")}</span>
                    </div>

                    <div className="folio-content">
                      <div className="folio-top">
                        <div className="folio-id">
                          <span>HOTEL FOLIO</span>
                          <strong>#{invoiceNumber}</strong>
                        </div>

                        <div
                          className={`folio-status ${status}`}
                        >
                          {status === "paid" && (
                            <Check size={13} />
                          )}
                          {status}
                        </div>
                      </div>

                      <div className="folio-guest">
                        <div className="folio-avatar">
                          {guestName
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <span>GUEST</span>
                          <h3>{guestName}</h3>
                          <p>{guestEmail}</p>
                        </div>

                        <div className="folio-room">
                          <span>ROOM</span>
                          <strong>
                            {booking.room?.roomNumber ||
                              "N/A"}
                          </strong>
                        </div>
                      </div>

                      <div className="folio-dashed-line">
                        <span></span>
                      </div>

                      <div className="folio-stay">
                        <div>
                          <span>NIGHTS</span>
                          <strong>
                            {booking.totalNights || 0}
                          </strong>
                        </div>

                        <div>
                          <span>RATE / NIGHT</span>
                          <strong>
                            {formatMoney(
                              booking.pricePerNight
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>STAY STATUS</span>
                          <strong className="folio-booking-status">
                            {booking.bookingStatus}
                          </strong>
                        </div>
                      </div>

                      <div className="folio-bill">
                        <div>
                          <span>TOTAL BILL</span>
                          <strong>
                            {formatMoney(total)}
                          </strong>
                        </div>

                        <div>
                          <span>RECEIVED</span>
                          <strong>
                            {formatMoney(paid)}
                          </strong>
                        </div>

                        <div className="folio-balance">
                          <span>BALANCE</span>
                          <strong>
                            {formatMoney(remaining)}
                          </strong>
                        </div>
                      </div>

                      <div className="folio-progress">
                        <div>
                          <span>Payment completion</span>
                          <strong>{paidPercent}%</strong>
                        </div>

                        <div className="folio-progress-track">
                          <span
                            style={{
                              width: `${paidPercent}%`,
                            }}
                          ></span>
                        </div>
                      </div>

                      <div className="folio-footer">
                        <div className="folio-last-payment">
                          {booking.paymentMethod ? (
                            <>
                              <span>LAST COLLECTION</span>

                              <strong>
                                {booking.paymentMethod.replace(
                                  "-",
                                  " "
                                )}
                                <small>
                                  {formatDate(
                                    booking.paymentDate
                                  )}
                                </small>
                              </strong>
                            </>
                          ) : (
                            <>
                              <span>COLLECTION STATUS</span>
                              <strong>
                                Awaiting payment
                              </strong>
                            </>
                          )}
                        </div>

                        {status === "paid" ? (
                          <div className="folio-settled">
                            <CheckCircle2 size={17} />
                            Settled
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="folio-pay-button"
                            onClick={() =>
                              openPayment(booking)
                            }
                          >
                            Collect
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {selectedBooking && (
        <div
          className="payment-terminal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closePayment();
            }
          }}
        >
          <section className="payment-terminal">
            <div className="terminal-head">
              <div className="terminal-brand">
                <div>
                  <WalletCards size={23} />
                </div>

                <span>
                  <strong>Payment Terminal</strong>
                  LuxuryStay Financial Operations
                </span>
              </div>

              <button
                type="button"
                onClick={closePayment}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <div className="terminal-body">
              <div className="terminal-guest-strip">
                <div>
                  <UserRound size={18} />
                </div>

                <span>
                  <small>COLLECTING FROM</small>
                  <strong>
                    {selectedBooking.guestDetails
                      ?.fullName ||
                      selectedBooking.guest?.name ||
                      "Guest"}
                  </strong>
                </span>

                <div className="terminal-room">
                  Room{" "}
                  {selectedBooking.room?.roomNumber ||
                    "N/A"}
                </div>
              </div>

              <div className="terminal-balance">
                <span>OUTSTANDING BALANCE</span>

                <strong>
                  {formatMoney(
                    selectedBooking.remainingAmount
                  )}
                </strong>

                <small>
                  Enter the amount received from the guest.
                </small>
              </div>

              <form onSubmit={handlePayment}>
                <div className="terminal-section-title">
                  <span>01</span>
                  Amount Received
                </div>

                <div className="terminal-amount">
                  <span>PKR</span>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    max={selectedBooking.remainingAmount}
                    value={paymentForm.amount}
                    onChange={handlePaymentChange}
                    placeholder="0"
                    required
                  />

                  <button
                    type="button"
                    onClick={setFullBalance}
                  >
                    FULL
                  </button>
                </div>

                <div className="terminal-section-title method-title">
                  <span>02</span>
                  Choose Payment Channel
                </div>

                <div className="terminal-methods">
                  {Object.entries(paymentMethodInfo).map(
                    ([value, method]) => {
                      const Icon = method.icon;

                      const selected =
                        paymentForm.paymentMethod ===
                        value;

                      return (
                        <label
                          key={value}
                          className={
                            selected
                              ? "terminal-method selected"
                              : "terminal-method"
                          }
                        >
                          <input
                            type="radio"
                            name="paymentMethod"
                            value={value}
                            checked={selected}
                            onChange={handlePaymentChange}
                          />

                          <div className="terminal-method-icon">
                            <Icon size={26} />
                          </div>

                          <span>
                            <strong>
                              {method.title}
                            </strong>
                            <small>
                              {method.subtitle}
                            </small>
                          </span>

                          <div className="method-check">
                            {selected && (
                              <Check size={13} />
                            )}
                          </div>
                        </label>
                      );
                    }
                  )}
                </div>

                {paymentForm.paymentMethod !== "cash" && (
                  <div className="terminal-reference">
                    <label>
                      Transaction Reference
                    </label>

                    <div>
                      <LockKeyhole size={17} />

                      <input
                        type="text"
                        name="transactionReference"
                        value={
                          paymentForm.transactionReference
                        }
                        onChange={handlePaymentChange}
                        placeholder={
                          paymentForm.paymentMethod ===
                          "card"
                            ? "Enter card transaction reference"
                            : "Enter bank transfer reference"
                        }
                        required
                      />
                    </div>
                  </div>
                )}

                {message && (
                  <div
                    className={`terminal-message ${messageType}`}
                  >
                    {messageType === "success" ? (
                      <CheckCircle2 size={18} />
                    ) : (
                      <X size={18} />
                    )}

                    {message}
                  </div>
                )}

                <div className="terminal-secure">
                  <ShieldCheck size={15} />
                  Payment will be securely recorded in the
                  LuxuryStay billing ledger.
                </div>

                <button
                  type="submit"
                  className="terminal-confirm"
                  disabled={saving}
                >
                  {saving ? (
                    <LoaderCircle
                      size={19}
                      className="finance-spin"
                    />
                  ) : (
                    <CircleDollarSign size={19} />
                  )}

                  <span>
                    {saving
                      ? "Processing Collection..."
                      : "Confirm & Record Payment"}
                  </span>

                  {!saving && <ChevronRight size={18} />}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

export default AdminFinance;