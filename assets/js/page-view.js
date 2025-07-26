(function () {
  function getPageNameFromPath() {
    let path = window.location.pathname;
    if (path.startsWith("/")) {
      path = path.substring(1);
    }
    if (path.endsWith("/")) {
      path = path.slice(0, -1);
    }
    if (path.endsWith(".html")) {
      path = path.slice(0, -5);
    }
    if (!path) {
      return "git-interactive-learning-hub-home-page";
    }

    path = path.split("/").pop();

    return `git-interactive-learning-hub-${path}-page`;
  }

  document.addEventListener("DOMContentLoaded", function () {
    const pageName = getPageNameFromPath();
    fetch(`https://aidarkezio.vercel.app/api/page-view?name=${pageName}`, {
      method: "GET",
      mode: "cors",
    })
      .then(async (response) => {
        if (!response.ok) {
          console.error(
            "Error recording page view:",
            response.status,
            response.statusText,
            `for page: ${pageName}`
          );
        } // else {
        //   console.log(`Page view recorded successfully for page: ${pageName}`);
        //   console.log('Response:', (await response.json()));
        // }
      })
      .catch((error) => {
        console.error(
          "Error recording page view:",
          error,
          `for page: ${pageName}`
        );
      });
  });
})();
