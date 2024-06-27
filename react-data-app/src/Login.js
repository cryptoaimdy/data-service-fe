import React, { useState, useEffect } from 'react';
import './Login.css'; // Optional: Add CSS for styling

function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpScreen, setShowOtpScreen] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setFilteredProducts(products); // Initialize filtered products with all products
  }, [products]);

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:8001/api/v1/auth-user/login', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'language-id': '1',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const loginData = await response.json();
      console.log('Login successful:', loginData);

      // Assuming the access_token is directly available in loginData
      const { access_token } = loginData;

      // Set access token state
      setAccessToken(access_token);
      setShowOtpScreen(true); // Show OTP screen after successful login
      setError('');
    } catch (error) {
      console.error('Error logging in:', error.message);
      setError(error.message);
    }
  };

  const handleOtpSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await fetch('http://localhost:8001/api/v1/auth-user/validate-otp', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_validation_id: '5c05a3a2-3d24-4288-acca-6b5e214f7406', // Replace with actual user_validation_id
          otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'OTP validation failed');
      }

      const otpValidationData = await response.json();
      console.log('OTP validation successful:', otpValidationData);

      // Set access token state from OTP validation response
      setAccessToken(otpValidationData.data.access_token);
      setError('');
      setOtp(''); // Clear OTP input field
      fetchProducts(); // Fetch products after OTP validation
    } catch (error) {
      console.error('Error validating OTP:', error.message);
      setError(error.message);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8001/api/v1/catalogue/product-list', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'access-token': accessToken, // Pass access_token obtained from OTP validation
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const responseData = await response.json();
      console.log('Products fetched successfully:', responseData);

      // Set products and handle any pagination logic if needed
      setProducts(responseData.data);
      setError('');
    } catch (error) {
      console.error('Error fetching products:', error.message);
      setError(error.message);
    }
  };

  const handleFilter = (filterKey) => {
    // Example: Sorting by product name
    const sortedProducts = [...products].sort((a, b) => {
      if (a[filterKey] < b[filterKey]) return -1;
      if (a[filterKey] > b[filterKey]) return 1;
      return 0;
    });
    setFilteredProducts(sortedProducts);
  };

  const handleSearch = () => {
    const filtered = products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  };

  // Render login or OTP form based on state
  return (
    <div className="login-container">
      {!accessToken && !showOtpScreen && (
        <div>
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <div>
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Login</button>
          </form>
        </div>
      )}

      {!accessToken && showOtpScreen && (
        <div className="otp-form">
          <form onSubmit={handleOtpSubmit}>
            <div>
              <label htmlFor="otp">OTP:</label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit">Verify OTP</button>
          </form>
        </div>
      )}

      {accessToken && (
        <div className="products-list-container">
          <div>
            <button onClick={fetchProducts}>Show Products</button>
            <input
              type="text"
              placeholder="Search by Product Name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={handleSearch}>Search</button>
          </div>
          {filteredProducts.length > 0 && (
            <div>
              <h3>Products List</h3>
              <table>
                <thead>
                  <tr>
                    <th>
                      <button onClick={() => handleFilter('product_id')}>
                        Product ID
                      </button>
                    </th>
                    <th>
                      <button onClick={() => handleFilter('product_name')}>
                        Product Name
                      </button>
                    </th>
                    <th>
                      <button onClick={() => handleFilter('company_name')}>
                        Company Name
                      </button>
                    </th>
                    <th>Website</th>
                    <th>
                      <button onClick={() => handleFilter('product_category')}>
                        Category
                      </button>
                    </th>
                    <th>Company Address</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map(product => (
                    <tr key={product.product_id}>
                      <td>{product.product_id}</td>
                      <td>{product.product_name}</td>
                      <td>{product.company_name}</td>
                      <td>
                        <a
                          href={product.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {product.website}
                        </a>
                      </td>
                      <td>{product.product_category}</td>
                      <td>{product.company_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Login;
