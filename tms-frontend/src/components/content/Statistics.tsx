// import Iframe from 'react-iframe'
/* import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";
import { Square3Stack3DIcon } from "@heroicons/react/24/outline"; */

import React, { useEffect, useState } from "react";
import axios from "axios";

type NumberCardProps = {
  number: number; // Update to accept a resolved number
  title: string;
  description: string;
};

const getUsers = async () => {
  const res = await axios.get("/api/users");
  return res.data.length || 0;
};

const getTheses = async () => {
  const res = await axios.get("/api/theses");
  return res.data.length || 0;
};

const getThesesRequests = async () => {
  const res = await axios.get("/api/theses_requests");
  return res.data.length || 0;
};

function NumberCard({ number, title, description }: NumberCardProps) {
  return (
    <div className="tw-flex tw-flex-grow tw-flex-col tw-text-dark-sky-blue tw-bg-white tw-rounded-xl tw-py-4 tw-px-8 tw-overflow-hidden">
      <div className="tw-text-center tw-font-bold tw-text-xl">{title}</div>
      <div className="tw-text-center tw-font-medium">{description}</div>
      <div className="tw-mt-6 tw-text-center tw-font-extrabold tw-text-9xl">
        {number}
      </div>
    </div>
  );
}

export default function Statistics() {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTheses, setTotalTheses] = useState<number>(0);
  const [totalThesesRequests, setTotalThesesRequests] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const users = await getUsers();
      const theses = await getTheses();
      const thesesRequests = await getThesesRequests();

      setTotalUsers(users);
      setTotalTheses(theses);
      setTotalThesesRequests(thesesRequests);
    };

    fetchData();
  }, []);

  function renderCharts() {
    return (
      <div className="statistics">
        <div className="row tw-flex tw-flex-grow" style={{ overflowX: "auto" }}>
          <div className="col mt-2">
            <NumberCard
              number={totalUsers}
              title="Users"
              description="Number of registered Users in the Database"
            />
          </div>
          <div className="col mt-2">
            <NumberCard
              number={totalTheses}
              title="Theses"
              description="Number of Theses in the Database"
            />
          </div>
          <div className="col mt-2">
            <NumberCard
              number={totalThesesRequests}
              title="Theses Requests"
              description="Number of Theses Requests in the Database"
            />
          </div>
        </div>
        <div className="row">
          <div className="col">hey</div>
          <div className="col">yo</div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-wrapper">
      <h5>Charts</h5>
      <div id="chart"></div>
      {renderCharts()}
    </div>
  );
}
