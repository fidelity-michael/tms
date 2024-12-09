import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import "./content.css";
import { SearchFunction } from "../../utils/utils";
import EditIcon from "@mui/icons-material/Edit";
import ActionButtons, { PaginationTab } from "./TableComponents";

export default function ThesesTable({ userId, userGroup }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("info");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState("");
  const [path, setPath] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "title",
    sort: "asc",
  });

  let updateThesis = [];

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  useEffect(() => {
    const fetchTheses = async () => {
      let theses_data = null;
      try {
        setLoadingTheses(true);
        if (userGroup === "Administrator") {
          theses_data = await axios.get("/api/data/theses/", {
            params: {
              page: thesesPage,
              limit: thesesLimit,
            },
          });
        } else {
          theses_data = await axios.get("/api/data/theses/" + userId, {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "professor",
            },
          });
        }

        //console.log(theses_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total,
          });

          if (theses_data.data.results.length > 0)
            setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchTheses();
  }, [thesesPage, thesesLimit, userId, userGroup]);

  useEffect(() => {
    if (showResponse === "deleted") {
      const fetchTheses = async () => {
        let theses_data = null;
        try {
          setLoadingTheses(true);
          if (userGroup === "Administrator") {
            theses_data = await axios.get("/api/data/theses/", {
              params: {
                page: thesesPage,
                limit: thesesLimit,
              },
            });
          } else {
            theses_data = await axios.get("/api/data/theses/" + userId, {
              params: {
                page: thesesPage,
                limit: thesesLimit,
                user: "professor",
              },
            });
          }

          //console.log(theses_data.data);
          if (componentIsMounted.current) {
            if (theses_data.data.results.length > 0)
              setTheses(theses_data.data.results);
            setLoadingTheses(false);
          }
        } catch (err) {
          console.log("Server internal error occurred!");
        }
      };

      setVariant("success");
      setMessage("Thesis deleted successfully!");
      setShowAlert(true);

      setTimeout(() => {
        setMessage("");
        setVariant("");
        setShowAlert(false);
      }, 3000);

      fetchTheses();
      setShowResponse("");
    } else if (showResponse === "failed") {
      setVariant("danger");
      setMessage("Error! Thesis deletion failed.");
      setShowAlert(true);

      setTimeout(() => {
        setMessage("");
        setVariant("");
        setShowAlert(false);
      }, 3000);

      setShowResponse("");
    }
  }, [thesesPage, thesesLimit, showResponse, userId, userGroup]);

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

  function orderThesesData() {
    if (order.sort === "asc") {
      theses.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr])
          result = a[order.attr].localeCompare(b[order.attr], "en", {
            sensitivity: "base",
          });
        return result;
      });
    } else {
      theses.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr])
          result = b[order.attr].localeCompare(a[order.attr], "en", {
            sensitivity: "base",
          });
        return result;
      });
    }
  }

  function handleInputChange(target) {
    // console.log("Target: ", target.name, " value: ", target.value);
    // console.log("Data Key: ", target.getAttribute("data-key"));
    if (updateThesis.length > 0) {
      const index = updateThesis.findIndex(
        (update) => update.thesisId === target.getAttribute("data-key"),
      );
      if (index > -1) {
        updateThesis[index][target.name] = target.value;
      } else {
        const newUpdate = {
          thesisId: target.getAttribute("data-key"),
        };

        newUpdate[target.name] = target.value;
        updateThesis.push(newUpdate);
      }
    } else {
      const newUpdate = {
        thesisId: target.getAttribute("data-key"),
      };

      newUpdate[target.name] = target.value;
      updateThesis.push(newUpdate);
    }
  }

  function handleCellUpdate(id) {
    // console.log("Update id: ", target.getAttribute("data-key"));
    const index = updateThesis.findIndex((update) => update.thesisId === id);
    // console.log("Found Index: ", index);
    if (index > -1) {
      const fetchTheses = async () => {
        let theses_data = null;
        try {
          setLoadingTheses(true);
          if (userGroup === "Administrator") {
            theses_data = await axios.get("/api/data/theses/", {
              params: {
                page: thesesPage,
                limit: thesesLimit,
              },
            });
          } else {
            theses_data = await axios.get("/api/data/theses/" + userId, {
              params: {
                page: thesesPage,
                limit: thesesLimit,
                user: "professor",
              },
            });
          }

          //console.log(theses_data.data);
          if (componentIsMounted.current) {
            if (theses_data.data.results.length > 0)
              setTheses(theses_data.data.results);
            setLoadingTheses(false);
          }
        } catch (err) {
          console.log("Server internal error occurred!");
        }
      };

      try {
        // console.log("Theses Data: ", updateThesis);
        const thesisKeys = Object.keys(updateThesis[index]);
        // console.log("Keys: ", thesisKeys);
        thesisKeys.map((key) => {
          axios
            .patch("/api/theses/" + id, {
              attr: key,
              value: updateThesis[index][key],
            })
            .then((data) => {
              setVariant("success");
              setMessage("Successfull Update");
              setShowAlert(true);

              setTimeout(() => {
                setMessage("");
                setVariant("");
                setShowAlert(false);
              }, 3000);

              window.scroll({ top: 0, left: 0, behavior: "smooth" });

              fetchTheses();
            })
            .catch((err) => {
              console.log(err);
            });

          return key;
        });
      } catch (err) {
        console.log("Thesis failed to update!");
      }
    } else {
      /*
      // alert("Please fill desired cells before you proceed");
      setVariant("info")
      setMessage("Info! Please fill desired cells before you proceed.");
      setShowAlert(true);

      setTimeout(() => { 
        setMessage("")
        setVariant("")
        setShowAlert(false);
      }, 3000)

      window.scroll({ top: 0, left: 0, behavior: 'smooth' });*/

      document.getElementById(id + "info").innerHTML =
        "Please fill in desired cells.";
      document.getElementById(id + "info").style.color = "blue";
      setTimeout(() => {
        document.getElementById(id + "info").innerHTML = "";
      }, 2000);
    }
  }

  function handleCellDelete(id) {
    const thesis = id;
    setPath("/api/theses/" + thesis);
    setShowConfirmation(true);
  }

  function renderThesesData() {
    const filtered_theses = theses.filter(
      (thesis) =>
        thesis.title.toLowerCase().includes(query.toLowerCase()) ||
        thesis.topic.toLowerCase().includes(query.toLowerCase()) ||
        thesis.area.toLowerCase().includes(query.toLowerCase()) ||
        thesis.prerequisites.toLowerCase().includes(query.toLowerCase()) ||
        thesis.professor_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.group.toLowerCase().includes(query.toLowerCase()) ||
        thesis.status.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((thesis) => {
        const {
          _id,
          date,
          title,
          topic,
          area,
          professor_email,
          professor_name,
          prerequisites,
          group,
          status,
        } = thesis;
        return (
          <tr
            key={_id}
            className="hover:tw-bg-light-pale-blue-white tw-text-center tw-align-middle tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          >
            <td className="table-data">
              <span style={{ fontSize: "0.85rem" }}>
                {new Intl.DateTimeFormat("en-GB", {
                  year: "numeric",
                  month: "numeric",
                  day: "2-digit",
                  // hour: 'numeric', minute: 'numeric', second: 'numeric',
                  // hour12: false
                }).format(new Date(date))}
              </span>
            </td>
            <td className="table-data">
              <input
                type="text"
                name="title"
                data-key={_id}
                className="editable-data"
                placeholder={title}
                size={title.length + 2}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                name="topic"
                data-key={_id}
                className="editable-data"
                placeholder={topic}
                size={topic.length}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                name="area"
                data-key={_id}
                className="editable-data"
                placeholder={area}
                size={area.length}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            {userGroup === "Administrator" ? (
              <td
                className="table-data"
                data-toggle="tooltip"
                data-placement="right"
                title={professor_name}
              >
                {professor_email}
              </td>
            ) : null}
            <td className="table-data">
              <input
                type="text"
                name="prerequisites"
                data-key={_id}
                className="editable-data"
                placeholder={
                  prerequisites.length > 0 ? prerequisites : "No Prerequisites"
                }
                size={prerequisites.length}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            <td className="table-data">
              {/* <input type="text" name="group" data-key={_id} className="editable-data" placeholder={group} size={group.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select
                className="editable-data"
                name="group"
                data-key={_id}
                defaultValue={group}
                onChange={(e) => handleInputChange(e.target)}
              >
                <option value="BSc">BSc</option>
                <option value="MSc">MSc</option>
                <option value="PhD">PhD</option>
              </select>
            </td>
            <td className="table-data">
              {/* <input type="text" name="status" data-key={_id} className="editable-data" placeholder={status} size={status.length} autoComplete="off" onChange={(e) => handleInputChange(e.target)} /> */}
              <select
                className="editable-data"
                name="status"
                data-key={_id}
                defaultValue={status}
                onChange={(e) => handleInputChange(e.target)}
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </td>
            <td className="table-data" align="center">
              <ActionButtons
                updateFunction={() => handleCellUpdate(_id)}
                deleteFunction={() => handleCellDelete(_id)}
              />
              <div>
                <b>
                  <small
                    className="infoUpdateUser"
                    id={_id + "info"}
                    style={{ marginTop: "1.3vh", float: "left" }}
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
    if (name === "prev_thesis") {
      setThesesPage(thesesPage - 1);
      //console.log("Thesis: Previous Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_thesis") {
      setThesesPage(thesesPage + 1);
      //console.log("Thesis: Next Page!");
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
          colSpan={100}
        >
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      <div className="theses-container">
        <ConfirmationModal
          message={""}
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

        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Archived Theses Table
          </h5>
          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for archived theses"
          />
        </div>

        <Table className="theses-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th className="table-header">
                <span id="date" onClick={(e) => toggleOrder(e.target.id)}>
                  Date
                </span>
              </th>
              <th className="table-header text-center">
                <span id="title" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Title
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span id="topic" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Topic
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span id="area" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Area
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              {userGroup === "Administrator" && (
                <th className="table-header text-center">
                  <span
                    id="professor_email"
                    onClick={(e) => toggleOrder(e.target.id)}
                  >
                    Professor
                  </span>
                </th>
              )}
              <th className="table-header text-center">
                <span
                  id="prerequisites"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Prerequisites
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span id="group" onClick={(e) => toggleOrder(e.target.id)}>
                  Group
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span id="status" onClick={(e) => toggleOrder(e.target.id)}>
                  Status
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th
                className="table-header text-center"
                style={{ textAlign: "center" }}
              >
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingTheses
              ? loadingTable()
              : theses.length
                ? renderThesesData()
                : emptyTable()}
          </tbody>
        </Table>
        <PaginationTab
          setLimit={(e) => {
            setThesesLimit(e.target.value);
          }}
          renderPageButtonsName="thesis"
          pagination={pagination}
          setPageState={setThesesPage}
        />
      </div>
    </div>
  );
}
