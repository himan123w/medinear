import { useState } from "react";
import { medicineAPI } from './api';

function Home() {
  const [query, setQuery] = useState("");
  const [medicines, setMedicines] = useState([]);

  const searchMedicine = async () => {
    try {
      const res = await medicineAPI.search(query);
      setMedicines(res.data?.data || res.data || []);
    } catch (error) {
      console.error(error);
      alert("Error fetching medicines");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>🏥 MediNear - Find Medicines Nearby</h1>

      <input
        type="text"
        placeholder="Enter medicine name"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <button onClick={searchMedicine}>Search</button>

      <div>
        {medicines.map((item) => (
          <div
            key={item._id}
            style={{
              border: "1px solid gray",
              marginTop: "10px",
              padding: "10px",
            }}
          >
            <h3>{item.name}</h3>
            <p>Price: ₹{item.price}</p>
            <p>Stock: {item.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;