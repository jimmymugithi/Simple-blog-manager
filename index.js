const BASE_URL = "http://localhost:3000/posts";
let currentPostId = null;

function main() {
  displayPosts();
  addNewPostListener();
}

document.addEventListener("DOMContentLoaded", main);

function displayPosts() {
  fetch(BASE_URL)
    .then(res => res.json())
    .then(posts => {
      const listContainer = document.getElementById("post-list");
      listContainer.innerHTML = "";
      posts.forEach(post => {
        const postEl = document.createElement("div");
        postEl.textContent = post.title;
        postEl.classList.add("post-title");
        postEl.addEventListener("click", () => handlePostClick(post.id));
        listContainer.appendChild(postEl);
      });

      // Auto-load first post
      if (posts.length > 0) handlePostClick(posts[0].id);
    });
}

function handlePostClick(id) {
  fetch(`${BASE_URL}/${id}`)
    .then(res => res.json())
    .then(post => {
      currentPostId = post.id;
      const detail = document.getElementById("post-detail");
      detail.innerHTML = `
        <h2>${post.title}</h2>
        <p><strong>Author:</strong> ${post.author}</p>
        <p>${post.content}</p>
        <button id="edit-btn">Edit</button>
        <button id="delete-btn">Delete</button>
      `;

      document.getElementById("edit-btn").addEventListener("click", () => showEditForm(post));
      document.getElementById("delete-btn").addEventListener("click", () => deletePost(post.id));
    });
}

function addNewPostListener() {
  const form = document.getElementById("new-post-form");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newPost = {
      title: formData.get("title"),
      content: formData.get("content"),
      author: formData.get("author")
    };

    fetch(BASE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPost)
    })
    .then(res => res.json())
    .then(post => {
      displayPosts(); // Refresh the list
      form.reset();
    });
  });
}

function showEditForm(post) {
  const form = document.getElementById("edit-post-form");
  form.classList.remove("hidden");
  document.getElementById("edit-title").value = post.title;
  document.getElementById("edit-content").value = post.content;

  form.onsubmit = function (e) {
    e.preventDefault();
    const updatedPost = {
      title: document.getElementById("edit-title").value,
      content: document.getElementById("edit-content").value
    };

    fetch(`${BASE_URL}/${post.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updatedPost)
    })
    .then(res => res.json())
    .then(() => {
      form.classList.add("hidden");
      handlePostClick(post.id);
      displayPosts();
    });
  };

  document.getElementById("cancel-edit").addEventListener("click", () => {
    form.classList.add("hidden");
  });
}

function deletePost(id) {
  fetch(`${BASE_URL}/${id}`, {
    method: "DELETE"
  }).then(() => {
    document.getElementById("post-detail").innerHTML = "<h2>Select a post to view details</h2>";
    displayPosts();
  });
}
