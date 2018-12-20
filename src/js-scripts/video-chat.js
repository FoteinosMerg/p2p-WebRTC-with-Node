"use strict";

window.addEventListener("load", () => {
  /* ------------------------- Collect DOM elements ------------------------- */

  // Chat platform
  const chatTemplateEl = Handlebars.compile(
    $("#chat-template") // internal script
      .html()
  );
  const chatContentTemplateEl = Handlebars.compile(
    $("#chat-content-template") // internal script
      .html()
  );
  const chatEl = $("#chat");
  const formEl = $(".form");
  const messages = [];
  let username;

  // Local Video
  const localImageEl = $("#local-image"); // Appears in place of cameras before streaming starts
  const localVideoEl = $("#local-video");

  // Remote Videos
  const remoteVideoTemplate = Handlebars.compile(
    $("#remote-video-template") // internal script
      .html()
  );
  const remoteVideosEl = $("#remote-videos");

  /* ------------------------------ Initialize ------------------------------ */

  // Hide cameras until initialization
  localVideoEl.hide();

  // Add validation rules
  formEl.form({
    fields: {
      roomName: "empty",
      username: "empty"
    }
  });

  // Every connection starts with zero remote videos
  let remoteVideosCount = 0;

  // Establish WebRTC connection
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

  /* ---------------------------- Event handlers ---------------------------- */

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

  // Room submit button handler
  $(".submit").on("click", event => {
    if (!formEl.form("is valid")) {
      return false;
    }
    username = $("#username").val();
    const roomName = $("#roomName")
      .val()
      .toLowerCase();
    if (event.target.id === "create-btn") {
      createRoom(roomName);
    } else {
      joinRoom(roomName);
    }
    return false;
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

  // Register new Chat Room
  const createRoom = roomName => {
    // eslint-disable-next-line no-console
    console.info(`Creating new room: ${roomName}`);
    webrtc.createRoom(roomName, (err, name) => {
      formEl.form("clear");
      showChatRoom(name);
      postMessage(`${username} created chatroom`);
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
