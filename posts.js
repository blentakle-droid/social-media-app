var auth = firebase.auth();
var db = firebase.firestore();


var postBtn = document.getElementById("postBtn");
var textInput = document.getElementById("text");
var statusP = document.getElementById("status");
var feed = document.getElementById("feed");
var imageInput = document.getElementById("imageInput");

/* ======================
   LOAD FEED (LIVE)
====================== */
function loadFeed() {
  feed.innerHTML = "";
  statusP.textContent = "Loading feed...";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      feed.innerHTML = "";
      statusP.textContent = "";

      snapshot.forEach((doc) => {
        var post = doc.data();
        var postDiv = document.createElement("div");
        postDiv.className = "post";

        /* Post text */
        var textP = document.createElement("p");
        textP.textContent = post.text;
        postDiv.appendChild(textP);

        /* Image (optional) */
        if (post.imageUrl) {
          var img = document.createElement("img");
          img.src = post.imageUrl;
          img.style.maxWidth = "200px";
          postDiv.appendChild(img);
        }

        /* Like system */
        var user = auth.currentUser;
        var likedByMe = user && post.likes && post.likes[user.uid];

        var heart = document.createElement("span");
        heart.textContent = likedByMe ? "❤️" : "🤍";
        heart.style.cursor = "pointer";

        var likeCount = document.createElement("span");
        likeCount.textContent = " " + (post.likeCount || 0);

        heart.addEventListener("click", () => {
          if (!user) return;

          var postRef = db.collection("posts").doc(doc.id);

          if (post.likes && post.likes[user.uid]) {
            postRef.update({
              ["likes." + user.uid]: firebase.firestore.FieldValue.delete(),
              likeCount: firebase.firestore.FieldValue.increment(-1)
            });
          } else {
            postRef.update({
              ["likes." + user.uid]: true,
              likeCount: firebase.firestore.FieldValue.increment(1)
            });
          }
        });

        postDiv.appendChild(heart);
        postDiv.appendChild(likeCount);

        /* Meta info */
        var meta = document.createElement("small");
        var author = post.authorId || "Anonymous";
        meta.textContent =
          " by " +
          author +
          " on " +
          (post.createdAt
            ? post.createdAt.toDate().toLocaleString()
            : "just now");

        postDiv.appendChild(document.createElement("br"));
        postDiv.appendChild(meta);

        feed.appendChild(postDiv);
      });
    });
}

/* ======================
   CREATE POST
====================== */
function makePost() {
  var user = auth.currentUser;
  if (!user) {
    statusP.textContent = "You must be logged in to post.";
    return;
  }

  var text = textInput.value.trim();
  var file = imageInput.files[0];

  if (!text && !file) {
    statusP.textContent = "Post something first.";
    return;
  }

  statusP.textContent = "Posting...";
if (file) {
  var formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_posts");

  fetch("https://api.cloudinary.com/v1_1/dnkaowrex/image/upload", {
    method: "POST",
    body: formData
  })
    .then((res) => res.json())
    .then((data) => {
      var postData = {
        authorId: user.email,
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likeCount: 0,
        likes: {}
      };
      if (data.secure_url) {
        postData.imageUrl = data.secure_url;
      }
      return db.collection("posts").add(postData);
    })
    .then(clearPost)
    .catch((err) => {
      statusP.textContent = err.message;
    });
} else {
    db.collection("posts")
      .add({
        authorId: user.email,
        text: text,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        likeCount: 0,
        likes: {}
      })
      .then(clearPost)
      .catch((err) => {
        statusP.textContent = err.message;
      });
  }
}

/* ======================
   CLEAR INPUTS
====================== */
function clearPost() {
  textInput.value = "";
  imageInput.value = "";
  statusP.textContent = "Posted!";
}

/* ======================
   EVENTS
====================== */
postBtn.addEventListener("click", makePost);
postBtn.addEventListener("click", makePost);

auth.onAuthStateChanged((user) => {
  if (user) {
    loadFeed();
  } else {
    feed.innerHTML = "";
    statusP.textContent = "Please log in to see posts.";
  }
});

