import axios from "axios"
import { useState, useEffect, useRef } from "react";
import ReactPaginate from "react-paginate";
import { useReactToPrint } from "react-to-print";

axios.defaults.baseURL = 'https://radshopserver-v1.onrender.com/api/products' || process.env.baseURL;

function App() {

  const [products, setProducts] = useState([]);
  const [pageNumber, setPageNumber] = useState(0);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [id, setId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Entrée');

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });

  const getAllProducts = async () => {
    try {
      const { data } = await axios.get("/get-product");
      setProducts(data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getAllProducts();
  }, []);

  let retrievedCartItems = localStorage.getItem("cartItems");

  const catsArray = products.map(product => product.category);
  const uniqueCats = [...new Set(catsArray)];

  const handleNameChange = (event) => {
    setName(event.target.value);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleImageChange = (event) => {
    setImage(event.target.value);
  };

  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };

  const handleAdd = async (event) => {
    event.preventDefault;
    await axios.post("/add-product", {
      name: name,
      image: image,
      description: description,
      category: category,
      price: 9.99
    });
    alert('Product successfully added!');
    setId('');
    setName('');
    setCategory('');
    setDescription('');
    setImage('');
  };

  const handleEdit = (product) => {
    setIsEditing(true);
    setName(product.name);
    setCategory(product.category);
    setDescription(product.description);
    setImage(product.image);
    setId(product._id);
  };

  const handleDelete = async(product) => {
    console.log(product._id)
    await axios.post("delete-product", {
      productId: product._id,
    });
    alert('Product successfully deleted!');
  };

  const handleUpdate = async() => {
    await axios.put("edit-product", {
      productId: id,
      name: name,
      category: category,
      description: description,
      image: image,
    });
    alert('Product successfully updated!');
    setIsEditing(false);
    setId('');
    setName('');
    setCategory('');
    setDescription('');
    setImage('');
    setIsEditing(false);
  };

  const handleReset = () => {
    setId('');
    setName('');
    setCategory('');
    setDescription('');
    setImage('');
    setIsEditing(false);
  };

  const handleInvoice = async (product) => {

    let findProductInCart = await cartItems.find((item) => {
      return item._id === product._id;
    });

    if(findProductInCart) {
      let updatedCartItems = [];
      let updatedItem;

      cartItems.forEach((cartItem) => {
        if(cartItem._id === product._id) {
          updatedItem = {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            totalPrice: cartItem.price * (cartItem.quantity + 1),
          }
          updatedCartItems.push(updatedItem);
        } else {
          updatedCartItems.push({...cartItem, totalPrice: cartItem.price * (cartItem.quantity)});
        }
      });

      setCartItems(updatedCartItems);
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));

    } else {
      let newProduct = {
        ...product,
        quantity: 1,
        totalPrice: product.price,
      }

      setCartItems([...cartItems, newProduct])
      localStorage.setItem('cartItems', JSON.stringify([...cartItems, newProduct]));
    }
  };

  const handleCartReset = () => {
    setCartItems([]);
  };

  const handleRemoveFromCart = (item) => {
    let newCartItems = cartItems.filter((cartItem) => cartItem._id !== item._id);
    setCartItems(newCartItems);
    localStorage.setItem('cartItems', JSON.stringify(newCartItems));
  }

  const handleIncrement = async (item) => {
    let findProductInCart = await cartItems.find((item) => {
      return item._id === item._id;
    });

    if(findProductInCart) {
      let updatedCartItems = [];
      let updatedItem;

      cartItems.forEach((cartItem) => {
        if(cartItem._id === item._id) {
          updatedItem = {
            ...cartItem,
            quantity: cartItem.quantity + 1,
            totalPrice: cartItem.price * (cartItem.quantity + 1),
          }
          updatedCartItems.push(updatedItem);
        } else {
          updatedCartItems.push({...cartItem, totalPrice: cartItem.price * (cartItem.quantity)});
        }
      });
      setCartItems(updatedCartItems);
      localStorage.setItem('cartItems', JSON.stringify(updatedCartItems));
    }
  }

  const handleDecrement = async (item) => {
    let updatedCartItems = [];
    let updatedItem;
    console.log(item);

    if (item.quantity === 1) {
      let newCartItems = cartItems.filter((cartItem) => cartItem._id !== item._id);
      setCartItems(newCartItems);
    } else {
      cartItems.forEach((cartItem) => {
        if(cartItem._id === item._id) {
          updatedItem = {
            ...cartItem,
            quantity: cartItem.quantity - 1,
            totalPrice: cartItem.price * (cartItem.quantity - 1),
          }
          updatedCartItems.push(updatedItem);
        } else {
          updatedCartItems.push({...cartItem, totalPrice: cartItem.price * (cartItem.quantity)});
        }       
        setCartItems(updatedCartItems);
      });
    }
  }

  const productsPerPage = 8;
  const pagesVisited = pageNumber * productsPerPage;

  const displayProducts = products.filter((product) => product.category === selectedCategory).slice(pagesVisited, pagesVisited + productsPerPage).map((product) => {
    return (
      <article 
        key={product._id} className="article"
      >
        <div className="img-container">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="text-container">
          <div className="text-flex">
            <h2 className="article-title">{product.name}</h2>
          </div>
          <span className="article-price">${product.price}</span>
          <p className="article-detail">{product.description}</p>
        </div>
        <button 
          className="edit-btn"
          type="button"
          onClick={() => {
            handleEdit(product);
          }}
        >
          Edit
        </button>
        <button 
          className="edit-btn delete-btn"
          type="button"
          onClick={() => {
            handleDelete(product);
          }}
        >
          Delete
        </button>
        <button 
          className="edit-btn add-btn"
          type="button"
          onClick={() => {
            handleInvoice(product);
          }}
        >
          Add
        </button>
      </article>
    )
  });
  
  const pageCount = Math.ceil(products.length / productsPerPage);

  const changePage = ({ selected }) => {
    setPageNumber(selected);
  }

  return (
    <div className="app">
      <nav className="nav">
        <h1 className="logo">RADHSHOP</h1>
        <div className="categories">
        {Array.from(uniqueCats).map((category) => (
            <button className={`category-btn ${selectedCategory}-active`} onClick={() => setSelectedCategory(category)}>{category}</button>
          ))}
        </div>
      </nav>
      <div className="giant-flex">
        <div className="flex-container">
          {displayProducts}
          <ReactPaginate
            previousLabel={'P'}
            nextLabel={'N'}
            pageCount={pageCount}
            onPageChange={changePage}
            containerClassName={'pagination'}
            previousClassName={'prev-btn'}
            nextLinkClassName={'next-btn'}
            disabledClassName={'disabled-btn'}
            activeClassName={'active-btn'}
          />
        </div>
        <div className="small-flex">
          <div ref={componentRef} className="invoice-container">
            <span className="form-header">Invoice Calculator</span>
            <table className="invoice-table">
              <thead>
                <tr className="padded-head-row">
                  <td>Image</td>
                  <td className="invoice-name">Name</td>
                  <td>Price</td>
                  <td className="qty-td">Qty</td>
                  <td>Subtotal</td>
                  <td>Actions</td>
                </tr>
              </thead>
              <tbody className="table-body">
                {
                  cartItems.map((item) => (
                    <tr 
                      className="padded-row"
                      key={item._id}
                    >
                      <td className="thumbnail">
                        <img className="invoice-thumbnail" 
                        src={item.image} alt={item.name} />
                      </td>
                      <td className="invoice-name-detail">{item.name}</td>
                      <td>${item.price}</td>
                      <td className="qty-td-detail">
                        <button className="btn" onClick={() => handleIncrement(item)}></button>
                        {item.quantity}
                        <button className="btn btn-decrease" onClick={() => handleDecrement(item)}></button>
                      </td>
                      <td className="total-price">${item.totalPrice}</td>
                      <td><button className="remove-btn" onClick={() => handleRemoveFromCart(item)}>Remove</button></td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
            <div className="invoice-flex">
              <button className="save-btn" onClick={handleCartReset} disabled={cartItems.length === 0}>Clear Cart</button>
              <button className="save-btn" onClick={handlePrint} disabled={cartItems.length === 0}>Get Receipt</button>
              <h2 className="subtotal">Total: ${cartItems.length === 0 ? '0' : `${cartItems.map((item) => item.totalPrice).reduce((total, price) => total + price).toFixed(2)}`}</h2>
            </div>
          </div>
          <div className="form-container">
            <span className="form-header">Add or Edit Product</span>
            <form 
              action="" 
              className="form"
            >
              <div className="form-item">
                <label htmlFor="name">id</label>
                <input 
                  type="text" 
                  value={id}
                  onChange={handleNameChange}
                  disabled
                />
              </div>
              <div className="form-item">
                <label htmlFor="name">Name:</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                />
              </div>
              <div className="form-item">
                <label htmlFor="category">Category:</label>
                <input 
                  type="text" 
                  value={category}
                  onChange={handleCategoryChange}
                />
              </div>
              <div className="form-item">
                <label htmlFor="image">Image:</label>
                <input 
                  type="text" 
                  value={image}
                  onChange={handleImageChange}
                />
              </div>
              <div className="form-item">
                <label htmlFor="description">Description:</label>
                <textarea 
                  name="description" 
                  id="" cols="30" rows="3" 
                  style={{ resize: 'none'}} 
                  onChange={handleDescriptionChange}
                  value={description}
                />
              </div>
              <div className="form-item">
                <button 
                  className="save-btn update-btn"
                  onClick={handleUpdate}
                  type="button"
                  disabled={!isEditing}
                >
                  Update
                </button>
                <button 
                  className="save-btn"
                  onClick={handleAdd}
                  type="button"
                  disabled={isEditing}
                >
                  Add 
                </button>
                <button 
                  className="save-btn"
                  onClick={handleReset}
                  type="button"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App
