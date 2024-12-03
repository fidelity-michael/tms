import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import { Dropdown, Label, Select } from "flowbite-react";
import "./content.css";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import {
  Checkbox,
  Field,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  MenuSeparator,
} from "@headlessui/react";

export default function UsersTable() {
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersLimit, setUsersLimit] = useState(10);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState("");
  const [path, setPath] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "first_name",
    sort: "asc",
  });

  const [isOpen, setIsOpen] = useState(false);

  const updateCheckboxState = (role, value) => {
    setRoles((prev) => ({ ...prev, [role]: value }));
  };

  const [isAdminChecked, setIsAdmin] = useState(false);

  const toggleMenu = () => {
    setIsOpen((prev) => !prev);
  };

  const componentIsMounted = useRef(true);
  useEffect(() => {
    // return () => {
    //     componentIsMounted.current = true
    // }
  }, []);

  //fetch users and pagination
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const users_data = await axios.get("/api/data/users", {
          params: {
            page: usersPage,
            limit: usersLimit,
          },
        });

        console.log("[Table]Users: ", users_data.data.results);
        console.log("mounted: " + componentIsMounted.current);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: users_data.data.startIndex,
            endIndex: users_data.data.endIndex,
            total: users_data.data.total,
          });

          if (users_data.data.results.length > 0)
            setUsers(users_data.data.results);
          setLoadingUsers(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchUsers();
  }, [usersPage, usersLimit]);

  //fetch users after a deletion
  useEffect(() => {
    if (showResponse === "deleted") {
      setVariant("success");
      setMessage("User deleted successfully!");
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });

      fetchUsers();
      setShowResponse("");
    } else if (showResponse === "failed") {
      setVariant("danger");
      setMessage("Error! User deletion failed.");
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });

      setShowResponse("");
    }
  }, [usersPage, usersLimit, showResponse]);

  function toggleOrder(attr) {
    //console.log(order);
    if (order.attr === attr) {
      if (order.sort === "desc") {
        setOrder({
          attr: attr,
          sort: "asc",
        });
      } else {
        setOrder({
          attr: attr,
          sort: "desc",
        });
      }
    } else {
      setOrder({
        attr: attr,
        sort: "asc",
      });
    }
  }

  function orderUsersData() {
    if (order.sort === "asc") {
      users.sort((a, b) => {
        const result = a[order.attr].localeCompare(b[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    } else {
      users.sort((a, b) => {
        const result = b[order.attr].localeCompare(a[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    }
  }

  function handleCellDelete(target) {
    const user = target.getAttribute("data-key");
    setPath("/users/" + user);
    setShowConfirmation(true);
  }

  //update a users's attribute in db )patch)
  function updateUsersAttribute(id, attribute, value) {
    axios
      .patch("/api/users/" + id, {
        attr: attribute,
        value: value,
      })
      .then((data) => {
        console.log("OK");
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const users_data = await axios.get("/api/data/users", {
        params: {
          page: usersPage,
          limit: usersLimit,
        },
      });

      console.log("users_data: " + users_data);

      if (componentIsMounted.current) {
        if (users_data.data.results.length > 0)
          setUsers(users_data.data.results);
        setLoadingUsers(false);
      }
    } catch (err) {
      console.log("Server internal error occurred!");
    }
  };

  async function updateUser(id) {
    var newRolesArray = []; //new roles
    var flag = 0; //indicates if something changed

    //names
    const firstName = document.getElementById(id + "first_name").value;
    const lastName = document.getElementById(id + "last_name").value;

    //roles
    const isProfessor = document.getElementById(id + "professor").checked;
    const isStudent = document.getElementById(id + "student").checked;
    const isSecretariat = document.getElementById(id + "secretariat").checked;
    const isAdmin = document.getElementById(id + "administrator").checked;

    console.log("prof", isProfessor);

    //status
    const status = document.getElementById(id + "status").value;

    //find user's index in users array
    const index = users.findIndex((user) => user._id === id);
    console.log(users[index]);

    //get firstname, lastname check if they are different from the previous ones and update
    if (firstName) {
      flag = 1;
      //change firstname
      if (firstName !== users[index].first_name)
        await updateUsersAttribute(id, "first_name", firstName);
    }

    if (lastName) {
      flag = 1;
      //change lastname
      if (lastName !== users[index].last_name)
        await updateUsersAttribute(id, "last_name", lastName);
    }

    //newroles
    if (isProfessor) newRolesArray.push("professor");
    if (isStudent) newRolesArray.push("student");
    if (isSecretariat) newRolesArray.push("secretariat");
    if (isAdmin) newRolesArray.push("administrator");

    //elegxoume an uparxei allagh stous roles kai kanoume update
    if (
      JSON.stringify(newRolesArray.sort()) !==
      JSON.stringify(users[index].role.sort())
    ) {
      flag = 1;
      await updateUsersAttribute(id, "role", newRolesArray);
      sendNotificationForNewRoles(id, newRolesArray);
    }

    //update status if changed
    if (status !== users[index].status) {
      flag = 1;
      await updateUsersAttribute(id, "status", status);
    }

    //no change
    if (flag === 0) {
      document.getElementById(id + "info").innerHTML =
        "Please fill in desired cells.";
      setTimeout(() => {
        if (document.getElementById(id + "info"))
          document.getElementById(id + "info").innerHTML = "";
      }, 2000);
    } else {
      setVariant("success");
      setMessage(
        "Successful Update of user: " +
          users[index].first_name +
          " " +
          users[index].last_name +
          ".",
      );
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });
      fetchUsers();
    }
  }

  function sendNotificationForNewRoles(userId, roles) {
    const notifyStudent = async () => {
      await axios
        .post("/notifications", {
          title: "Your user roles have been updated.",
          message: "Roles: " + roles,
          receiver: userId,
          type: "info",
        })
        .then((res) => {
          console.log("Notification sent successfully!");
        })
        .catch((err) => {
          console.log("Notification failed to send!");
        });
    };

    notifyStudent();
  }

  //dropdown in order to edit roles
  async function dropDownRoles(id, rolesArray) {
    //the list (DOM element) containing all the potential roles
    var roleList = document.getElementById(id + "roleList");

    if (roleList.classList.contains("visible")) {
      roleList.classList.remove("visible");
    } else {
      roleList.classList.add("visible");
    }
  }

  function renderUsersData() {
    const filtered_users = users.filter(
      (user) =>
        user.first_name.toLowerCase().includes(query.toLowerCase()) ||
        user.last_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase()) ||
        user.status.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_users.length) {
      orderUsersData();
      return filtered_users.map((user, index) => {
        const { _id, first_name, last_name, email, role, status } = user;

        //for checkboxes
        const isProfessor = role.includes("professor");
        const isStudent = role.includes("student");
        const isAdmin = role.includes("administrator");
        const isSecretariat = role.includes("secretariat");

        return (
          <tr
            key={_id}
            className="hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          >
            <td className="table-data">{pagination.startIndex + index + 1}</td>
            <td className="table-data">
              <input
                type="text"
                name="first_name"
                id={_id + "first_name"}
                data-key={_id}
                className="editable-data"
                placeholder={first_name}
                size={first_name.length}
                autoComplete="off"
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                name="last_name"
                id={_id + "last_name"}
                data-key={_id}
                className="editable-data"
                placeholder={last_name}
                size={last_name.length}
                autoComplete="off"
              />
            </td>
            <td className="table-data">{email}</td>
            <td className="table-data">
              <div className="tw-flex tw-gap-2 tw-items-center">
                <div className="tw-flex tw-flex-col">
                  {role.map((role) => {
                    return (
                      <div className="rolesWrapper" key={role + _id}>
                        <i className="fas fa-caret-right rolesArrow"></i>
                        <p className="roleP">{role}</p>
                      </div>
                    );
                  })}
                </div>
                <div
                  id={_id + "roleList"}
                  className="tw-flex tw-flex-row tw-justify-start"
                  /* onClick={() => dropDownRoles(_id, role)} */
                >
                  <Dropdown
                    label="Edit"
                    dismissOnClick={false}
                    inline
                    renderTrigger={() => (
                      <div className="tw-flex tw-items-center tw-cursor-pointer tw-border tw-border-dark-sky-blue tw-rounded-md tw-py-1 tw-px-2">
                        Edit
                        <KeyboardArrowDown />
                      </div>
                    )}
                  >
                    <div>
                      <Dropdown.Item>
                        <div className="tw-flex tw-w-full tw-gap-2 tw-items-center">
                          <input
                            id={_id + "administrator"}
                            defaultChecked={isAdmin}
                            type="checkbox"
                            className="tw-text-dark-sky-blue"
                          />
                          <Label
                            htmlFor={_id + "administrator"}
                            className="tw-text-center tw-mb-0 tw-text-dark-sky-blue"
                          >
                            Administrator
                          </Label>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <div className="tw-flex tw-w-full tw-gap-2 tw-items-center">
                          <input
                            id={_id + "professor"}
                            defaultChecked={isProfessor}
                            type="checkbox"
                            className="tw-text-dark-sky-blue"
                          />
                          <Label
                            htmlFor={_id + "professor"}
                            className="tw-text-center tw-mb-0 tw-text-dark-sky-blue"
                          >
                            Professor
                          </Label>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <div className="tw-flex tw-w-full tw-gap-2 tw-items-center">
                          <input
                            id={_id + "student"}
                            defaultChecked={isStudent}
                            type="checkbox"
                            className="tw-text-dark-sky-blue"
                          />
                          <Label
                            htmlFor={_id + "student"}
                            className="tw-text-center tw-mb-0 tw-text-dark-sky-blue"
                          >
                            Student
                          </Label>
                        </div>
                      </Dropdown.Item>
                      <Dropdown.Item>
                        <div className="tw-flex tw-w-full tw-gap-2 tw-items-center">
                          <input
                            id={_id + "secretariat"}
                            defaultChecked={isSecretariat}
                            type="checkbox"
                            className="tw-text-dark-sky-blue"
                          />
                          <Label
                            htmlFor={_id + "secretariat"}
                            className="tw-text-center tw-mb-0 tw-text-dark-sky-blue"
                          >
                            Secretariat
                          </Label>
                        </div>
                      </Dropdown.Item>
                    </div>
                  </Dropdown>
                  {/* Hidden inputs to keep them always in the DOM */}
                  <div className="tw-hidden" id={_id + "hiddenRoleInputs"}>
                    <input
                      id={_id + "administrator"}
                      defaultChecked={isAdmin}
                      type="checkbox"
                      className="tw-text-dark-sky-blue"
                    />
                    <input
                      id={_id + "professor"}
                      defaultChecked={isProfessor}
                      type="checkbox"
                      className="tw-text-dark-sky-blue"
                    />
                    <input
                      id={_id + "student"}
                      defaultChecked={isStudent}
                      type="checkbox"
                      className="tw-text-dark-sky-blue"
                    />
                    <input
                      id={_id + "secretariat"}
                      defaultChecked={isSecretariat}
                      type="checkbox"
                      className="tw-text-dark-sky-blue"
                    />
                  </div>
                </div>
              </div>
            </td>
            <td className="table-data">
              {/* <input type="text" name="status" data-key={_id} className="editable-data" placeholder={status} size={status.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <Select
                className="tw-text-dark-sky-blue"
                name="status"
                data-key={_id}
                id={_id + "status"}
                defaultValue={status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </Select>
            </td>
            <td className="table-data">
              <div
                className="btn-group"
                role="group"
                aria-label="Button group with nested dropdown"
              >
                <button
                  type="button"
                  data-key={_id}
                  className="btn btn-info accept-request"
                  onClick={() => updateUser(_id)}
                >
                  Update
                </button>
                <button
                  type="button"
                  name={email}
                  data-key={_id}
                  className="btn btn-danger decline-request"
                  onClick={(e) => handleCellDelete(e.target)}
                >
                  Delete
                </button>
              </div>
              <div>
                <b>
                  <p className="infoUpdateUser" id={_id + "info"}></p>
                </b>
              </div>
            </td>
          </tr>
        );
      });
    } else {
      return emptyTable();
    }
  }

  function renderPageButtons(name) {
    const prev = "prev_" + name;
    const next = "next_" + name;

    return (
      <div className="page-select">
        {pagination.startIndex > 0 && (
          <span
            className={prev}
            onClick={(e) => {
              handlePrevPage(e.target.className);
            }}
          >
            Previous Page
          </span>
        )}
        {pagination.endIndex < pagination.total && (
          <span
            className={next}
            onClick={(e) => {
              handleNextPage(e.target.className);
            }}
          >
            Next Page
          </span>
        )}
        <span className="page-number">
          Results{" "}
          {pagination.endIndex > pagination.total
            ? pagination.total
            : pagination.endIndex}{" "}
          out of {pagination.total}
        </span>
      </div>
    );
  }

  function handlePrevPage(name) {
    if (name === "prev_user") {
      setUsersPage(usersPage - 1);
      //console.log("User: Previous Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_user") {
      setUsersPage(usersPage + 1);
      //console.log("User: Next Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function loadingTable(e) {
    return (
      <tr>
        <td className="loading-data" colSpan="100%">
          <p
            className="animated headShake infinite"
            style={{ marginBottom: "-0.1rem" }}
          >
            Loading Data...
          </p>
        </td>
      </tr>
    );
  }

  function emptyTable(e) {
    return (
      <tr>
        <td
          className="empty-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          colSpan="100%"
        >
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      <div className="users-container">
        <ConfirmationModal
          show={showConfirmation}
          setShow={(data) => setShowConfirmation(data)}
          path={path}
          setResponse={(res) => setShowResponse(res)}
        />
        <Alert
          key={"update_cellKey"}
          variant={variant}
          show={showAlert}
          onClose={(e) => setShowAlert(false)}
          transition={false}
          dismissible
        >
          {message}
        </Alert>

        <div className="tw-flex filter-content tw-justify-start">
          {" "}
          {/* Search Functionality */}
          <div className="tw-relative tw-mt-1 tw-text-gray-300 tw-mb-6">
            <div className="tw-absolute tw-inset-y-0 tw-start-0 tw-flex tw-items-center tw-ps-3 tw-pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              id="table-search"
              className="tw-flex tw-flex-1 tw-items-center tw-py-2 tw-ps-10 tw-text-sm tw-text-dark-sky-blue tw-border tw-border-light-blue tw-rounded-lg tw-w-80 tw-bg-light-pale-blue-white focus:tw-outline-none focus:tw-ring-mid-pale-blue focus:tw-border-mid-pale-blue"
              placeholder="Search for people"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <Table className="users-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th>#</th>
              <th className="table-header">
                <span id="first_name" onClick={(e) => toggleOrder(e.target.id)}>
                  First Name
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header">
                <span id="last_name" onClick={(e) => toggleOrder(e.target.id)}>
                  Last Name
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header">
                <span id="email" onClick={(e) => toggleOrder(e.target.id)}>
                  Email
                </span>
              </th>
              <th className="table-header">
                <span id="role" onClick={(e) => toggleOrder(e.target.id)}>
                  Role
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header">
                <span id="status" onClick={(e) => toggleOrder(e.target.id)}>
                  Status
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header" style={{ textAlign: "center" }}>
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingUsers
              ? loadingTable()
              : users.length
                ? renderUsersData()
                : emptyTable()}
          </tbody>
        </Table>
        {renderPageButtons("user")}
        {/* --- User limit section --- */}
        <div className="dropdown-limit">
          <Form.Group controlId="selectControl">
            <Form.Label className="page-limit-lbl">Users per page</Form.Label>
            <Form.Control
              className="page-limit"
              as="select"
              onChange={(e) => {
                setUsersLimit(e.target.value);
              }}
            >
              <option>10</option>
              <option>25</option>
              <option>50</option>
            </Form.Control>
          </Form.Group>
        </div>
      </div>
    </div>
  );
}
