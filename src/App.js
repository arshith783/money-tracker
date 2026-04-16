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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Money Lending Tracker 💰</h1>

      {/* FILTER */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => setFilter("all")}>All</button>
        <button onClick={() => setFilter("paid")}>Paid</button>
        <button onClick={() => setFilter("pending")}>Pending</button>
      </div>

      {/* 🔐 AUTH SECTION */}
      {!user ? (
        <>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={signup}>Sign Up</button>
          <button onClick={login}>Login</button>
        </>
      ) : (
        <>
          <p>Welcome: {user.email}</p>
          <button onClick={logout}>Logout</button>
        </>
      )}

      <hr />

      {/* ➕ ADD TRANSACTION */}
      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      <input
        placeholder="Interest %"
        value={interest}
        onChange={(e) => setInterest(e.target.value)}
      />

      <button onClick={addTransaction}>Add</button>

      <h2>Transactions</h2>

      {transactions
        .filter((t) => {
          if (filter === "paid") return t.paid;
          if (filter === "pending") return !t.paid;
          return true;
        })
        .map((t) => (
          <div key={t.id}>
            {t.name} - ₹{t.amount} - Interest: {t.interest}% - Total: ₹
            {(
              Number(t.amount) *
              (1 + Number(t.interest || 0) / 100)
            ).toFixed(2)}{" "}
            - Due: {t.dueDate} - {t.paid ? "Paid" : "Pending"}

            <button onClick={() => markPaid(t.id)}>Mark Paid</button>
          </div>
        ))}
    </div>
  );
}

export default App;