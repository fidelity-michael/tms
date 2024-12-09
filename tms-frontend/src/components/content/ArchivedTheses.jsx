import React, { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import "./content.css";
import { SearchFunction } from "../../utils/utils";
import EditIcon from "@mui/icons-material/Edit";
import { PaginationTab } from "./TableComponents";

export default function ArchivedTheses({ userId }) {
  const [theses, setTheses] = useState([]);
  const [thesesPage, setThesesPage] = useState(1);
  const [thesesLimit, setThesesLimit] = useState(10);
  const [loadingTheses, setLoadingTheses] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [message, setMessage] = useState("");
  const [variant, setVariant] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "title",
    sort: "asc",
  });

  //let updateThesis = [];

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
            filter: "archived",
          },
        });

        // console.log("Archived Theses: ", theses_data.data.results);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: theses_data.data.startIndex,
            endIndex: theses_data.data.endIndex,
            total: theses_data.data.total,
          });

          if (theses_data.data.results.length > 0) {
            setTheses(theses_data.data.results);
          }
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

  //update a thesis attribute in db (patch)
  function updateAttribute(id, attribute, value) {
    const fetchTheses = async () => {
      try {
        setLoadingTheses(true);
        const theses_data = await axios.get("/api/data/assigned_theses/", {
          params: {
            page: thesesPage,
            limit: thesesLimit,
            attr: "status",
            filter: "archived",
          },
        });

        // console.log("Archived Theses: ", theses_data.data.results);
        if (componentIsMounted.current) {
          if (theses_data.data.results.length > 0)
            setTheses(theses_data.data.results);
          setLoadingTheses(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    console.log(id);
    console.log(attribute);
    console.log(value);

    axios
      .patch("/api/assigned_theses/updateAttribute/" + id, {
        attr: attribute,
        value: value,
      })
      .then((data) => {
        fetchTheses();
        return 1;
      })
      .catch((err) => {
        setShowAlert(true);
        setMessage("Something went wrong.");
        setVariant("danger");
        setTimeout(() => {
          setMessage("");
          setVariant("");
          setShowAlert(false);
        }, 3000);

        window.scroll({ top: 0, left: 0, behavior: "smooth" });
        console.log(err);

        return 0;
      });
  }

  async function updateAssignedThesis(id) {
    //indicates if something changed
    var flag = 0;

    //editable attributes
    const thesisTitleGreek = document.getElementById(id + "thesisTitleGreek");
    const thesisTitleEnglish = document.getElementById(
      id + "thesisTitleEnglish",
    );
    const grade = document.getElementById(id + "grade");

    //find thesis' index in theses array
    const index = theses.findIndex((theses) => theses._id === id);
    console.log(theses[index]);

    //updates
    if (
      thesisTitleGreek.value &&
      thesisTitleGreek.value !== thesisTitleGreek.placeholder
    ) {
      flag = 1;
      updateAttribute(id, "title_greek", thesisTitleGreek.value);
    }

    if (
      thesisTitleEnglish.value &&
      thesisTitleEnglish.value !== thesisTitleEnglish.placeholder
    ) {
      flag = 1;
      updateAttribute(id, "title_english", thesisTitleEnglish.value);
    }

    if (grade.value && grade.value !== grade.placeholder) {
      flag = 1;
      updateAttribute(id, "grade", grade.value);
    }

    //no change
    if (flag === 0) {
      document.getElementById(id + "info").innerHTML =
        "Please fill in desired cells.";
      document.getElementById(id + "info").style = "color: blue";
      setTimeout(() => {
        document.getElementById(id + "info").innerHTML = "";
      }, 2000);
    } else {
      setShowAlert(true);
      setMessage("Successful update!");
      setVariant("success");
      setTimeout(() => {
        setMessage("");
        setVariant("");
        setShowAlert(false);
      }, 3000);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
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
      return filtered_theses.map((find_thesis, index) => {
        const {
          _id,
          date,
          thesis_title_greek,
          thesis_title_english,
          thesis_group,
          student_id,
          student_email,
          student_name,
          professor_email,
          professor_name,
          thesis_grade,
        } = find_thesis;
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
                id={_id + "thesisTitleGreek"}
                name="title_greek"
                data-key={_id}
                className="editable-data"
                placeholder={thesis_title_greek}
                size={thesis_title_greek.length + 1}
                autoComplete="off"
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                id={_id + "thesisTitleEnglish"}
                name="title_english"
                data-key={_id}
                className="editable-data"
                placeholder={thesis_title_english}
                size={thesis_title_english.length}
                autoComplete="off"
              />
            </td>
            <td className="table-data" id={_id + "group"}>
              {thesis_group}
            </td>
            <td
              className="table-data"
              id={_id + "professorEmail"}
              data-toggle="tooltip"
              data-placement="right"
              title={professor_name}
            >
              {professor_email}
            </td>
            <td
              className="table-data"
              id={_id + "studentName"}
              data-toggle="tooltip"
              data-placement="right"
              title={student_name}
            >
              {student_email}
            </td>
            <td className="table-data">
              <input
                type="number"
                id={_id + "grade"}
                step="0.25"
                min="0"
                max="10"
                name="grade"
                data-key={_id}
                className="editable-data"
                placeholder={thesis_grade}
                size={thesis_grade.length}
                autoComplete="off"
              />
            </td>
            <td className="table-data">
              <button
                onClick={() => updateAssignedThesis(_id)}
                className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
              >
                Update
              </button>
              <div style={{ marginTop: "1.3vh" }}>
                <b>
                  <small className="infoUpdateUser" id={_id + "info"}></small>
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
        <td
          className="loading-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          colSpan="100%"
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
      <div className="theses-container">
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
              <th className="table-header">
                <span id="title_1" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis Greek Title
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header">
                <span id="title_2" onClick={(e) => toggleOrder(e.target.id)}>
                  Thesis English Title
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header">
                <span id="group" onClick={(e) => toggleOrder(e.target.id)}>
                  Group
                </span>
              </th>
              <th className="table-header">
                <span id="professor" onClick={(e) => toggleOrder(e.target.id)}>
                  Professor
                </span>
              </th>
              <th className="table-header">
                <span id="student" onClick={(e) => toggleOrder(e.target.id)}>
                  Student
                </span>
              </th>
              <th className="table-header">
                <span id="grade" onClick={(e) => toggleOrder(e.target.id)}>
                  Grade
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header" style={{ textAlign: "center" }}>
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
