type AlertProps = {
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>;
};

type pageTopContentTableProps = {
  newOption: boolean;
  name: string;
  toggleOption: React.Dispatch<React.SetStateAction<boolean>>;
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
