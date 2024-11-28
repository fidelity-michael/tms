import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";

interface Caption {
  name: string; // Header Name
  amount: string; // Header amount
}

interface UserData {
  role?: string[];
  first_name?: string;
  last_name?: string;
  active?: boolean;
}

interface smallTableProps {
  caption: Caption;
  headerTitles: String[];
  data: UserData[];
}

export default function SmallTable({
  caption,
  headerTitles,
  data,
}: smallTableProps) {
  
  console.log("Are data OK?: ", data)

  return (
    <div className="tw-relative tw-overflow-x-auto tw-shadow-md sm:tw-rounded-lg tw-px-6 tw-pt-4 tw-pb-6 tw-bg-white">
      <table className="tw-w-full tw-text-sm tw-text-dark-sky-blue">
        <caption className="tw-caption-top tw-text-xl tw-font-semibold tw-text-dark-sky-blue tw-bg-white">
          <div className="tw-flex tw-flex-1 tw-items-center tw-justify-between">
            <div className="tw-text-left">
              {caption.name} ({caption.amount})
            </div>
            <div className="tw-flex tw-items-center tw-cursor-pointer">
              <div className="tw-text-right tw-underline tw-text-mid-pale-blue tw-text-sm tw-items-center">
                Show All
              </div>
              <KeyboardArrowRight className="tw-text-mid-pale-blue" />
            </div>
          </div>
        </caption>
        <thead className="tw-text-xs tw-text-mid-pale-blue tw-capitalize tw-bg-light-pale-blue-white">
          <tr>
            {headerTitles.map((el, index) => (
              <th scope="col" key={index} className="tw-px-6 tw-py-3">
                {el}
              </th>
            ))}
          </tr>
        </thead>
        {
          <tbody>
            {data.map((e, index) => (
              <tr key={index} className="tw-bg-white tw-border-b tw-border-light-sky-blue">
                <th
                  scope="row"
                  className="tw-px-6 tw-py-4 tw-font-medium tw-text-gray-900 tw-whitespace-nowrap "
                >
                  {e.role}
                </th>
                <td className="tw-px-6 tw-py-4">{e.first_name}</td>
                <td className="tw-px-6 tw-py-4">{e.last_name}</td>
                <td className="tw-px-6 tw-py-4">{e.active}</td>
              </tr>
            ))}
          </tbody>
        }
      </table>
    </div>
  );
}
