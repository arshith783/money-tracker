import React, { useState, useEffect } from "react";
import { db } from "./firebase";
import { collection, addDoc, getDocs, updateDoc, doc } from "firebase/firestore";

function App() {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [interest, setInterest] = useState("");
  const [filter, setFilter] = useState("all");

  const transactionsRef = collection(db, "transactions");

  // Load data
  const getTransactions = async () => {
    const data = await getDocs(transactionsRef);
    setTransactions(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
  getTransactions();
  // eslint-disable-next-line
}, []);

  // Add data
  const addTransaction = async () => {
    if (!name || !amount) return;

    await addDoc(transactionsRef, {
      name,
      amount,
      paid: false,
    });

    await addDoc(transactionsRef, {
      name,
      amount,
      dueDate,
      paid: false,
    });

    await addDoc(transactionsRef, {
      name,
      amount,
      interest,
      dueDate,
      paid: false,
    });

    setName("");
    setAmount("");
    getTransactions();
  };

  // Mark as paid
  const markPaid = async (id) => {
    const transactionDoc = doc(db, "transactions", id);
    await updateDoc(transactionDoc, { paid: true });
    getTransactions();
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Money Lending Tracker 💰</h1>

    <div style={{ marginBottom: "10px" }}>
      <button onClick={() => setFilter("all")}>All</button>
      <button onClick={() => setFilter("paid")}>Paid</button>
      <button onClick={() => setFilter("pending")}>Pending</button>
    </div>

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
          Total: ₹{(Number(t.amount) * (1 + Number(t.interest) / 100)).toFixed(2)} - Due: {t.dueDate} - {t.paid ? "Paid" : "Pending"}

          <button onClick={() => markPaid(t.id)}>Mark Paid</button>
        </div>
      ))}
    </div>
  );
}

export default App;