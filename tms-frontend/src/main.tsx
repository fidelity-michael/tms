import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// function importBuildTarget() {
//   const TARGET = import.meta.env.VITE_REACT_APP_BUILD_TARGET
//   switch (TARGET) {
//     case "wall":
//       // return import("./Wall.tsx");
//     case "all":
//       // return (import("./Table.tsx"), import("./Device.tsx"), import("./Wall.tsx"))
//     default:
//       return Promise.reject(
//         new Error("No such build target: " + TARGET)
//       );
//   }
// }

// // Import the entry point and render it's default export
// importBuildTarget().then(({ default: Environment }) =>
//   ReactDOM.createRoot(document.getElementById('root')!).render(
//       <Environment />
//   )
// );
