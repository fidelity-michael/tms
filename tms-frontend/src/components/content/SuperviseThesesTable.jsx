import React, { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import ReportsModal from "../content/ReportsModal";
import axios from "axios";
import "./content.css";
import { SearchFunction } from "../../utils/utils";
import { PaginationTab } from "./TableComponents";

export default function SuperviseThesesTable({ userId, email }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [student, setStudent] = useState("");
  const [title, setTitle] = useState("Thesis Reports");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "title",
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
    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get(
          "/api/data/assigned_theses/" + userId,
          {
            params: {
              page: thesesPage,
              limit: thesesLimit,
              user: "supervisor",
              // attr: "status",
              // filter: "active"
            },
          },
        );

        // console.log("Supervise Theses: ", theses_data.data.results);
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
  }, [thesesPage, thesesLimit, userId]);

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

  function loadReports(target) {
    console.log("Load reports of student: ", target.id);
    setStudent(target.id);
    setShowModal(true);
  }

  function renderThesesData() {
    const filtered_theses = theses.filter(
      (thesis) =>
        thesis.thesis_title.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_topic.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_area.toLowerCase().includes(query.toLowerCase()) ||
        thesis.professor_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_group.toLowerCase().includes(query.toLowerCase()) ||
        thesis.student_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_status.toLowerCase().includes(query.toLowerCase()),
    );

    console.log("pure:", theses);
    console.log("filtered:", filtered_theses);

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((thesis) => {
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
          professor_email,
          professor_name,
          thesis_status,
        } = thesis;
        var colorStatus;
        if (thesis_status === "active" || thesis_status === "completed") {
          colorStatus = "#228B22";
        } else if (thesis_status === "graded" || thesis_status === "archived") {
          colorStatus = "blue";
        } else {
          colorStatus = "grey";
        }

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
            <td
              className="table-data"
              data-toggle="tooltip"
              data-placement="right"
              title={professor_name}
            >
              {professor_email}
            </td>
            <td className="table-data">{thesis_group}</td>
            <td
              className="table-data"
              data-toggle="tooltip"
              data-placement="right"
              title={student_name}
            >
              {student_email}
            </td>
            <td className="table-data" style={{ color: colorStatus }}>
              <b>{thesis_status}</b>
            </td>
            <td className="table-data">
              <i
                id={student_id}
                className="modal-item far fa-file-alt fa-lg"
                onClick={(e) => {
                  setTitle(thesis_title);
                  loadReports(e.target);
                }}
              ></i>
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
        <td className="empty-data" colSpan="100%">
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl">
      {/* Modal */}
      <ReportsModal
        title={title}
        userId={student}
        show={showModal}
        email={email}
        onShow={(data) => setShowModal(data)}
      />

      <div className="theses-container">
        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Supervised Theses Table
          </h5>

          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for supervised theses"
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
                  id="professor_email"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Professor
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
                <span id="status" onClick={(e) => toggleOrder(e.target.id)}>
                  Status
                </span>
              </th>
              <th className="table-header">
                <span id="reports" onClick={(e) => toggleOrder(e.target.id)}>
                  Reports
                </span>
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
