import React, { useEffect, useState } from "react";
import axios from "axios";
import "./content.css";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

export default function MyThesis({ userId, thesisAssigned }) {
  const [supervisors, setSupervisors] = useState([]);
  const [loadingSupervisors, setLoadingSupervisors] = useState(true);

  useEffect(() => {
    const getSupervisorsData = async () => {
      if (
        !thesisAssigned?.supervisor ||
        !Array.isArray(thesisAssigned.supervisor)
      ) {
        setLoadingSupervisors(false);
        return;
      }
      try {
        const supervisorsArray = await Promise.all(
          thesisAssigned.supervisor.map(async (supervisorId) => {
            const res = await axios.get(`/api/users/${supervisorId}`);
            return res.data.email;
          }),
        );
        setSupervisors(supervisorsArray);
      } catch (error) {
        console.log("Error fetching supervisors", error);
      } finally {
        setLoadingSupervisors(false);
      }
      setLoadingSupervisors(false);
    };

    getSupervisorsData();
  }, [thesisAssigned]);

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
        .get("/api/downloads/theses/" + target.name, { responseType: "blob" })
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

  function renderDownloads() {
    // console.log("Thesis Assigned: ", thesisAssigned);
    return thesisAssigned.thesis.thesis_files.map((filename, index) => {
      return (
        <a
          key={index}
          name={filename}
          href={"#" + filename}
          onClick={(e) => downloadFile(e.target)}
          style={{ marginRight: "0.5rem" }}
        >
          {filename}
        </a>
      );
    });
  }

  function loading() {
    return (
      <p
        className="animated headShake infinite"
        style={{ marginBottom: "-0.1rem" }}
      >
        Loading Supervisors...
      </p>
    );
  }

  function renderSupervisors() {
    if (supervisors.length > 0) {
      return supervisors.map((supervisor) => {
        return <li key={supervisor}>{supervisor}</li>;
      });
    } else {
      return <div>-</div>;
    }
  }

  return (
    <div className="tw-flex tw-flex-1 tw-px-8 tw-py-6 tw-justify-center tw-rounded-xl">
      {thesisAssigned.thesis ? (
        <div className="tw-font-dm tw-relative tw-w-full tw-max-w-2xl tw-overflow-x-auto tw-shadow-md sm:tw-rounded-lg tw-px-6 tw-pt-4 tw-pb-6 tw-bg-white">
          <table className="tw-w-full tw-text-sm tw-text-dark-sky-blue">
            <caption className="tw-caption-top tw-text-xl tw-font-semibold tw-text-dark-sky-blue tw-bg-white">
              <div className="tw-flex tw-flex-1 tw-items-center tw-justify-between">
                <div className="tw-text-left tw-text-mid-pale-blue tw-text-3xl">
                  My Thesis
                </div>
              </div>
            </caption>
            <thead className="tw-text-left tw-text-xl tw-text-mid-pale-blue tw-bg-light-pale-blue-white">
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Title
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {thesisAssigned.thesis.title}
                </td>
              </tr>

              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Topic
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {thesisAssigned.thesis.topic}
                </td>
              </tr>
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Area
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {thesisAssigned.thesis.area}
                </td>
              </tr>
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Professor
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {thesisAssigned.thesis.professor}
                </td>
              </tr>
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Supervisors
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  <ul>
                    {loadingSupervisors ? loading() : renderSupervisors()}
                  </ul>
                </td>
              </tr>
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Description
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {thesisAssigned.thesis.description}
                </td>
              </tr>
              <tr>
                <th
                  scope="col"
                  key={""}
                  className="tw-text-xl tw-px-6 tw-py-3 tw-align-middle"
                >
                  Date Assigned
                </th>
                <td className="tw-text-xl tw-text-left tw-align-middle tw-bg-white tw-border-light-sky-blue hover:tw-bg-light-pale-blue-white tw-px-4 tw-py-2">
                  {new Intl.DateTimeFormat("en-GB", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                  }).format(new Date(thesisAssigned.date))}
                </td>
              </tr>
            </thead>
          </table>
        </div>
      ) : null}
    </div>
  );
}
