import React from "react";
import "./chatStyle.css";
import ArticleIcon from "@mui/icons-material/Article";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";

export default function FilesContainer({ files, removeFile }) {
  if (files.length > 0) {
    return files.map((file, index) => {
      return (
        <li key={file.name + index} id="filesList" className="tw-gap-4">
          <div className="tw-flex tw-justify-between tw-items-center tw-text-mid-pale-blue">
            <div
              style={{ scrollbarGutter: "stable" }}
              className="tw-scroll-pt-6 tw-flex tw-gap-2 tw-items-center hover:tw-overflow-x-auto tw-overflow-hidden"
            >
              <ArticleIcon />
              <p className="tw-text-sm tw-text-dark-sky-blue">{file.name}</p>
            </div>
            <button
              className="tw-text-red-incorrect hover:tw-opacity-85"
              onClick={(file) => {
                removeFile(file, index);
              }}
            >
              <DeleteForeverIcon />
            </button>
          </div>
        </li>
      );
    });
  } else {
    return <div></div>;
  }
}
