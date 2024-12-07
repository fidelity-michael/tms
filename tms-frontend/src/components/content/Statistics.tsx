// import Iframe from 'react-iframe'
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
} from "@material-tailwind/react";
import Chart from "react-apexcharts";

import React, { useEffect, useState } from "react";
import axios from "axios";

type NumberCardProps = {
  number: number;
  title: string;
  description: string;
};

const getUsers = async () => {
  const res = await axios.get("/api/users");

  return res.data;
};

const getTheses = async () => {
  const res = await axios.get("/api/theses");
  return res.data;
};

const getThesesRequests = async () => {
  const res = await axios.get("/api/theses_requests");
  return res.data;
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

function PieChart({ chartConfig }: any) {
  return (
    <Card className="tw-rounded-xl">
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
      >
        <div className="tw-p-5">
          <Typography
            placeholder={""}
            variant="h6"
            color="blue-gray"
            className="tw-text-dark-sky-blue tw-text-xl"
          >
            Registered Users
          </Typography>
          {/* <Typography
            placeholder={""}
            variant="small"
            color="gray"
            className="tw-max-w-sm tw-font-normal"
          ></Typography> */}
        </div>
      </CardHeader>
      <CardBody
        placeholder={""}
        className="tw-mt-4 tw-grid tw-place-items-center tw-px-2"
      >
        <Chart {...chartConfig} />
      </CardBody>
    </Card>
  );
}

type User = {
  _id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  role: string[]; // An array of roles, e.g., ["student"]
  group: string;
  status: string; // e.g., "active" or "inactive"
  department: string; // Assuming it's an ID reference to a department
  date: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
};

type chartConfigForUsersProps = {
  users: User[];
};

/* function chartConfigForUsers({ users }: chartConfigForUsersProps) {
  let studentCount = 0;
  let adminCount = 0;
  let professorCount = 0;
  let secretariantCount = 0;

  users.map((el) => {
    el.role.map((role) => {
      if (role === "student") studentCount++;
      else if (role === "professor") professorCount++;
      else if (role === "secretariat") secretariantCount++;
      else if (role === "administrator") adminCount++;
    });
  });

  return {
    type: "pie",
    width: 280,
    height: 280,
    series: [adminCount, secretariantCount, professorCount, studentCount],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#020617", "#ff8f00", "#00897b", "#1e88e5"],
      legend: {
        show: false,
      },
    },
  };
} */

function chartConfigForUsers({ users }: chartConfigForUsersProps) {
  if (!users || users.length === 0) {
    return {
      type: "pie",
      width: 280,
      height: 280,
      series: [0, 0, 0, 0],
      options: {
        chart: {
          toolbar: {
            show: false,
          },
        },
        title: {
          show: "",
        },
        dataLabels: {
          enabled: false,
        },
        colors: ["#020617", "#ff8f00", "#00897b", "#1e88e5"],
        legend: {
          show: false,
        },
      },
    };
  }

  let studentCount = 0;
  let adminCount = 0;
  let professorCount = 0;
  let secretariantCount = 0;

  users.map((el) => {
    el.role.map((role) => {
      if (role === "student") studentCount++;
      else if (role === "professor") professorCount++;
      else if (role === "secretariat") secretariantCount++;
      else if (role === "administrator") adminCount++;
    });
  });

  return {
    type: "pie",
    width: 450,
    height: 450,
    series: [adminCount, secretariantCount, professorCount, studentCount],
    options: {
      labels: ["Admins", "Secretariants", "Professors", "Students"],
      chart: {
        toolbar: {
          show: false,
        },
      },
      title: {
        show: "",
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#384959", "#ff8f00", "#00897b", "#1e88e5"],
      legend: {
        show: true,
      },
    },
  };
}

export default function Statistics() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTheses, setTotalTheses] = useState<number>(0);
  const [totalThesesRequests, setTotalThesesRequests] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const users = await getUsers();
      const theses = await getTheses();
      const thesesRequests = await getThesesRequests();

      setUsers(users);
      setTotalUsers(users.length || 0);
      setTotalTheses(theses.length || 0);
      setTotalThesesRequests(thesesRequests.length || 0);
    };
    console.log("SET?? USERS???: ", users);

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
          <div className="col">
            <PieChart chartConfig={chartConfigForUsers({ users })} />
          </div>
          <div className="col"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stats-wrapper">
      <h5 className="tw-text-3xl tw-text-dark-sky-blue tw-mb-2">Charts</h5>
      <div id="chart"></div>
      {renderCharts()}
    </div>
  );
}
