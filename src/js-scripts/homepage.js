"use strict";

window.addEventListener("load", () => {
  /* ------------------------- Collect DOM elements ------------------------- */

  // Collect any form
  const formEl = $(".form");

  // Collect online peers elements
  const onlinePeersTemplateEl = Handlebars.compile(
    $("#online-peers-template") // internal script
      .html()
  );
  const onlinePeersContentTemplateEl = Handlebars.compile(
    $("#online-peers-content-template") // internal script
      .html()
  );

  // Collect invitations elements
  const invitationsTemplateEl = Handlebars.compile(
    $("#invitations-template") // internal script
      .html()
  );
  const invitationsContentTemplateEl = Handlebars.compile(
    $("#invitations-content-template") // internal script
      .html()
  );

  // Collect online peers and invitations displayer
  const displayer = $("#displayer");

  // Collect private chat elements
  const videoChatTemplateEl = Handlebars.compile(
    $("#video-chat-template") // internal script
      .html()
  );
  const videoChooseTemplateEl = Handlebars.compile(
    $("#video-choose-template") // internal script
      .html()
  );
  const videoChatContentTemplateEl = Handlebars.compile(
    $("#video-chat-content-template") // internal script
      .html()
  );
  const videoChatEl = $("#video-chat");

  /* ---------------------------- Event handlers ---------------------------- */

  // Submit button handler
  $(".submit").on("click", event => {
    switch (event.target.id) {
      case "see-online-peers-btn":
        showOnlinePeers();
        break;
      case "see-invitations-btn":
        showInvitations();
        break;
      case "create-video-chat-btn":
        createVideoChat();
        break;
      case "join-video-chat-btn":
        joinVideoChat();
        break;
      case "generate-new-key-btn":
        generateNewKey();
        break;
      case "disconnect-btn":
        disconnect();
        break;
      default:
        alert();
        break;
    }
  });

  /* ------------------------------ Initialize ------------------------------ */

  // Establish WebRTC connection for private chat
  const webrtc = new SimpleWebRTC({
    // the id/element dom element that will hold local video
    localVideoEl: "local-video",
    // the id/element dom element that will hold remote videos
    remoteVideosEl: "remote-videos",
    // immediately ask for camera access
    autoRequestMedia: true,
    debug: false,
    detectSpeakingEvents: true,
    autoAdjustMic: false
  });

  // New local video handler (event emitted immediately after page loads)
  webrtc.on("localStream", () => {
    localImageEl.hide(); //
    localVideoEl.show();
  });

  // New remote video handler (event emitted when peer enters the chat room)
  webrtc.on("videoAdded", (video, peer) => {
    const id = webrtc.getDomId(peer);
    const html = remoteVideoTemplate({ id });
    if (remoteVideosCount === 0) {
      remoteVideosEl.html(html);
    } else {
      remoteVideosEl.append(html);
    }
    $(`#${id}`).html(video);
    $(`#${id} video`).addClass("ui image medium"); // Make video element responsive
    remoteVideosCount += 1;
  });

  // New message handler
  webrtc.connection.on("message", data => {
    if (data.type === "chat") {
      const message = data.payload;
      messages.push(message);
      updateChatMessages();
    }
  });

  /* ------------------------------ Functions ------------------------------ */

  const showOnlinePeers = () => {
    const html = onlinePeersTemplateEl(); //"<div>test</div>"; //onlinePeersContentTemplateEl(["a", "b"]);
    displayer.html(html);
    //const html = videoChooseTemplateEl();
    //onlinePeers.html(html);
  };

  const showInvitations = () => {
    const html = invitationsTemplateEl(); //"<div>test</div>"; //onlinePeersContentTemplateEl(["a", "b"]);
    displayer.html(html);
  };

  const createVideoChat = () => {
    window.location.href = `${window.location.href}video-chat`;
    //alert("create video chat");
  };

  const joinVideoChat = () => {
    alert("join video chat");
  };

  const generateNewKey = () => {
    alert("generate new key");
  };

  const disconnect = () => {
    alert("disconnect");
  };

  const createPrivateChatRoom = roomName => {
    // eslint-disable-next-line no-console
    console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      formEl.form("clear");
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
    });
  };

  // Post Local Message
  const postMessage = message => {
    const chatMessage = {
      username,
      message,
      postedOn: new Date().toLocaleString("en-GB")
    };
    // Send to all peers
    webrtc.sendToAll("chat", chatMessage);
    // Update messages locally
    messages.push(chatMessage);
    $("#post-message").val("");
    updateChatMessages();
  };

  // Update Chat Messages
  const updateChatMessages = () => {
    const html = chatContentTemplateEl({ messages });
    const chatContentEl = $("#chat-content");
    chatContentEl.html(html);
    // automatically scroll downwards
    const scrollHeight = chatContentEl.prop("scrollHeight");
    chatContentEl.animate({ scrollTop: scrollHeight }, "slow");
  };

  // Display Chat Interface
  const showChatRoom = room => {
    formEl.hide();
    const html = chatTemplateEl({ room });
    chatEl.html(html);
    const postForm = $("form");
    postForm.form({
      message: "empty"
    });
    $("#post-btn").on("click", () => {
      const message = $("#post-message").val();
      postMessage(message);
    });
    $("#post-message").on("keyup", event => {
      if (event.keyCode === 13) {
        const message = $("#post-message").val();
        postMessage(message);
      }
    });
  };

  // Join existing Chat Room
  const joinRoom = roomName => {
    // eslint-disable-next-line no-console
    console.log(`Joining Room: ${roomName}`);
    webrtc.joinRoom(roomName);
    showChatRoom(roomName);
    postMessage(`${username} joined chatroom`);
  };
});
