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
    <Card placeholder={""} className="tw-rounded-xl">
      <CardHeader
        placeholder={""}
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
          <Typography
            placeholder={""}
            variant="small"
            color="gray"
            className="tw-max-w-sm tw-font-normal"
          >
            Users pursuing either a Bachelor's or Master's degree are classified
            under the 'Student' category.
          </Typography>
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

function BarChart({ chartConfig, title = "", description = "" }: any) {
  return (
    <Card placeholder={""} className="tw-rounded-xl">
      <CardHeader
        placeholder={""}
        floated={false}
        shadow={false}
        color="transparent"
        className="flex flex-col gap-4 rounded-none md:flex-row md:items-center"
      >
        <div className="tw-px-5 tw-pt-5 tw-pb-2">
          <Typography
            placeholder={""}
            variant="h6"
            color="blue-gray"
            className="tw-text-dark-sky-blue tw-text-xl"
          >
            {title}
          </Typography>
          <Typography
            placeholder={""}
            variant="small"
            color="gray"
            className="tw-text-gray-300 tw-font-normal"
          >
            {description}
          </Typography>
        </div>
      </CardHeader>
      <CardBody placeholder={""} className="mt-4 grid place-items-center px-2">
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

type Thesis = {
  _id: string;
  title: string;
  topic: string;
  area: string;
  description: string;
  prerequisites: string;
  group: string;
  professor: string; // Assuming this references a professor's ID
  required_files: string[]; // Array of strings for file paths or names
  thesis_files: string[]; // Array of strings for file paths or names
  status: "active" | "inactive"; // Assuming "status" is an enum with known values
  date: string; // ISO date string
  createdAt: string; // ISO date string for creation timestamp
  updatedAt: string; // ISO date string for update timestamp
};

type barChartThesesProps = {
  theses: Thesis[];
};

function getChartConfigForUsers({ users }: chartConfigForUsersProps) {
  if (!users || users.length === 0) {
    return {
      type: "pie",
      width: 450,
      height: 450,
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
        colors: ["#384959", "#ff8f00", "#00897b", "#88BDF2"],
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
      colors: ["#384959", "#ff8f00", "#00897b", "#88BDF2"],
      legend: {
        show: true,
      },
    },
  };
}

function getChartConfigForTheses({ theses }: barChartThesesProps) {
  if (!theses || theses.length === 0) {
    return {
      type: "bar",
      height: 300,
      series: [
        {
          name: "Theses",
          data: [0, 0],
        },
      ],
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
        colors: ["#384959"],
        plotOptions: {
          bar: {
            columnWidth: "40%",
            borderRadius: 2,
          },
        },
        xaxis: {
          axisTicks: {
            show: false,
          },
          axisBorder: {
            show: false,
          },
          labels: {
            style: {
              colors: "#616161",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 400,
            },
          },
          categories: ["BSc", "MSc"],
        },
        yaxis: {
          labels: {
            style: {
              colors: "#616161",
              fontSize: "12px",
              fontFamily: "inherit",
              fontWeight: 400,
            },
          },
        },
        grid: {
          show: true,
          borderColor: "#dddddd",
          strokeDashArray: 5,
          xaxis: {
            lines: {
              show: true,
            },
          },
          padding: {
            top: 5,
            right: 20,
          },
        },
        fill: {
          opacity: 0.8,
        },
        tooltip: {
          theme: "dark",
        },
      },
    };
  }

  let bachelorStudent = 0;
  let masterStudent = 0;

  theses.map((el) => {
    if (el.group === "BSc") bachelorStudent++;
    else if (el.group === "MSc") masterStudent++;
  });

  const chartConfig = {
    type: "bar",
    height: 300,
    series: [
      {
        name: "Theses",
        data: [bachelorStudent, masterStudent],
      },
    ],
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
      colors: ["#384959"],
      plotOptions: {
        bar: {
          columnWidth: "40%",
          borderRadius: 2,
        },
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        categories: ["BSc", "MSc"],
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    },
  };

  return chartConfig;
}

function getChartConfigForAreaTheses({ theses }: barChartThesesProps) {
  let areasWithTheses = new Map<string, number>();

  console.log(...areasWithTheses.keys());
  console.log("theses: ", theses)
  theses.map((el) => {
    if (areasWithTheses.has(el.area)) {
      areasWithTheses.set(el.area, areasWithTheses.get(el.area)! + 1);
    } else {
      areasWithTheses.set(el.area, 1);
    }
  });

  const chartConfig = {
    type: "bar",
    height: 300,
    series: [
      {
        name: "Theses",
        data: [...areasWithTheses.values()],
      },
    ],
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
      colors: ["#00897b"],
      plotOptions: {
        bar: {
          columnWidth: "10%",
          barHeight: "30%",
          borderRadius: 2,
          horizontal: true,
        },
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#384959",
            fontSize: "15px",
            fontFamily: "DM",
            fontWeight: 400,
          },
        },
        categories: [...areasWithTheses.keys()],
        min: 0,
        max: Math.max(...areasWithTheses.values()),
        tickAmount: Math.max(...areasWithTheses.values()), // Ensure no repeated values
      },
      yaxis: {
        labels: {
          style: {
            colors: "#616161",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
      },
      grid: {
        show: true,
        borderColor: "#dddddd",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 0.8,
      },
      tooltip: {
        theme: "dark",
      },
    },
  };

  return chartConfig;
}

export default function Statistics() {
  const [users, setUsers] = useState<User[]>([]);
  const [theses, setTheses] = useState<Thesis[]>([]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTheses, setTotalTheses] = useState<number>(0);
  const [totalThesesRequests, setTotalThesesRequests] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      const users = await getUsers();
      const theses = await getTheses();
      const thesesRequests = await getThesesRequests();

      setUsers(users);
      setTheses(theses);

      setTotalUsers(users.length || 0);
      setTotalTheses(theses.length || 0);
      setTotalThesesRequests(thesesRequests.length || 0);
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
              description="Number of registered Users in the database"
            />
          </div>
          <div className="col mt-2">
            <NumberCard
              number={totalTheses}
              title="Theses"
              description="Number of Theses in the database"
            />
          </div>
          <div className="col mt-2">
            <NumberCard
              number={totalThesesRequests}
              title="Theses Requests"
              description="Number of Theses Requests in the database"
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <BarChart
              chartConfig={getChartConfigForAreaTheses({ theses })}
              title={"Available Theses per Category"}
              description={
                "Only categories with ongoing theses associated with them are displayed."
              }
            />
          </div>
        </div>
        <div className="row">
          <div className="col">
            <PieChart chartConfig={getChartConfigForUsers({ users })} />
          </div>
          <div className="col">
            <BarChart
              chartConfig={getChartConfigForTheses({ theses })}
              title={"Available Theses"}
              description={
                "Based on whether users are pursuing a Bachelor's or Master's degree."
              }
            />
          </div>
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
