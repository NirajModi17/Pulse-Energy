import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { auth } from '../../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getDoc,
} from 'firebase/firestore';

import './homes.css'; // Import the styles

function Homes(props) {
  const [user, setUser] = useState(null);
  const [shops, setShops] = useState([]);
  const [newShop, setNewShop] = useState({
    name: '',
    shopBio: '',
    address: '',
    latitude: '',
    longitude: '',
  });

  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: 0,
    tags: [],
    stock: 0,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShop, setSelectedShop] = useState(null);
  const [addselectedShop, setaddSelectedShop] = useState(null);

  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isViewProductsModalOpen, setIsViewProductsModalOpen] = useState(false);
  const [shopProducts, setShopProducts] = useState([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        console.log(user);
        fetchShops(user.uid);
      } else {
        setUser(null);
        setShops([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchShops = async (userId) => {
    try {
      const q = query(collection(db, 'shops'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetchedShops = [];
      querySnapshot.forEach((doc) => {
        fetchedShops.push({ id: doc.id, ...doc.data() });
      });
      setShops(fetchedShops);
    } catch (error) {
      console.error('Error fetching shops:', error);
    }
  };

  const fetchProductsForShop = async (shopId) => {
    try {
      const q = query(collection(db, 'shops', shopId, 'products'));
      const querySnapshot = await getDocs(q);
      const products = [];
      querySnapshot.forEach((doc) => {
        products.push({ id: doc.id, ...doc.data() });
      });
      setShopProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const createShop = async () => {
    if (user) {
      try {
        await addDoc(collection(db, 'shops'), {
          ...newShop,
          userId: user.uid,
        });
        setNewShop({
          name: '',
          shopBio: '',
          address: '',
          latitude: '',
          longitude: '',
        });
        fetchShops(user.uid);
        closeModal();
      } catch (error) {
        console.error('Error creating shop:', error);
      }
    }
  };

  const handleProductChange = (field, value) => {
    setNewProduct({ ...newProduct, [field]: value });
  };

  const addProduct = async (shopId) => {
    try {
      await addDoc(collection(db, 'shops', shopId, 'products'), newProduct);

      setNewProduct({
        name: '',
        description: '',
        price: 0,
        tags: [],
        stock: 0,
      });

      closeAddProductModal();
      fetchProductsForShop(shopId); // Fetch updated products after adding a new one
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const openModal1 = async (shop) => {
    setSelectedShop(shop);
    // await fetchProductsForShop(shop.id);
  };

  const closeModal1 = () => {
    setSelectedShop(null);
    setShopProducts([]); // Clear products when closing the modal
  };

  const openAddProductModal = (shop) => {
    setaddSelectedShop(shop);
    setIsAddProductModalOpen(true);
  };

  const closeAddProductModal = () => {
    setIsAddProductModalOpen(false);
  };

  const openViewProductsModal = (shop) => {
    setIsViewProductsModalOpen(true);
    fetchProductsForShop(shop.id);
  };

  const closeViewProductsModal = () => {
    setIsViewProductsModalOpen(false);
  };

  return (
    <div>
      {user ? (
        <div>
          <h1>Welcome, {user.displayName}</h1>

          <div>
            <button className="create-shop-button" onClick={openModal}>
              Create Shop
            </button>

            {isModalOpen && (
              <div className="modal">
                <h2>Create a Shop</h2>
                <input
                  type="text"
                  placeholder="Shop Name"
                  value={newShop.name}
                  onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Shop Bio"
                  value={newShop.shopBio}
                  onChange={(e) => setNewShop({ ...newShop, shopBio: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newShop.address}
                  onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Latitude"
                  value={newShop.latitude}
                  onChange={(e) => setNewShop({ ...newShop, latitude: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Longitude"
                  value={newShop.longitude}
                  onChange={(e) => setNewShop({ ...newShop, longitude: e.target.value })}
                />
                <button onClick={createShop}>Create Shop</button>
                <button onClick={closeModal}>Close</button>
              </div>
            )}
          </div>

          <div>
            <h2>Your Shops</h2>
            {shops.map((shop) => (
              <div key={shop.id} className="shop-item">
                <p>Shop Name: {shop.name}</p>
                <div>
                  <button className='shop-details-button' onClick={() => openModal1(shop)}>Details</button>
                  <button className='add-product-button' onClick={() => openAddProductModal(shop)}>Add Product</button>
                  <button className='view-products-button' onClick={() => openViewProductsModal(shop)}>View Products</button>
                </div>
                {/* Display products for the selected shop */}
                {/* {selectedShop && selectedShop.id === shop.id && (
                  <div>
                    <h3>Products</h3>
                    {shopProducts.map((product) => (
                      <div key={product.id}>
                        <p>Product Name: {product.name}</p>
                        <p>Description: {product.description}</p>
                        <p>Price: {product.price}</p>
                        <p>Stock: {product.stock}</p>
                      </div>
                    ))}
                  </div>
                )} */}
              </div>
            ))}
          </div>

          {/* Display details of the selected shop */}
          {selectedShop && (
            <div className="modal">
              <h2>Shop Details</h2>
              <p>Shop Name: {selectedShop.name}</p>
              <p>Shop Bio: {selectedShop.shopBio}</p>
              <p>Address: {selectedShop.address}</p>
              <p>Latitude: {selectedShop.latitude}</p>
              <p>Longitude: {selectedShop.longitude}</p>
              <button onClick={closeModal1}>Close</button>
            </div>
          )}

{isAddProductModalOpen && (
            <div className="modal">
              <h2>Add Product</h2>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => handleProductChange('name', e.target.value)}
              />
              <input
                type="text"
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => handleProductChange('description', e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => handleProductChange('price', e.target.value)}
              />
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                value={newProduct.tags}
                onChange={(e) => handleProductChange('tags', e.target.value.split(','))}
              />
              <input
                type="number"
                placeholder="Stock"
                value={newProduct.stock}
                onChange={(e) => handleProductChange('stock', e.target.value)}
              />
              <button onClick={() => addProduct(addselectedShop.id)}>Add Product</button>
              <button onClick={closeAddProductModal}>Close</button>
            </div>
          )}

          {/* View Products Modal */}
          {isViewProductsModalOpen && (
            <div className="modal">
              <h2>Products</h2>
              {shopProducts.map((product) => (
                <div key={product.id}>
                  <p>Product Name: {product.name}</p>
                  <p>Description: {product.description}</p>
                  <p>Price: {product.price}</p>
                  <p>Stock: {product.stock}</p>
                </div>
              ))}
              <button onClick={closeViewProductsModal}>Close</button>
            </div>
          )}
        </div>
      ) : (
        <button>Log In</button>
      )}
    </div>
  );
}

export default Homes;


// export default Homes;import React, { useState, useEffect } from 'react';
// import { db } from '../../firebase';
// import { auth } from '../../firebase';
// import { onAuthStateChanged } from 'firebase/auth';
// import {
//   collection,
//   doc,
//   setDoc,
//   addDoc,
//   getDocs,
//   query,
//   where,
// } from 'firebase/firestore';

// import './homes.css'; // Import the styles

// function Homes(props) {
//   const [user, setUser] = useState(null);
//   const [shops, setShops] = useState([]);
//   const [newShop, setNewShop] = useState({
//     name: '',
//     shopBio: '',
//     address: '',
//     latitude: '',
//     longitude: '',
//   });

//   const [newProduct, setNewProduct] = useState({
//     name: '',
//     description: '',
//     price: 0,
//     tags: [],
//     stock: 0,
//   });

//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedShop, setSelectedShop] = useState(null);
//   const [addselectedShop, setaddSelectedShop] = useState(null);

//   const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (user) => {
//       if (user) {
//         setUser(user);
//         console.log(user);
//         fetchShops(user.uid);
//       } else {
//         setUser(null);
//         setShops([]);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   const fetchShops = async (userId) => {
//     try {
//       const q = query(collection(db, 'shops'), where('userId', '==', userId));
//       const querySnapshot = await getDocs(q);
//       const fetchedShops = [];
//       querySnapshot.forEach((doc) => {
//         fetchedShops.push({ id: doc.id, ...doc.data() });
//       });
//       setShops(fetchedShops);
//     } catch (error) {
//       console.error('Error fetching shops:', error);
//     }
//   };

//   const createShop = async () => {
//     if (user) {
//       try {
//         await addDoc(collection(db, 'shops'), {
//           ...newShop,
//           userId: user.uid,
//         });
//         setNewShop({
//           name: '',
//           shopBio: '',
//           address: '',
//           latitude: '',
//           longitude: '',
//         });
//         fetchShops(user.uid);
//         closeModal();
//       } catch (error) {
//         console.error('Error creating shop:', error);
//       }
//     }
//   };

//   const handleProductChange = (field, value) => {
//     setNewProduct({ ...newProduct, [field]: value });
//   };

//   const addProduct = async (shopId) => {
//     try {
//       await addDoc(collection(db, 'shops', shopId, 'products'), newProduct);

//       setNewProduct({
//         name: '',
//         description: '',
//         price: 0,
//         tags: [],
//         stock: 0,
//       });

//       closeAddProductModal();
//     } catch (error) {
//       console.error('Error adding product:', error);
//     }
//   };

//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const openModal1 = (shop) => {
//     setSelectedShop(shop);
//   };

//   const closeModal1 = () => {
//     setSelectedShop(null);
//   };

//   const openAddProductModal = (shop) => {
//     setaddSelectedShop(shop);
//     setIsAddProductModalOpen(true);
//   };

//   const closeAddProductModal = () => {
//     setIsAddProductModalOpen(false);
//   };

//   return (
//     <div>
//       {user ? (
//         <div>
//           <h1>Welcome, {user.displayName}</h1>

//           <div>
//             <button className="create-shop-button" onClick={openModal}>
//               Create Shop
//             </button>

//             {isModalOpen && (
//               <div className="modal">
//                 <h2>Create a Shop</h2>
//                 <input
//                   type="text"
//                   placeholder="Shop Name"
//                   value={newShop.name}
//                   onChange={(e) => setNewShop({ ...newShop, name: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Shop Bio"
//                   value={newShop.shopBio}
//                   onChange={(e) => setNewShop({ ...newShop, shopBio: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Address"
//                   value={newShop.address}
//                   onChange={(e) => setNewShop({ ...newShop, address: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Latitude"
//                   value={newShop.latitude}
//                   onChange={(e) => setNewShop({ ...newShop, latitude: e.target.value })}
//                 />
//                 <input
//                   type="text"
//                   placeholder="Longitude"
//                   value={newShop.longitude}
//                   onChange={(e) => setNewShop({ ...newShop, longitude: e.target.value })}
//                 />
//                 <button onClick={createShop}>Create Shop</button>
//                 <button onClick={closeModal}>Close</button>
//               </div>
//             )}
//           </div>

//           <div>
//             <h2>Your Shops</h2>
//             {shops.map((shop) => (
//               <div key={shop.id} className="shop-item">
//                 <p>Shop Name: {shop.name}</p>
//                 <div>
//                     <button className='shop-details-button' onClick={() => openModal1(shop)}>Details</button>
//                     <button className='add-product-button' onClick={() => openAddProductModal(shop)}>Add Product</button>
//                 </div>
//               </div>
//             ))}
//           </div>

//           {/* Display details of the selected shop */}
//           {selectedShop && (
//             <div className="modal">
//               <h2>Shop Details</h2>
//               <p>Shop Name: {selectedShop.name}</p>
//               <p>Shop Bio: {selectedShop.shopBio}</p>
//               <p>Address: {selectedShop.address}</p>
//               <p>Latitude: {selectedShop.latitude}</p>
//               <p>Longitude: {selectedShop.longitude}</p>
//               <button onClick={closeModal1}>Close</button>
//             </div>
//           )}

//           {/* Add Product Modal */}
//           {isAddProductModalOpen && (
//             <div className="modal">
//               <h2>Add Product</h2>
//               <input
//                 type="text"
//                 placeholder="Product Name"
//                 value={newProduct.name}
//                 onChange={(e) => handleProductChange('name', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="Description"
//                 value={newProduct.description}
//                 onChange={(e) => handleProductChange('description', e.target.value)}
//               />
//               <input
//                 type="number"
//                 placeholder="Price"
//                 value={newProduct.price}
//                 onChange={(e) => handleProductChange('price', e.target.value)}
//               />
//               <input
//                 type="text"
//                 placeholder="Tags (comma-separated)"
//                 value={newProduct.tags}
//                 onChange={(e) => handleProductChange('tags', e.target.value.split(','))}
//               />
//               <input
//                 type="number"
//                 placeholder="Stock"
//                 value={newProduct.stock}
//                 onChange={(e) => handleProductChange('stock', e.target.value)}
//               />
//               <button onClick={() => addProduct(addselectedShop.id)}>Add Product</button>
//               <button onClick={closeAddProductModal}>Close</button>
//             </div>
//           )}
//         </div>
//       ) : (
//         <button>Log In</button>
//       )}
//     </div>
//   );
// }

// export default Homes;