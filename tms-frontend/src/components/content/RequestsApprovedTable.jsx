import { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import axios from "axios";
import "./content.css";
import { PaginationTab } from "./TableComponents";
import { SearchFunction } from "../../utils/utils";

export default function RequestsApprovedTable({
  userId,
  email,
  thesisAssigned,
  assignThesis,
  updateThesisData,
}) {
  const [requests, setRequests] = useState([]);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsLimit, setRequestsLimit] = useState(10);
  const [loadingRequests, setLoadingRequests] = useState(false);

  const [myThesis, setMyThesis] = useState({});

  const [supervisors, setSupervisors] = useState([]);
  const [secretariats, setSecretariats] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [pagination, setPagination] = useState({});

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
              user: "student",
              attr: "status",
              filter: "accepted",
            },
          },
        );

        if (componentIsMounted.current) {
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
        setLoadingRequests(false);
      }
    };

    fetchRequests();
  }, [requestsPage, requestsLimit, thesisAssigned, userId]);

  useEffect(() => {
    axios
      .get("/api/assigned_theses/assigned_thesis/" + userId)
      .then((res) => {
        console.log(res.data.supervisor);
        setMyThesis(res.data);
      })
      .catch(() => "Server internal error occured!");
  }, [userId]);

  //if user has already a thesis assigned we fetch the supervisors,
  //secretariats and admins because of a potential change of thesis
  useEffect(() => {
    const getSupervisors = async (Ids) => {
      try {
        const supervisorData = await Promise.all(
          Ids.map((supervisorId) =>
            axios.get("/api/data/users/" + supervisorId),
          ),
        );
        // console.log('gg', res.data)
        setSupervisors(supervisorData.map((res) => res.data));
      } catch (err) {
        console.log("Server internal error occured!");
      }
    };

    const getSecretariats = () => {
      axios
        .get("/api/data/users/secretariats")
        .then((res) => setSecretariats(res.data))
        .catch(() => console.log("Server internal error occured!"));
    };

    const getAdmins = () => {
      axios
        .get("/api/data/users/admins")
        .then((res) => setAdmins(res.data))
        .catch(() => console.log("Server internal error occured!"));
    };

    if (myThesis && Object.keys(myThesis).length > 0) {
      getSupervisors(myThesis.supervisor);
      getSecretariats();
      getAdmins();
    }
  }, [myThesis]);

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

  function fetchThesisData() {
    axios
      .get("/api/data/my_thesis/" + userId)
      .then((thesis_data) => {
        // console.log(thesis_data.data);
        updateThesisData(thesis_data.data);
      })
      .catch((err) => {
        console.log("An error occurred: Failed to fetch thesis data!");
      });
  }

  function sendNotification(target) {
    const professorId = target.getAttribute("data-key");
    const thesisTitle = target.name;

    const notifyProfessor = async () => {
      await axios
        .post("/notifications", {
          title: "Thesis assigned!",
          message: "Thesis: " + thesisTitle + ". Student: " + email,
          receiver: professorId,
          type: "new",
        })
        .then((res) => {
          console.log("Notification sent successfully!");
        })
        .catch((err) => {
          console.log("Notification failed to send!");
        });
    };

    notifyProfessor();
  }

  function handleAcceptClicked(target) {
    console.log("Confirm Thesis Request with id: ", target.id);
    const find_request = requests.find((request) => request._id === target.id);
    if (find_request) {
      const newThesis = {
        thesis: find_request.thesis_id,
        professor: find_request.professor_id,
        supervisor: find_request.professor_id,
        student: find_request.student_id,
      };

      axios
        .post("/api/assigned_theses", newThesis)
        .then((res) => {
          assignThesis(find_request.thesis_id);
          fetchThesisData();
          sendNotification(target);
          console.log("Thesis assignment completed successfully!");
        })
        .catch((err) => {
          console.log("Thesis assignment failed to submit!");
        });
    } else {
      console.log("An error occurred: Thesis not found!");
    }
  }

  //we notify the supervisors, the secretariats and the admins
  //for the change of thesis
  async function changeThesis(target) {
    if (document.getElementById(target.id)) {
      document.getElementById(target.id).style.display = "none";
      document.getElementById(target.id + "feedback").innerHTML =
        "Requested for a change of thesis. Admins will delete your previous thesis. Please get in contact with secretariats and your supervisors.";
    }

    const notifyForChangeofThesis = async (receiver) => {
      await axios
        .post("/notifications", {
          title: "Student " + email + " has requested for a thesis change.",
          message: "Thesis to be cancelled: " + target.name + ".",
          receiver: receiver,
          type: "info",
        })
        .then((res) => {
          console.log("Notification sent successfully!");
        })
        .catch((err) => {
          console.log("Notification failed to send!");
        });
    };

    //notify supervisors, secretariats and admins
    if (supervisors && supervisors.length > 0)
      supervisors.map((supervisor) => notifyForChangeofThesis(supervisor._id));

    if (secretariats && secretariats.length > 0)
      secretariats.map((secretariat) =>
        notifyForChangeofThesis(secretariat._id),
      );

    if (admins && admins.length > 0)
      admins.map((admin) => notifyForChangeofThesis(admin._id));
  }

  function renderRequestsData() {
    const filtered_requests = requests.filter(
      (request) =>
        request.thesis_title.toLowerCase().includes(query.toLowerCase()) ||
        request.thesis_topic.toLowerCase().includes(query.toLowerCase()) ||
        request.professor_email.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_requests.length) {
      orderRequestsData();
      return filtered_requests.map((request, index) => {
        const {
          _id,
          date,
          thesis_id,
          thesis_title,
          thesis_topic,
          professor_id,
          professor_email,
          professor_name,
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
            <td
              className="table-data"
              data-toggle="tooltip"
              data-placement="right"
              title={professor_name}
            >
              {professor_email}
            </td>
            <td className="table-data" align="center">
              {thesisAssigned && thesisAssigned.length > 0 ? (
                thesisAssigned === thesis_id ? (
                  <span>Thesis Assigned</span>
                ) : (
                  <div>
                    <button
                      type="button"
                      data-key={professor_id}
                      id={_id}
                      name={thesis_title}
                      className="btn btn-success accept-request"
                      onClick={(e) => changeThesis(e.target)}
                    >
                      Change Thesis
                    </button>
                    <span
                      id={_id + "feedback"}
                      style={{ whiteSpace: "pre-wrap" }}
                    ></span>
                  </div>
                )
              ) : (
                <button
                  type="button"
                  data-key={professor_id}
                  id={_id}
                  name={thesis_title}
                  className="btn btn-success accept-request"
                  onClick={(e) => handleAcceptClicked(e.target)}
                >
                  Confirm
                </button>
              )}
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
      //console.log("Request: Previous Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_request") {
      setRequestsPage(requestsPage + 1);
      //console.log("Request: Next Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function loadingTable(e) {
    return (
      <tr>
        <td
          className="loading-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          colSpan={100}
        >
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
      <div className="requests-container">
        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Approved Requests Table
          </h5>
          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for approved theses"
          />
        </div>
        <Table
          className="requests-table"
          size="md"
          responsive
        >
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th className="table-header">
                <span id="date" onClick={(e) => toggleOrder(e.target.id)}>
                  Date
                </span>
              </th>
              <th className="table-header">
                <span id="title" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Title
                </span>
              </th>
              <th className="table-header">
                <span id="professor" onClick={(e) => toggleOrder(e.target.id)}>
                  Topic
                </span>
              </th>
              <th className="table-header">
                <span id="student" onClick={(e) => toggleOrder(e.target.id)}>
                  Professor
                </span>
              </th>
              <th className="table-header">
                <span id="action" onClick={(e) => toggleOrder(e.target.id)}>
                  {thesisAssigned && thesisAssigned.length > 1
                    ? "Status"
                    : "Assign Thesis"}
                </span>
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

        <PaginationTab
          setLimit={(e) => {
            setRequestsLimit(e.target.value);
          }}
          renderPageButtonsName="request"
          pagination={pagination}
          setPageState={setRequestsPage}
        />
      </div>
    </div>
  );
}
