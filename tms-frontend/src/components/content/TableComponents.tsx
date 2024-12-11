import { Form } from "react-bootstrap";

type ActionButtonsProps = {
  updateFunction: () => void;
  deleteFunction: () => void;
  firstButtonName?: string;
  secondButtonName?: string;
  secondCustomColors?: string;
};

type PaginationProps = {
  setLimit: () => void;
  renderPageButtonsName: string;
  pagination: any;
  setPageState: React.Dispatch<React.SetStateAction<number>>;
};

export default function ActionButtons({
  updateFunction,
  deleteFunction,
  firstButtonName = "Update",
  secondButtonName = "Delete",
  secondCustomColors = "tw-text-white tw-bg-red-incorrect tw-border-dark-sky-blue hover:tw-opacity-95 hover:tw-text-dark-sky-blue hover:tw-border-dark-sky-blue",
}: ActionButtonsProps) {
  return (
    <div className="tw-flex tw-gap-1">
      <button
        onClick={updateFunction}
        className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
      >
        {firstButtonName}
      </button>
      <button
        onClick={deleteFunction}
        className={`tw-font-semibold tw-py-2 tw-px-4 tw-rounded ${secondCustomColors}`}
      >
        {secondButtonName}
      </button>
    </div>
  );
}

export function PaginationTab({
  setLimit,
  renderPageButtonsName,
  pagination,
  setPageState,
}: PaginationProps) {
  return (
    <div className="tw-flex tw-gap-6 tw-items-center tw-bg-light-pale-blue-white tw-py-2 tw-px-4 tw-rounded-md">
      <div>
        <Form.Group
          controlId="selectControl"
          className="tw-flex tw-justify-start tw-gap-2"
        >
          <Form.Label className="tw-flex tw-fill-1 tw-items-center tw-mb-0">
            {getPageName(renderPageButtonsName)} per page
          </Form.Label>
          <Form.Control className="tw-w-28" as="select" onChange={setLimit}>
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </Form.Control>
        </Form.Group>
      </div>
      {renderPageButtons(renderPageButtonsName, pagination, setPageState)}
    </div>
  );
}

function getPageName(name: string): string {
  switch (name) {
    case "user":
      return "Users";
    case "university":
      return "Universities";
    case "area":
      return "Categories";
    case "department":
      return "Departments";
    case "thesis":
      return "Theses";
    case "request":
      return "Requests";
    case "report":
      return "Reports";
  }
}

function renderPageButtons(name: string, pagination: any, setPageState) {
  return (
    <div
      className={`tw-flex tw-flex-1 ${pagination.total > 0 ? "tw-justify-between" : "tw-justify-end"}`}
    >
      <div className="tw-flex tw-justify-start tw-gap-2 tw-text-light-sky-blue">
        {pagination.startIndex > 0 && (
          <span
            className={"tw-cursor-pointer  hover:tw-text-dark-sky-blue"}
            onClick={() => {
              handlePrevPage(setPageState);
            }}
          >
            Previous Page
          </span>
        )}
        {pagination.endIndex < pagination.total && (
          <span
            className={"tw-cursor-pointer hover:tw-text-dark-sky-blue"}
            onClick={(e) => {
              handleNextPage(setPageState);
            }}
          >
            Next Page
          </span>
        )}
      </div>
      <span className="">
        Results{" "}
        {pagination.endIndex > pagination.total
          ? pagination.total
          : pagination.endIndex}{" "}
        out of {pagination.total}
      </span>
    </div>
  );
}

function handlePrevPage(setPageState: any) {
  setPageState((prev: any) => prev - 1);
}

function handleNextPage(setPageState: any) {
  setPageState((prev: any) => prev + 1);
}
