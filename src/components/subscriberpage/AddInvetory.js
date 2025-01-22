import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { db } from '../../FirebaseConfig';

export default function AddInventory() {
  const [arraymaker, setArrayMaker] = useState([]);
  const [arraycategory, setArrayCategory] = useState([]);
  const [arrayserial, setArraySerial] = useState([]);
  const [selectedcategory, setSelectedCategoty] = useState('');
  const [selectedMaker, setSelectedMaker] = useState('');
  const [serial, setSerial] = useState('');
  const [amount, setAmount] = useState('');
  const [remarks, setRemarks] = useState('');
  const [addDate, setAddDate] = useState('');

  const inventRef = ref(db, `Inventory/New Stock`);

  // Fetch makers on component mount
  useEffect(() => {
    const fetchMaker = async () => {
      const makerSnap = await get(inventRef);
      if (makerSnap.exists()) {
        const makerArray = [];
        makerSnap.forEach((Childmaker) => {
          const maker = Childmaker.key;
          makerArray.push(maker);
        });
        setArrayMaker(makerArray);
      }
    };

    fetchMaker();
  }, [inventRef]);

  // Fetch categories based on the selected maker
  const getCategory = async (maker) => {
    try {
      const categoryRef = ref(db, `Inventory/New Stock/${maker}`);
      const categorySnap = await get(categoryRef);

      if (categorySnap.exists()) {
        const categoryArray = [];
        categorySnap.forEach((childCategory) => {
          const category = childCategory.key;
          categoryArray.push(category);
        });
        setArrayCategory(categoryArray);
      } else {
        setArrayCategory([]);
        console.log('No categories found for this maker.');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getserial = async (category) => {
    console.log(category)
    try {
      const serialRef = ref(db, `Inventory/New Stock/${selectedMaker}/${selectedcategory}`);
      const serialSnap = await get(serialRef);

      if (serialSnap.exists()) {
        const categoryArray = [];
        serialSnap.forEach((childCategory) => {
          const category = childCategory.key;
          categoryArray.push(category);
        });
        console.log(categoryArray);
        setArraySerial(categoryArray);
      } else {
        setArraySerial([]);
        console.log('No Serial found for this Category.');
      }
    } catch (error) {
      console.error('Error fetching Serial Numbers:', error);
    }
  };

  // Handle maker selection and fetch categories
  const handleMakerChange = (e) => {
    const maker = e.target.value;
    setSelectedMaker(maker);
    getCategory(maker);
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategoty(category);
    getserial(category);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          flex: '1',
          margin: '20px',
          border: '1px solid yellow',
          padding: '10px',
          borderRadius: '5px',
          boxShadow: '0 0 10px yellow',
        }}
      >
        <form className="row g-3">
          <div className="col-md-1">
            <label htmlFor="productCode" className="form-label">
              Product Code
            </label>
            <input
              type="text"
              className="form-control"
              id="productCode"
              value="Auto"
              readOnly
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="addDate" className="form-label">
              Product Add Date
            </label>
            <input
              className="form-control"
              type="date"
              id="addDate"
              value={addDate}
              onChange={(e) => setAddDate(e.target.value)}
            />
          </div>

          <div className="col-md-3">
            <label htmlFor="amount" className="form-label">
              Amount
            </label>
            <input
              type="number"
              className="form-control"
              id="amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div className="col-md-2">
            <label htmlFor="productMaker" className="form-label">
              Product Maker
            </label>
            <select
              id="productMaker"
              className="form-select"
              value={selectedMaker}
              onChange={handleMakerChange}
            >
              <option value="">
                Choose...
              </option>
              {arraymaker.length > 0 ? (
                arraymaker.map((maker, index) => (
                  <option key={index} value={maker}>
                    {maker}
                  </option>
                ))
              ) : (
                <option value="">No Maker Available</option>
              )}
            </select>
          </div>

          <div className="col-md-3">
            <label htmlFor="productCategory" className="form-label">
              Product Category
            </label>
            <select onChange={handleCategoryChange} id="productCategory" className="form-select">
              <option value="" >
                Choose...
              </option>
              {arraycategory.length > 0 ? (
                arraycategory.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))
              ) : (
                <option value="">No Category Available</option>
              )}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label">
              Product Serial No.
            </label>
            <input
              type="text"
              className="form-control"
              id="serial"
              list="serials" // Match this with the datalist ID
            />
            <datalist id="serials"> {/* Corrected ID */}
              {arrayserial && arrayserial.length > 0 ? (
                arrayserial.map((serial, index) => (
                  <option key={index} value={serial}>
                    {serial}
                  </option>
                ))
              ) : (
                <option value="No serials available" disabled />
              )}
            </datalist>
          </div>


          <div className="col-md-6">
            <label htmlFor="remarks" className="form-label">
              Remarks
            </label>
            <input
              type="text"
              className="form-control"
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          <div className="col-8">
            <button type="button" className="btn btn-outline-success">
              Save Details
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
