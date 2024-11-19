import { useState } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginForm() {
  const initialUser = {
    email: "",
    password: "",
    user: [],
  };

  const navigate = useNavigate();

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [ldapAuth, setLdapAuth] = useState(false);

  /**
   * @param {EventTarget & HTMLInputElement} target
   */
  function handleChange(target) {
    setError("");
    setUser((prevState) => ({
      ...prevState,
      [target.name]: target.value,
    }));
  }

  function handleCheckboxChange(target) {
    // console.log(ldapAuth);
    setLdapAuth(!ldapAuth);
  }

  function login(e) {
    e.preventDefault();
    const user_data = {
      email: user.email,
      password: user.password,
    };

    if (ldapAuth) {
      setLoading(true);
      // axios.post("/api/auth/login", user_data, {proxy: {protocol: "http", host: "http://localhost", port: 8080}})
      axios({
        // url: "http://localhost:8080/api/auth/login", // before use of proxy server
        url: "/api/auth/ldap_login",
        method: "POST",
        data: user_data,
      })
        .then((res) => {
          setLoading(false);
          setError("");
          console.log("Authentication succeeded!");
          // console.log("User role: ", res.data.role);
          const redirection_page = "/" + res.data.role;
          navigate(redirection_page, { state: "login" });
        })
        .catch(() => {
          setLoading(false);
          setError("Email or password is incorrect!");
          console.log("Authentication failed!");
        });
    } else {
      setLoading(true);
      axios({
        url: "/api/auth/login", // after use of proxy server
        method: "POST",
        data: user_data,
      })
        .then((res) => {
          setLoading(false);
          console.log("Authentication succeeded!");
          // console.log(res.data);
          // localStorage.setItem('email', user.email);
          const redirection_page = "/" + res.data.role;
          navigate(redirection_page, { state: "login" });
        })
        .catch((err) => {
          setLoading(false);
          if (err.response) {
            if (err.response.status === 500) {
              setError("Internal server error occurred!");
            } else if (err.response.status === 503) {
              setError("Database connection error!");
            } else {
              setError("Email or password is incorrect!");
              console.log("Authentication failed!");
            }
          } else {
            setError("Internal server error occurred!");
          }
        });
    }
  }

  return (
    <Form onSubmit={(e) => login(e)}>
      <div className="md-form md-outline input-with-pre-icon">
        <i
          className="fas fa-envelope input-prefix"
          style={{ color: "#6A89A7" }}
        ></i>
        <input
          type="text"
          id="email"
          name="email"
          className="form-control"
          placeholder="Email Address"
          onChange={(e) => handleChange(e.target)}
          value={user.email}
          required
        />
      </div>

      <div className="md-form md-outline input-with-pre-icon">
        <i
          className="fas fa-lock input-prefix"
          style={{ color: "#6A89A7" }}
        ></i>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control"
          placeholder="Password"
          onChange={(e) => handleChange(e.target)}
          value={user.password}
          required
        />
      </div>

      <div className="form-group">
        <input
          type="checkbox"
          id="ldap-auth"
          name="ldap"
          style={{ marginRight: "0.5rem" }}
          onClick={(e) => handleCheckboxChange(e.target)}
        />
        <label htmlFor="ldap-auth" style={{ fontSize: "0.9rem" }}>
          Use LDAP Authentication
        </label>
      </div>

      <div className="tw-flex tw-flex-col tw-mb-8">
        <button
          type="submit"
          id="login"
          className="tw-font-bold tw-text-2xl hover:tw-bg-dark-sky-blue tw-bg-mid-pale-blue tw-text-light-pale-blue-white tw-rounded-full tw-py-2 tw-px-4"
          disabled={loading}
        >
          Login
        </button>
        {loading && (
          <div
            className="spinner-border text-primary login-spinner"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        )}
      </div>

      {!loading && (
        <div
          className="login-info"
          style={{ visibility: error.length > 1 ? "visible" : "hidden" }}
        >
          <span>{error}</span>
        </div>
      )}

      {/* <div className="loading-info" style={{ textAlign: "center" }}>
                { loading && <span>Loading...</span> }
            </div> */}
    </Form>
  );
}
