import React from "react";
import ReactDOM from "react-dom";
import App from "./components/App";

import queryString from "query-string";
import router from "./router";
import history from './history'
const container = document.getElementById("root");
let currentLocation = history.location;
const scrollPositionsHistory = {};
const context = {};

async function onLocationChange(location, action) {
  // Remember the latest scroll position for the previous location
  scrollPositionsHistory[currentLocation.key] = {
    scrollX: window.pageXOffset,
    scrollY: window.pageYOffset
  };
  // Delete stored scroll position for next page if any
  if (action === "PUSH") {
    delete scrollPositionsHistory[location.key];
  }
  currentLocation = location;

  const isInitialRender = !action;
  try {
    context.pathname = location.pathname;
    context.query = queryString.parse(location.search);
    
    const route = await router.resolve(context);
    if (currentLocation.key !== location.key) {
      return;
    }

    if (route.redirect) {
      history.replace(route.redirect);
      return;
    }

    ReactDOM.render(
      <App context={context}>{route.component}</App>,
      container,
      () => {
        document.title = route.title || '';

        if (isInitialRender) {
          if (window.history && "scrollRestoration" in window.history) {
            window.history.scrollRestoration = "manual";
          }

          const elem = document.getElementById("css");
          if (elem) elem.parentNode.removeChild(elem);
          return;
        }
        // updateMeta('description', route.description);
        // Update necessary tags in <head> at runtime here, ie:
        // updateMeta('keywords', route.keywords);
        // updateCustomMeta('og:url', route.canonicalUrl);
        // updateCustomMeta('og:image', route.imageUrl);
        // updateLink('canonical', route.canonicalUrl);
        // etc.

        let scrollX = 0;
        let scrollY = 0;
        const pos = scrollPositionsHistory[location.key];
        if (pos) {
          scrollX = pos.scrollX;
          scrollY = pos.scrollY;
        } else {
          const targetHash = location.hash.substr(1);
          if (targetHash) {
            const target = document.getElementById(targetHash);
            if (target) {
              scrollY = window.pageYOffset + target.getBoundingClientRect().top;
            }
          }
        }

        // Restore the scroll position if it was saved into the state
        // or scroll to the given #hash anchor
        // or scroll to top of the page
        window.scrollTo(scrollX, scrollY);
      }
    );
  } catch (error) {
    if (__DEV__) {
      throw error;
    }

    console.error(error);

    // Do a full page reload if error occurs during client-side navigation
    if (!isInitialRender && currentLocation.key === location.key) {
      console.error("RSK will reload your page after error");
      window.location.reload();
    }
  }
}

// Handle client-side navigation by using HTML5 History API
// For more information visit https://github.com/mjackson/history#readme
history.listen(onLocationChange);
onLocationChange(currentLocation);

if (module.hot) {
  module.hot.accept("./routes", () => {
    onLocationChange(currentLocation);
  });
}