import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import "./content.css";

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

    console.log("filtered, ", filtered_users);

    if (filtered_users.length) {
      orderUsersData();
      return filtered_users.map((user, index) => {
        const { _id, first_name, last_name, email, role, /*group,*/ status } =
          user;

        //for checkboxes
        const isProfessor = role.includes("professor");
        const isStudent = role.includes("student");
        const isAdmin = role.includes("administrator");
        const isSecretariat = role.includes("secretariat");

        return (
          <tr key={_id}>
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
              {role.map((role) => {
                return (
                  <div className="rolesWrapper" key={role + _id}>
                    <i className="fas fa-caret-right rolesArrow"></i>
                    <p className="roleP">{role}</p>
                  </div>
                );
              })}

              <div id={_id + "roleList"} className="dropdown-check-list">
                <span
                  className="anchor"
                  onClick={() => dropDownRoles(_id, role)}
                >
                  Edit Roles
                </span>
                <ul className="roles" data-key={_id}>
                  <li className="roleListOption">
                    <label htmlFor="professor">Professor</label>
                    <input
                      type="checkbox"
                      id={_id + "professor"}
                      defaultChecked={isProfessor}
                      onChange={() => {
                        /*for warning*/
                      }}
                    />
                  </li>
                  <li className="roleListOption">
                    <label htmlFor="administrator">Administrator</label>
                    <input
                      type="checkbox"
                      id={_id + "administrator"}
                      defaultChecked={isAdmin}
                      onChange={() => {
                        /*for warning*/
                      }}
                    />
                  </li>
                  <li className="roleListOption">
                    <label htmlFor="student">Student</label>
                    <input
                      type="checkbox"
                      id={_id + "student"}
                      defaultChecked={isStudent}
                      onChange={() => {
                        /*for warning*/
                      }}
                    />
                  </li>
                  <li className="roleListOption">
                    <label htmlFor="secratariat">Secretariat</label>
                    <input
                      type="checkbox"
                      id={_id + "secretariat"}
                      defaultChecked={isSecretariat}
                      onChange={() => {
                        /*for warning*/
                      }}
                    />
                  </li>
                </ul>
              </div>
            </td>
            <td className="table-data">
              {/* <input type="text" name="status" data-key={_id} className="editable-data" placeholder={status} size={status.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select
                className="editable-data"
                name="status"
                data-key={_id}
                id={_id + "status"}
                defaultValue={status}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
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
                  onClick={(e) => updateUser(_id)}
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
        <td className="empty-data" colSpan="100%">
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data">
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
        <div className="filter-content">
          <div className="md-form md-outline input-with-pre-icon">
            <i
              className="fa fa-search input-prefix"
              style={{ color: "#31b1e4" }}
            ></i>
            <input
              type="text"
              id="search-users"
              className="form-control"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table
          className="users-table"
          striped
          bordered
          hover
          size="md"
          responsive
        >
          <thead>
            <tr>
              <th>#</th>
              <th className="table-header">
                <span id="first_name" onClick={(e) => toggleOrder(e.target.id)}>
                  First Name
                </span>
                <i className="fa fa-edit edit-input-icon"></i>
              </th>
              <th className="table-header">
                <span id="last_name" onClick={(e) => toggleOrder(e.target.id)}>
                  Last Name
                </span>
                <i className="fa fa-edit edit-input-icon"></i>
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
                <i className="fa fa-edit edit-input-icon"></i>
              </th>
              <th className="table-header">
                <span id="status" onClick={(e) => toggleOrder(e.target.id)}>
                  Status
                </span>
                <i className="fa fa-edit edit-input-icon"></i>
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
        <div className="dropdown-limit"> {/* --- User limit section --- */}
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
