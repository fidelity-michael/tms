import React, { useState, useEffect, useRef } from "react";
import { Table, Form } from "react-bootstrap";
import axios from "axios";
import "./content.css";
import { SearchFunction } from "../../utils/utils";
import { PaginationTab } from "./TableComponents";

export default function FavouritesTable({ userId, studentFavourites }) {
  const [areas, setAreas] = useState([]);
  const [areasPage, setAreasPage] = useState(1);
  const [areasLimit, setAreasLimit] = useState("10");
  const [loadingAreas, setLoadingAreas] = useState(false);

  const [pagination, setPagination] = useState({});

  const [query, setQuery] = useState("");
  const [order, setOrder] = useState({
    attr: "name",
    sort: "asc",
  });

  const [favouriteAreas, setFavouriteAreas] = useState([]);

  const componentIsMounted = useRef(true);
  useEffect(() => {
    return () => {
      componentIsMounted.current = true;
      // componentIsMounted.current = false
    };
  }, []);

  useEffect(() => {
    const fetchFavourites = async () => {
      try {
        const favourites_data = await axios.get(
          "/api/data/favourites/" + userId,
        );
        // console.log("Favourites: ", favourites_data.data);
        const areas = (array, column) => array.map((obj) => obj[column]);
        if (componentIsMounted.current) {
          setFavouriteAreas(areas(favourites_data.data, "area_id"));
        }
      } catch (err) {
        console.log("Server internal error occurred!");
      }
    };

    fetchFavourites();
  }, [userId]);

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

        console.log("Areas Received: ", areas_data.data);
        if (componentIsMounted.current) {
          setPagination({
            startIndex: areas_data.data.startIndex,
            endIndex: areas_data.data.endIndex,
            total: areas_data.data.total,
          });

          if (areas_data.data.results.length > 0)
            setAreas(areas_data.data.results);
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

  function handleAddFavourite(target) {
    // console.log("Add Favourite Area: ", target.getAttribute("data-key"));
    setFavouriteAreas((previousData) => [...previousData, target.id]);

    const newFavourite = {
      student: userId,
      area_id: target.id,
      area_name: target.getAttribute("data-key"),
    };

    axios
      .post("/api/favourites", newFavourite)
      .then((res) => {
        //   console.log("Area added to favourites successfully!");
        axios
          .get("/api/data/favourites/" + userId)
          .then((favourites) => {
            // console.log("Add Favourite: ", favourites.data);
            studentFavourites(favourites.data);
          })
          .catch((err) => {
            console.log("An error occurred: Couldn't update favourites!", err);
          });
      })
      .catch((err) => {
        console.log("An error occurred: Couldn't add favourite!", err);
      });
  }

  function handleRemoveFavourite(target) {
    // console.log("Remove Favourite Area: ", target.getAttribute("data-key"));
    const tempData = favouriteAreas.filter((id) => {
      return id !== target.id;
    });
    setFavouriteAreas(tempData);

    axios
      .delete("/api/favourites/", {
        params: {
          student: userId,
          area_id: target.id,
        },
      })
      .then((data) => {
        //   console.log("Area deleted from favourites successfully!");
        axios
          .get("/api/data/favourites/" + userId)
          .then((favourites) => {
            // console.log("Remove Favourite: ", favourites.data);
            studentFavourites(favourites.data);
          })
          .catch((err) => {
            console.log("An error occurred: Couldn't update favourites!", err);
          });
      })
      .catch((err) => {
        console.log("An error occurred: Couldn't remove favourite!", err);
      });
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
          <tr key={_id}>
            <td className="table-data">{pagination.startIndex + index + 1}</td>
            <td className="table-data">{name}</td>
            <td className="table-data">{description}</td>
            <td className="table-data" align="center">
              {favouriteAreas.indexOf(_id) > -1 ? (
                <button
                  type="button"
                  data-key={name}
                  id={_id}
                  className="tw-bg-dark-sky-blue hover:tw-bg-light-blue hover:tw-drop-shadow-xl tw-text-white tw-font-semibold hover:tw-text-white tw-py-2 tw-px-3 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
                  onClick={(e) => handleRemoveFavourite(e.target)}
                >
                  <i className="fa fa-heart" data-key={name} id={_id}></i>
                </button>
              ) : (
                <button
                  type="button"
                  data-key={name}
                  id={_id}
                  className="tw-bg-dark-sky-blue hover:tw-bg-light-blue hover:tw-drop-shadow-xl tw-text-white tw-font-semibold hover:tw-text-white tw-py-2 tw-px-3 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
                  onClick={(e) => handleAddFavourite(e.target)}
                >
                  <i className="far fa-heart" data-key={name} id={_id}></i>
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
        <td className="empty-data hover:tw-bg-light-pale-blue-white tw-text-dark-sky-blue tw-placeholder-dark-sky-blue" colSpan={100}>
          No Data Found
        </td>
      </tr>
    );
  }

  return (
    <div className="tables-data tw-bg-white tw-px-4 tw-py-6 tw-rounded-2xl tw-mt-10">

      <div className="areas-container">

        <div className="tw-ml-4 tw-mb-6 tw-mt-4 tw-flex tw-items-center tw-align-middle filter-content tw-justify-between">
          <h5 className="tw-text-dark-sky-blue tw-text-xl">
            Favourite Categories Table
          </h5>
          <SearchFunction
            query={query}
            setQuery={(e) => setQuery(e.target.value)}
            placeholder="Search for favourite categories"
          />
        </div>
        <Table
          className="areas-table"
          size="md"
          responsive
        >
          <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
            <tr>
              <th>#</th>
              <th className="table-header">
                <span id="name" onClick={(e) => toggleOrder(e.target.id)}>
                  Area Name
                </span>
              </th>
              <th className="table-header">
                <span
                  id="description"
                  onClick={(e) => toggleOrder(e.target.id)}
                >
                  Description
                </span>
              </th>
              <th className="table-header" style={{ textAlign: "center" }}>
                <span>Favourite</span>
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
