import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import "./content.css";
import ActionButtons, { PaginationTab } from "./TableComponents";

export default function DepartmentsArchive() {
  const [departments, setDepartments] = useState([]);
  const [departmentsPage, setDepartmentsPage] = useState(1);
  const [departmentsLimit, setDepartmentsLimit] = useState(10);
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState(true);
  const [path, setPath] = useState("");
  const [confirmationMessage, setConfirmationMessage] = useState("");

  const [pagination, setPagination] = useState({});

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "name",
    sort: "asc",
  });

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departments_data = await axios.get("/api/data/departments", {
          params: {
            page: departmentsPage,
            limit: departmentsLimit,
          },
        });

        //console.log(departments_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: departments_data.data.startIndex,
            endIndex: departments_data.data.endIndex,
            total: departments_data.data.total,
          });

          if (departments_data.data.results.length > 0) {
            setDepartments(departments_data.data.results);
          }
          setLoadingDepartments(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchDepartments();
  }, [departmentsPage, departmentsLimit]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        setLoadingDepartments(true);
        const departments_data = await axios.get("/api/data/departments", {
          params: {
            page: departmentsPage,
            limit: departmentsLimit,
          },
        });

        //console.log(departments_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: departments_data.data.startIndex,
            endIndex: departments_data.data.endIndex,
            total: departments_data.data.total,
          });

          if (departments_data.data.results.length > 0) {
            setDepartments(departments_data.data.results);
          }
          setLoadingDepartments(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };
    if (showResponse === "deleted") {
      setVariant("success");
      setMessage("Department deleted successfully!");
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });

      fetchDepartments();
      setShowResponse("");
    } else if (showResponse === "failed") {
      setVariant("danger");
      setMessage("Error! Department deletion failed.");
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });

      setShowResponse("");
    }
  }, [showResponse]);

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

  function orderDepartmentsData() {
    if (order.sort === "asc") {
      departments.sort((a, b) => {
        const result = a[order.attr].localeCompare(b[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    } else {
      departments.sort((a, b) => {
        const result = b[order.attr].localeCompare(a[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    }
  }

  function showFeedback(id, color, message) {
    document.getElementById(id + "info").style.display = "block";
    document.getElementById(id + "info").style.color = color;
    document.getElementById(id + "info").innerHTML = message;
    setTimeout(() => {
      if (document.getElementById(id + "info"))
        document.getElementById(id + "info").style.display = "none";
    }, 2500);
  }

  async function updateDepartment(id) {
    var newName = document.getElementById(id + "name").value;
    var newUniversity = document.getElementById(id + "university").value;
    var newEmail = document.getElementById(id + "email").value;
    var newPhone = document.getElementById(id + "phone").value;

    var index = departments.findIndex((department) => department._id === id);

    if (index > -1) {
      if (
        departments[index].name === newName &&
        departments[index].university === newUniversity &&
        departments[index].email === newEmail &&
        departments[index].phone === newPhone
      ) {
        showFeedback(id, "blue", "Nothing to update.");
      } else if (
        newName === "" &&
        newUniversity === "" &&
        newEmail === "" &&
        newPhone === ""
      ) {
        showFeedback(id, "blue", "Please fill in the desired fields.");
      } else {
        if (newName === "")
          newName = document.getElementById(id + "name").placeholder;

        if (newUniversity === "")
          newUniversity = document.getElementById(
            id + "university",
          ).placeholder;

        if (newEmail === "")
          newEmail = document.getElementById(id + "email").placeholder;

        if (newPhone === "")
          newPhone = document.getElementById(id + "phone").placeholder;

        //update
        await axios
          .patch("/api/departments/" + id, {
            name: newName,
            university: newUniversity,
            email: newEmail,
            phone: newPhone,
          })
          .then((res) => {
            console.log("University updated successfully.");
            showFeedback(id, "green", "Successful update!");
          })
          .catch(() => {
            console.log("Failed to update.");
            showFeedback(id, "red", "Failed to update!");
          });
      }
    } else {
      console.log("something went wrong");
      return;
    }
  }

  async function deleteDepartment(departmentId) {
    const index = departments.findIndex(
      (department) => department._id === departmentId,
    );
    setPath("/api/departments/" + departmentId);
    setConfirmationMessage(
      "Do you want to delete " + departments[index].name + " ?",
    );
    setShowConfirmation(true);
  }

  function renderDepartmentsData() {
    const filtered_departments = departments.filter(
      (department) =>
        department.name.toLowerCase().includes(query.toLowerCase()) ||
        department.university.toLowerCase().includes(query.toLowerCase()) ||
        department.email.toLowerCase().includes(query.toLowerCase()) ||
        department.phone.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_departments.length) {
      orderDepartmentsData();
      return filtered_departments.map((department, index) => {
        const { _id, name, university, email, phone } = department;
        return (
          <tr
            key={_id}
            className="hover:tw-bg-light-pale-blue-white tw-text-center tw-align-middle tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          >
            <td className="table-data">{pagination.startIndex + index + 1}</td>
            <td className="table-data tw-text-center">
              <input
                type="text"
                id={_id + "name"}
                data-key={_id}
                className="editable-data tw-text-sm"
                placeholder={name}
                autoComplete="off"
              />
            </td>
            <td className="table-data tw-text-center">
              <input
                type="text"
                id={_id + "university"}
                data-key={_id}
                className="editable-data tw-text-sm"
                placeholder={university}
                autoComplete="off"
              />
            </td>
            <td className="table-data tw-text-center">
              <input
                type="text"
                id={_id + "email"}
                data-key={_id}
                className="editable-data tw-text-sm"
                placeholder={email}
                autoComplete="off"
              />
            </td>
            <td className="table-data tw-text-center">
              <input
                type="text"
                id={_id + "phone"}
                data-key={_id}
                className="editable-data tw-text-sm"
                placeholder={phone}
                autoComplete="off"
              />
            </td>
            <td className="table-data tw-text-center" style={{ width: "4vw" }}>
              <ActionButtons
                updateFunction={() => updateDepartment(_id)}
                deleteFunction={() => deleteDepartment(_id)}
              />
              <div style={{ display: "block" }}>
                <b>
                  <small
                    className="infoUpdateUser"
                    id={_id + "info"}
                    style={{ display: "none" }}
                  ></small>
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
    if (name === "prev_department") {
      setDepartmentsPage(departmentsPage - 1);
      //console.log("Department: Previous Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_department") {
      setDepartmentsPage(departmentsPage + 1);
      //console.log("Department: Next Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function loadingTable(e) {
    return (
      <tr>
        <td className="loading-data" colSpan={100}>
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
          colSpan={100}
        >
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      <ConfirmationModal
        show={showConfirmation}
        setShow={(data) => setShowConfirmation(data)}
        path={path}
        setResponse={(res) => setShowResponse(res)}
        message={confirmationMessage}
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
      <div className="departments-container">
        <div className="tw-flex filter-content tw-justify-start">
          {/* Search Functionality */}
          <div className="tw-relative tw-mt-1 tw-text-gray-300 tw-mb-6">
            <div className="tw-absolute tw-inset-y-0 tw-start-0 tw-flex tw-items-center tw-ps-3 tw-pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              id="table-search"
              className="tw-flex tw-flex-1 tw-items-center tw-py-2 tw-ps-10 tw-text-sm tw-text-dark-sky-blue tw-border tw-border-light-blue tw-rounded-lg tw-w-80 tw-bg-light-pale-blue-white focus:tw-outline-none focus:tw-ring-mid-pale-blue focus:tw-border-mid-pale-blue"
              placeholder="Search for departments"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table className="departments-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th>#</th>
              <th className="table-header tw-text-center">
                <span id="name" onClick={(e) => toggleOrder(e.target.id)}>
                  Department Name
                  <EditIcon style={{ height: "1rem", width: "1rem" }} />
                </span>
              </th>
              <th className="table-header tw-text-center">
                <span id="university" onClick={(e) => toggleOrder(e.target.id)}>
                  University
                  <EditIcon style={{ height: "1rem", width: "1rem" }} />
                </span>
              </th>
              <th className="table-header tw-text-center">
                <span id="email" onClick={(e) => toggleOrder(e.target.id)}>
                  Email
                  <EditIcon style={{ height: "1rem", width: "1rem" }} />
                </span>
              </th>
              <th className="table-header tw-text-center">
                <span id="phone" onClick={(e) => toggleOrder(e.target.id)}>
                  Phone
                  <EditIcon style={{ height: "1rem", width: "1rem" }} />
                </span>
              </th>
              <th className="table-header tw-text-center" style={{ textAlign: "center" }}>
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingDepartments
              ? loadingTable()
              : departments.length
                ? renderDepartmentsData()
                : emptyTable()}
          </tbody>
        </Table>
        <PaginationTab
          setLimit={(e) => {
            setDepartmentsLimit(e.target.value);
          }}
          renderPageButtonsName="department"
          pagination={pagination}
          setPageState={setDepartmentsPage}
        />
      </div>
    </div>
  );
}
