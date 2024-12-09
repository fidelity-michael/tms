import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Changed from deprecated useHistory
import axios from "axios";
import "./content.css";

export default function MyRoles({ userId, currentRole }) {
  const [roles, setRoles] = useState([]);
  const navigate = useNavigate();

  //fetch user's data
  useEffect(() => {
    axios
      .get("api/users/" + userId)
      .then((res) => {
        setRoles(res.data.role);
      })
      .catch(() => {
        console.log("Server internal error occurred!");
      });
  }, [userId]);

  function showInfo(role) {
    document.getElementById("info" + role).innerHTML =
      "Go to my " + role + " page";
  }

  function hideInfo(role) {
    document.getElementById("info" + role).innerHTML = "";
  }

  function changeRolePage(role) {
    navigate("/" + role, { state: "changeRole" });
  }

  return (
    <div>
      <div className="tw-flex tw-justify-between tw-mb-8">
        <div className="tw-text-dark-sky-blue tw-text-md">
          <a href="">Dashboard</a> &gt; My Roles
        </div>
      </div>

      <ul>
        {roles.map((role) => {
          if (role === currentRole) {
            return (
              <li
                className="liRole tw-text-dark-sky-blue"
                key={userId + role}
                style={{ fontSize: "1.5rem" }}
              >
                <b>{role}</b>
              </li>
            );
          } else {
            return (
              <li
                className="liRole tw-text-dark-sky-blue"
                key={userId + role}
                style={{ fontSize: "1.5rem" }}
              >
                <div>
                  <button
                    type="button"
                    className="btn btn-info roleButton"
                    onMouseOver={() => {
                      showInfo(role);
                    }}
                    onMouseOut={() => {
                      hideInfo(role);
                    }}
                    onClick={() => {
                      changeRolePage(role);
                    }}
                  >
                    {role}
                  </button>
                  <small
                    id={"info" + role}
                    style={{ display: "block" }}
                  ></small>
                </div>
              </li>
            );
          }
        })}
      </ul>
    </div>
  );
}
