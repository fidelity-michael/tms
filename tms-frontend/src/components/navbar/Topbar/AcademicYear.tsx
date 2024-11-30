import React from "react";

const AcademicYear: React.FC = () => {
  // Get current date, year, and month
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0 = January, 11 = December

  // Determine Academic Year
  const academicYear =
    currentMonth <= 5 // June (5) and earlier
      ? `${currentYear - 1}-${currentYear}`
      : `${currentYear}-${currentYear + 1}`;

  // Determine Semester
  const semester = currentMonth <= 5 ? "Spring" : "Fall";

  return (
    <div className="tw-flex tw-flex-1 tw-items-center tw-text-dark-sky-blue tw-font-extrabold tw-text-md md:tw-text-xl xl:tw-text-2xl">
      <p>
        Academic Year: {academicYear} | Semester: {semester}
      </p>
    </div>
  );
};

export default AcademicYear;
