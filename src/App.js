import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { deleteDoc } from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [interest, setInterest] = useState("");
  const [filter, setFilter] = useState("all");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [user, setUser] = useState(null);

  const transactionsRef = collection(db, "transactions");

  // 🔐 Detect logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // 📦 Load user-specific data
  useEffect(() => {
    if (user) {
      getTransactions();
    } else {
      setTransactions([]);
    }
  }, [user]);

  const getTransactions = async () => {
    if (!user) return;

    const q = query(transactionsRef, where("userId", "==", user.uid));
    const data = await getDocs(q);

    setTransactions(
      data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }))
    );
  };

  // ➕ Add transaction
  const addTransaction = async () => {
    if (!name || !amount) return;

    if (!user) {
      alert("Please login first");
      return;
    }

    await addDoc(transactionsRef, {
      name,
      amount,
      interest,
      dueDate,
      paid: false,
      userId: user.uid,
    });

    setName("");
    setAmount("");
    setInterest("");
    setDueDate("");

    getTransactions();
  };

  // ✅ Mark paid
  const markPaid = async (id) => {
    const transactionDoc = doc(db, "transactions", id);
    await updateDoc(transactionDoc, { paid: true });
    getTransactions();
  };

  // 🔐 Signup
  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      alert("User registered");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔐 Login
  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Logged in");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔓 Logout
  const logout = async () => {
    await signOut(auth);
    alert("Logged out");
  };

  const totalAmount = transactions.reduce(
  (sum, t) => sum + Number(t.amount || 0),
  0
);

const deleteTransaction = async (id) => {
  const transactionDoc = doc(db, "transactions", id);
  await deleteDoc(transactionDoc);
  getTransactions();
};

const totalPending = transactions
  .filter((t) => !t.paid)
  .reduce((sum, t) => sum + Number(t.amount || 0), 0);

const totalPaid = transactions
  .filter((t) => t.paid)
  .reduce((sum, t) => sum + Number(t.amount || 0), 0);

  return (
  <div
    style={{
      maxWidth: "600px",
      margin: "auto",
      padding: "20px",
      fontFamily: "Arial",
    }}
  >
    <h1
  style={{
    textAlign: "center",
    color: "#333",
    marginBottom: "20px",
  }}
>
  AK Finance 💰
</h1>
    <div
  style={{
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
  }}
>
  <div
    style={{
      flex: 1,
      margin: "5px",
      padding: "15px",
      background: "#f0f8ff",
      borderRadius: "10px",
      textAlign: "center",
    }}
  >
    <h3>Total</h3>
    <p>₹{totalAmount}</p>
  </div>

  <div
    style={{
      flex: 1,
      margin: "5px",
      padding: "15px",
      background: "#fff3cd",
      borderRadius: "10px",
      textAlign: "center",
    }}
  >
    <h3>Pending</h3>
    <p>₹{totalPending}</p>
  </div>

  <div
    style={{
      flex: 1,
      margin: "5px",
      padding: "15px",
      background: "#d4edda",
      borderRadius: "10px",
      textAlign: "center",
    }}
  >
    <h3>Paid</h3>
    <p>₹{totalPaid}</p>
  </div>
</div>

    {/* AUTH */}
    {!user ? (
      <div style={{ marginBottom: "20px" }}>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ marginRight: "10px", padding: "8px" }}
        />

        <button onClick={signup} style={{ marginRight: "10px" }}>
          Sign Up
        </button>
        <button onClick={login}>Login</button>
      </div>
    ) : (
      <div style={{ marginBottom: "20px" }}>
        <p>Welcome: {user.email}</p>
        <button onClick={logout}>Logout</button>
      </div>
    )}

    {/* ADD FORM */}
    <div style={{ marginBottom: "20px" }}>
      <div
  style={{
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "15px",
  }}
>
  <input
    placeholder="Name"
    value={name}
    onChange={(e) => setName(e.target.value)}
    style={{ flex: "1 1 45%", padding: "8px" }}
  />

  <input
    placeholder="Amount"
    value={amount}
    onChange={(e) => setAmount(e.target.value)}
    style={{ flex: "1 1 45%", padding: "8px" }}
  />

  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    style={{ flex: "1 1 45%", padding: "8px" }}
  />

  <input
    placeholder="Interest %"
    value={interest}
    onChange={(e) => setInterest(e.target.value)}
    style={{ flex: "1 1 45%", padding: "8px" }}
  />
</div>

      <button
  onClick={addTransaction}
  style={{
    padding: "8px 15px",
    borderRadius: "5px",
    border: "none",
    background: "#007bff",
    color: "white",
    cursor: "pointer",
  }}
>
  Add
  
</button>
    </div>

    {/* FILTER */}
    <div style={{ marginBottom: "20px" }}>
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("paid")} style={{ marginLeft: "10px" }}>
        Paid
      </button>
      <button
        onClick={() => setFilter("pending")}
        style={{ marginLeft: "10px" }}
      >
        Pending
      </button>
    </div>

    {/* TRANSACTIONS */}
    <h2>Transactions</h2>

    {transactions
      .filter((t) => {
        if (filter === "paid") return t.paid;
        if (filter === "pending") return !t.paid;
        return true;
      })
      .map((t) => {
  const isOverdue =
    !t.paid && t.dueDate && new Date(t.dueDate) < new Date();

  return (
    <div
      key={t.id}
      style={{
        borderRadius: "10px",
        padding: "15px",
        marginBottom: "10px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        background: isOverdue
          ? "#ffcccc"
          : t.paid
          ? "#d4edda"
          : "#fff3cd",
      }}
    >
      <strong>{t.name}</strong> — ₹{t.amount}
      <br />
      Interest: {t.interest}% | Total: ₹
      {(
        Number(t.amount) *
        (1 + Number(t.interest || 0) / 100)
      ).toFixed(2)}
      <br />
      Due: {t.dueDate}
      <br />
      Status: {t.paid ? "✅ Paid" : "⏳ Pending"}

      {isOverdue && (
        <p style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ Overdue
        </p>
      )}

      <button onClick={() => markPaid(t.id)}>Mark Paid</button>

      <button
        onClick={() => deleteTransaction(t.id)}
        style={{
          marginLeft: "10px",
          background: "red",
          color: "white",
          border: "none",
          padding: "5px 10px",
          borderRadius: "5px",
        }}
      >
        Delete
      </button>
    </div>
  );
})}
  </div>
  
);
}

export default App;