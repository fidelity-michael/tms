import React, { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import ReportsModal from "../content/ReportsModal";
import GradingModal from "../forms/GradingForm/GradingModal";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import axios from "axios";
import "./content.css";

export default function AssignedThesesTable({ userId }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});
  const [supervisors, setSupervisors] = useState("");

  // Modal
  const [showReportModal, setShowReportModal] = useState(false);
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [student, setStudent] = useState("");
  const [title, setTitle] = useState("Thesis Reports");

  const [completedData, setCompletedData] = useState([]);
  const gradedData = [];

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "title",
    sort: "asc",
  });

  let updateSupervisor = [];

  const componentIsMounted = useRef(true);

  //get theses data
  useEffect(() => {
    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get(
          "/api/data/assigned_theses/" + userId,
          {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "professor",
              // attr: "status",
              // filter: "active compledted graded"
            },
          },
        );

        // console.log("Assigned Theses: ",theses_data.data.results);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total,
          });

          updateSupervisor = [theses_data.data.results.length]; //setting length

          if (theses_data.data.results.length > 0)
            setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchTheses();
  }, [thesesPage, thesesLimit, userId]);

  //getting all the proffesors and setting them into potential supervisors
  useEffect(() => {
    axios
      .get("/api/data/users/professors")
      .then((res) => {
        // console.log("Professors: ", res.data)
        console.log("Professors: ", res.data);
        if (componentIsMounted.current) setSupervisors(res.data);
      })
      .catch(() => {
        console.log("Server internal error occurred!");
      });

    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

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

  //on change supervisor on the dropdown
  function handleSupervisorChange(target, index) {
    //console.log("Thesis id: ", target.id, " supervisor: ", target.value);

    //get supervisor's index and id
    const supervisor_index = supervisors.findIndex(
      (supervisor) => supervisor.email === target.value,
    );
    const supervisor_id = supervisors[supervisor_index]._id;

    const newUpdate = {
      thesisId: target.id,
      supervisorId: supervisor_id,
      supervisorEmail: target.value,
    };

    updateSupervisor[index] = newUpdate;

    //console.log('prohgoumenoi supervisors', theses[0].supervisor_id)
    console.log(
      "Selected professor as new supervisor: ",
      updateSupervisor[index],
    );
  }

  //add a new professor as supervisor
  function handleProposeSupervisor(target, student_id, index, emails) {
    console.log("index: ", index);

    //prevent adding a null supervisor
    if (supervisors.length === emails.length) return;

    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get(
          "/api/data/assigned_theses/" + userId,
          {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "professor",
              // attr: "status",
              // filter: "active compledted graded"
            },
          },
        );

        // console.log("Assigned Theses: ",theses_data.data.results);
        if (componentIsMounted.current) {
          if (theses_data.data.results.length > 0)
            setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    var oldSupervisorsIdArray = [];
    var newSupervisorId;
    var newSupervisorsIdArray = [];

    //get old supervisors id
    oldSupervisorsIdArray = theses[index].supervisor_id;
    console.log("Palioi", oldSupervisorsIdArray);

    //get new supervisor's id
    if (updateSupervisor[index] === undefined) {
      //prwtos aptous potential giati den diallexame kapoion
      newSupervisorId = supervisors.find(
        (supervisor) => !emails.includes(supervisor.email),
      );
      console.log("den allaxame ara o prwtos");
    } else {
      newSupervisorId = updateSupervisor[index].supervisorId;
    }
    console.log("autos pou tha prosthesoume", newSupervisorId);

    newSupervisorsIdArray = oldSupervisorsIdArray;
    newSupervisorsIdArray.push(newSupervisorId);

    //filter for null or undefined gia periptwsh lathous
    newSupervisorsIdArray.filter(
      (element) => element !== null && element !== undefined,
    );

    console.log("ela oi neoiiii", newSupervisorsIdArray);

    if (newSupervisorsIdArray.length > 0) {
      axios
        .patch("/api/assigned_theses/" + student_id, {
          attr: "supervisor",
          value: newSupervisorsIdArray,
        })
        .then((data) => {
          // console.log("Supervisor proposed successfully!");
          fetchTheses();
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function removeSupervisor(e, index) {
    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get(
          "/api/data/assigned_theses/" + userId,
          {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "professor",
              // attr: "status",
              // filter: "active compledted graded"
            },
          },
        );

        // console.log("Assigned Theses: ",theses_data.data.results);
        if (componentIsMounted.current) {
          if (theses_data.data.results.length > 0)
            setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    const email = e.target.id;
    let indexToRemove = theses[index].supervisor_email.indexOf(email);

    let updatedSupervisorsId = theses[index].supervisor_id;
    updatedSupervisorsId.splice(indexToRemove, 1);

    console.log(updatedSupervisorsId);

    axios
      .patch("/api/assigned_theses/" + theses[index].student_id, {
        attr: "supervisor",
        value: updatedSupervisorsId,
      })
      .then((data) => {
        // console.log("Supervisor proposed successfully!");
        fetchTheses();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function renderPotentialSupervisors(supervisors_emails) {
    if (supervisors.length) {
      return supervisors.map((supervisor) => {
        const { _id, email } = supervisor;
        if (!supervisors_emails.includes(supervisor.email)) {
          return (
            <option id={_id} key={_id}>
              {email}
            </option>
          );
        } else {
          return null;
        }
      });
    } else {
      return <option key={0}>No supervisors found</option>;
    }
  }

  function loadReports(target) {
    // console.log("Load reports of student: ", target.id);
    setStudent(target.id);
    setShowReportModal(true);
  }

  function handleStatus(target) {
    console.log("Completed Data: ", completedData);
    setStudent(target.id);
    setShowGradingModal(true);
  }

  function renderThesesData() {
    const filtered_theses = theses.filter(
      (thesis) =>
        thesis.thesis_title.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_topic.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_area.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_group.toLowerCase().includes(query.toLowerCase()) ||
        thesis.student_email.toLowerCase().includes(query.toLowerCase()) ||
        //thesis.supervisor_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_status.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((find_thesis, index) => {
        if (
          find_thesis.thesis_status === "graded" ||
          find_thesis.thesis_status === "archived"
        ) {
          const data = {
            userId: find_thesis.student_id,
            title_greek: find_thesis.thesis_title_greek,
            title_english: find_thesis.thesis_title_english,
            grade: find_thesis.thesis_grade,
          };

          gradedData.push(data);
        }

        const {
          _id,
          date,
          thesis_title,
          thesis_topic,
          thesis_area,
          thesis_group,
          student_id,
          student_email,
          student_name,
          supervisor_email,
          thesis_status,
        } = find_thesis;

        //list all supervisors
        const listSupervisorsEmails = (
          <ul>
            {supervisor_email.map((email) => (
              <li key={thesis_title + "_" + email}>
                {email}
                <i
                  className="fa fa-trash-alt"
                  type="button"
                  id={email}
                  style={{ color: "#ec2020" }}
                  onClick={(e) => removeSupervisor(e, index)}
                ></i>
              </li>
            ))}
          </ul>
        );

        return (
          <tr key={_id}>
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
            <td className="table-data">{thesis_title}</td>
            <td className="table-data">{thesis_topic}</td>
            <td className="table-data">{thesis_area}</td>
            <td className="table-data">{thesis_group}</td>
            <td
              className="table-data"
              data-toggle="tooltip"
              data-placement="right"
              title={student_name}
            >
              {student_email}
            </td>
            <td
              className="table-data"
              data-toggle="tooltip"
              data-placement="right"
            >
              {listSupervisorsEmails}
            </td>
            <td className="table-data">
              {thesis_status === "active" ? (
                <span>{thesis_status}</span>
              ) : (
                <span
                  id={student_id}
                  className="modal-item"
                  onClick={(e) => {
                    setTitle(thesis_title);
                    handleStatus(e.target);
                  }}
                >
                  {thesis_status}
                </span>
              )}
            </td>
            <td className="table-data">
              <i
                id={student_id}
                className="modal-item far fa-file-alt fa-lg"
                style={{ fontSize: "4vh" }}
                onClick={(e) => {
                  setTitle(thesis_title);
                  loadReports(e.target);
                }}
              ></i>
            </td>
            <td className="table-data">
              {
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <Form.Group>
                    <Form.Control
                      as="select"
                      id={_id}
                      data-key={index}
                      className="supervisors-dropdown"
                      value={updateSupervisor[index]}
                      onChange={(e) => handleSupervisorChange(e.target, index)}
                    >
                      {renderPotentialSupervisors(supervisor_email)}
                    </Form.Control>
                  </Form.Group>
                  <button
                    type="button"
                    id={_id}
                    className="btn btn-info propose-btn"
                    onClick={(e) =>
                      handleProposeSupervisor(
                        e.target,
                        student_id,
                        index,
                        supervisor_email,
                      )
                    }
                  >
                    Add
                  </button>
                </div>
              }
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
            className="animated headShake infinite empty-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
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
          colSpan={100}
          className="empty-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
        >
          No Data Found
        </td>
      </tr>
    );
  }

  /*
  function addSupervisor() {
    
    if (supervisors.length) {
      const newSupervisor = {
        id: requiredFilename + "_" + new Date().getTime().toString(),
        filename: requiredFilename,
      };

      setRequiredFiles([...requiredFiles, newFile]);
      setRequiredFilename("");
    } else {
      console.log("File name is empty!");
    }
  }*/

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      {/* Modals */}
      <ReportsModal
        title={title}
        userId={student}
        show={showReportModal}
        onShow={(data) => setShowReportModal(data)}
      />
      <GradingModal
        title={title}
        userId={student}
        completedData={gradedData}
        onCompleted={(data) => setCompletedData(data)}
        show={showGradingModal}
        onShow={(data) => setShowGradingModal(data)}
      />

      <div className="theses-container">
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
              placeholder="Search for people"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
        <Table
          className="theses-table"
          striped
          bordered
          hover
          size="md"
          responsive
        >
          <thead>
            <tr>
              <th className="table-header">
                <span id="date" onClick={(e) => toggleOrder(e.target.id)}>
                  Date
                </span>
              </th>
              <th className="table-header">
                <span
                  id="thesis_title"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Thesis Title
                </span>
              </th>
              <th className="table-header">
                <span
                  id="thesis_topic"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Thesis Topic
                </span>
              </th>
              <th className="table-header">
                <span
                  id="thesis_area"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Thesis Area
                </span>
              </th>
              <th className="table-header">
                <span
                  id="thesis_group"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Group
                </span>
              </th>
              <th className="table-header">
                <span
                  id="student_email"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Student
                </span>
              </th>
              <th className="table-header">
                <span
                  id="supervisor_email"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Supervisors
                </span>
              </th>
              <th className="table-header">
                <span
                  id="thesis_status"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Status
                </span>
              </th>
              <th className="table-header">
                <span id="reports" onClick={(e) => toggleOrder(e.target.id)}>
                  Reports
                </span>
              </th>
              <th className="table-header">
                <span id="action">Add Supervisor</span>
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
        {renderPageButtons("thesis")}
        <div className="dropdown-limit">
          <Form.Group controlId="selectControl">
            <Form.Label className="page-limit-lbl">Theses per page</Form.Label>
            <Form.Control
              className="page-limit"
              as="select"
              onChange={(e) => {
                setThesesLimit(e.target.value);
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
