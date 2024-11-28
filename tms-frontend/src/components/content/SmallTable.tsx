import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface Caption {
  name: string; // Header Name
  amount: string; // Header amount
}

interface smallTableProps {
  caption: Caption;
  headerTitles: String[];
}

export default function SmallTable({ caption, headerTitles }: smallTableProps) {
  return (
    <div className="tw-relative tw-overflow-x-auto tw-shadow-md sm:tw-rounded-lg tw-px-6 tw-pt-4 tw-pb-6 tw-bg-white">
      <table className="tw-w-full tw-text-sm tw-text-dark-sky-blue">
        <caption className="tw-caption-top tw-text-xl tw-font-semibold tw-text-dark-sky-blue tw-bg-white">
          <div className="tw-flex tw-flex-1 tw-items-center tw-justify-between">
            <div className="tw-text-left">
              {caption.name} ({caption.amount})
            </div>
            <div className="tw-flex tw-items-center tw-cursor-pointer">
              <div className="tw-text-right tw-underline tw-text-mid-pale-blue tw-text-sm tw-items-center">Show All</div>
              <KeyboardArrowRight className="tw-text-mid-pale-blue"/>
            </div>
          </div>
        </caption>
        <thead className="tw-text-xs tw-text-mid-pale-blue tw-uppercase tw-bg-light-pale-blue-white">
          <tr>
            {headerTitles.map((el) => (
              <th scope="col" className="tw-px-6 tw-py-3">
                {el}
              </th>
            ))}
          </tr>
        </thead>
        {
          <tbody>
            <tr className="tw-bg-white tw-border-b tw-border-light-sky-blue">
              <th
                scope="row"
                className="tw-px-6 tw-py-4 tw-font-medium tw-text-gray-900 tw-whitespace-nowrap "
              >
                Apple MacBook Pro 17"
              </th>
              <td className="tw-px-6 tw-py-4">Silver</td>
              <td className="tw-px-6 tw-py-4">Laptop</td>
              <td className="tw-px-6 tw-py-4">$2999</td>
            </tr>
            <tr className="tw-bg-white tw-border-b">
              <th
                scope="row"
                className="tw-px-6 tw-py-4 tw-font-medium tw-text-gray-900 tw-whitespace-nowrap"
              >
                Microsoft Surface Pro
              </th>
              <td className="tw-px-6 tw-py-4">White</td>
              <td className="tw-px-6 tw-py-4">Laptop PC</td>
              <td className="tw-px-6 tw-py-4">$1999</td>
            </tr>
            <tr className="tw-bg-white tw-border-b">
              <th
                scope="row"
                className="tw-px-6 tw-py-4 tw-font-medium tw-text-gray-900 tw-whitespace-nowrap"
              >
                Magic Mouse 2
              </th>
              <td className="tw-px-6 tw-py-4">Black</td>
              <td className="tw-px-6 tw-py-4">Accessories</td>
              <td className="tw-px-6 tw-py-4">$99</td>
            </tr>
          </tbody>
        }
      </table>
    </div>
  );
}
