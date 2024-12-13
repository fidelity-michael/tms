import React, { useEffect, useState, useRef } from "react";
import "./chatStyle.css";
import io from "socket.io-client";
import axios from "axios";
import sound from "../../assets/sound.mp3";
import newMessage from "../../assets/newMessage.mp3";
import FilesContainer from "./FilesContainer";
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import Contacts from "./Contacts";

export default function Chat({ userId, role }) {
  //supervisors for students and students for
  const [myContacts, setMyContacts] = useState([]);

  const [currentContact, setCurrentContact] = useState("");
  const [currentChatId, setCurrentChatId] = useState("");

  const [loadingConversations, setLoadingConversations] = useState(true);

  const [contactsTitle, setContactsTitle] = useState("");

  const [conversations, setConversations] = useState([]);

  const [files, setFiles] = useState([]);

  const [fileContainerOpen, setFileContainerOpen] = useState(false);
  const popupRef = useRef(null);
  const togglePopup = () => {
    setFileContainerOpen((prev) => !prev);
  };

  const componentIsMounted = useRef(true);

  //for sockets
  const socketRef = useRef(null);
  const ENDPOINT = "http://localhost:8080/chat"; // /chat for namespace

  useEffect(() => {
    /* const handleClickOutside = (event) => {
      if (popupRef.current && !popupRef.current.contains(event.target)) {
        setFileContainerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }; */
  }, []);

  //we establish connection with endpoint
  useEffect(() => {
    if (socketRef.current == null) {
      //current will persist for the full lifetime of the component
      socketRef.current = io(ENDPOINT);
    }

    socketRef.current.on("connect", () => {
      console.log("Connected to chat!");
      socketRef.current.emit("chat:map", userId);
      socketRef.current.on("chat:message", (socket) => {
        console.log(socket.message);
      });
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disonnected from chat!");
    });

    //cleanup (disconnect from chat server)
    // return () => {
    //   if (socketRef.current) {
    //     socketRef.current.disconnect();
    //     socketRef.current.close();
    //     componentIsMounted.current = false;
    //   }
    // };
  }, [ENDPOINT, userId]);

  //setting title of contacts depending on our role
  useEffect(() => {
    //---for students-----
    //get data of supervisors (we pass supervisors id)
    const fetchSupervisors = async () => {
      const getSupervisorsData = async (id) => {
        //console.log('supervisor: ', id)
        await axios
          .get("/api/data/users/" + id)
          .then((res) => {
            //console.log(res.data)
            setMyContacts((prev) => [...prev, res.data]);
          })
          .catch(() => {
            console.log("Server internal Error.");
          });
      };

      //get my thesis_data
      const thesis_data = await axios.get("/api/data/my_thesis/" + userId);

      //get supervisors data
      if (
        thesis_data.data.supervisor &&
        Array.isArray(thesis_data.data.supervisor)
      ) {
        thesis_data.data.supervisor.map(async (id) => {
          await getSupervisorsData(id);
        });
      }

      fetchConversations();
    };

    //---professors---
    //get data of students we supervise
    const fetchStudents = async () => {
      var studentsIds = [""];

      const getStudentsIds = async () => {
        await axios
          .get("/api/assigned_theses/supervised/" + userId)
          .then((res) => {
            // console.log(res.data);
            studentsIds = res.data.map((elem) => {
              return elem.student;
            });
          })
          .catch(() => {
            console.log("fetchStudents error");
          });
      };

      const getStudentsObjects = async () => {
        studentsIds.map((studentId) => {
          axios
            .get("/api/data/users/" + studentId)
            .then((res) => {
              setMyContacts((prev) => [...prev, res.data]);
            })
            .catch(() => {
              console.log("errroor");
            });
        });
      };

      await getStudentsIds();
      await getStudentsObjects();
      fetchConversations();
    };

    if (role === "student") {
      setContactsTitle("My Supervisors");
      fetchSupervisors();
    } else if (role === "professor") {
      setContactsTitle("My Students");
      fetchStudents();
    } else {
      setContactsTitle("");
    }
  }, [role, userId]);

  //socket events and basic fetching
  useEffect(() => {
    // console.log("new current contact:", currentContact);

    //receiving message event
    socketRef.current.on("chat:privateMessage", (data) => {
      receiveMessage(data);
    });

    //display my message event
    socketRef.current.on("chat:myMessage", (data) => {
      if (currentContact._id === data.receiverId) {
        var date = new Date(data.date);
        displayMyMessage(data, date);
      }
    });

    //cleanup events
    // return () => {
    //   // console.log("clean");
    //   // socketRef.current.off("privateMessage");
    // };
  }, [currentContact]);

  //loadMessages of currentchat
  useEffect(() => {
    const renderMessages = async () => {
      loadingMessages();
      const chatId = currentChatId;
      try {
        //get messages
        var messages = await axios.get("/chat/message/" + chatId);

        resetConversation();

        //render messages
        messages.data.map((message) => {
          var date = new Date(message.date);
          if (message.sender === userId) {
            displayMyMessage(message, date);
          } else {
            displayIncomingMessage(message, date);
            checkRead(message);
          }
        });
        //scroll down
        var scrollBar = document.getElementById("conversation");
        scrollBar.scrollTop = scrollBar.scrollHeight;
      } catch {
        console.log("Server internal error occurred!");
      }
    };

    resetConversation();
    if (currentChatId !== "") {
      renderMessages();
    }
  }, [currentChatId]);

  useEffect(() => {
    console.log("ta files", files);
    //append file
    if (files.length > 0 && files[files.length - 1]) {
      appendFileStyle();
    }
  }, [files]);

  async function fetchConversations() {
    try {
      const res = await axios.get("/chat/privateConversation/" + userId);
      if (res.data.length > 0) {
        // console.log("OOK", res.data);
        // console.log("Conversations SETing");

        setConversations(res.data);
        // console.log("Conversations SET");
        setTimeout(function () {
          setLoadingConversations(false);
        }, 800); //lathos alla exw kollhsei kai douleuei
        //setLoadingConversations(false);
      } else {
        setLoadingConversations(false);
      }
    } catch {
      console.log("err");
    }
  }

  //reset previous currentContact style
  function resetStyle(contactId) {
    if (document.getElementById("contact" + contactId))
      if (
        document.getElementById("contact" + contactId).attributeStyleMap !==
        undefined
      ) {
        document
          .getElementById("contact" + contactId)
          .attributeStyleMap.clear();
      } else {
        // For browsers that do not support gradients
        document.getElementById("contact" + contactId).style.backgroundColor =
          "rgb(242, 249, 250)";

        //gradient
        document.getElementById("contact" + contactId).style.backgroundImage =
          "";
        document.getElementById("contact" + contactId).style.color =
          "rgb(100, 98, 98)";
      }
  }

  //switch to new current contact
  function switchContact(contact, chatId) {
    if (currentContact._id !== contact._id) {
      resetStyle(currentContact._id);
      setCurrentChatId(chatId);
      setCurrentContact(contact);
    }
  }

  async function toggleMyMessageInfo(messageInfo, messageId, readIcon) {
    try {
      console.log(messageId);
      const messageData = await axios.get("/chat/message/data/" + messageId);
      const read = messageData.data[0].read;

      if (read.length > 0) {
        readIcon.style.backgroundColor = "green";
        readIcon.style.color = "white";
      }

      if (messageInfo.style.display === "block") {
        messageInfo.style.display = "none";
      } else if (messageInfo.style.display === "none") {
        messageInfo.style.display = "block";
      }
    } catch (err) {
      console.log("Server internal error occurred!");
    }
  }

  function toggleIncomingMessageInfo(messageInfo) {
    if (messageInfo.style.display === "block") {
      messageInfo.style.display = "none";
    } else if (messageInfo.style.display === "none") {
      messageInfo.style.display = "block";
    }
  }

  //post message in db, display my message, and emit event
  async function postMessage(chatId, text) {
    //we make the message object
    const newMessage = {
      sender: userId,
      chatId: chatId,
      text: text,
    };

    await axios
      .post("/chat/message", newMessage)
      .then(async (res) => {
        var messageData = res.data;
        messageData.text = text;

        var fileNames = [];

        if (files.length > 0) {
          fileNames = await uploadFiles(messageData._id);
          messageData.files = fileNames;
        }

        console.log("Message sent succesfuly: ", messageData);
        var date = new Date(messageData.date);

        displayMyMessage(messageData, date);
        updateLastMessage(chatId, messageData);

        //emit new message event
        socketRef.current.emit("chat:privateMessage", {
          _id: messageData._id,
          receiverId: currentContact._id,
          senderId: messageData.sender,
          chatId: messageData.chatId,
          text: messageData.text,
          files: fileNames,
          date: messageData.date,
          read: messageData.read,
        });
      })
      .catch((err) => {
        console.log("Message failed to send!");
      });
  }

  //update lastmessage property of current chat
  async function updateLastMessage(chatId, message) {
    await axios
      .patch("/chat/privateConversation/updateLastMessage/" + chatId, {
        lastMessage: message,
      })
      .then(() => {
        console.log("Chat updated succesfuly");
      })
      .catch((err) => {
        console.log("Failed to update chat!");
      });
  }

  function sendMessage() {
    const message = document.getElementById("messageInput").value;

    //valid message and receiver
    if (currentContact !== "" && (message.length > 0 || files.length > 0)) {
      //if there is not already a conversation with current contact we add a new contact and then post the message
      if (currentChatId === "") {
        (async () => {
          var chatId = await postNewConversation(currentContact._id);

          await postMessage(chatId, message);
          switchContact(currentContact, chatId);
          contactSelectStyleNew(currentContact._id);
        })();
      } else {
        //we just post the message

        postMessage(currentChatId, message);
        document
          .getElementById("myContacts")
          .prepend(document.getElementById("contact" + currentChatId));
      }

      resetFiles();
    } else {
      //no receiver or message
      console.log("NO message");
    }
  }

  function receiveMessage(message) {
    //just display the message
    if (
      currentContact._id === message.senderId &&
      document.getElementById("icon" + message.chatId)
    ) {
      var date = new Date(message.date);
      console.log("giaaa dateee, ", message);
      displayIncomingMessage(message, date);
      checkRead(message);
      //scroll down
      var scrollBar = document.getElementById("conversation");
      scrollBar.scrollTop = scrollBar.scrollHeight;

      let audio = new Audio(sound);
      audio.play();

      //notify
    } else if (
      currentContact._id !== message.senderId &&
      document.getElementById("icon" + message.chatId)
    ) {
      document
        .getElementById("myContacts")
        .prepend(document.getElementById("contact" + message.chatId));

      notify(message.chatId);

      let audio = new Audio(newMessage);
      audio.play();
    } else {
      //fetch conversations again
      fetchConversations();

      if (currentContact._id === message.senderId) setCurrentContact("");

      let audio = new Audio(newMessage);
      audio.play();
    }
  }

  function hideNotifyIcon(chatId) {
    if (chatId !== "" && document.getElementById("icon" + chatId)) {
      console.log("AAAAAAAAAAAAAAAAAAAA icon", chatId);
      console.log("elemmm", document.getElementById("icon" + chatId));
      document.getElementById("icon" + chatId).style = "display: none";
    }
  }

  function contactSelectStyle(contactId) {
    if (
      currentContact._id !== contactId &&
      document.getElementById("contact" + contactId)
    ) {
      // For browsers that do not support gradients
      document.getElementById("contact" + contactId).style.backgroundColor =
        "rgb(50, 87, 211)";

      //gradient
      document.getElementById("contact" + contactId).style.backgroundImage =
        "linear-gradient(rgb(50, 87, 211), rgb(147, 195, 206))";
      document.getElementById("contact" + contactId).style.color = "white";
    }
  }

  function contactSelectStyleNew(contactId) {
    if (document.getElementById("contact" + contactId)) {
      // For browsers that do not support gradients
      document.getElementById("contact" + contactId).style.backgroundColor =
        "rgb(50, 87, 211)";

      //gradient
      document.getElementById("contact" + contactId).style.backgroundImage =
        "linear-gradient(rgb(50, 87, 211), rgb(147, 195, 206))";
      document.getElementById("contact" + contactId).style.color = "white";
    }
  }

  //show notify icon in a contact
  function notify(chatId) {
    document.getElementById("icon" + chatId).style = "display: block";
  }

  function displayMyMessage(message, date) {
    const myMessageWrapper = document.createElement("div");
    const myMessage = document.createElement("div");
    const infoWrapper = document.createElement("div");
    const timestamp = document.createElement("small");
    const read = document.createElement("i");

    //my message wrapper div
    myMessageWrapper.className = "myMessageWrapper";

    //my message div
    myMessage.className = "myMessage";
    myMessage.textContent = message.text;
    myMessage.setAttribute("type", "button");
    myMessage.onclick = function () {
      toggleMyMessageInfo(infoWrapper, message._id, read);
    };

    //my message info div
    infoWrapper.className = "messageInfo";
    infoWrapper.style.display = "none";

    //date and time of message
    timestamp.className = "myTimestamp";

    //read icon
    read.className = "far fa-check-circle";

    //calculate time and date
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var minutes = date.getMinutes();
    var hours = date.getHours();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    timestamp.innerHTML =
      hours + ":" + minutes + "  " + "  " + day + "/" + month + "/" + year;

    //-----append------
    //for text
    if (message.text !== "") {
      myMessageWrapper.append(myMessage);
      infoWrapper.append(timestamp);
      infoWrapper.append(read);
      document.getElementById("conversation").append(myMessageWrapper);
      document.getElementById("conversation").append(infoWrapper);
    }

    //for files
    if (message.files.length > 0) {
      console.log("eeeexw", message.files);

      message.files.forEach((file) => {
        const messageFilesDiv = document.createElement("div");
        messageFilesDiv.className = "messageFilesDiv";

        const wrapper = document.createElement("div");
        wrapper.className = "myMessageFilesWrapper";
        wrapper.onclick = function () {
          downloadFile(file);
        };

        const p = document.createElement("p");
        p.className = "fileName";
        p.innerHTML = file;
        p.setAttribute("type", "button");

        const fileIcon = document.createElement("i");
        fileIcon.className = "far fa-file-alt";
        fileIcon.id = "fileIcon";
        fileIcon.setAttribute("type", "button");

        wrapper.append(fileIcon);
        wrapper.append(p);
        messageFilesDiv.append(wrapper);

        document.getElementById("conversation").append(messageFilesDiv);
      });
    }

    //reset input
    document.getElementById("messageInput").value = "";

    //scroll down
    var scrollBar = document.getElementById("conversation");
    scrollBar.scrollTop = scrollBar.scrollHeight;
  }

  function displayIncomingMessage(message, date) {
    const incomingMessageWrapper = document.createElement("div");
    const incomingMessage = document.createElement("div");
    const infoWrapper = document.createElement("div");
    const timestamp = document.createElement("small");

    //incoming message wrapper div
    incomingMessageWrapper.className = "incomingMessageWrapper";

    //incoming message div
    incomingMessage.className = " incomingMessage";
    incomingMessage.textContent = message.text;

    incomingMessage.setAttribute("type", "button");
    incomingMessage.onclick = function () {
      toggleIncomingMessageInfo(infoWrapper);
    };

    //my message info div
    infoWrapper.className = "messageInfoIncoming";
    infoWrapper.style.display = "none";

    //date and time of message
    timestamp.className = "incomingTimestamp";

    //calculate time and date
    var month = date.getMonth() + 1;
    var day = date.getDate();
    var year = date.getFullYear();
    var minutes = date.getMinutes();
    var hours = date.getHours();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;

    timestamp.innerHTML =
      hours + ":" + minutes + "  " + "  " + day + "/" + month + "/" + year;

    //-----append------
    //for text
    if (message.text !== "") {
      infoWrapper.append(timestamp);
      incomingMessageWrapper.append(incomingMessage);
      document.getElementById("conversation").append(incomingMessageWrapper);
      document.getElementById("conversation").append(infoWrapper);
    }

    //for files
    if (message.files.length > 0) {
      message.files.forEach((file) => {
        const messageFilesDiv = document.createElement("div");
        messageFilesDiv.className = "messageFilesDiv";

        const wrapper = document.createElement("div");
        wrapper.className = "incomingFilesWrapper";
        wrapper.onclick = function () {
          downloadFile(file);
        };

        const p = document.createElement("p");
        p.className = "fileName";
        p.innerHTML = file;
        p.setAttribute("type", "button");

        const fileIcon = document.createElement("i");
        fileIcon.className = "far fa-file-alt";
        fileIcon.id = "fileIcon";
        fileIcon.setAttribute("type", "button");

        wrapper.append(fileIcon);
        wrapper.append(p);
        messageFilesDiv.append(wrapper);

        document.getElementById("conversation").append(messageFilesDiv);
      });
    }
  }

  //reset conversations style (clear divs)
  function resetConversation() {
    var conversation = document.getElementById("conversation");
    while (
      conversation.firstChild &&
      conversation.removeChild(conversation.firstChild)
    );
  }

  function loadingMessages() {
    var conversation = document.getElementById("conversation");
    var loader = document.createElement("div");
    loader.className = "loader";
    conversation.append(loader);
  }

  //set as read from user if not already read
  async function checkRead(message) {
    const index = message.read.indexOf(userId);

    if (index < 0) {
      //if user not in read array

      try {
        console.log(message, " and ", userId);
        const read = await axios.patch("/chat/message/read/" + message._id, {
          userId: userId,
        });
        const readInChat = await axios.patch(
          "/chat/privateConversation/readLastMessage/" + currentChatId,
          {
            userId: userId,
          },
        );
        console.log("Message set as read succesfuly!");
      } catch {
        console.log("Server Internal error!");
      }
    }
  }

  //we check if the last message is read (for notify icon)
  function checkLastMessageRead(message) {
    if (message) {
      if (message.sender !== userId) {
        //we are the receiver
        var read;
        console.log("periexei?? ", userId, "   ", message.read);
        message.read.includes(userId) ? (read = true) : (read = false);
        console.log(read);
        return read;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  async function postNewConversation(id) {
    try {
      const newConversation = {
        user1: userId,
        user2: id,
      };

      const newConvo = await axios.post(
        "/chat/privateConversation",
        newConversation,
      );

      fetchConversations();
      setCurrentChatId(newConvo.data._id);
      return newConvo.data._id;
    } catch {
      console.log("Server internal error occurred!");
      return null;
    }
  }

  function loading() {
    return (
      <p
        className="animated headShake infinite"
        style={{ marginBottom: "-0.1rem" }}
      >
        Loading Contacts..
      </p>
    );
  }

  function addFile(newFile) {
    //if we cancel selecting the file on the pop up window, the filevalue will be undefined
    if (newFile !== undefined) {
      setFiles((prevState) => [...prevState, newFile]);
      document.getElementById("fileUpload").value = ""; //reset value
    }
  }

  //we manipulate the style in order to fit the files
  function appendFileStyle() {
    document.getElementById("filesOl").style.display = "inline-block";

    document.getElementById("filesContainer").style.width = "20vw";
    document.getElementById("filesContainer").style.height = "10vh";

    document.getElementById("messageInput").style.width = "2vw";

    document.getElementById("iconsDiv").style.marginLeft = "2vw";
  }

  //setState for files
  function removeFile(file, index) {
    //element.style.display = "none"

    const arr = files.filter((_, i) => i !== index);

    if (files.length > 1) {
      setFiles(arr);
    } else if (files.length === 1) {
      setFiles([]);
    }
  }

  async function uploadFiles(messageId) {
    // console.log("File Upload: ", reportFiles);
    let formData = new FormData();
    for (let index = 0; index < files.length; index++) {
      formData.append("files", files[index]);
    }

    console.log("uploaaaaaad: ", formData);
    var fileNames = [];

    const uploadData = async () => {
      await axios
        .post("/api/uploads/chat", formData)
        .then((res) => {
          console.log("Saved: ", res.data);
          uploadFileNamestoDB(messageId, res.data.files_list); //update message to db
          //resetFiles()

          fileNames = res.data.files_list; //the filenames
        })
        .catch((err) => {
          console.log("Something went wrong: ", err);
        });
    };

    await uploadData(); //storing the file in the public folder
    return fileNames;
  }

  function uploadFileNamestoDB(messageId, fileNames) {
    const upload = async () => {
      await axios
        .patch("/chat/message/addFiles/" + messageId, {
          fileNames: fileNames,
        })
        .then((res) => {
          console.log("Succesful upload: ", res.data);
        })
        .catch((err) => {
          console.log("Something went wrong: ", err);
        });
    };

    upload();
  }

  //reset files array and ui of message input
  function resetFiles() {
    setFiles([]);

    document.getElementById("filesContainer").style.width = "0";
    document.getElementById("filesContainer").style.height = "0";

    document.getElementById("messageInput").style.width = "49vw";

    document.getElementById("iconsDiv").style.marginLeft = "3vw";

    document.getElementById("fileUpload").value = "";
  }

  function downloadFile(file) {
    const saveData = (function () {
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      return function (data, fileName) {
        const url = window.URL.createObjectURL(new Blob([data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
      };
    })();

    const fetchData = async () => {
      console.log("File to download: ", file);
      await axios
        .get("/api/downloads/chat/" + file, { responseType: "blob" })
        .then((res) => {
          // console.log("Response: ", res.data);
          // Redirect to file (open file in browser) : window.location.assign(res.data);
          saveData(res.data, file);
        })
        .then((blob) => {
          console.log("File downloaded successfully!");
        })
        .catch((err) => {
          console.log(err);
          console.log("File failed to download!");
        });
    };

    fetchData();
  }

  return (
    <div className="tw-flex tw-flex-col xl:tw-flex-row">
      {/**contacts */}
      <div className=" tw-bg-light-pale-blue-white tw-p-3">
        <div className="tw-pb-3 tw-bg-light-pale-blue-white">
          <h5 className="tw-text-dark-sky-blue">{contactsTitle}</h5>
        </div>

        <div className="tw-w-full tw-max-w-sm ">
          <ul className="" id="myContacts">
            {loadingConversations ? (
              loading()
            ) : (
              <Contacts
                myContacts={myContacts}
                conversations={conversations}
                hideNotifyIcon={hideNotifyIcon}
                contactSelectStyle={contactSelectStyle}
                switchContact={switchContact}
                checkLastMessageRead={checkLastMessageRead}
              />
            )}
          </ul>
        </div>
      </div>

      {/**chat */}
      <div className="chatContainer z-depth-3">
        <div className="tw-px-4 tw-py-2">
          {currentContact !== "" ? (
            <h5>
              {currentContact.first_name + " " + currentContact.last_name}
            </h5>
          ) : (
            <span className="tw-font-medium tw-text-dark-sky-blue">
              Choose someone to chat with...
            </span>
          )}
        </div>

        <div className="conversation" id="conversation"></div>

        <div className="tw-flex tw-items-center tw-gap-3 tw-bg-light-pale-blue-white tw-p-3 tw-mb-0 tw-border tw-border-light-pale-blue-white">
          <textarea
            name="input"
            id="messageInput"
            className="tw-flex tw-flex-1 tw-min-h-24 tw-rounded-xl tw-resize-none tw-outline-none tw-border-none focus:tw-border-none focus:tw-outline-none"
            placeholder="Type your message"
          ></textarea>

          <div className="tw-flex tw-items-center" id="iconsDiv">
            <div className="tw-flex tw-flex-row tw-items-center tw-text-center tw-w-full tw-min-w-24">
              <div className="tw-relative tw-inline-block">
                {/* Icon */}
                <button
                  onClick={togglePopup}
                  className="tw-text-mid-pale-blue tw-p-2 hover:tw-text-gray-800 focus:tw-outline-none"
                  aria-label="Open popup"
                >
                  <AttachFileIcon style={{height: "2rem", width: "2rem"}}/>
                </button>

                {/* Popup */}
                {fileContainerOpen && (
                  <div
                    ref={popupRef}
                    className="tw-w-64 tw-h-52 tw-absolute tw-z-10 tw-p-4 tw-mt-2 tw-bottom-12 tw-right-36 tw-text-sm tw-bg-white tw-border tw-border-gray-200 tw-rounded-md tw-shadow-lg  tw-transform tw-translate-x-1/2"
                  >
                    <ol className="tw-w-full">
                      <FilesContainer files={files} removeFile={removeFile} />
                    </ol>
                  </div>
                )}
              </div>

              {/* <label
                htmlFor="fileUpload"
                className="hover:tw-text-dark-sky-blue"
              >
                <i
                  className="fas fa-paperclip hover:tw-text-dark-sky-blue"
                  onClick={() => {}}
                ></i>
              </label>

              <div
                className="tw-absolute tw-bottom-40 tw-right-36"
                id="filesContainer"
              >
                <ol id="filesOl" className="">
                  <FilesContainer files={files} removeFile={removeFile} />
                </ol>
              </div> */}

              <input
                className="hover:tw-text-dark-sky-blue tw-align-middle tw-text-center"
                id="fileUpload"
                type="file"
                onChange={(e) => {
                  addFile(e.target.files[0]);
                }}
              />

              <div
                className="tw-text-mid-pale-blue hover:tw-text-dark-sky-blue hover:tw-cursor-pointer"
                onClick={() => {
                  sendMessage();
                }}
              >
                <SendIcon style={{height: "2rem", width: "2rem"}}/>
              </div>
            </div>
            {/* <AttachFileIcon
className=""
onChange={(e) => {
addFile(e.target.files[0]);
}}
/> */}
          </div>
        </div>
      </div>
    </div>
  );
}
