import SearchIcon from "@mui/icons-material/Search";

type AlertProps = {
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

type pageTopContentTableProps = {
  newOption: boolean;
  name: string;
  toggleOption: React.Dispatch<React.SetStateAction<boolean>>;
};

type searchFunctionProps = {
  query: string;
  setQuery: () => void;
  placeholder: string;
};

export function showShortAlert({ setShowAlert }: AlertProps) {
  setShowAlert(true);
  setTimeout(() => setShowAlert(false), 3000);
}

export default function PageTopContentTable({
  newOption,
  name,
  toggleOption,
}: pageTopContentTableProps) {
  return (
    <div className="tw-flex tw-gap-1 tw-justify-between tw-items-center tw-mb-4">
      <h5 className="tw-text-dark-sky-blue tw-text-xl">
        {newOption ? `New ${name}` : `${name} Table`}
      </h5>
      <hr />
      <div className="tw-flex tw-gap-1">
        <button
          onClick={() => toggleOption(false)}
          className="tw-bg-transparent hover:tw-bg-dark-sky-blue tw-text-dark-sky-blue tw-font-semibold hover:tw-text-white tw-py-2 tw-px-4 tw-border tw-border-dark-sky-blue hover:tw-border-transparent tw-rounded"
        >
          Show {name}
        </button>
        <button
          onClick={() => toggleOption(true)}
          className="tw-font-semibold tw-text-white tw-bg-dark-sky-blue tw-py-2 tw-px-4 tw-border-dark-sky-blue hover:tw-bg-mid-pale-blue  hover:tw-border-dark-sky-blue tw-rounded"
        >
          New {name}
        </button>
      </div>
    </div>
  );
}

export function SearchFunction({
  query,
  setQuery,
  placeholder,
}: searchFunctionProps) {
  return (
    <div className="tw-flex filter-content tw-justify-start">
      {/* Search Functionality */}
      <div className="tw-relative tw-mt-1 tw-text-gray-300 tw-mb-6">
        <div className="tw-absolute tw-inset-y-0 tw-start-0 tw-flex tw-items-center tw-ps-3 tw-pointer-events-none">
          <SearchIcon />
        </div>
        <input
          type="text"
          id="table-search"
          className="tw-flex tw-flex-1 tw-items-center tw-py-2 tw-ps-10 tw-text-sm tw-text-dark-sky-blue tw-border tw-border-light-blue tw-rounded-lg tw-w-80 tw-bg-light-pale-blue-white focus:tw-outline-none focus:tw-ring-mid-pale-blue focus:tw-border-mid-pale-blue"
          placeholder={placeholder}
          value={query}
          onChange={setQuery}
        />
      </div>
    </div>
  );
}
