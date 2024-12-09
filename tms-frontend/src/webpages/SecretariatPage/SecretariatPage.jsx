import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import NotAuthorizedPage from "../NotAuthorizedPage/NotAuthorizedPage";
import Topbar from "../../components/navbar/Topbar/SecretariatTopbar";
import Sidebar from "../../components/navbar/Sidebar/SecretariatSidebar";
import ActiveThesesTable from "../../components/content/ActiveThesesTable";
import CompletedTheses from "../../components/content/CompletedTheses";
import ArchivedTheses from "../../components/content/ArchivedTheses";
import Footer from "../../components/footer/Footer";
import MyRoles from "../../components/content/MyRoles";
import Calendar from "../../components/content/Calendar";
import SecretariatDashboard from "../../components/content/SecretariatDashboard";

function SecretariatPage() {
  //we use ths to indicate from where we're coming from (login or changeRole)
  const location = useLocation();

  const [page, setPage] = useState("Dashboard");

  const [userId, setUserId] = useState("");
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");

  // For sidebar link selection
  const [selectedItem, setSelectedItem] = useState("Dashboard");

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get("/api/auth/authorization");
        //console.log(auth_data.data);

        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("secretariat")) || //we come from my roles page
            (location.state === "login" &&
              auth_data.data.role[0] === "secretariat") //we come from login
          ) {
            const user_data = await axios.get(
              "/api/users/" + auth_data.data.id,
            );
            setFullName(
              user_data.data.first_name + " " + user_data.data.last_name,
            );

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
          } else setAuth(false);
        } else setAuth(false);
        setLoading(false);
      } catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    };

    authUser();
  }, []);

  useEffect(() => {
    const authUser = async () => {
      try {
        const auth_data = await axios.get("/api/auth/authorization");
        //console.log(auth_data.data);

        if (auth_data.data.auth) {
          if (
            (location.state === "changeRole" &&
              auth_data.data.role.includes("secretariat")) || //we come from my roles page
            (location.state === "login" &&
              auth_data.data.role[0] === "secretariat") //we come from login
          ) {
            console.log(location.state);

            setAuth(true);
            setEmail(auth_data.data.email);
            setUserId(auth_data.data.id);
          } else setAuth(false);
        } else setAuth(false);
        setLoading(false);
      } catch (err) {
        console.log("Server internal error occurred!");
        setAuth(false);
        setLoading(false);
      }
    };

    const interval = setInterval(() => {
      if (auth) authUser();
    }, 3600000);

    return () => clearInterval(interval);
  }, [auth]);

  const userNotAuthorized = () => {
    return <NotAuthorizedPage />;
  };

  const userAuthorized = () => {
    return (
      <div id="wrapper">
        <Sidebar
          role={"Secretariat"}
          selectedItem={selectedItem}
          name={fullName}
          onSelect={(page) => {
            setPage(page);
            setSelectedItem(page);
          }}
        />
        <div id="content-wrapper" className="tw-flex tw-flex-col">
          <div id="content" className="tw-bg-light-pale-blue-white">
            <Topbar
              userId={userId}
              email={email}
              onSelect={(page) => setPage(page)}
            />
            <div className="tw-flex tw-flex-col tw-mx-10 tw-mt-10">
              <p className="tw-flex tw-text-dark-sky-blue tw-font-bold tw-text-2xl xl:tw-text-3xl">
                {page === "Dashboard" ? "Overview" : ""}
              </p>
              {page === "Dashboard" ? (
                <SecretariatDashboard
                  userId={userId}
                  setPage={setPage}
                  setSelectedItem={setSelectedItem}
                />
              ) : null}
              {page === "Active Theses" ? (
                <div>
                  <h5 className="tw-text-dark-sky-blue tw-text-xl">Active Theses</h5>
                  <ActiveThesesTable
                    userId={userId}
                    userGroup={"Secretariat"}
                  />
                </div>
              ) : null}
              {page === "Completed Theses" ? (
                <CompletedTheses userId={userId} />
              ) : null}
              {page === "Theses Archive" ? (
                <ArchivedTheses userId={userId} />
              ) : null}
              {page === "My Roles" ? (
                <MyRoles userId={userId} currentRole="secretariat" />
              ) : null}
              {page === "My Calendar" ? <Calendar userId={userId} /> : null}
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  };

  return (
    <div>{auth ? userAuthorized() : loading ? null : userNotAuthorized()}</div>
  );
}

export default SecretariatPage;
