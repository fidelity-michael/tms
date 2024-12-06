import { useState, useEffect, useRef } from "react";
import { Table, Form, Alert } from "react-bootstrap";
import axios from "axios";
import ConfirmationModal from "../content/ConfirmationModal";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import "./content.css";
import ActionButtons, { PaginationTab } from "./TableComponents";
import { SearchFunction, showShortAlert } from "../../utils/utils";

export default function AreasTable() {
  const [areas, setAreas] = useState([]);
  const [areasPage, setAreasPage] = useState(1);
  const [areasLimit, setAreasLimit] = useState("10");
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [pagination, setPagination] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [variant, setVariant] = useState("info");
  const [message, setMessage] = useState("");

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showResponse, setShowResponse] = useState("");
  const [path, setPath] = useState("");

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "name",
    sort: "asc",
  });

  let updateArea = [];

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setLoadingAreas(true);
        const pageFix = areasLimit === "50" ? 1 : areasPage;
        const areas_data = await axios.get("/api/data/areas", {
          params: {
            page: pageFix,
            limit: areasLimit,
          },
        });

        //console.log(areas_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: areas_data.data.startIndex,
            endIndex: areas_data.data.endIndex,
            total: areas_data.data.total,
          });

          if (areas_data.data.results.length > 0) {
            setAreas(areas_data.data.results);
          }
          setLoadingAreas(false);
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    if (areasLimit === "50") {
      // console.log("Limit 50 !");
      setAreasPage(1);
    }

    fetchAreas();
  }, [areasPage, areasLimit]);

  useEffect(() => {
    if (showResponse === "deleted") {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const areas_data = await axios.get("/api/data/areas", {
            params: {
              page: areasPage,
              limit: areasLimit,
            },
          });

          if (componentIsMounted.current) {
            if (areas_data.data.results.length > 0)
              setAreas(areas_data.data.results);
            setLoadingAreas(false);
          }
        } catch (err) {
          console.log("Server internal error occurred!");
        }
      };

      setVariant("success");
      setMessage("Area deleted successfully!");
      setShowAlert(true);

      fetchAreas();
      setShowResponse("");
    } else if (showResponse === "failed") {
      setVariant("danger");
      setMessage("Error! Area deletion failed.");
      setShowAlert(true);

      setShowResponse("");
    }
  }, [areasPage, areasLimit, showResponse]);

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

  function orderAreasData() {
    if (order.sort === "asc") {
      areas.sort((a, b) => {
        const result = a[order.attr].localeCompare(b[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    } else {
      areas.sort((a, b) => {
        const result = b[order.attr].localeCompare(a[order.attr], "en", {
          sensitivity: "base",
        });
        return result;
      });
    }
  }

  /*TODO: Check this target parameter and function usage*/
  function handleInputChange(target) {
    // console.log("Target: ", target.name, " value: ", target.value);
    // console.log("Data Key: ", target.getAttribute("data-key"));
    if (updateArea.length > 0) {
      const index = updateArea.findIndex(
        (update) => update.areaId === target.getAttribute("data-key"),
      );
      if (index > -1) {
        updateArea[index][target.name] = target.value;
      } else {
        const newUpdate = {
          areaId: target.getAttribute("data-key"),
        };

        newUpdate[target.name] = target.value;
        updateArea.push(newUpdate);
      }
    } else {
      const newUpdate = {
        areaId: target.getAttribute("data-key"),
      };

      newUpdate[target.name] = target.value;
      updateArea.push(newUpdate);
    }
  }

  function handleCellUpdate(id) {
    // console.log("Update id: ", target.getAttribute("data-key"));
    const index = updateArea.findIndex((update) => update.areaId === id);
    // console.log("Found Index: ", index);
    if (index > -1) {
      const fetchAreas = async () => {
        try {
          setLoadingAreas(true);
          const areas_data = await axios.get("/api/data/areas", {
            params: {
              page: areasPage,
              limit: areasLimit,
            },
          });

          if (componentIsMounted.current) {
            if (areas_data.data.results.length > 0)
              setAreas(areas_data.data.results);
            setLoadingAreas(false);
          }
        } catch (err) {
          console.log("Server internal error occurred!");
        }
      };

      try {
        // console.log("Areas Data: ", updateArea);
        const areaKeys = Object.keys(updateArea[index]);
        // console.log("Keys: ", areaKeys);

        areaKeys.map((key) => {
          // console.log(key);
          axios
            .patch("/api/areas/" + id, {
              attr: key,
              value: updateArea[index][key],
            })
            .then((data) => {
              fetchAreas();
              setMessage("Updated successfully");
            })
            .catch((err) => {
              console.log(err);
            });

          return key;
        });
      } catch (err) {
        console.log("Area failed to update!");
      }
    } else {
      setVariant("info");
      setMessage("Info! Please fill desired cells before you proceed.");
      setShowAlert(true);

      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
  }

  function handleCellDelete(id) {
    const area = id;
    setPath("/api/areas/" + area);
    setShowConfirmation(true);
  }

  function renderAreasData() {
    const filtered_areas = areas.filter(
      (area) =>
        area.name.toLowerCase().includes(query.toLowerCase()) ||
        area.description.toLowerCase().includes(query.toLowerCase()),
    );

    if (filtered_areas.length) {
      orderAreasData();
      return filtered_areas.map((area, index) => {
        const { _id, name, description } = area;
        return (
          <tr
            key={_id}
            className="hover:tw-bg-light-pale-blue-white tw-text-center tw-align-middle tw-text-dark-sky-blue tw-placeholder-dark-sky-blue"
          >
            <td className="table-data">{pagination.startIndex + index + 1}</td>
            <td className="table-data">
              <input
                type="text"
                name="name"
                data-key={_id}
                className="editable-data"
                placeholder={name}
                size={name.length}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            <td className="table-data">
              <input
                type="text"
                name="description"
                data-key={_id}
                className="editable-data"
                placeholder={description}
                size={description.length}
                autoComplete="off"
                onChange={(e) => handleInputChange(e.target)}
              />
            </td>
            <td className="table-data" align="center">
              <ActionButtons
                updateFunction={() => handleCellUpdate(_id)}
                deleteFunction={() => handleCellDelete(_id)}
              />
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
    if (name === "prev_area") {
      setAreasPage(areasPage - 1);
      //console.log("Area: Previous Page!");
    } else {
      console.log(
        "Server internal error occurred. Server failed to load page.",
      );
    }
  }

  function handleNextPage(name) {
    if (name === "next_area") {
      setAreasPage(areasPage + 1);
      //console.log("Area: Next Page!");
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
      <div className="areas-container">
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

        <SearchFunction
          query={query}
          setQuery={(e) => setQuery(e.target.value)}
          placeholder="Search for Categories"
        />

        <Table className="areas-table" size="md" responsive>
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th>#</th>
              <th className="table-header text-center">
                <span id="name" onClick={(e) => toggleOrder(e.target.id)}>
                  Area Name
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header text-center">
                <span
                  id="description"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Description
                </span>
                <EditIcon style={{ height: "1rem", width: "1rem" }} />
              </th>
              <th className="table-header" style={{ textAlign: "center" }}>
                <span>Action</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingAreas
              ? loadingTable()
              : areas.length
                ? renderAreasData()
                : emptyTable()}
          </tbody>
        </Table>
        <PaginationTab
          setLimit={(e) => {
            setAreasLimit(e.target.value);
          }}
          renderPageButtonsName="area"
          pagination={pagination}
          setPageState={setAreasPage}
        />
      </div>
    </div>
  );
}
