import React from 'react';
import './chatStyle.css';

export default function FilesContainer({files, removeFile}) {
    if(files.length>0){
        return files.map((file, index) => {
            return(
                <li key={file.name+index} id="filesList">
                    <div className = "newFileDiv">
                        <i  className = "far fa-file-alt" id="fileIcon" type="button">
                        </i>
                        <p className = "fileName">{file.name}</p>
                        <i className = 'fa fa-trash-alt' type="button"
                            onClick={(file)=> {
                                removeFile(file, index)
                            }}
                        ></i>
                    </div>
                </li>
            )
        })
    } else {
        return(<div></div>)
    }
}