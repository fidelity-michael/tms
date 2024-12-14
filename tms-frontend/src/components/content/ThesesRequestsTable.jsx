import React, { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
// import ModalPopup from './ModalPopup';
import axios from "axios";
import "./content.css";
import DeclineThesisRequestModal from "./DeclineThesisRequestModal";
import { SearchFunction } from "../../utils/utils";
import { PaginationTab } from "./TableComponents";

export default function ThesesRequestsTable({
  userId,
  email,
  thesesRequest,
  requestAction,
}) {
  // Modal
  const [showModal, setShowModal] = useState(false);
  const [titleModal, setTitleModal] = useState("");
  const [thesisId, setThesisId] = useState("");
  //const [message, setMessage] = useState("Current status is saved.");
  // const [saveButton, setSaveButton] = useState(false);
  // const [requestData, setRequestData] = useState({ });
  // const [responseData, setResponseData] = useState({ });

  const [requests, setRequests] = useState([]);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsLimit, setRequestsLimit] = useState(10);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [pagination, setPagination] = useState({});
  const [requestsAnswered, setRequestsAnswered] = useState([]);

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "thesis",
    sort: "asc",
  });

  const componentIsMounted = useRef(true);
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoadingRequests(true);
        const requests_data = await axios.get(
          "/api/data/theses_requests/" + userId,
          {
            params: {
              page: requestsPage,
              limit: requestsLimit,
              user: "professor",
              attr: "status",
              filter: "active",
            },
          },
        );

        if (componentIsMounted.current) {
          // console.log("Requests: ", requests_data.data.results);
          setPagination({
            startIndex: requests_data.data.startIndex,
            endIndex: requests_data.data.endIndex,
            total: requests_data.data.total,
          });

          if (requests_data.data.results.length > 0) {
            setRequests(requests_data.data.results);
          }
          setLoadingRequests(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchRequests();
  }, [requestsPage, requestsLimit, userId]);

  function toggleOrder(attr) {
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

  function orderRequestsData() {
    if (order.sort === "asc") {
      requests.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr])
          result = a[order.attr].localeCompare(b[order.attr], "en", {
            sensitivity: "base",
          });
        return result;
      });
    } else {
      requests.sort((a, b) => {
        let result = null;
        if (a[order.attr] && b[order.attr])
          result = b[order.attr].localeCompare(a[order.attr], "en", {
            sensitivity: "base",
          });
        return result;
      });
    }
  }

  function sendNotification(target, action) {
    const studentId = target.getAttribute("data-key");
    const thesisTitle = target.name;
    const notifyStudent = async () => {
      await axios
        .post("/notifications", {
          title: "Request Reply arrived!",
          message:
            "Request for " +
            thesisTitle +
            " " +
            action +
            ".\nProfessor: " +
            email,
          receiver: studentId,
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

  function handleAcceptClicked(target) {
    try {
      axios
        .patch("/api/theses_requests/" + target.id, { status: "accepted" })
        .then((data) => {
          // console.log("Request ID: ", target.id, " accepted!");
          const newData = {
            id: target.id,
            status: "accepted",
          };

          setRequestsAnswered((previousData) => [...previousData, newData]);
          sendNotification(target, "Accepted");
        })
        .catch((err) => {
          console.log("Action failed to submit!");
        });
    } catch (err) {
      console.log("Request failed to update!");
    }
  }

  //open decline thesis request Modal
  function handleDeclineClicked(target) {
    setTitleModal(target.name);
    setThesisId(target.id);
    setShowModal(true);

    console.log("Decline modal opened.");
  }

  function renderAction(id, studentId, thesisTitle) {
    // I could use array.indexOf as AvailableThesis implementation!
    const find_request = requestsAnswered.find((request) => request.id === id);
    if (find_request) {
      // console.log(find_request);
      return (
        <span className="request-action-status">{find_request.status}</span>
      );
    } else {
      // console.log("Not found!");
      return (
        <div
          className="btn-group"
          role="group"
          aria-label="Button group with nested dropdown"
        >
          <DeclineThesisRequestModal
            title={titleModal}
            thesisId={thesisId}
            studentId={studentId}
            show={showModal}
            setShow={setShowModal}
            setRequestsAnswered={setRequestsAnswered}
            onShow={(data) => setShowModal(data)}
          />
          <button
            type="button"
            data-key={studentId}
            id={id}
            name={thesisTitle}
            className="btn btn-success accept-request"
            onClick={(e) => handleAcceptClicked(e.target)}
          >
            Accept
          </button>
          <button
            type="button"
            data-key={studentId}
            id={id}
            name={thesisTitle}
            className="btn btn-danger decline-request"
            onClick={(e) => handleDeclineClicked(e.target)}
          >
            Decline
          </button>
        </div>
      );
    }
  }

  function downloadFile(target) {
    const saveData = (function () {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      return function (data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      };
    })();

    const fetchData = async () => {
      console.log("File to download: ", target.name);
      await axios
        .get("/api/data/downloads/requests/" + target.name, {
          responseType: "blob",
        })
        .then((res) => {
          // console.log("Response: ", res.data);
          // Redirect to file (open file in browser) : window.location.assign(res.data);
          saveData(res.data, target.name);
        })
        .then((blob) => {
          console.log("File downloaded successfully!");
        })
        .catch((err) => {
          console.log(err);
          console.log("File failed to download!");
        });
    };

    fetchData();
  }

  function renderDownloads(files) {
    if (Array.isArray(files) && files.length > 0 && files[0].length) {
      return (
        <ul>
          {files.map((filename, index) => {
            if (filename.length > 0) {
              return (
                <li key={index + filename}>
                  <a
                    key={index}
                    name={filename}
                    href={"#" + filename}
                    onClick={(e) => downloadFile(e.target)}
                    style={{ color: "blue", marginRight: "0.5rem" }}
                  >
                    {filename}
                  </a>
                </li>
              );
            } else {
              return <span key={index}>No files available</span>;
            }
          })}
        </ul>
      );
    } else {
      return <p>No files available</p>;
    }
  }

  function renderRequestsData() {
    const filtered_requests = requests.filter(
      (request) =>
        request.thesis_title.toLowerCase().includes(query.toLowerCase()) ||
        request.thesis_topic.toLowerCase().includes(query.toLowerCase()) ||
        request.thesis_area.toLowerCase().includes(query.toLowerCase()) ||
        request.thesis_group.toLowerCase().includes(query.toLowerCase()) ||
        request.student_email.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_requests.length) {
      orderRequestsData();
      return filtered_requests.map((request) => {
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
          required_files,
        } = request;
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
            <td className="table-data">{renderDownloads(required_files)}</td>
            <td className="table-data" align="center">
              {renderAction(_id, student_id, thesis_title)}
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
    if (name === "prev_request") {
      setRequestsPage(requestsPage - 1);
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_request") {
      setRequestsPage(requestsPage + 1);
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
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      <div className="requests-container">
        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Theses Requests Table
          </h5>

          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for theses requests"
          />
        </div>
        <Table className="requests-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
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
                  Student Email
                </span>
              </th>
              <th className="table-header">
                <span
                  id="student_files"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Student Files
                </span>
              </th>
              <th className="table-header">
                <span id="action">Request Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingRequests
              ? loadingTable()
              : requests.length
                ? renderRequestsData()
                : emptyTable()}
          </tbody>
        </Table>
      </div>

      <PaginationTab
        setLimit={(e) => {
          setRequestsLimit(e.target.value);
        }}
        renderPageButtonsName="thesis"
        pagination={pagination}
        setPageState={setRequestsPage}
      />
    </div>
  );
}
