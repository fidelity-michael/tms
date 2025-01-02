import { useState } from "react";
import { Form, Button, Alert } from "react-bootstrap";
import axios from "axios";

export default function NewUser() {
  const initialUser = {
    first_name: "",
    last_name: "",
    role: "professor",
    group: "Professor",
    email: "",
    password: "",
  };

  const [user, setUser] = useState(initialUser);

  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  function uploadUser() {
    // console.log("New User: ", user);
    const uploadData = async () => {
      await axios
        .post("/api/users", user)
        .then((res) => {
          setVariant("success");
          setMessage("User submitted successfully!");
          setShowAlert(true);

          setTimeout(() => {
            setVariant("");
            setMessage("");
            setShowAlert(false);
          }, 2500);

          window.scroll({ top: 0, left: 0, behavior: "smooth" });

          resetForm();
        })
        .catch((err) => {
          setVariant("danger");
          if (err.response.status === 400) {
            setMessage(err.response.data.message);
          } else setMessage("User failed to submit!");
          setShowAlert(true);

          setTimeout(() => {
            setVariant("");
            setMessage("");
            setShowAlert(false);
          }, 2500);

          window.scroll({ top: 0, left: 0, behavior: "smooth" });

          resetForm();
        });
    };

    uploadData();
  }

  function validateEmail(email) {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (!re.test(String(email).toLowerCase())) {
      document.getElementById("emailValidity").innerHTML =
        "Not a valid email address.";

      document.getElementById("emailValidity").style = "color: red";
      return false;
    } else {
      document.getElementById("emailValidity").innerHTML = "";
      return true;
    }
  }

  function submitForm(e) {
    var validEmail;
    var validPassword;

    e.preventDefault();

    validEmail = validateEmail(user.email);
    validPassword = validatePassword(user.password);

    console.log(validEmail && validPassword);
    if (validEmail && validPassword) uploadUser();
  }

  function resetForm() {
    setUser(initialUser);
  }

  const capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  //validate password's requirements
  function validatePassword(password) {
    const upperCase = new RegExp("[A-Z]");
    const lowerCase = new RegExp("[a-z]");
    const numbers = new RegExp("[0-9]");

    if (
      password.length >= 8 &&
      password.length <= 20 &&
      upperCase.test(password) &&
      lowerCase.test(password) &&
      numbers.test(password)
    ) {
      document.getElementById("passwordValidity").innerHTML = "";
      return true;
    } else {
      document.getElementById("passwordValidity").innerHTML =
        "Your password has to be at least 8 characters long and contain at least one uppercase letter, one lowercase letter and a number (English letters)";

      document.getElementById("passwordValidity").style = "color: red";

      return false;
    }
  }

  function toggleEye(bool) {
    var eye = document.getElementById("eye");
    var eyeSlash = document.getElementById("eyeSlash");
    var passwordInput = document.getElementById("password");

    console.log(bool);

    if (!bool) {
      eye.style.display = "none";
      eyeSlash.style.display = "block";
      eyeSlash.style.marginLeft = "1rem";
      passwordInput.type = "text";
    } else {
      eye.style.display = "block";
      eyeSlash.style.display = "none";
      passwordInput.type = "password";
    }
  }

  function handleChange(target) {
    // console.log("Target: ", target.name, " Value: ", target.value);
    if (target.name === "role") {
      const value = target.value.toLowerCase();
      setUser((prevState) => ({
        ...prevState,
        [target.name]: value,
      }));

      if (value === "administrator") {
        setUser((prevState) => ({
          ...prevState,
          group: "Administrator",
        }));
      } else if (value === "professor") {
        setUser((prevState) => ({
          ...prevState,
          group: "Professor",
        }));
      } else if (value === "secretariat") {
        setUser((prevState) => ({
          ...prevState,
          group: "Secretariat",
        }));
      } else {
        setUser((prevState) => ({
          ...prevState,
          group: "BSc",
        }));
      }
    } else {
      setUser((prevState) => ({
        ...prevState,
        [target.name]: target.value,
      }));
    }
  }

  return (
    <div className="tw-flex tw-flex-1 tw-align-middle tw-justify-center">
      {showAlert ? (
        <Alert
          className="upload-alert"
          key={"alert-message"}
          variant={variant}
          onClose={() => setShowAlert(false)}
          dismissible
        >
          {message}
        </Alert>
      ) : null}
      <Form
        onSubmit={(e) => {
          submitForm(e);
        }}
        className="tw-w-full tw-max-w-6xl tw-bg-white tw-shadow-md tw-rounded tw-px-8 tw-pt-6 tw-pb-8 tw-mb-4"
      >
        <div className="tw-mb-4">
          <label
            className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2"
            htmlFor="first_name"
          >
            First Name
          </label>
          <input
            onChange={(e) => handleChange(e.target)}
            name="first_name"
            className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
            id="first_name"
            type="text"
            placeholder="Username"
          />
        </div>
        <div className="tw-mb-4">
          <label
            className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2"
            htmlFor="last_name"
          >
            Last Name
          </label>
          <input
            className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
            id="last_name"
            name="last_name"
            type="text"
            placeholder="Last Name"
            onChange={(e) => handleChange(e.target)}
          />
        </div>
        <div className="tw-mb-4">
          <label
            className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2"
            htmlFor="role"
          >
            Role<span className="tw-text-red-incorrect tw-ml-1">*</span>
          </label>
          <select
            className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
            id="role"
            onSelect={(e) => handleChange(e.target)}
          >
            <option key={0}>Professor</option>
            <option key={1}>Student</option>
            <option key={2}>Secretariat</option>
            <option key={3}>Administrator</option>
          </select>
        </div>

        {user.role === "student" && (
          <div className="tw-mb-4">
            <label
              className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2"
              htmlFor="role"
            >
              Group<span className="tw-text-red-incorrect tw-ml-1">*</span>
            </label>
            <select
              className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
              id="role"
              onChange={(e) => handleChange(e.target)}
            >
              <option key={0}>BSc</option>
              <option key={1}>MSc</option>
              <option key={2}>PhD</option>
            </select>
          </div>
        )}

        <div className="tw-mb-4">
          <label
            className="tw-block tw-text-dark-sky-blue tw-text-sm tw-font-bold tw-mb-2"
            htmlFor="email"
          >
            Email<span className="tw-text-red-incorrect tw-ml-1">*</span>
          </label>
          <input
            className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
            id="email"
            name="email"
            type="text"
            placeholder="Email"
            onChange={(e) => handleChange(e.target)}
            required={true}
          />
            <small id="emailValidity"></small>
        </div>

        <div className="tw-mb-6">
          <label
            className="tw-block tw-text-gray-700 tw-text-sm tw-font-bold tw-mb-2"
            htmlFor="password"
          >
            Password<span className="tw-text-red-incorrect tw-ml-1">*</span>
            <div id="eyeIcons" className="tw-inline-block tw-cursor-pointer">
              <i
                className="fa fa-eye"
                id="eye"
                style={{ marginLeft: "1rem" }}
                aria-hidden="true"
                onClick={() => toggleEye(false)}
              ></i>
              <i
                className="fa fa-eye-slash"
                id="eyeSlash"
                style={{ display: "none" }}
                aria-hidden="true"
                onClick={() => toggleEye(true)}
              ></i>
            </div>
          </label>
          <input
            className="tw-shadow tw-appearance-none tw-border tw-rounded tw-w-full tw-py-2 tw-px-3 tw-text-gray-700 tw-mb-3 tw-leading-tight focus:tw-outline-none focus:tw-shadow-outline"
            id="password"
            name="password"
            type="password"
            placeholder=""
            onChange={(e) => handleChange(e.target)}
            required={true}
          ></input>
            <small id="passwordValidity"></small>
        </div>
        <div className="tw-flex tw-items-center tw-justify-end">
          <button
            className="tw-bg-dark-sky-blue hover:tw-bg-mid-pale-blue tw-text-white tw-font-bold tw-py-2 tw-px-4 tw-rounded focus:tw-outline-none focus:tw-shadow-outline"
            type="submit"
          >
            Add User
          </button>
        </div>
      </Form>
    </div>
  );
}
