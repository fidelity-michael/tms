import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import "./content.css";
import ActionButtons, { PaginationTab } from "./TableComponents";

export default function UniversitiesArchive() {
  const [universities, setUniversities] = useState([]);
  const [universitiesPage, setUniversitiesPage] = useState(1);
  const [universitiesLimit, setUniversitiesLimit] = useState(10);
  const [loadingUniversities, setLoadingUniversities] = useState(false);

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
      // componentIsMounted.current = false
      componentIsMounted.current = true;
    };
  }, []);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const universities_data = await axios.get("/api/data/universities", {
          params: {
            page: universitiesPage,
            limit: universitiesLimit,
          },
        });

        //console.log(universities_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: universities_data.data.startIndex,
            endIndex: universities_data.data.endIndex,
            total: universities_data.data.total,
          });

          if (universities_data.data.results.length > 0)
            setUniversities(universities_data.data.results);
          setLoadingUniversities(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchUniversities();
  }, [universitiesPage, universitiesLimit, showResponse]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        setLoadingUniversities(true);
        const universities_data = await axios.get("/api/data/universities", {
          params: {
            page: universitiesPage,
            limit: universitiesLimit,
          },
        });

        //console.log(universities_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: universities_data.data.startIndex,
            endIndex: universities_data.data.endIndex,
            total: universities_data.data.total,
          });

          if (universities_data.data.results.length > 0)
            setUniversities(universities_data.data.results);
          setLoadingUniversities(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    if (showResponse === "deleted") {
      setVariant("success");
      setMessage("University deleted successfully!");
      setShowAlert(true);

      setTimeout(() => {
        setVariant("");
        setMessage("");
        setShowAlert(false);
      }, 2500);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });

      fetchUniversities();
      setShowResponse("");
    } else if (showResponse === "failed") {
      setVariant("danger");
      setMessage("Error! University deletion failed.");
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

  function orderUniversitiesData() {
    if (order.sort === "asc") {
      universities.sort((a, b) => {
        const result = a[order.attr].localeCompare(b[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    } else {
      universities.sort((a, b) => {
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

  async function updateUniversity(id) {
    var newName = document.getElementById(id + "name").value;
    var newCountry = document.getElementById(id + "country").value;
    var index = universities.findIndex((university) => university._id === id);

    if (index > -1) {
      if (
        universities[index].name === newName &&
        universities[index].country === newCountry
      ) {
        showFeedback(id, "blue", "Nothing to update.");
      } else if (newName === "" && newCountry === "") {
        showFeedback(id, "blue", "Please fill in the desired fields.");
      } else {
        if (newName === "")
          newName = document.getElementById(id + "name").placeholder;

        if (newCountry === "")
          newCountry = document.getElementById(id + "country").placeholder;

        //update
        await axios
          .patch("/api/universities/" + id, {
            name: newName,
            country: newCountry,
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

  async function deleteUniversity(universityId) {
    const index = universities.findIndex(
      (university) => university._id === universityId,
    );
    setPath("/api/universities/" + universityId);
    setConfirmationMessage(
      "Do you want to delete " + universities[index].name + " ?",
    );
    setShowConfirmation(true);
  }

  function renderUniversitiesData() {
    const filtered_universities = universities.filter(
      (university) =>
        university.name.toLowerCase().includes(query.toLowerCase()) ||
        university.country.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_universities.length) {
      orderUniversitiesData();
      return filtered_universities.map((university, index) => {
        const { _id, name, country } = university;
        return (
          <tr
            key={_id}
            className="table-data hover:tw-bg-light-pale-blue-white tw-text-center tw-align-middle tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          >
            <td>{pagination.startIndex + index + 1}</td>
            <td className="table-data">
              <input
                type="text"
                id={_id + "name"}
                data-key={_id}
                className="editable-data"
                placeholder={name}
                size={30}
                autoComplete="off"
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                id={_id + "country"}
                data-key={_id}
                className="editable-data"
                placeholder={country}
                size={15}
                autoComplete="off"
              />
            </td>
            <td className="table-data" style={{ width: "4vw" }}>
              <ActionButtons
                updateFunction={() => updateUniversity(_id)}
                deleteFunction={() => deleteUniversity(_id)}
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
          className="empty-data hover:tw-bg-light-pale-blue-white tw-text-center tw-align-middle tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          colSpan="100%"
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
      <div className="universities-container">
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
              placeholder="Search for universities"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table className="universities-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th>#</th>
              <th className="table-header tw-text-center">
                <span id="name" onClick={(e) => toggleOrder(e.target.id)}>
                  University Name
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span id="country" onClick={(e) => toggleOrder(e.target.id)}>
                  Country
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header tw-text-center">
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingUniversities
              ? loadingTable()
              : universities.length
                ? renderUniversitiesData()
                : emptyTable()}
          </tbody>
        </Table>
        <PaginationTab
          setLimit={(e) => setUniversitiesLimit(e.target.value)}
          renderPageButtonsName={"university"}
          pagination={pagination}
          setPageState={setUniversities}
        />
      </div>
    </div>
  );
}
