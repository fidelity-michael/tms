import { ReactNode } from "react";
import { Form } from "react-bootstrap";

type ActionButtonsProps = {
  updateFunction: () => void;
  deleteFunction: () => void;
};

type PaginationProps = {
  setLimit: () => void;
  renderPageButtonsName: string;
  pagination: any;
  setPageState: React.Dispatch<React.SetStateAction<never[]>>
};

export default function ActionButtons({
  updateFunction,
  deleteFunction,
}: ActionButtonsProps) {
  return (
    <div className="tw-flex tw-gap-1">
      <button
        onClick={updateFunction}
        className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
      >
        Update
      </button>
      <button
        onClick={deleteFunction}
        className="tw-font-semibold tw-text-white tw-bg-red-incorrect tw-py-2 tw-px-4 tw-border-dark-sky-blue hover:tw-opacity-95 hover:tw-text-dark-sky-blue hover:tw-border-dark-sky-blue tw-rounded"
      >
        Delete
      </button>
    </div>
  );
}

export function PaginationTab({
  setLimit,
  renderPageButtonsName,
  pagination,
  setPageState
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
  }
}

function renderPageButtons(name: string, pagination: any, setPageState) {
  const prev = "prev_" + name;
  const next = "next_" + name;

  return (
    <div
      className={`tw-flex tw-flex-1 ${pagination.startIndex < 0 ? "tw-justify-between" : "tw-justify-end"}`}
    >
      {pagination.startIndex > 0 && (
        <span
          className={prev}
          onClick={(e) => {
            handlePrevPage(setPageState);
          }}
        >
          Previous Page
        </span>
      )}
      {pagination.endIndex < pagination.total && (
        <span
          className={next}
          onClick={(e) => {
            handleNextPage(setPageState);
          }}
        >
          Next Page
        </span>
      )}
      <span className="tw-float-right">
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
