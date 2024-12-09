import React, { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import axios from "axios";
import "./content.css";
import { SearchFunction } from "../../utils/utils";
import { PaginationTab } from "./TableComponents";

export default function CompletedTheses({ userId }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});
  const [thesesArchived, setThesesArchived] = useState([]);

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
        const theses_data = await axios.get("/api/data/assigned_theses/", {
          params: {
            page: thesesPage,
            limit: thesesLimit,
            attr: "status",
            filter: "graded",
          },
        });

        // console.log("Graded Theses: ", theses_data.data.results);
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

  function handleArchiveClicked(target) {
    axios
      .patch("/api/assigned_theses/" + target.getAttribute("data-key"), {
        attr: "status",
        value: "archived",
      })
      .then((data) => {
        setThesesArchived((previousData) => [...previousData, target.id]);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function renderThesesData() {
    const filtered_theses = theses.filter(
      (thesis) =>
        thesis.thesis_title_greek.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_title_english
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        thesis.thesis_group.toLowerCase().includes(query.toLowerCase()) ||
        thesis.professor_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.student_email.toLowerCase().includes(query.toLowerCase()) ||
        thesis.thesis_grade.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_theses.length) {
      orderThesesData();
      return filtered_theses.map((find_thesis) => {
        const {
          _id,
          date,
          thesis_title_greek,
          thesis_title_english,
          thesis_group,
          student_id,
          student_email,
          professor_email,
          thesis_grade,
        } = find_thesis;
        return (
          <tr key={_id}>
            <td className="table-data-thesis">
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
            <td className="table-data-thesis">{thesis_title_greek}</td>
            <td className="table-data-thesis">{thesis_title_english}</td>
            <td className="table-data-thesis">{thesis_group}</td>
            <td className="table-data-thesis">{professor_email}</td>
            <td className="table-data-thesis">{student_email}</td>
            <td className="table-data-thesis">{thesis_grade}</td>
            <td className="table-data-thesis" align="center">
              {thesesArchived.indexOf(_id) > -1 ? (
                <span>Thesis archived</span>
              ) : (
                <div
                  className="btn-group"
                  role="group"
                  aria-label="Button group with nested dropdown"
                >
                  <button
                    type="button"
                    id={_id}
                    data-key={student_id}
                    className="btn btn-success apply-thesis"
                    onClick={(e) => handleArchiveClicked(e.target)}
                  >
                    Archive
                  </button>
                </div>
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
        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Completed Theses Table
          </h5>
          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for completed theses"
          />
        </div>

        <Table className="table-thesis" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th className="table-header-thesis">
                <span id="date" onClick={(e) => toggleOrder(e.target.id)}>
                  Date
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="title_1" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Greek Title
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="title_2" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis English Title
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="group" onClick={(e) => toggleOrder(e.target.id)}>
                  Group
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="professor" onClick={(e) => toggleOrder(e.target.id)}>
                  Professor
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="student" onClick={(e) => toggleOrder(e.target.id)}>
                  Student
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="grade" onClick={(e) => toggleOrder(e.target.id)}>
                  Grade
                </span>
              </th>
              <th className="table-header-thesis">
                <span id="action">Action</span>
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
