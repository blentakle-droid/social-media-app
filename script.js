var db = firebase.firestore();
var auth = firebase.auth();
var usersRef = db.collection("users");

var emailInput = document.getElementById("email");
var passwordInput = document.getElementById("password");
var statusP = document.getElementById("status");

document.getElementById("signupbtn").addEventListener("click", () => {
  var email = emailInput.value;
  var password = passwordInput.value;

  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      statusP.textContent = "Account created!";
      window.location.href = "posts.html";
    })
    .catch((error) => {
      statusP.textContent = error.message;
    });
});

document.getElementById("loginbtn").addEventListener("click", () => {
  var email = emailInput.value;
  var password = passwordInput.value;
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      statusP.textContent = "logged in!";
      window.location.href = "posts.html";
    })
    .catch((error) => {
      statusP.textContent = error.message;
    });
});

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    statusP.textContent = "User logged in: " + user.email;

    usersRef.doc(user.uid).get().then((doc) => {
      if (!doc.exists) {
        usersRef.doc(user.uid).set({
          email: user.email,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          posts: 0
        });
      }
    });

  } else {
    statusP.textContent = "No user logged in";
  }
});

  


