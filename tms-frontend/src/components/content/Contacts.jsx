export default function Contacts({
  myContacts,
  conversations,
  hideNotifyIcon,
  contactSelectStyle,
  switchContact,
  checkLastMessageRead,
}) {
  function renderContacts() {
    console.log("Rendering CONTACTS", conversations);

    console.log(myContacts.length);
    if (myContacts.length > 0) {
      var contactsIds = myContacts.map((contact) => {
        return contact._id;
      });
      console.log("contactsIds", contactsIds, myContacts);

      conversations.forEach((conversation, index) => {
        if (
          !contactsIds.includes(conversation.user1) &&
          !contactsIds.includes(conversation.user2)
        )
          conversations.splice(index, 1); //we remove this conversation because we dont have such contact now
      });

      //we sort our conversations by date
      var mostRecent = null;
      var sorted = [];
      if (conversations.length > 0) {
        conversations.map((conversation) => {
          if (conversation.lastMessage) {
            var lastMessageDate = new Date(conversation.lastMessage.date);

            if (mostRecent === null) {
              sorted.push(conversation);
              mostRecent = lastMessageDate;
            } else {
              if (lastMessageDate.getTime() > mostRecent.getTime()) {
                sorted.unshift(conversation);
                mostRecent = lastMessageDate;
              } else {
                sorted.push(conversation);
              }
            }
          } else {
            sorted.unshift(conversation);
          }
        });
      }

      //console.log('Sorted:', sorted)

      //we get all the contacts we have a conversation with
      var chatted = [];
      sorted.forEach((conversation, index) => {
        var user = myContacts.find(
          (user) =>
            user._id === conversation.user1 || user._id === conversation.user2,
        );
        //console.log(user!==undefined)

        if (user) {
          user.chatId = conversation._id;
          user.lastMessage = conversation.lastMessage;
          chatted.push(user);
        }
      });

      //and all the contacts we haven't already got a conversation with
      var notChatted = [];
      if (sorted.length > 0) {
        myContacts.forEach((user) => {
          var index = sorted.findIndex(
            (conversation) =>
              user._id === conversation.user1 ||
              user._id === conversation.user2,
          );

          if (index < 0) notChatted.push(user);
        });
      } else {
        notChatted = myContacts;
      }

      //console.log('chatted: ', chatted)
      //console.log('notChatted: ', notChatted)

      var contacts = chatted.concat(notChatted);
      //console.log('all:', contacts)

      //render
      //console.log('sorteeeeeed:', sorted)
      return contacts.map((contact, index) => {
        if (index < sorted.length) {
          //sorted

          //console.log(index)

          return (
            <div key={contact.chatId} id={"contact" + contact.chatId}>
              <li
                className="contact list-group-item"
                type="button"
                style={{ backgroundColor: "" }}
                id={"contact" + contact._id}
                onClick={() => {
                  hideNotifyIcon(contact.chatId);
                  contactSelectStyle(contact._id);
                  switchContact(contact, contact.chatId);
                }}
              >
                <i
                  className="fas fa-circle"
                  id={"icon" + contact.chatId}
                  style={{
                    display: checkLastMessageRead(contact.lastMessage)
                      ? "none"
                      : "block",
                  }}
                ></i>

                {contact.first_name + " " + contact.last_name}
              </li>
            </div>
          );
        } else {
          //notChatted (ctually user objects)
          //console.log(index)

          return (
            <div key={contact._id + index}>
              <li
                className="contact list-group-item"
                type="button"
                style={{ backgroundColor: "" }}
                id={"contact" + contact._id}
                onClick={() => {
                  contactSelectStyle(contact._id);
                  switchContact(contact, "");
                }}
              >
                {contact.first_name + " " + contact.last_name}
              </li>
            </div>
          );
        }
      });
    } else {
      return <div>No Contacts</div>;
    }
  }

  return <div>{renderContacts()}</div>;
}
